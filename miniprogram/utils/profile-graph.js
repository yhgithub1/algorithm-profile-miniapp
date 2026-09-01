const { tags } = require('../data/tags')
const { labels } = require('../data/rules')

const inputLabels = tags.reduce((map, item) => {
  map[item.id] = item.label
  return map
}, {})

const dimensionNodeIds = new Set([
  'exploration',
  'deep_dive',
  'nostalgia_score',
  'price_score',
  'decision_score',
  'social_expression',
  'trend_score',
  'familiar_preference',
  'quick_consume',
  'convenience_preference',
  'private_mode',
  'stable_interest'
])

function nodeLabel(id) {
  return inputLabels[id] || labels[id] || id
}

function isDimension(id) {
  return dimensionNodeIds.has(id)
}

function buildProfileGraph(selectedTags, profile) {
  const profileMap = profile.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})

  const nodeMap = {}
  const edgeMap = {}

  selectedTags.forEach(id => {
    nodeMap[id] = {
      id,
      label: nodeLabel(id),
      depth: 0,
      score: 100,
      type: 'input',
      feedback: ''
    }
  })

  profile.forEach(item => {
    nodeMap[item.id] = {
      id: item.id,
      label: item.label,
      depth: item.depth,
      score: item.score,
      originalScore: item.originalScore || item.score,
      type: isDimension(item.id) ? 'dimension' : 'inference',
      feedback: item.feedback || ''
    }

    item.paths.forEach(path => {
      path.forEach((id, index) => {
        if (!nodeMap[id]) {
          const source = profileMap[id]
          nodeMap[id] = {
            id,
            label: source ? source.label : nodeLabel(id),
            depth: source ? source.depth : index,
            score: source ? source.score : 50,
            originalScore: source ? (source.originalScore || source.score) : 50,
            type: index === 0 ? 'input' : (isDimension(id) ? 'dimension' : 'inference'),
            feedback: source ? (source.feedback || '') : ''
          }
        }

        if (index < path.length - 1) {
          const to = path[index + 1]
          edgeMap[`${id}->${to}`] = { from: id, to }
        }
      })
    })
  })

  const nodes = Object.values(nodeMap)
  const edges = Object.values(edgeMap)
  const maxDepth = nodes.reduce((max, item) => Math.max(max, item.depth), 0)
  const layers = []

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    layers.push(nodes.filter(item => item.depth === depth))
  }

  const nodeWidth = 126
  const nodeHeight = 62
  const horizontalGap = 30
  const verticalGap = 76
  const sidePadding = 28
  const topPadding = 34
  const widestLayer = Math.max(...layers.map(layer => layer.length), 1)
  const width = Math.max(340, sidePadding * 2 + widestLayer * nodeWidth + (widestLayer - 1) * horizontalGap)
  const height = topPadding * 2 + (maxDepth + 1) * nodeHeight + maxDepth * verticalGap

  layers.forEach((layer, depth) => {
    const layerWidth = layer.length * nodeWidth + Math.max(0, layer.length - 1) * horizontalGap
    const startX = (width - layerWidth) / 2
    const y = topPadding + depth * (nodeHeight + verticalGap)

    layer
      .sort((a, b) => b.score - a.score)
      .forEach((node, index) => {
        node.x = startX + index * (nodeWidth + horizontalGap)
        node.y = y
        node.width = nodeWidth
        node.height = nodeHeight
      })
  })

  return { nodes, edges, width, height, maxDepth }
}

module.exports = { buildProfileGraph }
