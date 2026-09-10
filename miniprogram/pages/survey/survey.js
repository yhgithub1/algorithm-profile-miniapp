const { getObservationPlatform } = require('../../data/observation-platforms')
const { buildPlatformObservation } = require('../../utils/observation-engine')

const FRAGMENT_COLORS = ['#6f7bf7', '#f28b72', '#f3bf4f', '#55b9a7', '#bd78d6', '#ef6d8c']

Page({
  data: {
    platform: null,
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    currentSelected: {},
    answers: {},
    progress: 0,
    fragments: [],
    flyingFragment: null,
    fragmentAnimation: null
  },

  onLoad(options) {
    const platform = getObservationPlatform(options.platform)
    if (!platform) {
      wx.showToast({ title: '观察视角不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }

    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    const previous = saved[platform.id]
    const answers = previous && previous.answers ? previous.answers : {}

    this.setData({
      platform,
      questions: platform.questions,
      answers,
      fragments: this.buildFragments(platform, answers)
    }, () => this.refreshQuestion())
  },

  buildFragments(platform, answers) {
    if (!platform) return []
    const fragments = []
    platform.questions.forEach((question, index) => {
      const value = answers[question.id]
      const option = question.options.find(item => item.value === value)
      if (!option) return
      const seed = (index * 37 + String(value).length * 13) % 100
      fragments.push({
        id: question.id,
        label: option.label,
        style: `left:${18 + (seed % 62)}%;top:${12 + ((seed * 3) % 66)}%;background:${FRAGMENT_COLORS[index % FRAGMENT_COLORS.length]};transform:rotate(${(seed % 22) - 11}deg);`
      })
    })
    return fragments
  },

  refreshQuestion() {
    const question = this.data.questions[this.data.currentIndex]
    const selected = this.data.answers[question.id]
    const currentSelected = {}
    if (selected) currentSelected[selected] = true

    this.setData({
      currentQuestion: question,
      currentSelected,
      progress: Math.round(((this.data.currentIndex + 1) / this.data.questions.length) * 100)
    })
  },

  selectOption(e) {
    const value = e.currentTarget.dataset.value
    const question = this.data.currentQuestion
    const option = question.options.find(item => item.value === value)
    if (!option) return

    const answers = { ...this.data.answers, [question.id]: value }
    this.setData({ answers }, () => this.refreshQuestion())
    this.flyFragment(e, option, answers)
  },

  flyFragment(e, option, answers) {
    const query = wx.createSelectorQuery().in(this)
    query.select(`#option-${option.value}`).boundingClientRect(rect => {
      if (!rect) {
        this.setData({ fragments: this.buildFragments(this.data.platform, answers) })
        return
      }

      const info = typeof wx.getWindowInfo === 'function' ? wx.getWindowInfo() : wx.getSystemInfoSync()
      const targetX = info.windowWidth / 2 - rect.left - 26
      const targetY = info.windowHeight - 190 - rect.top
      const colorIndex = this.data.currentIndex % FRAGMENT_COLORS.length
      const animation = wx.createAnimation({ duration: 520, timingFunction: 'ease-in-out' })

      this.setData({
        flyingFragment: {
          label: option.label,
          style: `left:${rect.left}px;top:${rect.top}px;background:${FRAGMENT_COLORS[colorIndex]};`
        },
        fragmentAnimation: null
      })

      setTimeout(() => {
        animation.translate(targetX, targetY).scale(0.34).rotate((Math.random() * 50) - 25).opacity(0).step()
        this.setData({ fragmentAnimation: animation.export() })
      }, 20)

      setTimeout(() => {
        this.setData({
          fragments: this.buildFragments(this.data.platform, answers),
          flyingFragment: null,
          fragmentAnimation: null
        })
      }, 570)
    }).exec()
  },

  hasAnswer() {
    const question = this.data.currentQuestion
    return !!this.data.answers[question.id]
  },

  next() {
    if (!this.hasAnswer()) {
      wx.showToast({ title: '先选择一个行为', icon: 'none' })
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
    const profile = buildPlatformObservation(this.data.platform.id, this.data.answers)
    const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
    saved[this.data.platform.id] = profile
    wx.setStorageSync('algorithmPlatformProfiles', saved)

    getApp().globalData.currentPlatformProfile = profile
    wx.redirectTo({ url: `/pages/platform-result/platform-result?platform=${this.data.platform.id}` })
  }
})
