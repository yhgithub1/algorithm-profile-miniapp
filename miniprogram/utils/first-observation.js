const { axes, platformMeta, baseQuestions, supplementQuestions } = require('../data/first-observation')

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function unique(list) {
  return list.filter((item, index) => list.indexOf(item) === index)
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

  const mean = average(values)
  const positive = values.filter(value => value >= 0.35).length
  const negative = values.filter(value => value <= -0.35).length
  const mixed = positive > 0 && negative > 0
  const evidenceCount = values.length
  const magnitude = Math.abs(mean)
  const confidence = clamp((evidenceCount / 3) * 0.65 + magnitude * 0.35, 0, 1)

  let state = '尚未充分观察'
  let observed = false
  if (evidenceCount >= 2) {
    observed = true
    if (mixed && magnitude < 0.45) state = '不同场景表现不一致'
    else if (magnitude < 0.22) state = '暂无明显行为倾向'
    else state = mean > 0 ? axes[axisId].high : axes[axisId].low
  }

  return {
    id: axisId,
    label: axes[axisId].label,
    observed,
    state,
    average: Number(mean.toFixed(3)),
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

function evidenceFor(analysis, axisIds, limit = 4) {
  const rows = []
  axisIds.forEach(axisId => {
    ;(analysis.axisEvidence[axisId] || [])
      .slice()
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .forEach(item => {
        if (!rows.find(row => row.trace === item.trace)) {
          rows.push({
            trace: item.trace,
            platformId: item.platform,
            platformName: platformMeta[item.platform] ? platformMeta[item.platform].name : item.platform,
            value: item.value
          })
        }
      })
  })
  return rows.slice(0, limit)
}

function platformAxisStats(analysis, axisId) {
  const grouped = {}
  ;(analysis.axisEvidence[axisId] || []).forEach(item => {
    if (!grouped[item.platform]) grouped[item.platform] = []
    grouped[item.platform].push(item.value)
  })
  return Object.keys(grouped).map(platformId => ({
    platformId,
    name: platformMeta[platformId] ? platformMeta[platformId].name : platformId,
    value: Number(average(grouped[platformId]).toFixed(3))
  }))
}

function axisMap(analysis) {
  return analysis.axisSummaries.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})
}

function makeDiscovery(id, title, lead, explanation, axisIds, analysis, priority) {
  const evidence = evidenceFor(analysis, axisIds, 4)
  return {
    id,
    title,
    lead,
    explanation,
    axisIds,
    evidence,
    evidenceText: evidence.map(item => item.trace).join(' · '),
    priority
  }
}

