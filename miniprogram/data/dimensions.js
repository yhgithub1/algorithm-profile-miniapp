const dimensions = [
  { id: 'exploration', label: '探索度', lowLabel: '熟悉优先', highLabel: '主动探索' },
  { id: 'deepDive', label: '深挖度', lowLabel: '快速浏览', highLabel: '持续深挖' },
  { id: 'nostalgia', label: '怀旧度', lowLabel: '偏重新内容', highLabel: '经典内容共鸣' },
  { id: 'priceSensitivity', label: '价格敏感', lowLabel: '便利优先', highLabel: '价格比较' },
  { id: 'decisionCare', label: '决策谨慎', lowLabel: '快速决定', highLabel: '比较后决定' },
  { id: 'contentInitiative', label: '内容主动性', lowLabel: '推荐驱动', highLabel: '主动搜索' },
  { id: 'socialExpression', label: '社交表达', lowLabel: '私人消费', highLabel: '讨论互动' },
  { id: 'trendSensitivity', label: '热点敏感', lowLabel: '稳定兴趣', highLabel: '趋势驱动' }
]

// delta 只代表“用户主动提供的行为证据”对维度位置的贡献，不是心理学量表分数。
const dimensionEvidence = {
  jay: [
    { dimension: 'nostalgia', delta: 18, reason: '经典华语流行音乐可形成怀旧文化线索' },
    { dimension: 'deepDive', delta: 5, reason: '明确歌手偏好提供轻度垂直兴趣证据' }
  ],
  jj: [
    { dimension: 'nostalgia', delta: 12, reason: '经典华语流行音乐可形成年代文化线索' },
    { dimension: 'deepDive', delta: 5, reason: '明确歌手偏好提供轻度垂直兴趣证据' }
  ],
  mayday: [
    { dimension: 'nostalgia', delta: 15, reason: '经典乐团偏好可形成年代文化与青春记忆线索' },
    { dimension: 'deepDive', delta: 5, reason: '明确乐团偏好提供轻度垂直兴趣证据' }
  ],
  huanzhu: [{ dimension: 'nostalgia', delta: 22, reason: '经典大众影视是较强的怀旧文化线索' }],
  zhenhuan: [
    { dimension: 'deepDive', delta: 10, reason: '剧情型长内容偏好可增加持续追踪复杂内容的证据' },
    { dimension: 'nostalgia', delta: 8, reason: '长期流行的经典剧集提供一定年代文化线索' }
  ],
  wulin: [{ dimension: 'nostalgia', delta: 20, reason: '经典大众影视是较强的怀旧文化线索' }],
  qqzone: [{ dimension: 'nostalgia', delta: 20, reason: '早期社交互联网记忆增强怀旧维度' }],
  tieba: [
    { dimension: 'nostalgia', delta: 16, reason: '早期社区互联网经历增强年代记忆线索' },
    { dimension: 'socialExpression', delta: 8, reason: '社区型互联网经历提供轻度讨论互动线索' }
  ],
  bilibili_long: [{ dimension: 'deepDive', delta: 20, reason: '偏好长视频提供明显的深度内容消费证据' }],

  coupon: [
    { dimension: 'priceSensitivity', delta: 28, reason: '主动找优惠券是直接的价格比较行为' },
    { dimension: 'decisionCare', delta: 18, reason: '购买前寻找优惠体现决策前的信息搜集' }
  ],
  compare_reviews: [
    { dimension: 'decisionCare', delta: 28, reason: '下单前大量查看评价是直接的谨慎决策证据' },
    { dimension: 'contentInitiative', delta: 10, reason: '主动搜索评价体现信息获取主动性' },
    { dimension: 'deepDive', delta: 6, reason: '持续阅读评价提供轻度深挖证据' }
  ],
  wait_discount: [
    { dimension: 'priceSensitivity', delta: 24, reason: '愿意等待活动说明价格会明显影响购买时点' },
    { dimension: 'decisionCare', delta: 10, reason: '延迟购买体现一定的计划与比较过程' }
  ],
  convenience_first: [
    { dimension: 'priceSensitivity', delta: -24, reason: '明确把省事放在前面，降低价格比较权重' },
    { dimension: 'decisionCare', delta: -10, reason: '便利优先通常减少复杂比较过程' }
  ],

  street_food: [{ dimension: 'exploration', delta: 8, reason: '街边小吃偏好提供轻度本地探索线索' }],
  coffee: [
    { dimension: 'exploration', delta: 12, reason: '探店行为增加主动发现新地点的证据' },
    { dimension: 'socialExpression', delta: 4, reason: '探店内容具有轻度分享与讨论属性' }
  ],
  citywalk: [{ dimension: 'exploration', delta: 22, reason: 'City Walk 是主动发现周边空间的直接证据' }],
  travel: [{ dimension: 'exploration', delta: 24, reason: '周末短途旅行是主动体验新地点的直接证据' }],
  camping: [
    { dimension: 'exploration', delta: 22, reason: '露营与户外活动需要主动寻找新的活动场景' },
    { dimension: 'contentInitiative', delta: 5, reason: '户外活动通常伴随一定的主动攻略和信息搜集' }
  ],

  finish_video: [{ dimension: 'deepDive', delta: 26, reason: '经常完整看完感兴趣内容体现持续注意与深度消费' }],
  active_search: [
    { dimension: 'contentInitiative', delta: 30, reason: '主动搜索比被动接受推荐更能体现内容主动性' },
    { dimension: 'exploration', delta: 20, reason: '主动搜索新信息增强探索维度' },
    { dimension: 'deepDive', delta: 10, reason: '主动搜索也可能意味着对已有兴趣继续追踪' }
  ],
  save_later: [{ dimension: 'deepDive', delta: 15, reason: '收藏稍后再看体现对内容的持续追踪意愿' }],
  comments: [{ dimension: 'socialExpression', delta: 18, reason: '经常查看评论区说明会关注群体表达和讨论语境' }],
  hot_topics: [{ dimension: 'trendSensitivity', delta: 28, reason: '主动追热点是较直接的趋势敏感证据' }],
  familiar_content: [{ dimension: 'exploration', delta: -24, reason: '更愿意看熟悉内容，说明探索新内容的倾向较低' }],
  quick_browse: [{ dimension: 'deepDive', delta: -20, reason: '快速划走不感兴趣内容，体现更快的筛选节奏' }],
  private_consume: [{ dimension: 'socialExpression', delta: -26, reason: '明确偏好独自消费内容，降低讨论互动维度' }],
  avoid_hot: [{ dimension: 'trendSensitivity', delta: -28, reason: '明确不追热点，更偏向稳定兴趣而非趋势驱动' }]
}

module.exports = { dimensions, dimensionEvidence }
