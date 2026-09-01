const { getPlatform } = require('../../data/platforms')
const { SCREENSHOT_ANALYZER_BASE } = require('../../config/api')
const { buildScreenshotProfile } = require('../../utils/screenshot-profile')

Page({
  data: {
    platform: null,
    platformId: '',
    maxImages: 4,
    images: [],
    analyzing: false,
    progressText: '',
    result: null,
    errorText: ''
  },

  onLoad(options) {
    const platformId = options.platform
    const platform = getPlatform(platformId)
    if (!platform) {
      wx.showToast({ title: '平台参数无效', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }

    this.setData({
      platform,
      platformId,
      maxImages: platformId === 'douyin' ? 9 : 4
    })
  },

  chooseImages() {
    const remaining = this.data.maxImages - this.data.images.length
    if (remaining <= 0) {
      wx.showToast({ title: `最多上传 ${this.data.maxImages} 张`, icon: 'none' })
      return
    }

    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['compressed'],
      success: res => {
        const files = (res.tempFiles || []).map(item => ({
          path: item.tempFilePath,
          size: item.size || 0
        }))
        this.setData({
          images: [...this.data.images, ...files].slice(0, this.data.maxImages),
          result: null,
          errorText: ''
        })
      }
    })
  },

  removeImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    const images = this.data.images.filter((_, itemIndex) => itemIndex !== index)
    this.setData({ images, result: null })
  },

  previewImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    wx.previewImage({
      current: this.data.images[index].path,
      urls: this.data.images.map(item => item.path)
    })
  },

  uploadOne(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${SCREENSHOT_ANALYZER_BASE}/analyze`,
        filePath,
        name: 'file',
        formData: { platform: this.data.platformId },
        timeout: 120000,
        success: res => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`服务返回 ${res.statusCode}`))
            return
          }

          try {
            const payload = JSON.parse(res.data)
            if (!payload.ok || !payload.analysis) {
              reject(new Error(payload.detail || '识别结果为空'))
              return
            }
            resolve(payload.analysis)
          } catch (error) {
            reject(new Error('识别结果解析失败'))
          }
        },
        fail: error => reject(new Error(error.errMsg || '上传失败'))
      })
    })
  },

  async analyze() {
    if (!this.data.images.length || this.data.analyzing) return

    this.setData({
      analyzing: true,
      progressText: '准备分析…',
      errorText: '',
      result: null
    })

    try {
      const analyses = []
      for (let index = 0; index < this.data.images.length; index += 1) {
        this.setData({
          progressText: `正在分析第 ${index + 1} / ${this.data.images.length} 张…`
        })
        const analysis = await this.uploadOne(this.data.images[index].path)
        analyses.push(analysis)
      }

      const result = buildScreenshotProfile(this.data.platformId, analyses)
      if (!result) throw new Error('未能生成截图画像')

      const saved = wx.getStorageSync('algorithmPlatformProfiles') || {}
      saved[this.data.platformId] = result
      wx.setStorageSync('algorithmPlatformProfiles', saved)

      this.setData({
        result,
        progressText: '分析完成'
      })
    } catch (error) {
      this.setData({
        errorText: `${error.message || error}。请确认本地分析服务已启动，开发者工具已允许本地请求。`,
        progressText: ''
      })
    } finally {
      this.setData({ analyzing: false })
    }
  },

  goMerge() {
    wx.navigateTo({ url: '/pages/merge/merge' })
  },

  goPlatforms() {
    wx.navigateBack({ delta: 1 })
  }
})
