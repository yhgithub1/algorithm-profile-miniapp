const { getPlatform, globalAxes } = require('../data/platforms')

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function normalizeAnswers(platform, answers) {
  const list = []
  platform.questions.forEach(question => {
    const value = answers[question.id]
    if (Array.isArray(value)) {
      value.forEach(item => list.push({ question, value: item }))
    } else if (value) {
      list.push({ question, value })
    }
  })
  return list
}

function descriptor(score, config) {
  if (score >= 62) return config.high
  if (score <= 38) return config.low
  return '中间型'
}

function tagFor(score, config) {
  if (score >= 62) return config.highTag
  if (score <= 38) return config.lowTag
  return `${config.label}中间型`
}

function buildTitle(items, platform) {
  const ranked = [...items].sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
  const first = ranked[0]
  const second = ranked[1]
  if (!first) return `${platform.shortName}观察型`

  const firstTag = first.score >= 50 ? first.highTag : first.lowTag
  const secondTag = second && Math.abs(second.score - 50) >= 14
    ? (second.score >= 50 ? second.highTag : second.lowTag)
    : ''

  if (!secondTag) return firstTag
  return `${firstTag.replace(/型$/, '')} · ${secondTag}`
}

function buildImpact(platformId, items) {
  const map = items.reduce((result, item) => {
    result[item.id] = item.score
    return result
  }, {})

  const copy = {
    meituan: [
      map.price >= 62 ? '优惠、满减和低价套餐可能更容易影响你的点餐选择。' : '推荐可能更强调送达效率、口味和熟悉商家。',
      map.novelty >= 62 ? '新店、附近新商家和新品类可能更容易进入候选列表。' : '常点过的店、相似餐厅和复购入口可能更符合当前画像。',
      map.frequency >= 62 ? '高频点餐会让常用时段、常用地点和客单价显得更稳定。' : '低频点餐时，可形成的稳定行为信号会更少。'
    ],
    douyin: [
      map.depth >= 62 ? '完整观看、重播或看合集会让相似主题更容易被继续强化。' : '快速划走较多时，推荐可能继续尝试不同题材。',
      map.initiative >= 62 ? '搜索关键词、点主页等主动行为会显得更像明确兴趣。' : '首页推荐本身会成为塑造兴趣画像的重要来源。',
      map.interaction >= 62 ? '评论、分享、收藏等互动会让兴趣圈层和表达倾向显得更清晰。' : '只看不互动时，画像更多依赖观看行为。'
    ],
    xiaohongshu: [
      map.initiative >= 62 ? '主动搜索攻略、评价和关键词会让需求意图显得更明确。' : '首页推荐会更大程度影响后续看到的生活方式内容。',
      map.planning >= 62 ? '收藏、整理清单和反复查看会让未来意图显得更稳定。' : '随手浏览为主时，长期意图更难确定。',
      map.commercial >= 62 ? '高种草响应会让同类产品、探店和生活消费内容继续被强化。' : '二次查证和比价会削弱看到即转化的判断。'
    ],
    taobao: [
      map.price >= 62 ? '优惠券、大促提醒和同款比价更可能影响购买路径。' : '品牌、便利和直接购买可能更符合当前画像。',
      map.research >= 62 ? '参数、买家秀、问大家和长评论会显得是关键决策信息。' : '短链路购买和直接推荐可能更符合你的行为。',
      map.impulse >= 62 ? '限时优惠、直播和猜你喜欢更可能触发即时购买。' : '收藏、购物车、降价提醒和长期决策链可能更适合你。'
    ]
  }

  return copy[platformId] || []
}

function buildPlatformProfile(platformId, answers) {
  const platform = getPlatform(platformId)
  if (!platform) return null

  const scoreMap = {}
  platform.dimensions.forEach(item => {
    scoreMap[item.id] = 50
  })

  const globalMap = {}
  Object.keys(globalAxes).forEach(id => {
    globalMap[id] = 50
  })

  const evidence = []
  normalizeAnswers(platform, answers).forEach(({ question, value }) => {
    const option = question.options.find(item => item.value === value)
    if (!option) return

    Object.keys(option.effects || {}).forEach(id => {
      scoreMap[id] = clamp((scoreMap[id] || 50) + option.effects[id], 0, 100)
    })
    Object.keys(option.global || {}).forEach(id => {
      globalMap[id] = clamp((globalMap[id] || 50) + option.global[id], 0, 100)
    })

    evidence.push({ question: question.title, answer: option.label })
  })

  const items = platform.dimensions.map(config => ({
    ...config,
    score: scoreMap[config.id],
    descriptor: descriptor(scoreMap[config.id], config),
    tag: tagFor(scoreMap[config.id], config)
  }))

  const ranked = [...items].sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
  const tags = ranked
    .filter(item => Math.abs(item.score - 50) >= 9)
    .slice(0, 4)
    .map(item => item.tag)

  const strongest = ranked.slice(0, 2)
  const summary = strongest.length
    ? `在这套模拟中，${platform.name}可能会把你理解成“${buildTitle(items, platform)}”。目前最明显的信号来自${strongest.map(item => `${item.label}（${item.score}）`).join('、')}。`
    : '目前提供的信息还不足以形成明显画像。'

  return {
    platformId,
    platform,
    title: buildTitle(items, platform),
    summary,
    items,
    tags: tags.length ? tags : ['画像仍在形成'],
    impact: buildImpact(platformId, items),
    evidence,
    answers,
    globalSignals: globalMap,
    completedAt: Date.now()
  }
}

module.exports = { buildPlatformProfile }
