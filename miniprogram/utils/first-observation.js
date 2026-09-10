const { axes, platformMeta, baseQuestions, supplementQuestions } = require('../data/first-observation')

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getQuestionMap() {
  const map = {}
  baseQuestions.concat(supplementQuestions).forEach(question => {
    map[question.id] = question
  })
  return map
}

function getAnswerOption(question, value) {
  if (!question || !value) return null
  return question.options.find(item => item.value === value) || null
}

function collectEvidence(questionList, answers) {
  const axisEvidence = {}
  Object.keys(axes).forEach(id => { axisEvidence[id] = [] })

  const traces = []
  questionList.forEach(question => {
    const value = answers[question.id]
    const option = getAnswerOption(question, value)
    if (!option) return

    traces.push({
      questionId: question.id,
      platform: question.platform,
      scene: question.scene,
      trace: option.trace,
      answer: option.label,
      signals: option.signals || {}
    })

    Object.keys(option.signals || {}).forEach(axisId => {
      if (!axisEvidence[axisId]) axisEvidence[axisId] = []
      axisEvidence[axisId].push({
        value: option.signals[axisId],
        platform: question.platform,
        questionId: question.id,
        trace: option.trace
      })
    })
  })

  return { axisEvidence, traces }
}

function summarizeAxis(axisId, evidence) {
  const values = evidence.map(item => item.value)
  if (!values.length) {
    return {
      id: axisId,
      label: axes[axisId].label,
      observed: false,
      state: '尚未充分观察',
      average: 0,
      evidenceCount: 0,
      mixed: false,
      confidence: 0
    }
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  const positive = values.filter(value => value >= 0.35).length
  const negative = values.filter(value => value <= -0.35).length
  const mixed = positive > 0 && negative > 0
  const evidenceCount = values.length
  const magnitude = Math.abs(average)
  const confidence = clamp((evidenceCount / 3) * 0.65 + magnitude * 0.35, 0, 1)

  let state = '尚未充分观察'
  let observed = false
  if (evidenceCount >= 2) {
    observed = true
    if (mixed && magnitude < 0.45) state = '不同场景表现不一致'
    else if (magnitude < 0.22) state = '暂无明显行为倾向'
    else state = average > 0 ? axes[axisId].high : axes[axisId].low
  }

  return {
    id: axisId,
    label: axes[axisId].label,
    observed,
    state,
    average: Number(average.toFixed(3)),
    evidenceCount,
    mixed,
    confidence: Number(confidence.toFixed(3))
  }
}

function analyze(questionList, answers) {
  const { axisEvidence, traces } = collectEvidence(questionList, answers)
  const axisSummaries = Object.keys(axes).map(id => summarizeAxis(id, axisEvidence[id]))
  return { axisSummaries, axisEvidence, traces }
}

function chooseSupplements(answers, limit = 2) {
  const firstAnalysis = analyze(baseQuestions, answers)
  const priority = firstAnalysis.axisSummaries
    .map(item => ({
      id: item.id,
      score: (item.evidenceCount < 2 ? 100 : 0) + (1 - item.confidence) * 20 + (Math.abs(item.average) < 0.22 ? 8 : 0)
    }))
    .sort((a, b) => b.score - a.score)

  const chosen = []
  priority.forEach(item => {
    if (chosen.length >= limit) return
    const question = supplementQuestions.find(q => q.targetAxis === item.id)
    if (question && !chosen.find(existing => existing.id === question.id)) chosen.push(question)
  })

  return chosen
}

function confidenceLabel(summary) {
  if (!summary || !summary.observed) return '证据不足'
  if (summary.mixed) return '场景不一致'
  if (summary.confidence >= 0.78) return '较强'
  if (summary.confidence >= 0.58) return '中等'
  return '初步'
}

function buildPlatformInference(platformId, questionList, answers) {
  const platform = platformMeta[platformId]
  const platformQuestions = questionList.filter(question => question.platform === platformId)
  const { axisEvidence, traces } = collectEvidence(platformQuestions, answers)
  const summaries = Object.keys(axes).map(id => summarizeAxis(id, axisEvidence[id]))

  const ranked = summaries
    .filter(item => item.evidenceCount > 0)
    .sort((a, b) => {
      const aScore = (a.observed ? 2 : 0) + Math.abs(a.average) + Math.min(a.evidenceCount, 3) * 0.2
      const bScore = (b.observed ? 2 : 0) + Math.abs(b.average) + Math.min(b.evidenceCount, 3) * 0.2
      return bScore - aScore
    })

  const candidates = ranked.slice(0, 2).map(summary => {
    const related = (axisEvidence[summary.id] || []).slice(0, 2)
    const traceText = related.map(item => item.trace).join('；')

    let inference = '目前只有零散痕迹，算法还不应该继续往下猜。'
    if (summary.observed) {
      if (summary.state === '暂无明显行为倾向') {
        inference = '目前没有观察到足够明显、稳定的行为倾向。'
      } else if (summary.state === '不同场景表现不一致') {
        inference = '你在不同场景里的表现并不一致，算法不应该把它压成单一结论。'
      } else {
        const pair = platform.copies[summary.id]
        if (pair) inference = summary.average >= 0 ? pair[1] : pair[0]
      }
    }

    return {
      axisId: summary.id,
      axisLabel: summary.label,
      traceText,
      inference,
      confidence: confidenceLabel(summary),
      observed: summary.observed,
      evidenceCount: summary.evidenceCount,
      feedback: ''
    }
  })

  return {
    ...platform,
    traces: traces.map(item => item.trace),
    inferences: candidates,
    observedCount: traces.length
  }
}

function buildFirstResult(questionList, answers) {
  const analysis = analyze(questionList, answers)
  const platforms = ['meituan', 'douyin', 'xiaohongshu']
    .map(id => buildPlatformInference(id, questionList, answers))

  const observedAxes = analysis.axisSummaries.filter(item => item.observed)
  const unknownAxes = analysis.axisSummaries.filter(item => !item.observed)
  const mixedAxes = analysis.axisSummaries.filter(item => item.mixed)

  const anchors = analysis.traces.slice(0, 2).map(item => item.trace)
  const colorCoverage = clamp(18 + analysis.traces.length * 6 + observedAxes.length * 4, 20, 72)

  return {
    createdAt: Date.now(),
    questionCount: analysis.traces.length,
    answers,
    questionIds: questionList.map(item => item.id),
    platforms,
    observedAxes,
    unknownAxes,
    mixedAxes,
    anchors,
    colorCoverage,
    summary: `我们只看了 ${analysis.traces.length} 个日常选择，算法已经开始形成局部投影。但仍有 ${unknownAxes.length} 个行为侧面证据不足。`
  }
}

function restoreQuestions(questionIds) {
  const map = getQuestionMap()
  return (questionIds || []).map(id => map[id]).filter(Boolean)
}

module.exports = {
  analyze,
  chooseSupplements,
  buildFirstResult,
  restoreQuestions,
  baseQuestions,
  supplementQuestions,
  platformMeta,
  axes
}
