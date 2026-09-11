export const PLATFORM_META = {
  meituan: { name: '美团', view: '生活消费', color: '#E4A72C', soft: '#FFF3CE' },
  douyin: { name: '抖音', view: '内容注意力', color: '#7466D8', soft: '#EEEBFF' },
  xiaohongshu: { name: '小红书', view: '生活决策', color: '#E66F67', soft: '#FFE9E6' }
}

export const AXES = {
  decision: { label: '决策方式', low: '快速结束选择', high: '比较后决定' },
  exploration: { label: '探索方式', low: '熟悉优先', high: '主动尝新' },
  depth: { label: '信息深度', low: '快速浏览', high: '持续深挖' },
  expression: { label: '表达方式', low: '只看不表达', high: '主动互动' },
  planning: { label: '计划方式', low: '临时决定', high: '提前规划' }
}

export const QUESTIONS = [
  {
    id: 'meal', platform: 'meituan', kicker: '中午 · 吃点什么',
    title: '今天不知道吃什么，你更可能先做哪件事？',
    options: [
      { label: '还是那几家，省得想', trace: '吃饭时更常回到熟悉选择', signals: { exploration: -0.9, decision: -0.25 } },
      { label: '搜今天突然想吃的', trace: '会主动搜索当下想吃的东西', signals: { exploration: 0.45, decision: 0.2 } },
      { label: '看看附近有没有没吃过的', trace: '会主动看附近的新店和新选项', signals: { exploration: 0.95 } },
      { label: '先看看券和活动', trace: '下单前会先查看优惠与活动', signals: { decision: 0.5, planning: 0.25 } }
    ]
  },
  {
    id: 'video', platform: 'douyin', kicker: '晚上 · 刷到一个真感兴趣的视频',
    title: '你已经觉得它有意思了，接下来呢？',
    options: [
      { label: '看完就划走', trace: '感兴趣内容看完后也通常直接离开', signals: { depth: -0.25, expression: -0.3 } },
      { label: '点主页看看还有什么', trace: '会继续进入作者主页扩展兴趣', signals: { depth: 0.65, exploration: 0.35 } },
      { label: '搜一下这个话题', trace: '会继续主动搜索相关话题', signals: { depth: 0.95, decision: 0.45, exploration: 0.35 } },
      { label: '收藏 / 转发，以后再看', trace: '会把感兴趣内容保存或转发', signals: { planning: 0.65, expression: 0.35, depth: 0.25 } }
    ]
  },
  {
    id: 'buy', platform: 'xiaohongshu', kicker: '突然 · 很想买一个不了解的东西',
    title: '你第一反应更接近哪一个？',
    options: [
      { label: '喜欢就先买', trace: '面对陌生商品也可能直接行动', signals: { decision: -0.9, planning: -0.45 } },
      { label: '先看大家怎么评价', trace: '陌生商品会先看他人评价', signals: { decision: 0.65, depth: 0.35 } },
      { label: '搜几篇攻略 / 测评', trace: '购买前会主动搜索多篇攻略和测评', signals: { decision: 0.95, depth: 0.85, planning: 0.35 } },
      { label: '先收藏，过几天再说', trace: '会先收藏，把决定延后', signals: { planning: 0.9, decision: 0.35 } }
    ]
  },
  {
    id: 'restaurant', platform: 'meituan', kicker: '周末 · 朋友提到一家新店',
    title: '“看起来还不错”，你通常会怎么接？',
    options: [
      { label: '走，直接去试试', trace: '遇到新店时愿意直接尝试', signals: { exploration: 0.95, decision: -0.25 } },
      { label: '我先搜一下评价', trace: '尝试新店前会先搜索评价', signals: { exploration: 0.35, decision: 0.75, depth: 0.45 } },
      { label: '还是去熟悉的店吧', trace: '面对新店时更偏向熟悉选择', signals: { exploration: -0.95 } },
      { label: '先记着，以后有机会再说', trace: '会保留新选项但延后行动', signals: { exploration: 0.2, planning: 0.65 } }
    ]
  },
  {
    id: 'trend', platform: 'douyin', kicker: '热点 · 到处都在刷',
    title: '它本来不在你的兴趣范围里，你会？',
    options: [
      { label: '不相关就略过', trace: '面对无关热点通常直接略过', signals: { exploration: -0.45, depth: -0.2 } },
      { label: '刷到了就了解一下', trace: '面对热点会做轻量了解', signals: { exploration: 0.15, depth: 0.1 } },
      { label: '主动搜发生了什么', trace: '面对热点会主动搜索背景', signals: { exploration: 0.55, depth: 0.7, decision: 0.35 } },
      { label: '很容易顺着一路看下去', trace: '面对热点会持续追踪相关内容', signals: { exploration: 0.45, depth: 0.9 } }
    ]
  },
  {
    id: 'review', platform: 'xiaohongshu', kicker: '购买前 · 评价好坏参半',
    title: '这个时候你更可能怎么处理？',
    options: [
      { label: '相信第一感觉', trace: '评价冲突时仍可能按第一感觉决定', signals: { decision: -0.7 } },
      { label: '重点看差评说什么', trace: '评价冲突时会重点寻找负面证据', signals: { decision: 0.75, depth: 0.55 } },
      { label: '多看几个平台再决定', trace: '会跨多个来源继续查证', signals: { decision: 0.95, depth: 0.95, planning: 0.35 } },
      { label: '纠结太久就先不买', trace: '信息冲突时会延后购买', signals: { planning: 0.85, decision: 0.4 } }
    ]
  },
  {
    id: 'expression', platform: 'douyin', kicker: '内容 · 真心喜欢的时候',
    title: '你通常会留下什么？',
    options: [
      { label: '基本什么都不留', trace: '即使喜欢也很少公开互动', signals: { expression: -0.95 } },
      { label: '点个赞', trace: '喜欢时主要通过点赞留下反馈', signals: { expression: -0.1 } },
      { label: '收藏起来', trace: '喜欢时更常收藏而不是公开表达', signals: { expression: -0.35, planning: 0.45 } },
      { label: '评论 / 分享给别人', trace: '喜欢时会评论或分享给别人', signals: { expression: 0.95 } }
    ]
  }
]

