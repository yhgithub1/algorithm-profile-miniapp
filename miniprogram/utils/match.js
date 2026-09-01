const { tags } = require('../data/tags')
const { buildPersona } = require('./persona')

const tagMap = tags.reduce((map, item) => {
  map[item.id] = item
  return map
}, {})

function unique(items) {
  return [...new Set(items)]
}

function jaccard(a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  const union = new Set([...a, ...b])
  if (!union.size) return 0
  let intersection = 0
  setA.forEach(item => {
    if (setB.has(item)) intersection += 1
  })
  return intersection / union.size
}

function dimensionMap(persona) {
  return persona.items.reduce((map, item) => {
    map[item.id] = item.score
    return map
  }, {})
}

function complementScore(diff) {
  if (diff <= 8) return 58
  if (diff <= 28) return 70 + Math.round((diff - 8) * 1.1)
  if (diff <= 45) return 92 - Math.round((diff - 28) * 1.4)
  return Math.max(42, 68 - Math.round((diff - 45) * 1.2))
}

function buildTopics(myTags, otherTags, myPersona, otherPersona) {
  const sharedIds = myTags.filter(id => otherTags.includes(id))
  const sharedLabels = sharedIds.map(id => tagMap[id]?.label).filter(Boolean)
  const topics = []

  sharedLabels.slice(0, 3).forEach(label => {
    topics.push(`你们都选择了“${label}”，这是最直接的共同话题。`)
  })

  const a = dimensionMap(myPersona)
  const b = dimensionMap(otherPersona)

  if ((a.nostalgia || 50) >= 65 && (b.nostalgia || 50) >= 65) {
    topics.push('你们都偏经典内容，可以从小时候看过的剧、听过的歌或早期互联网记忆聊起。')
  }
  if ((a.exploration || 50) >= 62 && (b.exploration || 50) >= 62) {
    topics.push('你们都偏主动探索，周末去哪里、最近发现了什么店或新体验会比较容易聊起来。')
  }
  if ((a.deepDive || 50) >= 62 && (b.deepDive || 50) >= 62) {
    topics.push('你们都有持续深挖内容的倾向，适合交换“最近研究上头的一个东西”。')
  }
  if (Math.abs((a.exploration || 50) - (b.exploration || 50)) >= 22) {
    topics.push('你们在探索节奏上有一定互补：一个更愿意尝新，一个更偏熟悉内容，适合互相带入不同圈子。')
  }
  if (Math.abs((a.trendSensitivity || 50) - (b.trendSensitivity || 50)) >= 22) {
    topics.push('一个更关注热点、一个更偏稳定兴趣，可能会形成“带你看最近发生什么 / 带你看长期好内容”的互补。')
  }

  if (!topics.length) {
    topics.push('当前共同线索还比较少，可以从双方最强的兴趣维度开始交换各自最近最喜欢的内容。')
  }

  return topics.slice(0, 4)
}

function buildMatch(myTags, otherTags) {
  const myPersona = buildPersona(myTags, {})
  const otherPersona = buildPersona(otherTags, {})
  const sharedTags = myTags.filter(id => otherTags.includes(id))
  const myGroups = unique(myTags.map(id => tagMap[id]?.group).filter(Boolean))
  const otherGroups = unique(otherTags.map(id => tagMap[id]?.group).filter(Boolean))

  const exactOverlap = jaccard(myTags, otherTags)
  const groupOverlap = jaccard(myGroups, otherGroups)
  const circleOverlap = Math.round((exactOverlap * 0.58 + groupOverlap * 0.42) * 100)

  const myDimensions = dimensionMap(myPersona)
  const otherDimensions = dimensionMap(otherPersona)
  const ids = Object.keys(myDimensions)
  const diffs = ids.map(id => Math.abs(myDimensions[id] - otherDimensions[id]))
  const avgDiff = diffs.reduce((sum, value) => sum + value, 0) / Math.max(1, diffs.length)
  const behaviorSimilarity = Math.round(Math.max(0, 100 - avgDiff * 1.6))
  const complementarity = Math.round(diffs.reduce((sum, diff) => sum + complementScore(diff), 0) / Math.max(1, diffs.length))
  const fit = Math.round(circleOverlap * 0.42 + behaviorSimilarity * 0.38 + complementarity * 0.20)

  const sharedLabels = sharedTags.map(id => tagMap[id]?.label).filter(Boolean)
  const sharedGroups = myGroups.filter(group => otherGroups.includes(group))

  return {
    fit,
    circleOverlap,
    behaviorSimilarity,
    complementarity,
    myPersona,
    otherPersona,
    sharedLabels,
    sharedGroups,
    topics: buildTopics(myTags, otherTags, myPersona, otherPersona),
    summary: fit >= 78
      ? '圈层与行为节奏都有较强共鸣，比较容易快速找到共同话题。'
      : fit >= 62
        ? '你们有明显交集，同时保留一定差异，适合从共同兴趣继续向外扩展。'
        : '你们的直接交集不算高，但部分行为维度存在互补，更适合通过具体话题逐步建立连接。'
  }
}

module.exports = { buildMatch }
