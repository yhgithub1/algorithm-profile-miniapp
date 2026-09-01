const { tags } = require('../../data/tags')
const { buildPersona } = require('../../utils/persona')

Page({
  data: {
    persona: null,
    selectedLabels: [],
    cardReady: false,
    tempFilePath: ''
  },

  onLoad() {
    const app = getApp()
    const selectedTags = app.globalData.selectedTags || []
    const feedbackMap = app.globalData.feedbackMap || {}
    const persona = app.globalData.persona || buildPersona(selectedTags, feedbackMap)
    const selectedLabels = selectedTags
      .map(id => tags.find(item => item.id === id)?.label)
      .filter(Boolean)

    this.setData({ persona, selectedLabels })
  },

  onReady() {
    this.drawCard()
  },

  drawCard() {
    const persona = this.data.persona
    if (!persona) return

    const ctx = wx.createCanvasContext('shareCanvas', this)
    const width = 320
    const height = 520

    ctx.setFillStyle('#111827')
    ctx.fillRect(0, 0, width, height)

    ctx.setFillStyle('#8b5cf6')
    ctx.fillRect(0, 0, width, 8)

    ctx.setFillStyle('#a5b4fc')
    ctx.setFontSize(11)
    ctx.fillText('ALGORITHM PERSONA', 24, 42)

    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(28)
    ctx.fillText(persona.title || '多元观察者', 24, 82)

    ctx.setFillStyle('#cbd5e1')
    ctx.setFontSize(11)
    this.drawWrappedText(ctx, persona.summary || '', 24, 108, 272, 18, 3)

    ctx.setFillStyle('#1f2937')
    this.roundRect(ctx, 20, 176, 280, 238, 18)
    ctx.fill()

    const activeItems = (persona.items || [])
      .filter(item => item.evidenceCount > 0)
      .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
      .slice(0, 5)

    activeItems.forEach((item, index) => {
      const y = 207 + index * 40
      ctx.setFillStyle('#e5e7eb')
      ctx.setFontSize(11)
      ctx.fillText(item.label, 36, y)

      ctx.setTextAlign('right')
      ctx.setFillStyle('#ffffff')
      ctx.fillText(`${item.score}`, 284, y)
      ctx.setTextAlign('left')

      ctx.setFillStyle('#374151')
      this.roundRect(ctx, 36, y + 9, 248, 6, 3)
      ctx.fill()
      ctx.setFillStyle('#8b5cf6')
      this.roundRect(ctx, 36, y + 9, Math.max(8, 248 * item.score / 100), 6, 3)
      ctx.fill()
    })

    ctx.setFillStyle('#a5b4fc')
    ctx.setFontSize(10)
    ctx.fillText('我的真实线索', 24, 448)

    ctx.setFillStyle('#e5e7eb')
    ctx.setFontSize(10)
    const clueText = this.data.selectedLabels.slice(0, 5).join(' · ')
    this.drawWrappedText(ctx, clueText, 24, 470, 272, 16, 2)

    ctx.setFillStyle('#6b7280')
    ctx.setFontSize(9)
    ctx.fillText('算法侧写 · 仅为可解释算法模拟，不是心理学测评', 24, 506)

    ctx.draw(false, () => {
      setTimeout(() => this.exportTempFile(), 150)
    })
  },

  roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2)
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
  },

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = String(text || '').split('')
    let line = ''
    const lines = []

    chars.forEach(char => {
      const test = line + char
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = char
      } else {
        line = test
      }
    })
    if (line) lines.push(line)

    lines.slice(0, maxLines).forEach((item, index) => {
      const isLast = index === maxLines - 1 && lines.length > maxLines
      ctx.fillText(isLast ? `${item.slice(0, -1)}…` : item, x, y + index * lineHeight)
    })
  },

  exportTempFile() {
    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      width: 320,
      height: 520,
      destWidth: 960,
      destHeight: 1560,
      success: res => {
        this.setData({ cardReady: true, tempFilePath: res.tempFilePath })
      }
    }, this)
  },

  saveCard() {
    if (!this.data.tempFilePath) {
      wx.showToast({ title: '分享卡还在生成', icon: 'none' })
      return
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.tempFilePath,
      success: () => wx.showToast({ title: '已保存到相册' }),
      fail: err => {
        if (String(err.errMsg || '').includes('auth deny')) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在小程序设置中允许保存图片到相册。',
            confirmText: '去设置',
            success: res => {
              if (res.confirm) wx.openSetting()
            }
          })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: `算法眼中的我：${this.data.persona?.title || '数字人格'}`,
      path: '/pages/index/index',
      imageUrl: this.data.tempFilePath || ''
    }
  },

  onShareTimeline() {
    return {
      title: `算法眼中的我：${this.data.persona?.title || '数字人格'}`,
      imageUrl: this.data.tempFilePath || ''
    }
  }
})
