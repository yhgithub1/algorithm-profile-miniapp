const { getObservationPlatform, observationAxes } = require('../data/observation-platforms')

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function selectionsFromAnswers(platform, answers = {}) {
  return platform.questions.reduce((list, question) => {
    const value = answers[question.id]
    if (!value) return list
    const option = question.options.find(item => item.value === value)
    if (!option) return list
    list.push({ question, option })
    return list
  }, [])
}

function axisResult(axisId, selections, platform) {
  const evidence = []
  selections.forEach(({ option }) => {
    const delta = option.signals && option.signals[axisId]
    if (typeof delta !== 'number' || Math.abs(delta) < 0.01) return
    evidence.push({ trace: option.trace, delta })
  })

  const config = observationAxes[axisId]
  if (evidence.length < 2) {
    return {
      id: axisId,
      label: config.label,
      observed: false,
      status: '尚未充分观察',
      evidenceCount: evidence.length,
      evidence
    }
  }

  const mean = evidence.reduce((sum, item) => sum + item.delta, 0) / evidence.length
  const positiveCount = evidence.filter(item => item.delta > 0.08).length
  const negativeCount = evidence.filter(item => item.delta < -0.08).length
  const consistency = Math.max(positiveCount, negativeCount) / evidence.length
  const neutral = Math.abs(mean) < 0.18 || consistency < 0.6
  const direction = mean >= 0 ? 'positive' : 'negative'
  const score = Math.round(clamp((mean + 1) / 2, 0, 1) * 100)

  return {
    id: axisId,
    label: config.label,
    observed: true,
    neutral,
    direction,
    score,
    raw: Number(mean.toFixed(3)),
    evidenceCount: evidence.length,
    consistency: Number(consistency.toFixed(2)),
    descriptor: neutral ? '暂无明显行为倾向' : (direction === 'positive' ? config.high : config.low),
    evidence
  }
}

function confidenceFor(axis) {
  if (!axis.observed || axis.neutral) return '不足'
  const strength = Math.abs(axis.raw)
  if (axis.evidenceCount >= 3 && axis.consistency >= 0.75 && strength >= 0.42) return '较高'
  return '中等'
}

function tracesFor(axis) {
  return [...axis.evidence]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 2)
    .map(item => item.trace)
}

function buildInference(axis, platform) {
  if (!axis.observed || axis.neutral) return null
  const copy = platform.inferenceCopy && platform.inferenceCopy[axis.id]
  if (!copy) return null
  const traces = tracesFor(axis)
  const statement = copy[axis.direction]
  return {
    id: axis.id,
    axisLabel: axis.label,
    trace: traces.join('；'),
    statement,
    line: `【${traces.join('；')}】 → 算法推断：${statement}`,
    confidence: confidenceFor(axis),
    evidenceCount: axis.evidenceCount,
    detail: `这条推断来自 ${axis.evidenceCount} 条相关行为痕迹。算法只能看到行为，不知道这些行为背后的真实原因。`,
    feedback: ''
  }
}

function buildMemoryAnchors(selections) {
  return [...selections]
    .map(({ option }) => ({
      text: option.trace,
      strength: Object.values(option.signals || {}).reduce((sum, value) => sum + Math.abs(value), 0)
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2)
    .map(item => item.text)
}

function buildPlatformObservation(platformId, answers = {}) {
  const platform = getObservationPlatform(platformId)
  if (!platform) return null

  const selections = selectionsFromAnswers(platform, answers)
  const axes = Object.keys(observationAxes).map(axisId => axisResult(axisId, selections, platform))
  const inferences = axes.map(axis => buildInference(axis, platform)).filter(Boolean).slice(0, 5)
  const neutralAxes = axes.filter(item => item.observed && item.neutral)
  const unobservedAxes = axes.filter(item => !item.observed)
  const observedCount = axes.filter(item => item.observed).length
  const memoryAnchors = buildMemoryAnchors(selections)

  let summary = `这个视角目前对 ${observedCount} / ${axes.length} 个行为侧面形成了足够观察。`
  if (inferences.length) {
    summary += ` 系统只展示有多条证据支持的概率推断，不把单个答案直接当成事实。`
  } else {
    summary += ' 当前没有足够一致的证据形成明显倾向。'
  }

  return {
    source: 'survey',
    platformId,
    platform,
    viewName: platform.viewName,
    summary,
    axes,
    inferences,
    neutralAxes,
    unobservedAxes,
    observedCount,
    memoryAnchors,
    answers,
    feedbackMap: {},
    completedAt: Date.now()
  }
}

function applyInferenceFeedback(profile, inferenceId, status) {
  if (!profile) return profile
  const feedbackMap = { ...(profile.feedbackMap || {}) }
  if (feedbackMap[inferenceId] === status) {
    delete feedbackMap[inferenceId]
  } else {
    feedbackMap[inferenceId] = status
  }
  return {
    ...profile,
    feedbackMap,
    inferences: (profile.inferences || []).map(item => ({
      ...item,
      feedback: feedbackMap[item.id] || ''
    }))
  }
}

module.exports = { buildPlatformObservation, applyInferenceFeedback }
