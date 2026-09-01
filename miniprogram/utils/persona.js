const { tags } = require('../data/tags')
const { dimensions, dimensionEvidence } = require('../data/dimensions')

const tagLabels = tags.reduce((map, item) => {
  map[item.id] = item.label
  return map
}, {})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getDescriptor(score, dimension) {
  if (score >= 65) return dimension.highLabel
  if (score <= 35) return dimension.lowLabel
  return '中间型'
}

function buildTitle(dimensionMap) {
  const exploration = dimensionMap.exploration?.score || 50
  const deepDive = dimensionMap.deepDive?.score || 50
  const nostalgia = dimensionMap.nostalgia?.score || 50
  const price = dimensionMap.priceSensitivity?.score || 50
  const decision = dimensionMap.decisionCare?.score || 50
  const initiative = dimensionMap.contentInitiative?.score || 50

  if (exploration >= 65 && deepDive >= 65) return '深潜探索者'
  if (nostalgia >= 65 && deepDive >= 60) return '怀旧深潜者'
  if (price >= 65 && decision >= 60) return '理性比价者'
  if (initiative >= 65 && exploration >= 60) return '主动发现者'
  if (nostalgia >= 65) return '经典共鸣者'
  if (deepDive >= 65) return '深度内容型'
  if (exploration >= 65) return '主动探索者'
  return '多元观察者'
}

function buildSummary(items) {
  const strongest = [...items]
    .filter(item => item.evidenceCount > 0)
    .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
    .slice(0, 2)

  if (!strongest.length) {
    return '当前行为证据还比较少，先把它看作一个待补充的数字画像。'
  }

  const phrases = strongest.map(item => `${item.label}更偏向“${item.descriptor}”`)
  return `${phrases.join('，')}。这是根据你主动提供的行为线索生成的阶段性画像。`
}

function buildPersona(selectedTags) {
  const itemMap = {}

  dimensions.forEach(dimension => {
    itemMap[dimension.id] = {
      ...dimension,
      score: 50,
      evidence: []
    }
  })

  selectedTags.forEach(tagId => {
    const evidenceList = dimensionEvidence[tagId] || []
    evidenceList.forEach(item => {
      const target = itemMap[item.dimension]
      if (!target) return
      target.score = clamp(target.score + item.delta, 0, 100)
      target.evidence.push({
        tagId,
        tagLabel: tagLabels[tagId] || tagId,
        delta: item.delta,
        reason: item.reason
      })
    })
  })

  const items = dimensions.map(dimension => {
    const item = itemMap[dimension.id]
    return {
      ...item,
      evidenceCount: item.evidence.length,
      descriptor: getDescriptor(item.score, dimension),
      evidence: item.evidence.slice(0, 3)
    }
  })

  const dimensionMap = items.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})

  const evidenceTotal = items.reduce((sum, item) => sum + item.evidenceCount, 0)

  return {
    title: buildTitle(dimensionMap),
    summary: buildSummary(items),
    evidenceTotal,
    completeness: Math.min(100, Math.round((evidenceTotal / 10) * 100)),
    items
  }
}

module.exports = { buildPersona }
