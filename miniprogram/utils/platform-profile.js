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
    takeaway: [
      map.price >= 62 ? '更可能对满减、红包、低价套餐等促销信息产生响应。' : '平台可能更强调送达效率、口味和熟悉商家，而不是只靠低价吸引。',
      map.novelty >= 62 ? '新店、附近新商家和新品类可能获得更高曝光。' : '你常点过的店、相似餐厅和复购入口可能更靠前。',
      map.frequency >= 62 ? '平台可能把你视为高频餐饮需求用户，在常用时段提前强化推荐。' : '平台掌握到的外卖行为信号相对有限。'
    ],
    shortvideo: [
      map.depth >= 62 ? '相似主题可能被连续强化，因为完整观看是较强的兴趣信号。' : '推荐可能更快尝试不同内容，以寻找能让你停留的题材。',
      map.initiative >= 62 ? '搜索、主页访问等主动行为可能比单纯刷到的视频拥有更高权重。' : '首页推荐本身会成为塑造兴趣画像的主要来源。',
      map.interaction >= 62 ? '评论、分享等互动可能让系统进一步判断你的社交表达和圈层归属。' : '平台更难从公开互动判断你的表达倾向。'
    ],
    travel: [
      map.planning >= 62 ? '提前预订、套餐和行程规划类内容可能更适合你的决策周期。' : '临期酒店、即时出发和灵活取消等内容可能更有吸引力。',
      map.compare >= 62 ? '价格提醒、比价和优惠标签可能更容易被展示。' : '系统可能更强调省事的一站式组合和默认推荐。',
      map.exploration >= 62 ? '小众路线、目的地灵感和新城市可能获得更高推荐权重。' : '成熟热门目的地和经典线路可能更容易进入你的推荐池。'
    ],
    shopping: [
      map.price >= 62 ? '历史价、优惠券、大促提醒和同款比价可能更容易影响你的推荐页。' : '平台可能更偏向强调品牌、便利和直接购买。',
      map.research >= 62 ? '测评、参数、问大家和长评论可能被视为关键决策信息。' : '短链路购买和直接推荐可能更符合你的行为。',
      map.impulse >= 62 ? '直播、限时优惠和“猜你喜欢”可能更容易触发即时购买。' : '收藏、降价提醒和长期决策链可能更适合你。'
    ],
    content: [
      map.nostalgia >= 62 ? '经典歌单、老剧回顾和同年代内容可能被持续强化。' : '新歌、新剧、热榜和首发内容可能更常出现。',
      map.depth >= 62 ? '同导演、同演员、同歌手、幕后信息和深度内容可能继续向外扩展。' : '平台可能更依赖轻量推荐与快速切换。',
      map.initiative >= 62 ? '你的主动搜索会成为建立长尾兴趣画像的重要依据。' : '榜单和首页推荐会更大程度影响系统对你的理解。'
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

    evidence.push({
      question: question.title,
      answer: option.label
    })
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
    ? `${platform.name}可能会把你理解成“${buildTitle(items, platform)}”。目前最明显的信号来自${strongest.map(item => `${item.label}（${item.score}）`).join('、')}。`
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
