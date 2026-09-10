Page({
  data: {
    result: null,
    feedback: {}
  },

  onLoad() {
    const result = wx.getStorageSync('algorithmFirstProjection') || getApp().globalData.firstProjection
    if (!result) {
      wx.showToast({ title: '先留下几条行为痕迹', icon: 'none' })
      setTimeout(() => wx.redirectTo({ url: '/pages/first-observation/first-observation' }), 500)
      return
    }
    const feedback = wx.getStorageSync('algorithmFirstProjectionFeedback') || {}
    this.setData({ result: this.decorate(result, feedback), feedback })
  },

  decorate(result, feedback) {
    const discoveries = (result.discoveries || []).map(item => {
      const key = `discovery:${item.id}`
      const selectedFeedback = feedback[key] || ''
      return {
        ...item,
        feedbackKey: key,
        selectedFeedback,
        feedbackNote: selectedFeedback === 'wrong'
          ? '你否定了这条发现：这正说明“行为结构”仍然不能替代真实动机。'
          : (selectedFeedback === 'right'
            ? '这条模式得到了你的确认。'
            : (selectedFeedback === 'unsure' ? '先保留它，不把这条模式当成稳定结论。' : ''))
      }
    })

    const platforms = (result.platforms || []).map(platform => ({
      ...platform,
      tracePreview: platform.tracePreview || (platform.traces || []).slice(0, 2).join(' · ')
    }))

    return {
      ...result,
      discoveries,
      platforms,
      unknownText: (result.unknownAxes || []).map(item => item.label).join(' · '),
      coverageStyle: `opacity:${Math.min(0.78, 0.22 + (result.colorCoverage || 30) / 130)};`
    }
  },

  feedbackDiscovery(e) {
    const key = e.currentTarget.dataset.key
    const value = e.currentTarget.dataset.value
    const feedback = { ...this.data.feedback, [key]: value }
    wx.setStorageSync('algorithmFirstProjectionFeedback', feedback)
    const raw = wx.getStorageSync('algorithmFirstProjection') || this.data.result
    this.setData({ feedback, result: this.decorate(raw, feedback) })
  },

  deepen() {
    wx.navigateTo({ url: '/pages/platforms/platforms' })
  },

  restart() {
    wx.showModal({
      title: '重新观察一次？',
      content: '会清除这次首次投影和你的纠错反馈。',
      success: res => {
        if (!res.confirm) return
        wx.removeStorageSync('algorithmFirstProjection')
        wx.removeStorageSync('algorithmFirstProjectionFeedback')
        wx.removeStorageSync('firstObservationDraft')
        wx.redirectTo({ url: '/pages/first-observation/first-observation' })
      }
    })
  },

  onShareAppMessage() {
    const first = this.data.result && this.data.result.discoveries && this.data.result.discoveries[0]
    return {
      title: first ? `算法发现：${first.title}` : '算法从几个日常选择里发现了什么？',
      path: '/pages/index/index'
    }
  }
})
