const { observationPlatforms } = require('../../data/observation-platforms')

Page({
  data: {
    platforms: [],
    completedCount: 0
  },

  onShow() {
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    const list = observationPlatforms.map(item => ({
      ...item,
      completed: !!saved[item.id],
      inferenceCount: saved[item.id] ? (saved[item.id].inferences || []).length : 0,
      observedCount: saved[item.id] ? (saved[item.id].observedCount || 0) : 0
    }))

    this.setData({
      platforms: list,
      completedCount: list.filter(item => item.completed).length
    })
  },

  openPlatform(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/survey/survey?platform=${id}` })
  },

  goMerge() {
    wx.navigateTo({ url: '/pages/merge/merge' })
  }
})
