const { tags } = require('../../data/tags')
const { infer } = require('../../utils/inference')

Page({
  data: {
    tags,
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

    const selected = [...set]
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

    wx.navigateTo({ url: '/pages/profile/profile' })
  }
})
