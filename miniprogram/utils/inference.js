const { rules, labels } = require('../data/rules')

function combine(oldScore, newScore) {
  return 1 - (1 - oldScore) * (1 - newScore)
}

function infer(selectedTags, maxDepth = 3) {
  const state = {}
  const queue = []

  selectedTags.forEach(id => {
    state[id] = {
      score: 1,
      depth: 0,
      paths: [[id]],
      reasons: ['用户主动选择']
    }
    queue.push(id)
  })

  while (queue.length) {
    const from = queue.shift()
    const source = state[from]
    if (!source || source.depth >= maxDepth) continue

    rules
      .filter(rule => rule.from === from)
      .forEach(rule => {
        const candidate = source.score * rule.weight
        const oldScore = state[rule.to] ? state[rule.to].score : 0
        const merged = combine(oldScore, candidate)

        if (!state[rule.to]) {
          state[rule.to] = {
            score: merged,
            depth: source.depth + 1,
            paths: source.paths.map(path => [...path, rule.to]),
            reasons: [rule.reason]
          }
          queue.push(rule.to)
        } else if (merged - oldScore > 0.02) {
          state[rule.to].score = merged
          state[rule.to].paths.push(...source.paths.map(path => [...path, rule.to]))
          state[rule.to].reasons.push(rule.reason)
          queue.push(rule.to)
        }
      })
  }

  const selectedSet = new Set(selectedTags)

  return Object.entries(state)
    .filter(([id]) => !selectedSet.has(id))
    .map(([id, value]) => ({
      id,
      label: labels[id] || id,
      score: Math.round(value.score * 100),
      depth: value.depth,
      reasons: [...new Set(value.reasons)].slice(0, 3),
      paths: value.paths.slice(0, 3)
    }))
    .filter(item => item.score >= 38)
    .sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth
      return b.score - a.score
    })
}

module.exports = { infer }