function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

function collect(answers) {
  const evidence = Object.fromEntries(Object.keys(AXES).map(id => [id, []]))
  const traces = []
  QUESTIONS.forEach(question => {
    const idx = answers[question.id]
    if (idx === undefined) return
    const option = question.options[idx]
    const row = { questionId: question.id, platform: question.platform, trace: option.trace, signals: option.signals }
    traces.push(row)
    Object.entries(option.signals).forEach(([axis, value]) => evidence[axis].push({ value, ...row }))
  })
  return { evidence, traces }
}

function axisSummary(evidence) {
  const map = {}
  Object.keys(AXES).forEach(axis => {
    const rows = evidence[axis]
    const value = average(rows.map(r => r.value))
    map[axis] = { value, count: rows.length, rows, observed: rows.length >= 2 }
  })
  return map
}

function platformStats(evidence, axis) {
  const groups = {}
  evidence[axis].forEach(row => {
    groups[row.platform] ||= []
    groups[row.platform].push(row.value)
  })
  return Object.entries(groups).map(([platform, values]) => ({ platform, value: average(values) }))
}

function evidenceList(evidence, axes, max = 4) {
  const seen = new Set()
  const rows = []
  axes.forEach(axis => {
    [...evidence[axis]].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).forEach(row => {
      if (seen.has(row.trace)) return
      seen.add(row.trace)
      rows.push({ trace: row.trace, platform: PLATFORM_META[row.platform].name })
    })
  })
  return rows.slice(0, max)
}