function buildDiscoveries(analysis) {
  const map = axisMap(analysis)
  const candidates = []

  Object.keys(axes).forEach(axisId => {
    const stats = platformAxisStats(analysis, axisId).filter(item => Math.abs(item.value) >= 0.22)
    if (stats.length < 2) return
    const positive = stats.slice().sort((a, b) => b.value - a.value)[0]
    const negative = stats.slice().sort((a, b) => a.value - b.value)[0]
    if (!positive || !negative || positive.value < 0.28 || negative.value > -0.28) return

    const titles = {
      decision: '你的决策方式有明显的“场景开关”',
      exploration: '你的探索欲不是固定值，而是看场景',
      depth: '你并不是一直“深挖”，也不是一直“快刷”',
      expression: '你愿不愿意表达，很看场景',
      planning: '你的计划性不是一个固定性格'
    }
    const highs = {
      decision: '更愿意比较、查证以后再决定',
      exploration: '更愿意尝试和扩展新选项',
      depth: '更容易继续搜索或投入更多注意力',
      expression: '更愿意留下显性的互动反馈',
      planning: '更容易把行动提前安排好'
    }
    const lows = {
      decision: '反而更愿意快速结束选择',
      exploration: '反而更偏向熟悉和稳定',
      depth: '反而更偏快速浏览和筛选',
      expression: '反而更偏向只看不说',
      planning: '反而更多在需求出现后再行动'
    }

    candidates.push(makeDiscovery(
      `switch-${axisId}`,
      titles[axisId],
      `${positive.name}里的你${highs[axisId]}，但到了${negative.name}，你${lows[axisId]}。`,
      '这意味着把某一个平台里的行为直接当成你的“稳定性格”会很危险：它看到的可能只是你在那个场景下采用的一种策略。',
      [axisId],
      analysis,
      100 + Math.abs(positive.value - negative.value) * 10
    ))
  })

  if (map.depth && map.expression && map.depth.observed && map.expression.observed && map.depth.average >= 0.28 && map.expression.average <= -0.22) {
    candidates.push(makeDiscovery(
      'quiet-interest',
      '你留下的兴趣信号，比社交信号更强',
      '你可能很少公开评论或表达，但停留、继续搜索、收藏这类低可见行为，仍然会持续把兴趣暴露给推荐系统。',
      '所以“别人看不出你对什么感兴趣”和“算法看不出你对什么感兴趣”完全是两回事。对推荐系统来说，沉默并不等于没有信号。',
      ['depth', 'expression'],
      analysis,
      92
    ))
  }

  if (map.depth && map.expression && map.depth.observed && map.expression.observed && map.depth.average <= -0.22 && map.expression.average >= 0.28) {
    candidates.push(makeDiscovery(
      'visible-fast',
      '你留下的反馈很显眼，但兴趣未必会持续很久',
      '你愿意点赞、评论或分享，但在注意力上更偏快速筛选。算法可能收到很多“显性反馈”，却不一定能判断哪些兴趣真正稳定。',
      '高互动不等于高投入。平台如果只看互动次数，可能把短暂反应误当成长期偏好。',
      ['depth', 'expression'],
      analysis,
      90
    ))
  }

  if (map.decision && map.depth && map.decision.observed && map.depth.observed && map.decision.average >= 0.26 && map.depth.average >= 0.26) {
    candidates.push(makeDiscovery(
      'reduce-uncertainty',
      '你可能不是“犹豫”，而是不喜欢在信息不足时做决定',
      '当一个选择值得投入时，你更容易通过评价、搜索、比较或继续查看，把不确定性先降下来，再决定要不要行动。',
      '外表上它看起来像“想得多”，但行为结构更像是主动补信息。算法如果只看到搜索次数，很容易把它误解成强购买意愿或长期纠结。',
      ['decision', 'depth'],
      analysis,
      88
    ))
  }

  if (map.exploration && map.decision && map.exploration.observed && map.decision.observed && map.exploration.average >= 0.28 && map.decision.average >= 0.24) {
    candidates.push(makeDiscovery(
      'selective-explorer',
      '你会尝新，但“探索”并不等于冲动',
      '你对新选项有兴趣，同时又会补充信息再做决定。新鲜感更像一个入口，而不是让你立刻行动的按钮。',
      '这类行为很容易被平台拆成两个不同标签：一边认为你爱尝新，一边又认为你转化慢。其实它们可能来自同一个模式——先探索，再筛选。',
      ['exploration', 'decision'],
      analysis,
      84
    ))
  }

  if (map.exploration && map.depth && map.exploration.observed && map.depth.observed && map.exploration.average <= -0.24 && map.depth.average >= 0.28) {
    candidates.push(makeDiscovery(
      'narrow-but-deep',
      '你不一定追求更多选项，但会把注意力给真正选中的东西',
      '在“要不要换一个”这件事上你可能偏稳定，可一旦某件事真的进入兴趣范围，你又会持续看、继续搜或反复确认。',
      '因此“选择范围窄”和“兴趣不强”不是一回事。只看选择数量的平台，可能低估你的实际投入深度。',
      ['exploration', 'depth'],
      analysis,
      82
    ))
  }

  if (map.planning && map.expression && map.planning.observed && map.expression.observed && map.planning.average >= 0.28 && map.expression.average <= -0.22) {
    candidates.push(makeDiscovery(
      'private-planner',
      '你更常把信息留给未来的自己，而不是公开表达',
      '收藏、稍后处理、提前安排这类行为，可能比评论和分享更接近你的真实使用方式。',
      '平台会把这些“留给以后”的动作当成未来意图，但它并不知道你最后会不会真的行动。收藏是线索，不是承诺。',
      ['planning', 'expression'],
      analysis,
      80
    ))
  }

  const fallbackCopy = {
    decision: {
      high: ['你真正稳定的可能不是“谨慎”，而是先降低不确定性', '在需要做选择时，你更容易先补信息、比较或查证，再决定下一步。', '这是一种决策策略，不等于优柔寡断，也不等于每次都愿意花很多时间。'],
      low: ['你会主动压低很多日常选择的决策成本', '一些场景里，你更愿意快速结束选择，而不是把每个决定都变成研究项目。', '快速决定不一定意味着冲动，也可能只是你认为这件事不值得投入更多注意力。']
    },
    exploration: {
      high: ['新鲜感对你来说更像“信息入口”', '你更容易打开新选项、看看不同可能，而不是长期只停留在熟悉范围。', '但这只说明你愿意接触新东西，并不代表你会接受、购买或长期喜欢它。'],
      low: ['熟悉选项可能是你降低日常消耗的一种工具', '你在一些重复场景里更偏向稳定选择，让自己少做一次不必要的决策。', '平台可能把这种行为理解成“保守”，但真实原因也可能只是省时间。']
    },
    depth: {
      high: ['一旦被某件事勾住，你的行为链往往不会停在第一次接触', '继续搜索、查看更多信息或反复确认，会让一个兴趣从“偶然接触”变成更清晰的算法信号。', '平台很容易因此不断强化同类内容，但它不知道这种深挖会持续多久。'],
      low: ['你更常通过快速筛选保护自己的注意力', '面对大量信息时，你更偏向快速判断值不值得继续，而不是平均地把时间分给所有内容。', '算法可能把快速划过理解成“不感兴趣”，但有时它只是没有在几秒内证明自己的价值。']
    },
    expression: {
      high: ['你会主动给算法留下很多“看得见的反馈”', '评论、分享或其他互动，会比单纯观看更快地让系统认为某类内容与你有关。', '显性反馈通常很强，但一次表达也不等于长期身份。'],
      low: ['你不怎么说，但沉默本身也会被算法解释', '少评论、少分享不会让你从算法视野里消失，系统仍会从停留、搜索和选择中寻找替代信号。', '真正的空白很少；很多时候只是从“你说了什么”变成“你做了什么”。']
    },
    planning: {
      high: ['你会把“未来可能要做的事”提前埋进今天的行为里', '收藏、提前安排、延后决定等动作，会让平台形成对未来需求的猜测。', '但未来意图最容易被高估：保存过，不代表最后一定会做。'],
      low: ['你的很多选择更像在需求出现以后才启动', '相比提前安排，你在一些生活场景里更倾向等事情真正发生，再做当前最合适的选择。', '这不一定等于没计划，也可能只是你不愿意为不确定的未来提前投入。']
    }
  }

  analysis.axisSummaries
    .filter(item => item.observed && Math.abs(item.average) >= 0.24)
    .sort((a, b) => (b.confidence + Math.abs(b.average)) - (a.confidence + Math.abs(a.average)))
    .forEach(item => {
      const direction = item.average >= 0 ? 'high' : 'low'
      const copy = fallbackCopy[item.id] && fallbackCopy[item.id][direction]
      if (!copy) return
      candidates.push(makeDiscovery(
        `axis-${item.id}-${direction}`,
        copy[0], copy[1], copy[2], [item.id], analysis,
        55 + item.confidence * 20 + Math.abs(item.average) * 10
      ))
    })

  const selected = []
  const axisUse = {}
  candidates
    .sort((a, b) => b.priority - a.priority)
    .forEach(candidate => {
      if (selected.length >= 3) return
      const overused = candidate.axisIds.every(id => (axisUse[id] || 0) >= 2)
      if (overused) return
      selected.push(candidate)
      candidate.axisIds.forEach(id => { axisUse[id] = (axisUse[id] || 0) + 1 })
    })

  if (selected.length < 3) {
    analysis.traces.slice(0, 3 - selected.length).forEach((trace, index) => {
      selected.push({
        id: `trace-${index}`,
        title: '这条行为目前还不能被安全地概括成一种“性格”',
        lead: `你留下了“${trace.trace}”这条痕迹，但单独一条证据不足以推出更高层结论。`,
        explanation: '保留不确定性本身也是结果：算法如果继续往下猜，就开始从“观察行为”滑向“脑补一个人”。',
        axisIds: [],
        evidence: [{ trace: trace.trace, platformId: trace.platform, platformName: platformMeta[trace.platform] ? platformMeta[trace.platform].name : trace.platform }],
        evidenceText: trace.trace,
        priority: 1
      })
    })
  }

  return selected.slice(0, 3).map((item, index) => ({
    ...item,
    number: `0${index + 1}`
  }))
}

