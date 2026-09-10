const { getObservationPlatform } = require('../../data/observation-platforms')
const { buildPlatformObservation, applyInferenceFeedback } = require('../../utils/observation-engine')

const COLORS = ['#6f7bf7', '#ef8b70', '#e6b84d', '#55b9a7', '#b87ad8', '#ea7190']

Page({
  data: {
    profile: null,
    platform: null,
    visualInferences: [],
    visualFragments: []
  },

  onLoad(options) {
    const id = options.platform
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    let profile = saved[id] || getApp().globalData.currentPlatformProfile
    const platform = getObservationPlatform(id)

    if (profile && !profile.inferences && profile.answers) {
      profile = buildPlatformObservation(id, profile.answers)
      saved[id] = profile
      wx.setStorageSync('algorithmPlatformProfiles', saved)
    }

    if (!profile || !platform) {
      wx.showToast({ title: '还没有这个观察视角', icon: 'none' })
      setTimeout(() => wx.redirectTo({ url: '/pages/platforms/platforms' }), 600)
      return
    }

    this.refresh(profile, platform)
  },

  refresh(profile, platform = this.data.platform) {
    const visualInferences = (profile.inferences || []).map((item, index) => ({
      ...item,
      positionClass: `pos-${index}`,
      feedbackClass: item.feedback ? `feedback-${item.feedback}` : ''
    }))

    const visualFragments = platform.questions.reduce((list, question, index) => {
      const value = profile.answers && profile.answers[question.id]
      const option = question.options.find(item => item.value === value)
      if (!option) return list
      const seed = (index * 31 + String(value).length * 19) % 100
      list.push({
        id: question.id,
        style: `left:${18 + (seed % 62)}%;top:${10 + ((seed * 5) % 68)}%;background:${COLORS[index % COLORS.length]};transform:rotate(${(seed % 28) - 14}deg);`
      })
      return list
    }, [])

    this.setData({ profile, platform, visualInferences, visualFragments })
  },

  feedback(e) {
    const id = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    const profile = applyInferenceFeedback(this.data.profile, id, status)
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    saved[this.data.platform.id] = profile
    wx.setStorageSync('algorithmPlatformProfiles', saved)
    this.refresh(profile)
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
      title: `${this.data.platform.name}从这些行为痕迹里，是这样猜我的`,
      path: '/pages/index/index'
    }
  }
})
