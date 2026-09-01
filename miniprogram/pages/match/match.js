const { tags } = require('../../data/tags')
const { buildMatch } = require('../../utils/match')

const groupOrder = ['音乐', '影视', '互联网记忆', '互联网使用', '消费习惯', '本地生活', '出行', '内容行为']
const groups = groupOrder
  .map(name => ({ name, items: tags.filter(item => item.group === name) }))
  .filter(group => group.items.length)

Page({
  data: {
    groups,
    myTags: [],
    myLabels: [],
    otherTags: [],
    otherMap: {},
    result: null
  },

  onLoad() {
    const myTags = getApp().globalData.selectedTags || []
    const myLabels = myTags
      .map(id => tags.find(item => item.id === id)?.label)
      .filter(Boolean)
    this.setData({ myTags, myLabels })
  },

  toggleOther(e) {
    const id = e.currentTarget.dataset.id
    const set = new Set(this.data.otherTags)

    if (set.has(id)) {
      set.delete(id)
    } else {
      if (set.size >= 5) {
        wx.showToast({ title: '最多选择 5 个', icon: 'none' })
        return
      }
      set.add(id)
    }

    const otherTags = [...set]
    const otherMap = {}
    otherTags.forEach(item => { otherMap[item] = true })
    this.setData({ otherTags, otherMap, result: null })
  },

  useDemoPartner() {
    const pool = [
      ['jj', 'wulin', 'comments', 'citywalk'],
      ['coupon', 'compare_reviews', 'travel', 'active_search'],
      ['familiar_content', 'private_consume', 'avoid_hot', 'finish_video']
    ]
    const otherTags = pool[Math.floor(Math.random() * pool.length)]
    const otherMap = {}
    otherTags.forEach(item => { otherMap[item] = true })
    this.setData({ otherTags, otherMap, result: null })
  },

  calculate() {
    if (this.data.myTags.length < 2 || this.data.otherTags.length < 2) {
      wx.showToast({ title: '双方都至少需要 2 个线索', icon: 'none' })
      return
    }
    this.setData({ result: buildMatch(this.data.myTags, this.data.otherTags) })
  },

  goShare() {
    wx.navigateTo({ url: '/pages/share/share' })
  }
})
