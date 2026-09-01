const rules = [
  { from: 'jay', to: 'cn_pop', label: '华语流行音乐兴趣', weight: 0.92, reason: '喜欢周杰伦可直接关联到华语流行音乐兴趣' },
  { from: 'cn_pop', to: 'nostalgia', label: '怀旧文化倾向', weight: 0.72, reason: '经典流行音乐兴趣可能增强怀旧内容偏好' },

  { from: 'huanzhu', to: 'classic_tv', label: '经典影视兴趣', weight: 0.94, reason: '《还珠格格》属于经典大众影视内容' },
  { from: 'classic_tv', to: 'nostalgia', label: '怀旧文化倾向', weight: 0.76, reason: '经典影视内容可能增强怀旧文化偏好' },

  { from: 'qqzone', to: 'early_web', label: '早期社交互联网记忆', weight: 0.95, reason: 'QQ空间是明显的早期社交互联网线索' },
  { from: 'early_web', to: 'nostalgia', label: '怀旧文化倾向', weight: 0.68, reason: '早期互联网记忆可能与怀旧内容形成关联' },

  { from: 'coupon', to: 'price_compare', label: '比价行为倾向', weight: 0.93, reason: '主动找优惠券是直接的价格比较行为线索' },
  { from: 'price_compare', to: 'price_sensitive', label: '价格敏感度较高', weight: 0.90, reason: '持续比价与优惠搜索通常意味着更高价格敏感度' },

  { from: 'street_food', to: 'local_life', label: '本地生活兴趣', weight: 0.74, reason: '街边小吃与本地餐饮发现存在直接关联' },
  { from: 'travel', to: 'weekend_explore', label: '周末探索倾向', weight: 0.88, reason: '周末短途旅行体现对周边新体验的主动探索' },

  { from: 'finish_video', to: 'deep_consume', label: '内容深挖倾向', weight: 0.82, reason: '经常完整看完感兴趣内容，说明更偏向深度消费' },
  { from: 'active_search', to: 'active_explore', label: '主动探索倾向', weight: 0.94, reason: '主动搜索比被动接受推荐更能体现探索主动性' },

  { from: 'weekend_explore', to: 'exploration', label: '探索度', weight: 0.78, reason: '主动体验新地点可增加探索倾向' },
  { from: 'active_explore', to: 'exploration', label: '探索度', weight: 0.88, reason: '主动搜索是探索型行为的重要证据' },
  { from: 'deep_consume', to: 'deep_dive', label: '深挖度', weight: 0.90, reason: '长时间消费同类内容可增加深挖倾向' },
  { from: 'nostalgia', to: 'nostalgia_score', label: '怀旧度', weight: 0.88, reason: '多个经典文化线索汇聚后形成怀旧维度' },
  { from: 'price_sensitive', to: 'price_score', label: '价格敏感度', weight: 0.95, reason: '价格比较行为进一步汇聚到价格敏感维度' }
]

const labels = {
  cn_pop: '华语流行音乐兴趣',
  classic_tv: '经典影视兴趣',
  early_web: '早期社交互联网记忆',
  nostalgia: '怀旧文化倾向',
  price_compare: '比价行为倾向',
  price_sensitive: '价格敏感度较高',
  local_life: '本地生活兴趣',
  weekend_explore: '周末探索倾向',
  deep_consume: '内容深挖倾向',
  active_explore: '主动探索倾向',
  exploration: '探索度',
  deep_dive: '深挖度',
  nostalgia_score: '怀旧度',
  price_score: '价格敏感度'
}

module.exports = { rules, labels }
