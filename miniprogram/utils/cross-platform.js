const { globalAxes } = require('../data/platforms')

function average(values) {
  if (!values.length) return 50
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length)
}

function descriptor(id, score) {
  const labels = {
    price: ['便利优先', '精细比价'],
    exploration: ['熟悉优先', '主动探索'],
    planning: ['随性决定', '提前规划'],
    depth: ['快速消费', '持续深挖'],
    social: ['私人消费', '表达分享'],
    nostalgia: ['偏重新内容', '经典共鸣'],
    convenience: ['过程体验', '效率便利']
  }
  const pair = labels[id] || ['低', '高']
  if (score >= 62) return pair[1]
  if (score <= 38) return pair[0]
  return '中间型'
}

function buildTwinTitle(axisMap) {
  if (axisMap.price >= 63 && axisMap.planning >= 60) return '理性规划型数字分身'
  if (axisMap.exploration >= 63 && axisMap.depth >= 60) return '深度探索型数字分身'
  if (axisMap.convenience >= 63 && axisMap.price >= 58) return '高效务实型数字分身'
  if (axisMap.nostalgia >= 63 && axisMap.depth >= 58) return '经典深潜型数字分身'
  if (axisMap.social >= 63 && axisMap.exploration >= 56) return '外向发现型数字分身'
  if (axisMap.depth >= 65) return '深度研究型数字分身'
  return '多面生活型数字分身'
}

function buildCrossPlatform(profiles) {
  const valid = (profiles || []).filter(Boolean)
  const axisMap = {}
  const axes = Object.keys(globalAxes).map(id => {
    const values = valid.map(profile => profile.globalSignals && profile.globalSignals[id]).filter(value => typeof value === 'number')
    const score = average(values)
    axisMap[id] = score
    return {
      id,
      label: globalAxes[id],
      score,
      descriptor: descriptor(id, score),
      sourceCount: values.length
    }
  })

  const strongest = [...axes]
    .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
    .slice(0, 3)

  const title = buildTwinTitle(axisMap)
  const platformNames = valid.map(item => item.platform.shortName).join('、')
  const summary = valid.length
    ? `把${platformNames}这些原本分散的行为放在一起后，一个更完整的“数字分身”开始出现：${strongest.map(item => `${item.label}更偏向“${item.descriptor}”`).join('，')}。`
    : '至少完成一个平台画像后，才能开始拼出跨平台数字分身。'

  const snapshots = valid.map(profile => ({
    platformId: profile.platformId,
    icon: profile.platform.icon,
    name: profile.platform.name,
    title: profile.title,
    tags: profile.tags.slice(0, 3)
  }))

  const overlap = []
  axes.forEach(axis => {
    if (axis.sourceCount < 2 || Math.abs(axis.score - 50) < 8) return
    overlap.push(`${axis.label}在多个平台中出现一致信号，合并后可信度会显得更高。`)
  })

  return {
    completedCount: valid.length,
    title,
    summary,
    axes,
    snapshots,
    overlap: overlap.slice(0, 4),
    enough: valid.length >= 2
  }
}

module.exports = { buildCrossPlatform }