function discovery(id, title, lead, body, axes, evidence, priority) {
  return { id, title, lead, body, evidence: evidenceList(evidence, axes), priority }
}

function buildDiscoveries(summary, evidence) {
  const list = []
  Object.keys(AXES).forEach(axis => {
    const stats = platformStats(evidence, axis).filter(s => Math.abs(s.value) >= 0.25)
    if (stats.length < 2) return
    const high = [...stats].sort((a, b) => b.value - a.value)[0]
    const low = [...stats].sort((a, b) => a.value - b.value)[0]
    if (high.value > 0.3 && low.value < -0.3) {
      const copy = {
        decision: ['你的决策方式有明显的“场景开关”', '你不是一直谨慎，也不是一直干脆；值不值得投入信息成本，可能才是开关。'],
        exploration: ['你的探索欲不是固定值，而是看场景', '在一个场景里你会主动尝新，在另一个场景里却更愿意回到熟悉选项。'],
        depth: ['你不是一直“深挖”，也不是一直“快刷”', '注意力投入会随着场景价值变化，而不是一种固定性格。'],
        expression: ['你愿不愿意表达，很看场景', '公开互动不是稳定人格，更像是你对不同场景采取的策略。'],
        planning: ['你的计划性并不是一个固定性格', '有些事情你会提前安排，有些事情只有需求出现后才处理。']
      }
      list.push(discovery(`switch-${axis}`, copy[axis][0], `${PLATFORM_META[high.platform].name}里的你和${PLATFORM_META[low.platform].name}里的你，表现出了相反方向。`, copy[axis][1] + ' 如果平台只看其中一面，很容易把“场景策略”误认成稳定人格。', [axis], evidence, 100 + Math.abs(high.value - low.value) * 10))
    }
  })

  if (summary.depth.observed && summary.expression.observed && summary.depth.value > 0.28 && summary.expression.value < -0.2) {
    list.push(discovery('quiet-interest', '你留下的兴趣信号，比社交信号更强', '你可能很少公开表达，但停留、搜索、收藏这些低可见动作仍在不断暴露兴趣。', '所以“别人看不出你喜欢什么”和“推荐系统看不出你喜欢什么”完全是两回事。沉默并不等于没有数据。', ['depth', 'expression'], evidence, 95))
  }
  if (summary.decision.observed && summary.depth.observed && summary.decision.value > 0.25 && summary.depth.value > 0.25) {
    list.push(discovery('uncertainty', '你可能不是“犹豫”，而是不喜欢在信息不足时做决定', '当一个选择值得投入时，你会先补评价、搜索和比较，把不确定性降下来。', '外表看起来像“想得多”，行为结构却更像主动补信息。平台如果只看到搜索次数，可能把它高估成强购买意愿。', ['decision', 'depth'], evidence, 91))
  }
  if (summary.exploration.observed && summary.decision.observed && summary.exploration.value > 0.25 && summary.decision.value > 0.2) {
    list.push(discovery('selective-explorer', '你会尝新，但“探索”并不等于冲动', '新鲜感更像入口；真正行动前，你仍然会筛选和验证。', '平台可能同时把你标成“爱尝新”和“转化慢”，但这两个表面矛盾的标签，可能来自同一个模式：先探索，再筛选。', ['exploration', 'decision'], evidence, 88))
  }
  if (summary.exploration.observed && summary.depth.observed && summary.exploration.value < -0.2 && summary.depth.value > 0.28) {
    list.push(discovery('narrow-deep', '你不一定追求更多选项，但会把注意力给真正选中的东西', '选择范围稳定，不代表兴趣投入浅。', '只看“点了多少不同东西”的平台，可能低估你在少数主题上的实际投入深度。', ['exploration', 'depth'], evidence, 86))
  }
  if (summary.planning.observed && summary.expression.observed && summary.planning.value > 0.25 && summary.expression.value < -0.2) {
    list.push(discovery('private-plan', '你更常把信息留给未来的自己，而不是公开表达', '收藏、稍后处理和延后决定，可能比评论分享更接近你的真实使用方式。', '平台会把这些动作当作“未来意图”，但收藏只是线索，并不是行动承诺。', ['planning', 'expression'], evidence, 84))
  }

  const fallback = Object.entries(summary)
    .filter(([, s]) => s.observed && Math.abs(s.value) > 0.18)
    .sort((a, b) => Math.abs(b[1].value) - Math.abs(a[1].value))
    .map(([axis, s], i) => discovery(`fallback-${axis}`, s.value > 0 ? AXES[axis].high : AXES[axis].low, `这个倾向在多个回答里重复出现，而不是来自单独一道题。`, `它更适合被理解成“目前出现的行为策略”，而不是“你就是这种人”。`, [axis], evidence, 50 - i))

  const merged = [...list, ...fallback].sort((a, b) => b.priority - a.priority)
  const unique = []
  merged.forEach(item => {
    if (!unique.some(x => x.title === item.title)) unique.push(item)
  })
  return unique.slice(0, 3)
}

