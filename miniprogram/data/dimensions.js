const dimensions = [
  {
    id: 'exploration',
    label: '探索度',
    lowLabel: '熟悉优先',
    highLabel: '主动探索'
  },
  {
    id: 'deepDive',
    label: '深挖度',
    lowLabel: '快速浏览',
    highLabel: '持续深挖'
  },
  {
    id: 'nostalgia',
    label: '怀旧度',
    lowLabel: '偏重新内容',
    highLabel: '经典内容共鸣'
  },
  {
    id: 'priceSensitivity',
    label: '价格敏感',
    lowLabel: '便利优先',
    highLabel: '价格比较'
  },
  {
    id: 'decisionCare',
    label: '决策谨慎',
    lowLabel: '快速决定',
    highLabel: '比较后决定'
  },
  {
    id: 'contentInitiative',
    label: '内容主动性',
    lowLabel: '推荐驱动',
    highLabel: '主动搜索'
  }
]

// 这里的 delta 是“行为证据对维度位置的贡献”，不是心理学量表分数。
// 第一版只使用用户主动选择的事实线索，避免把二次推断再次当成事实输入。
const dimensionEvidence = {
  jay: [
    { dimension: 'nostalgia', delta: 18, reason: '经典华语流行音乐可形成怀旧文化线索' },
    { dimension: 'deepDive', delta: 5, reason: '明确歌手偏好提供了轻度垂直兴趣证据' }
  ],
  huanzhu: [
    { dimension: 'nostalgia', delta: 22, reason: '经典大众影视是较强的怀旧文化线索' }
  ],
  qqzone: [
    { dimension: 'nostalgia', delta: 20, reason: '早期社交互联网记忆增强怀旧维度' }
  ],
  coupon: [
    { dimension: 'priceSensitivity', delta: 28, reason: '主动找优惠券是直接的价格比较行为' },
    { dimension: 'decisionCare', delta: 18, reason: '购买前寻找优惠体现决策前的信息搜集' }
  ],
  street_food: [
    { dimension: 'exploration', delta: 8, reason: '街边小吃偏好提供轻度本地探索线索' }
  ],
  travel: [
    { dimension: 'exploration', delta: 24, reason: '周末短途旅行是主动体验新地点的直接证据' }
  ],
  finish_video: [
    { dimension: 'deepDive', delta: 26, reason: '经常完整看完感兴趣内容体现持续注意与深度消费' }
  ],
  active_search: [
    { dimension: 'contentInitiative', delta: 30, reason: '主动搜索比被动接受推荐更能体现内容主动性' },
    { dimension: 'exploration', delta: 20, reason: '主动搜索新信息增强探索维度' },
    { dimension: 'deepDive', delta: 10, reason: '主动搜索也可能意味着对已有兴趣继续追踪' }
  ]
}

module.exports = { dimensions, dimensionEvidence }