function buildBlindSpot(analysis) {
  const map = axisMap(analysis)
  const mixed = analysis.axisSummaries.find(item => item.mixed)
  if (mixed) {
    return {
      title: '平台最容易把你的“局部策略”误当成“稳定人格”',
      body: `${mixed.label}在不同场景里出现了相反信号。任何只看一个场景的平台，都可能得到一个看似合理、但并不完整的你。`,
      kicker: '算法最可能误解你的地方'
    }
  }
  if (map.depth && map.expression && map.depth.average >= 0.25 && map.expression.average <= -0.2) {
    return {
      title: '低互动，不等于低兴趣',
      body: '如果只看点赞和评论，平台可能低估你的兴趣；如果把停留、搜索全部算进去，又可能把一次深挖高估成长期偏好。',
      kicker: '算法最可能误解你的地方'
    }
  }
  if (map.decision && map.decision.average >= 0.25) {
    return {
      title: '搜索和比较，不等于“很想买”',
      body: '反复查证可能只是你在降低不确定性。平台如果把研究行为直接当成购买意愿，就可能不断追着你推荐同一类东西。',
      kicker: '算法最可能误解你的地方'
    }
  }
  if (map.exploration && map.exploration.average <= -0.22) {
    return {
      title: '重复选择，不等于保守',
      body: '一直选熟悉的东西，也可能只是你不愿意在低价值决策上浪费时间。算法看得到重复，却看不到你为什么觉得这件事“不值得折腾”。',
      kicker: '算法最可能误解你的地方'
    }
  }
  if (map.planning && map.planning.average >= 0.24) {
    return {
      title: '收藏，不等于未来一定会行动',
      body: '平台很容易把“先放着”解释成未来意图，但收藏有时只是备忘、兴趣或暂时不想做决定。',
      kicker: '算法最可能误解你的地方'
    }
  }
  return {
    title: '行为相同，也可能来自完全不同的原因',
    body: '算法只能看到你做了什么，无法直接知道你为什么这样做。任何结论都应该留出被你反驳的空间。',
    kicker: '算法最可能误解你的地方'
  }
}

