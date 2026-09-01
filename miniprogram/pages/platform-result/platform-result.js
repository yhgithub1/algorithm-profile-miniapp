const { getPlatform } = require('../../data/platforms')

Page({
  data: {
    profile: null,
    platform: null
  },

  onLoad(options) {
    const id = options.platform
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    const profile = saved[id] || getApp().globalData.currentPlatformProfile
    const platform = profile ? profile.platform : getPlatform(id)

    if (!profile || !platform) {
      wx.showToast({ title: '还没有这个平台的画像', icon: 'none' })
      setTimeout(() => wx.redirectTo({ url: '/pages/platforms/platforms' }), 600)
      return
    }

    this.setData({ profile, platform })
  },

  redo() {
    wx.redirectTo({ url: `/pages/survey/survey?platform=${this.data.platform.id}` })
  },

  goPlatforms() {
    wx.redirectTo({ url: '/pages/platforms/platforms' })
  },

  goMerge() {
    wx.navigateTo({ url: '/pages/merge/merge' })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.platform.name}眼中的我：${this.data.profile.title}`,
      path: '/pages/index/index'
    }
  }
})
