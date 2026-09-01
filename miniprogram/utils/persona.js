const { tags } = require('../data/tags')
const { dimensions, dimensionEvidence } = require('../data/dimensions')
const { feedbackFactor } = require('./feedback')

const tagLabels = tags.reduce((map, item) => {
  map[item.id] = item.label
  return map
}, {})

const dimensionFeedbackNodes = {
  exploration: ['active_explore', 'weekend_explore', 'local_explore', 'exploration', 'familiar_preference'],
  deepDive: ['longform_content', 'deep_story', 'deep_consume', 'deep_dive', 'quick_consume'],
  nostalgia: ['cn_pop', 'classic_tv', 'early_web', 'nostalgia', 'nostalgia_score'],
  priceSensitivity: ['price_compare', 'price_sensitive', 'price_score', 'convenience_preference'],
  decisionCare: ['decision_research', 'decision_care', 'decision_score', 'convenience_preference'],
  contentInitiative: ['active_explore', 'exploration'],
  socialExpression: ['social_context', 'social_expression', 'private_mode'],
  trendSensitivity: ['trend_follow', 'trend_score', 'stable_interest']
}

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
  const social = dimensionMap.socialExpression?.score || 50
  const trend = dimensionMap.trendSensitivity?.score || 50

  if (exploration >= 68 && deepDive >= 65 && initiative >= 62) return '深潜探索者'
  if (nostalgia >= 68 && deepDive >= 60) return '怀旧深潜者'
  if (price >= 68 && decision >= 62) return '理性比价者'
  if (initiative >= 68 && exploration >= 60) return '主动发现者'
  if (social >= 68 && trend >= 62) return '热点共鸣者'
  if (exploration >= 65 && social >= 60) return '城市发现者'
  if (trend <= 35 && nostalgia >= 60) return '稳定经典派'
  if (social <= 35 && deepDive >= 60) return '安静深潜者'
  if (nostalgia >= 65) return '经典共鸣者'
  if (deepDive >= 65) return '深度内容型'
  if (exploration >= 65) return '主动探索者'
  return '多元观察者'
}

function buildSummary(items, feedbackMap) {
  const strongest = [...items]
    .filter(item => item.evidenceCount > 0)
    .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
    .slice(0, 3)

  if (!strongest.length) {
    return '当前行为证据还比较少，先把它看作一个待补充的数字画像。'
  }

  const phrases = strongest.map(item => `${item.label}更偏向“${item.descriptor}”`)
  const corrected = Object.keys(feedbackMap || {}).length > 0
  return `${phrases.join('，')}。${corrected ? '这个结果已经根据你的纠错反馈重新计算。' : '这是根据你主动提供的行为线索生成的阶段性画像。'}`
}

function applyDimensionFeedback(item, feedbackMap = {}) {
  const nodes = dimensionFeedbackNodes[item.id] || []
  let factor = 1
  const applied = []

  nodes.forEach(nodeId => {
    const status = feedbackMap[nodeId]
    if (!status) return
    factor *= feedbackFactor(status)
    applied.push({ nodeId, status })
  })

  // 用户否定的是算法推断，所以只削弱相对中性 50 的偏移，不直接反向判定人格。
  const deviation = item.score - 50
  const score = clamp(Math.round(50 + deviation * factor), 0, 100)

  return {
    ...item,
    score,
    feedbackApplied: applied
  }
}

function buildPersona(selectedTags, feedbackMap = {}) {
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
    const item = applyDimensionFeedback(itemMap[dimension.id], feedbackMap)
    return {
      ...item,
      evidenceCount: item.evidence.length,
      descriptor: getDescriptor(item.score, dimension),
      evidence: item.evidence.slice(0, 4)
    }
  })

  const dimensionMap = items.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})

  const evidenceTotal = items.reduce((sum, item) => sum + item.evidenceCount, 0)
  const correctedCount = Object.keys(feedbackMap).length

  return {
    title: buildTitle(dimensionMap),
    summary: buildSummary(items, feedbackMap),
    evidenceTotal,
    correctedCount,
    completeness: Math.min(100, Math.round((evidenceTotal / 14) * 100)),
    items
  }
}

module.exports = { buildPersona }
