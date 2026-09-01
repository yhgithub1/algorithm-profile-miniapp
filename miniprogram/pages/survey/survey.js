const { getPlatform } = require('../../data/platforms')
const { buildPlatformProfile } = require('../../utils/platform-profile')

Page({
  data: {
    platform: null,
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    currentSelected: {},
    answers: {},
    progress: 0
  },

  onLoad(options) {
    const platform = getPlatform(options.platform)
    if (!platform) {
      wx.showToast({ title: '平台配置不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }

    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    const previous = saved[platform.id]
    const answers = previous && previous.answers ? previous.answers : {}

    this.setData({
      platform,
      questions: platform.questions,
      answers
    }, () => this.refreshQuestion())
  },

  refreshQuestion() {
    const question = this.data.questions[this.data.currentIndex]
    const selected = this.data.answers[question.id]
    const currentSelected = {}

    if (Array.isArray(selected)) {
      selected.forEach(value => { currentSelected[value] = true })
    } else if (selected) {
      currentSelected[selected] = true
    }

    this.setData({
      currentQuestion: question,
      currentSelected,
      progress: Math.round(((this.data.currentIndex + 1) / this.data.questions.length) * 100)
    })
  },

  selectOption(e) {
    const value = e.currentTarget.dataset.value
    const question = this.data.currentQuestion
    const answers = { ...this.data.answers }

    if (question.type === 'multiple') {
      const list = Array.isArray(answers[question.id]) ? [...answers[question.id]] : []
      const index = list.indexOf(value)
      if (index >= 0) {
        list.splice(index, 1)
      } else {
        if (question.max && list.length >= question.max) {
          wx.showToast({ title: `最多选择 ${question.max} 个`, icon: 'none' })
          return
        }
        list.push(value)
      }
      answers[question.id] = list
    } else {
      answers[question.id] = value
    }

    this.setData({ answers }, () => this.refreshQuestion())
  },

  hasAnswer() {
    const question = this.data.currentQuestion
    const value = this.data.answers[question.id]
    return Array.isArray(value) ? value.length > 0 : !!value
  },

  next() {
    if (!this.hasAnswer()) {
      wx.showToast({ title: '先选择一个答案', icon: 'none' })
      return
    }

    if (this.data.currentIndex >= this.data.questions.length - 1) {
      this.finish()
      return
    }

    this.setData({ currentIndex: this.data.currentIndex + 1 }, () => this.refreshQuestion())
  },

  previous() {
    if (this.data.currentIndex === 0) {
      wx.navigateBack()
      return
    }
    this.setData({ currentIndex: this.data.currentIndex - 1 }, () => this.refreshQuestion())
  },

  finish() {
    const profile = buildPlatformProfile(this.data.platform.id, this.data.answers)
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    saved[this.data.platform.id] = profile
    wx.setStorageSync('algorithmPlatformProfiles', saved)

    const app = getApp()
    app.globalData.currentPlatformProfile = profile

    wx.redirectTo({ url: `/pages/platform-result/platform-result?platform=${this.data.platform.id}` })
  }
})
