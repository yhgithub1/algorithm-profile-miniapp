Page({
  data: {
    hasProjection: false
  },

  onShow() {
    this.setData({ hasProjection: !!wx.getStorageSync('algorithmFirstProjection') })
  },

  start() {
    wx.navigateTo({ url: '/pages/first-observation/first-observation' })
  },

  openProjection() {
    wx.navigateTo({ url: '/pages/first-result/first-result' })
  }
})