function buildBlindSpot(summary) {
  if (summary.depth.value > 0.25 && summary.expression.value < -0.2) return { title: '低互动，不等于低兴趣。', body: '你可能几乎不评论，但停留和搜索已经足够让推荐系统建立兴趣判断。' }
  if (summary.decision.value > 0.3 && summary.depth.value > 0.25) return { title: '搜索很多，不等于“特别想买”。', body: '你也可能只是想把不确定性降下来。算法很容易把“查证”误读成“高转化意图”。' }
  if (summary.exploration.value < -0.25) return { title: '重复选择，不等于保守。', body: '也可能只是你在低价值日常决策里主动节省注意力。' }
  if (summary.planning.value > 0.3) return { title: '收藏，不等于未来一定会行动。', body: '平台能看见“留给以后”，却无法知道这个“以后”会不会真的发生。' }
  return { title: '行为相同，不代表动机相同。', body: '平台看得到你做了什么，却看不到你为什么这样做。这是算法画像天然存在的盲区。' }
}

function buildLoop(summary) {
  const ranked = Object.entries(summary).filter(([, s]) => s.observed).sort((a, b) => Math.abs(b[1].value) - Math.abs(a[1].value))
  const axis = ranked[0]?.[0] || 'depth'
  const loops = {
    depth: ['你在某类内容上持续停留 / 搜索', '系统提高相关主题的权重', '下一轮出现更多相似内容', '你的注意力可能进一步集中'],
    exploration: ['你持续打开新选项', '系统扩大推荐范围', '你看到更多跨主题内容', '探索行为可能继续被放大'],
    decision: ['你反复比较 / 查证', '系统识别出更长的决策链', '评价、测评、对比内容变多', '你更容易继续沿着比较路径行动'],
    expression: ['你持续点赞 / 评论 / 分享', '系统收到更强的显性反馈', '相似圈层内容更快收敛', '公开互动可能反过来强化推荐'],
    planning: ['你经常收藏 / 延后处理', '系统把这些动作视作潜在未来意图', '提醒与相关内容持续出现', '尚未发生的兴趣可能被不断强化']
  }
  return { title: '算法不只是在观察你，它还可能放大它已经看到的那一面。', steps: loops[axis] }
}

export function analyzeAnswers(answers) {
  const { evidence, traces } = collect(answers)
  const summary = axisSummary(evidence)
  const discoveries = buildDiscoveries(summary, evidence)
  return {
    traces,
    summary,
    discoveries,
    blindSpot: buildBlindSpot(summary),
    loop: buildLoop(summary),
    platforms: Object.entries(PLATFORM_META).map(([id, meta]) => ({
      id, ...meta,
      traces: traces.filter(t => t.platform === id).map(t => t.trace)
    }))
  }
}
