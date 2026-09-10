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
    const platforms = (result.platforms || []).map(platform => ({
      ...platform,
      inferences: (platform.inferences || []).map(item => {
        const key = `${platform.id}:${item.axisId}`
        const selectedFeedback = feedback[key] || ''
        return {
          ...item,
          feedbackKey: key,
          selectedFeedback,
          feedbackNote: selectedFeedback === 'wrong'
            ? '算法看到了行为，却可能误解了原因。这个结论会被降权。'
            : (selectedFeedback === 'right' ? '这条推断得到了你的确认。' : '')
        }
      })
    }))

    return {
      ...result,
      platforms,
      unknownText: (result.unknownAxes || []).map(item => item.label).join(' · '),
      coverageStyle: `opacity:${Math.min(0.78, 0.22 + (result.colorCoverage || 30) / 130)};`
    }
  },

  feedbackInference(e) {
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
    return {
      title: '我们只看了几个日常选择，算法已经开始猜了',
      path: '/pages/index/index'
    }
  }
})
