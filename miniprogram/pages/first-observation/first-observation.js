const {
  baseQuestions,
  chooseSupplements,
  buildFirstResult,
  platformMeta
} = require('../../utils/first-observation')

const TOTAL_STEPS = 8

Page({
  data: {
    questions: baseQuestions,
    currentIndex: 0,
    currentQuestion: baseQuestions[0],
    answers: {},
    selectedValue: '',
    transitioning: false,
    fragments: [],
    stepMarks: Array.from({ length: TOTAL_STEPS }, (_, index) => index),
    totalSteps: TOTAL_STEPS,
    phaseText: '先从几个很普通的选择开始'
  },

  onLoad() {
    const draft = wx.getStorageSync('firstObservationDraft')
    if (draft && draft.answers && draft.currentIndex > 0) {
      const answers = draft.answers
      const supplements = chooseSupplements(answers, 2)
      const questions = baseQuestions.concat(supplements)
      const safeIndex = Math.min(draft.currentIndex, questions.length - 1)
      this.setData({
        answers,
        questions,
        currentIndex: safeIndex,
        currentQuestion: questions[safeIndex],
        fragments: draft.fragments || [],
        phaseText: safeIndex >= baseQuestions.length ? '算法还想看清两个模糊的地方' : '先从几个很普通的选择开始'
      })
    }
  },

  selectOption(e) {
    if (this.data.transitioning) return
    const value = e.currentTarget.dataset.value
    const question = this.data.currentQuestion
    const answers = { ...this.data.answers, [question.id]: value }
    const fragments = this.data.fragments.concat(this.makeFragment(question.platform))

    this.setData({
      answers,
      selectedValue: value,
      transitioning: true,
      fragments
    })

    wx.setStorageSync('firstObservationDraft', {
      answers,
      currentIndex: this.data.currentIndex,
      fragments
    })

    setTimeout(() => this.advance(answers, fragments), 360)
  },

  makeFragment(platformId) {
    const meta = platformMeta[platformId] || platformMeta.douyin
    const left = 26 + Math.round(Math.random() * 48)
    const top = 24 + Math.round(Math.random() * 54)
    const size = 18 + Math.round(Math.random() * 18)
    const rotate = Math.round(Math.random() * 120 - 60)
    return {
      id: `${Date.now()}-${Math.round(Math.random() * 99999)}`,
      color: meta.color,
      style: `left:${left}%;top:${top}%;width:${size}rpx;height:${Math.round(size * 0.72)}rpx;transform:rotate(${rotate}deg);background:${meta.color};`
    }
  },

  advance(answers, fragments) {
    let questions = this.data.questions
    let nextIndex = this.data.currentIndex + 1

    if (this.data.currentIndex === baseQuestions.length - 1) {
      questions = baseQuestions.concat(chooseSupplements(answers, 2))
      nextIndex = baseQuestions.length
    }

    if (nextIndex >= questions.length) {
      const result = buildFirstResult(questions, answers)
      wx.setStorageSync('algorithmFirstProjection', result)
      wx.removeStorageSync('firstObservationDraft')
      getApp().globalData.firstProjection = result
      wx.redirectTo({ url: '/pages/first-result/first-result' })
      return
    }

    this.setData({
      questions,
      currentIndex: nextIndex,
      currentQuestion: questions[nextIndex],
      selectedValue: answers[questions[nextIndex].id] || '',
      transitioning: false,
      fragments,
      phaseText: nextIndex >= baseQuestions.length ? '算法还想看清两个模糊的地方' : '先从几个很普通的选择开始'
    })

    wx.setStorageSync('firstObservationDraft', {
      answers,
      currentIndex: nextIndex,
      fragments
    })
  },

  previous() {
    if (this.data.transitioning) return
    if (this.data.currentIndex === 0) {
      wx.navigateBack()
      return
    }
    const currentIndex = this.data.currentIndex - 1
    const currentQuestion = this.data.questions[currentIndex]
    this.setData({
      currentIndex,
      currentQuestion,
      selectedValue: this.data.answers[currentQuestion.id] || '',
      phaseText: currentIndex >= baseQuestions.length ? '算法还想看清两个模糊的地方' : '先从几个很普通的选择开始'
    })
    wx.setStorageSync('firstObservationDraft', {
      answers: this.data.answers,
      currentIndex,
      fragments: this.data.fragments
    })
  }
})
