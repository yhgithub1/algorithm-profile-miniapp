function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function scoreMap(persona) {
  return (persona.items || []).reduce((map, item) => {
    map[item.id] = item.score
    return map
  }, {})
}

function weight(score, base = 35, span = 55) {
  return clamp(Math.round(base + ((score - 50) / 50) * span), 5, 95)
}

function buildImpact(persona, rawPersona, profile = []) {
  const current = scoreMap(persona)
  const raw = scoreMap(rawPersona || persona)
  const nodeMap = profile.reduce((map, item) => {
    map[item.id] = item.score
    return map
  }, {})

  const nostalgia = current.nostalgia || 50
  const exploration = current.exploration || 50
  const deepDive = current.deepDive || 50
  const initiative = current.contentInitiative || 50
  const price = current.priceSensitivity || 50
  const decision = current.decisionCare || 50
  const localLife = nodeMap.local_life || 45
  const weekend = nodeMap.weekend_explore || 45

  const content = [
    { label: '经典 / 怀旧内容', value: weight(nostalgia, 38, 48), reason: '受怀旧度影响' },
    { label: '新鲜探索内容', value: weight(exploration, 36, 50), reason: '受探索度影响' },
    { label: '长内容 / 深度内容', value: weight(deepDive, 34, 52), reason: '受深挖度影响' },
    { label: '主动搜索相关延伸', value: weight(initiative, 32, 50), reason: '受内容主动性影响' }
  ].sort((a, b) => b.value - a.value)

  const promotion = [
    { label: '优惠 / 比价信息', value: weight(price, 35, 50), reason: '价格敏感度较高时模拟提高展示权重' },
    { label: '本地生活内容', value: clamp(Math.round(localLife), 10, 95), reason: '由本地生活兴趣节点提供证据' },
    { label: '周末出行内容', value: clamp(Math.round(weekend), 10, 95), reason: '由周末探索节点提供证据' }
  ].sort((a, b) => b.value - a.value)

  // 纯仿真：基础价不变，只演示画像可能参与“优惠分配”的机制。
  const basePrice = 68
  const neutralCoupon = 5
  const profileCoupon = clamp(Math.round(5 + (price - 50) * 0.10 + (decision - 50) * 0.04), 1, 12)
  const payable = basePrice - profileCoupon

  const corrections = Object.keys(current)
    .map(id => ({
      id,
      before: raw[id] || 50,
      after: current[id] || 50
    }))
    .filter(item => item.before !== item.after)
    .map(item => ({
      ...item,
      delta: item.after - item.before
    }))

  return {
    content,
    promotion,
    pricing: {
      basePrice,
      neutralCoupon,
      profileCoupon,
      payable,
      difference: profileCoupon - neutralCoupon
    },
    corrections,
    hasCorrections: corrections.length > 0
  }
}

module.exports = { buildImpact }
