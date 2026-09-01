const { getPlatform } = require('../data/platforms')

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function round(value, digits = 1) {
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

function average(values) {
  if (!values.length) return null
  return values.reduce((sum, item) => sum + item, 0) / values.length
}

function priceBand(value) {
  if (value == null) return ''
  if (value < 20) return '20元以下'
  if (value < 35) return '20～35元'
  if (value < 60) return '35～60元'
  if (value < 100) return '60～100元'
  if (value < 300) return '100～300元'
  return '300元以上'
}

function collectCategories(analyses) {
  const map = {}
  analyses.forEach(analysis => {
    ;(analysis.categories || []).forEach(item => {
      if (!map[item.label]) map[item.label] = { label: item.label, weight: 0, count: 0 }
      map[item.label].weight += (item.ratio || 0) * (item.confidence || 0.5)
      map[item.label].count += item.count || 1
    })
  })
  return Object.values(map).sort((a, b) => b.weight - a.weight)
}

function buildGlobalSignals(platformId, metrics) {
  const signals = {
    price: 50,
    exploration: 50,
    planning: 50,
    depth: 50,
    social: 50,
    nostalgia: 50,
    convenience: 50
  }

  signals.exploration = clamp(44 + metrics.categoryCount * 5, 35, 78)
  signals.planning = clamp(50 + metrics.planningRatio * 24, 50, 76)

  if (platformId === 'meituan') {
    signals.price = clamp(48 + metrics.discountRatio * 28 + (metrics.avgPrice != null && metrics.avgPrice < 35 ? 6 : 0), 35, 82)
    signals.convenience = 62
  }

  if (platformId === 'taobao') {
    signals.price = clamp(46 + metrics.discountRatio * 30 + (metrics.avgPrice != null && metrics.avgPrice < 100 ? 5 : 0), 34, 84)
    signals.planning = clamp(signals.planning + 4, 0, 100)
  }

  if (platformId === 'xiaohongshu') {
    signals.depth = clamp(48 + metrics.planningRatio * 22, 44, 76)
    signals.exploration = clamp(signals.exploration + 5, 0, 100)
  }

  if (platformId === 'douyin') {
    // 推荐页截图只说明“平台正在给你看什么”，无法可靠推出观看深度和社交表达。
    signals.depth = 50
    signals.social = 50
  }

  return signals
}

function buildScreenshotProfile(platformId, analyses) {
  const platform = getPlatform(platformId)
  if (!platform || !analyses || !analyses.length) return null

  const categories = collectCategories(analyses)
  const topCategories = categories.slice(0, 4)
  const prices = []
  let discountScreens = 0
  let planningScreens = 0
  let ocrCount = 0

  analyses.forEach(analysis => {
    prices.push(...(analysis.priceValues || []))
    if ((analysis.discountHits || []).length) discountScreens += 1
    if ((analysis.planningHits || []).length) planningScreens += 1
    ocrCount += (analysis.ocrTexts || []).length
  })

  const avgPrice = average(prices)
  const discountRatio = analyses.length ? discountScreens / analyses.length : 0
  const planningRatio = analyses.length ? planningScreens / analyses.length : 0
  const top = topCategories[0] ? topCategories[0].label : '混合内容'
  const band = priceBand(avgPrice)

  const titleMap = {
    meituan: `${band ? band + ' · ' : ''}${top}推荐曝光型`,
    douyin: `${top}内容推荐池`,
    xiaohongshu: `${top}种草 / 攻略曝光型`,
    taobao: `${band ? band + ' · ' : ''}${top}消费推荐型`
  }

  const metrics = {
    avgPrice,
    discountRatio,
    planningRatio,
    categoryCount: categories.length
  }

  const globalSignals = buildGlobalSignals(platformId, metrics)
  const tags = topCategories.map(item => item.label)
  if (band) tags.push(`常见价格 ${band}`)
  if (discountRatio >= 0.5) tags.push('优惠信息曝光较多')
  if (planningRatio >= 0.5) tags.push('攻略 / 测评信息明显')

  const evidence = [
    { label: '截图样本', value: `${analyses.length} 张` },
    { label: '识别内容类别', value: topCategories.length ? topCategories.map(item => item.label).join(' / ') : '暂未形成明显类别' },
    { label: 'OCR 文本', value: `${ocrCount} 条` }
  ]

  if (avgPrice != null) evidence.push({ label: '可识别价格均值', value: `约 ¥${round(avgPrice, 1)}` })
  if (discountScreens) evidence.push({ label: '出现优惠词的截图', value: `${discountScreens} / ${analyses.length}` })
  if (planningScreens) evidence.push({ label: '出现攻略/测评词的截图', value: `${planningScreens} / ${analyses.length}` })

  const impact = []
  if (topCategories.length) {
    impact.push(`当前截图里“${top}”最集中，类似内容可能继续获得更多推荐曝光。`)
  }
  if (discountRatio >= 0.5) {
    impact.push('优惠、券后价、补贴等信息在样本里出现较多，推荐页可能持续强化促销型内容。')
  }
  if (planningRatio >= 0.5) {
    impact.push('攻略、教程、测评、对比等决策型内容较明显，系统可能继续测试你对“做功课型内容”的响应。')
  }
  if (!impact.length) {
    impact.push('当前样本还比较少，建议继续上传推荐页截图后再观察稳定趋势。')
  }

  const summaryParts = [`这 ${analyses.length} 张${platform.name}推荐页里，${top}内容最明显`]
  if (band) summaryParts.push(`可识别价格主要落在${band}附近`)
  if (discountRatio >= 0.5) summaryParts.push('优惠信息曝光偏多')

  return {
    platformId,
    platform,
    source: 'screenshot',
    title: titleMap[platformId] || `${top}推荐画像`,
    summary: `${summaryParts.join('，')}。这是对“平台正在给你展示什么”的样本分析，不等于真实平台内部标签。`,
    tags: tags.slice(0, 6),
    categories: topCategories,
    evidence,
    impact,
    metrics: {
      avgPrice: avgPrice == null ? null : round(avgPrice, 1),
      discountRatio: round(discountRatio * 100, 0),
      planningRatio: round(planningRatio * 100, 0),
      screenshotCount: analyses.length
    },
    globalSignals,
    completedAt: Date.now()
  }
}

module.exports = { buildScreenshotProfile }
