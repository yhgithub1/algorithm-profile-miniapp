const { buildCrossPlatform } = require('../../utils/cross-platform')

Page({
  data: {
    twin: null
  },

  onShow() {
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    const profiles = Object.keys(saved).map(id => saved[id])
    const twin = buildCrossPlatform(profiles)
    this.setData({ twin })
  },

  goPlatforms() {
    wx.navigateTo({ url: '/pages/platforms/platforms' })
  },

  openPlatform(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/platform-result/platform-result?platform=${id}` })
  },

  resetAll() {
    wx.showModal({
      title: '清空所有平台画像？',
      content: '只会删除本机保存的问答和画像，不影响其他功能。',
      success: res => {
        if (!res.confirm) return
        wx.removeStorageSync('algorithmPlatformProfiles')
        this.setData({ twin: buildCrossPlatform([]) })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.twin ? `我的跨平台数字分身：${this.data.twin.title}` : '看看不同 App 眼中的你',
      path: '/pages/index/index'
    }
  }
})
