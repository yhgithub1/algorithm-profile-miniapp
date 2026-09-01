const { buildProfileGraph } = require('../../utils/profile-graph')
const { buildPersona } = require('../../utils/persona')
const { applyFeedback, feedbackStats, persistFeedback } = require('../../utils/feedback')

Page({
  data: {
    profile: [],
    selectedTags: [],
    feedbackMap: {},
    feedbackStats: {
      total: 0,
      accurate: 0,
      unsure: 0,
      inaccurate: 0
    },
    persona: {
      title: '多元观察者',
      summary: '',
      evidenceTotal: 0,
      correctedCount: 0,
      completeness: 0,
      items: []
    },
    graphWidth: 340,
    graphHeight: 420,
    visibleDepth: 0,
    maxDepth: 0,
    animationDone: false
  },

  onLoad() {
    const app = getApp()
    const baseProfile = app.globalData.profile || []
    const selectedTags = app.globalData.selectedTags || []

    this.baseProfile = baseProfile.map(item => ({
      ...item,
      originalScore: item.originalScore || item.score
    }))

    const feedbackMap = {}
    const profile = applyFeedback(this.baseProfile, feedbackMap)
    const persona = buildPersona(selectedTags, feedbackMap)

    this.setData({
      profile,
      selectedTags,
      feedbackMap,
      feedbackStats: feedbackStats(feedbackMap),
      persona
    })
  },

  onReady() {
    this.prepareGraph(true)
  },

  onUnload() {
    if (this.animationTimer) clearTimeout(this.animationTimer)
  },

  prepareGraph(animate = false) {
    const graph = buildProfileGraph(this.data.selectedTags, this.data.profile)
    this.graph = graph

    this.setData({
      graphWidth: graph.width,
      graphHeight: graph.height,
      maxDepth: graph.maxDepth,
      visibleDepth: animate ? 0 : graph.maxDepth,
      animationDone: !animate
    }, () => {
      if (animate) {
        setTimeout(() => this.startAnimation(), 80)
      } else {
        this.drawGraph(graph.maxDepth)
      }
    })
  },

  startAnimation() {
    if (!this.graph) return
    if (this.animationTimer) clearTimeout(this.animationTimer)

    let depth = 0
    const step = () => {
      this.setData({ visibleDepth: depth })
      this.drawGraph(depth)

      if (depth < this.graph.maxDepth) {
        depth += 1
        this.animationTimer = setTimeout(step, 620)
      } else {
        this.setData({ animationDone: true })
      }
    }

    step()
  },

  replay() {
    this.startAnimation()
  },

  submitFeedback(e) {
    const nodeId = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    const feedbackMap = { ...this.data.feedbackMap }

    if (feedbackMap[nodeId] === status) {
      delete feedbackMap[nodeId]
    } else {
      feedbackMap[nodeId] = status
      persistFeedback(this.data.selectedTags, nodeId, status)
    }

    const profile = applyFeedback(this.baseProfile, feedbackMap)
    const persona = buildPersona(this.data.selectedTags, feedbackMap)

    this.setData({
      feedbackMap,
      feedbackStats: feedbackStats(feedbackMap),
      profile,
      persona
    }, () => {
      this.prepareGraph(false)
    })
  },

  resetFeedback() {
    const feedbackMap = {}
    const profile = applyFeedback(this.baseProfile, feedbackMap)
    const persona = buildPersona(this.data.selectedTags, feedbackMap)

    this.setData({
      feedbackMap,
      feedbackStats: feedbackStats(feedbackMap),
      profile,
      persona
    }, () => {
      this.prepareGraph(false)
    })
  },

  drawGraph(visibleDepth) {
    const graph = this.graph
    if (!graph) return

    const ctx = wx.createCanvasContext('profileGraph', this)
    const nodeMap = {}
    graph.nodes.forEach(node => {
      nodeMap[node.id] = node
    })

    ctx.setFillStyle('#f8fafc')
    ctx.fillRect(0, 0, graph.width, graph.height)

    graph.edges.forEach(edge => {
      const from = nodeMap[edge.from]
      const to = nodeMap[edge.to]
      if (!from || !to || from.depth > visibleDepth || to.depth > visibleDepth) return

      const startX = from.x + from.width / 2
      const startY = from.y + from.height
      const endX = to.x + to.width / 2
      const endY = to.y
      const controlOffset = Math.max(28, (endY - startY) * 0.45)
      const weakened = from.feedback === 'inaccurate' || to.feedback === 'inaccurate'
      const uncertain = from.feedback === 'unsure' || to.feedback === 'unsure'

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(
        startX,
        startY + controlOffset,
        endX,
        endY - controlOffset,
        endX,
        endY
      )
      ctx.setStrokeStyle(weakened ? '#fecaca' : (uncertain ? '#fde68a' : '#cbd5e1'))
      ctx.setLineWidth(weakened ? 1 : 1.5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(endX - 4, endY - 7)
      ctx.lineTo(endX, endY)
      ctx.lineTo(endX + 4, endY - 7)
      ctx.setStrokeStyle(weakened ? '#fca5a5' : (uncertain ? '#fbbf24' : '#94a3b8'))
      ctx.setLineWidth(1.2)
      ctx.stroke()
    })

    graph.nodes.forEach(node => {
      if (node.depth > visibleDepth) return
      this.drawNode(ctx, node)
    })

    ctx.draw()
  },

  drawNode(ctx, node) {
    const palettes = {
      input: {
        fill: '#111827',
        stroke: '#111827',
        title: '#ffffff',
        meta: '#cbd5e1'
      },
      inference: {
        fill: '#ffffff',
        stroke: '#d8dee8',
        title: '#1f2937',
        meta: '#64748b'
      },
      dimension: {
        fill: '#f3e8ff',
        stroke: '#a855f7',
        title: '#581c87',
        meta: '#7e22ce'
      },
      inaccurate: {
        fill: '#fff7f7',
        stroke: '#fca5a5',
        title: '#991b1b',
        meta: '#b91c1c'
      },
      unsure: {
        fill: '#fffbeb',
        stroke: '#fbbf24',
        title: '#92400e',
        meta: '#a16207'
      },
      accurate: {
        fill: '#f0fdf4',
        stroke: '#86efac',
        title: '#166534',
        meta: '#15803d'
      }
    }

    const palette = node.feedback ? palettes[node.feedback] : (palettes[node.type] || palettes.inference)
    const x = node.x
    const y = node.y
    const w = node.width
    const h = node.height
    const radius = 13

    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.setFillStyle(palette.fill)
    ctx.fill()
    ctx.setStrokeStyle(palette.stroke)
    ctx.setLineWidth(node.type === 'dimension' ? 2 : 1)
    ctx.stroke()

    const lines = this.wrapLabel(node.label, 9)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.setFillStyle(palette.title)
    ctx.setFontSize(13)

    if (lines.length === 1) {
      ctx.fillText(lines[0], x + w / 2, y + 24)
    } else {
      ctx.fillText(lines[0], x + w / 2, y + 18)
      ctx.fillText(lines[1], x + w / 2, y + 35)
    }

    ctx.setFillStyle(palette.meta)
    ctx.setFontSize(10)
    const meta = node.type === 'input'
      ? '用户线索'
      : `${node.feedback === 'inaccurate' ? '已削弱 · ' : ''}${node.score}%`
    ctx.fillText(meta, x + w / 2, y + h - 10)
  },

  wrapLabel(text, maxChars) {
    if (!text || text.length <= maxChars) return [text || '']
    return [
      text.slice(0, maxChars),
      text.slice(maxChars, maxChars * 2)
    ]
  },

  again() {
    wx.navigateBack({ delta: 1 })
  }
})