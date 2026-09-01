const { tags } = require('../../data/tags')
const { infer } = require('../../utils/inference')

const groupOrder = ['音乐', '影视', '互联网记忆', '互联网使用', '消费习惯', '本地生活', '出行', '内容行为']
const groups = groupOrder
  .map(name => ({ name, items: tags.filter(item => item.group === name) }))
  .filter(group => group.items.length)

const presets = [
  {
    id: 'nostalgia',
    name: '怀旧深潜',
    desc: '适合快速演示年代文化 → 怀旧 → 深挖链路',
    tagIds: ['jay', 'qqzone', 'finish_video', 'active_search']
  },
  {
    id: 'rational',
    name: '理性比价',
    desc: '适合演示价格敏感与谨慎决策',
    tagIds: ['coupon', 'compare_reviews', 'wait_discount', 'active_search']
  },
  {
    id: 'explorer',
    name: '城市探索',
    desc: '适合演示本地生活与主动探索',
    tagIds: ['coffee', 'citywalk', 'travel', 'active_search']
  },
  {
    id: 'quiet',
    name: '安静稳定',
    desc: '适合演示低社交、低热点和熟悉优先',
    tagIds: ['familiar_content', 'private_consume', 'avoid_hot', 'finish_video']
  }
]

Page({
  data: {
    groups,
    presets,
    selected: [],
    selectedMap: {}
  },

  toggle(e) {
    const id = e.currentTarget.dataset.id
    const set = new Set(this.data.selected)

    if (set.has(id)) {
      set.delete(id)
    } else {
      if (set.size >= 5) {
        wx.showToast({ title: '最多选择 5 个', icon: 'none' })
        return
      }
      set.add(id)
    }

    this.syncSelection([...set])
  },

  usePreset(e) {
    const preset = this.data.presets.find(item => item.id === e.currentTarget.dataset.id)
    if (!preset) return
    this.syncSelection(preset.tagIds.slice(0, 5))
  },

  clearSelection() {
    this.syncSelection([])
  },

  syncSelection(selected) {
    const selectedMap = {}
    selected.forEach(item => {
      selectedMap[item] = true
    })
    this.setData({ selected, selectedMap })
  },

  generate() {
    if (this.data.selected.length < 2) return

    const profile = infer(this.data.selected, 3)
    const app = getApp()
    app.globalData.selectedTags = this.data.selected
    app.globalData.profile = profile
    app.globalData.adjustedProfile = profile
    app.globalData.feedbackMap = {}
    app.globalData.persona = null

    wx.navigateTo({ url: '/pages/profile/profile' })
  }
})
