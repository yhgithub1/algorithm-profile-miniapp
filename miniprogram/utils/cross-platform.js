const { observationAxes } = require('../data/observation-platforms')

function describeAxis(id, values) {
  const meta = observationAxes[id]
  if (!values.length) return { observed: false, descriptor: '尚未充分观察', raw: null, mixed: false }

  const positive = values.filter(value => value >= 0.25).length
  const negative = values.filter(value => value <= -0.25).length
  const mixed = positive > 0 && negative > 0
  const raw = values.reduce((sum, value) => sum + value, 0) / values.length

  if (mixed) {
    return { observed: true, descriptor: '不同场景表现不一致', raw: Number(raw.toFixed(3)), mixed: true }
  }
  if (Math.abs(raw) < 0.18) {
    return { observed: true, descriptor: '暂无明显行为倾向', raw: Number(raw.toFixed(3)), mixed: false }
  }
  return {
    observed: true,
    descriptor: raw > 0 ? meta.high : meta.low,
    raw: Number(raw.toFixed(3)),
    mixed: false
  }
}

function buildCrossPlatform(profiles) {
  const valid = (profiles || []).filter(profile => profile && profile.axes && profile.platform)
  const axes = Object.keys(observationAxes).map(id => {
    const contributors = valid
      .map(profile => {
        const axis = profile.axes.find(item => item.id === id && item.observed)
        return axis && typeof axis.raw === 'number' ? { platform: profile.platform.shortName, value: axis.raw } : null
      })
      .filter(Boolean)
    const info = describeAxis(id, contributors.map(item => item.value))
    return {
      id,
      label: observationAxes[id].label,
      sourceCount: contributors.length,
      sources: contributors.map(item => item.platform),
      ...info
    }
  })

  const observedAxes = axes.filter(item => item.observed)
  const unobservedAxes = axes.filter(item => !item.observed)
  const contrasts = axes
    .filter(item => item.mixed)
    .map(item => `${item.label}在不同生活场景里出现了相反信号，算法暂时不应该把它归结成单一倾向。`)

  const overlap = axes
    .filter(item => item.sourceCount >= 2 && !item.mixed && item.observed && item.raw !== null && Math.abs(item.raw) >= 0.22)
    .map(item => `${item.label}在 ${item.sources.join('、')} 中出现了相近方向的行为痕迹，但这仍只是跨场景的一致性，不代表事实。`)

  const snapshots = valid.map(profile => ({
    platformId: profile.platformId,
    icon: profile.platform.icon,
    name: profile.platform.name,
    viewName: profile.viewName || profile.platform.viewName,
    anchors: (profile.memoryAnchors || []).slice(0, 2),
    inferenceCount: (profile.inferences || []).length
  }))

  const memoryAnchors = valid
    .reduce((list, profile) => list.concat(profile.memoryAnchors || []), [])
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 2)

  const title = valid.length
    ? `算法目前从 ${valid.length} 个生活视角看过你`
    : '你的数字投影还是空白的'

  const summary = valid.length
    ? `这些视角一共留下了 ${snapshots.reduce((sum, item) => sum + item.inferenceCount, 0)} 条概率推断。它们只是不同平台从外在行为看到的局部投影，不是对“你是谁”的定义。`
    : '先选择一个平台场景。每多一个视角，数字分身才会多一块可解释的行为投影。'

  return {
    completedCount: valid.length,
    title,
    summary,
    axes,
    observedAxes,
    unobservedAxes,
    snapshots,
    overlap: overlap.slice(0, 4),
    contrasts: contrasts.slice(0, 4),
    memoryAnchors,
    enough: valid.length >= 2
  }
}

module.exports = { buildCrossPlatform }
