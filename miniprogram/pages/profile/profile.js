Page({
  data: {
    profile: []
  },

  onLoad() {
    const profile = getApp().globalData.profile || []
    this.setData({ profile })
  },

  again() {
    wx.navigateBack({ delta: 1 })
  }
})
