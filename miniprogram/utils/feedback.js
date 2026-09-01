const FEEDBACK_META = {
  accurate: { factor: 1.05, text: '符合', className: 'feedback-accurate' },
  unsure: { factor: 0.70, text: '不确定', className: 'feedback-unsure' },
  inaccurate: { factor: 0.20, text: '不符合', className: 'feedback-inaccurate' }
}

function feedbackFactor(status) {
  return FEEDBACK_META[status] ? FEEDBACK_META[status].factor : 1
}

function pathFactor(path, currentId, feedbackMap) {
  if (!Array.isArray(path)) return 1
  return path.reduce((factor, id) => {
    if (id === currentId) return factor
    return factor * feedbackFactor(feedbackMap[id])
  }, 1)
}

function applyFeedback(profile, feedbackMap = {}) {
  return profile.map(item => {
    const baseScore = item.originalScore || item.score
    const pathFactors = (item.paths || []).map(path => pathFactor(path, item.id, feedbackMap))
    const bestPathFactor = pathFactors.length ? Math.max(...pathFactors) : 1
    const ownFactor = feedbackFactor(feedbackMap[item.id])
    const adjustedScore = Math.max(5, Math.min(100, Math.round(baseScore * bestPathFactor * ownFactor)))
    const status = feedbackMap[item.id] || ''
    const meta = FEEDBACK_META[status]

    return {
      ...item,
      originalScore: baseScore,
      score: adjustedScore,
      feedback: status,
      feedbackText: meta ? meta.text : '',
      feedbackClass: meta ? meta.className : ''
    }
  })
}

function feedbackStats(feedbackMap = {}) {
  const values = Object.values(feedbackMap)
  return {
    total: values.length,
    accurate: values.filter(item => item === 'accurate').length,
    unsure: values.filter(item => item === 'unsure').length,
    inaccurate: values.filter(item => item === 'inaccurate').length
  }
}

function persistFeedback(selectedTags, nodeId, status) {
  const key = 'algorithmProfileFeedbackHistory'
  const history = wx.getStorageSync(key) || []
  history.unshift({
    createdAt: Date.now(),
    selectedTags,
    nodeId,
    status
  })
  wx.setStorageSync(key, history.slice(0, 100))
}

module.exports = {
  FEEDBACK_META,
  feedbackFactor,
  applyFeedback,
  feedbackStats,
  persistFeedback
}
