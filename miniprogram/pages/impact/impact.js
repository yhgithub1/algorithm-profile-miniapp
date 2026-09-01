const { buildPersona } = require('../../utils/persona')
const { buildImpact } = require('../../utils/impact')

Page({
  data: {
    persona: null,
    impact: null
  },

  onLoad() {
    const app = getApp()
    const selectedTags = app.globalData.selectedTags || []
    const feedbackMap = app.globalData.feedbackMap || {}
    const profile = app.globalData.adjustedProfile || app.globalData.profile || []
    const persona = app.globalData.persona || buildPersona(selectedTags, feedbackMap)
    const rawPersona = buildPersona(selectedTags, {})
    const impact = buildImpact(persona, rawPersona, profile)

    this.setData({ persona, impact })
  },

  backToProfile() {
    wx.navigateBack({ delta: 1 })
  }
})
