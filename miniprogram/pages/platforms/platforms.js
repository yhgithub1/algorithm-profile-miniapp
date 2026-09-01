const { platforms } = require('../../data/platforms')

Page({
  data: {
    platforms: [],
    completedCount: 0
  },

  onShow() {
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    const list = platforms.map(item => ({
      ...item,
      completed: !!saved[item.id],
      resultTitle: saved[item.id] ? saved[item.id].title : ''
    }))
    this.setData({
      platforms: list,
      completedCount: Object.keys(saved).length
    })
  },

  openPlatform(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/survey/survey?platform=${id}` })
  },

  goMerge() {
    wx.navigateTo({ url: '/pages/merge/merge' })
  },

  goAdvanced() {
    wx.navigateTo({ url: '/pages/select/select' })
  }
})