function buildConsequence(analysis) {
  const ranked = analysis.axisSummaries
    .filter(item => item.observed)
    .sort((a, b) => Math.abs(b.average) - Math.abs(a.average))
  const strongest = ranked[0]
  if (!strongest) {
    return {
      title: '算法现在还没有足够稳定的信号可以放大',
      steps: ['零散行为', '形成弱假设', '继续观察', '暂不收敛']
    }
  }

  const positive = strongest.average >= 0
  const chains = {
    decision: positive
      ? ['比较 / 查证', '意图信号变强', '相似候选持续出现', '决策路径可能被拉长']
      : ['快速选择', '短链路被强化', '相似捷径更多', '以后更容易继续快速决定'],
    exploration: positive
      ? ['不断尝新', '候选主题扩大', '更多新内容进入', '兴趣边界可能继续被拉宽']
      : ['重复熟悉选择', '相似推荐更有把握', '新选项曝光减少', '行为看起来越来越稳定'],
    depth: positive
      ? ['持续停留 / 搜索', '相关主题权重提高', '同类内容增多', '注意力可能进一步集中']
      : ['快速划过', '系统频繁试探新内容', '主题切换加快', '兴趣画像可能更分散'],
    expression: positive
      ? ['点赞 / 评论 / 分享', '显性反馈权重提高', '推荐更快收敛', '某些兴趣更快被固化']
      : ['很少公开互动', '系统依赖隐性行为', '停留和搜索权重上升', '画像更依赖“猜”'],
    planning: positive
      ? ['收藏 / 延后行动', '被解释为未来意图', '后续重复提醒', '更容易再次进入决策']
      : ['需求出现后再行动', '即时信号更突出', '当下相关推荐增加', '长期意图更难判断']
  }

  return {
    title: '算法不只是在观察，也可能把你现在的行为继续放大',
    axisLabel: strongest.label,
    steps: chains[strongest.id] || ['行为痕迹', '形成假设', '调整推荐', '新的行为痕迹']
  }
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
    tracePreview: traces.slice(0, 2).map(item => item.trace).join(' · '),
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
  const discoveries = buildDiscoveries(analysis)
  const blindSpot = buildBlindSpot(analysis)
  const consequence = buildConsequence(analysis)

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
    discoveries,
    blindSpot,
    consequence,
    anchors,
    colorCoverage,
    summary: `这次真正值得看的，不是你选了什么，而是 ${analysis.traces.length} 条行为放在一起以后，出现了哪些你未必会主动总结出来的模式。`
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
