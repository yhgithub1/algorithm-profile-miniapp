const rules = [
  { from: 'jay', to: 'cn_pop', weight: 0.92, reason: '明确喜欢周杰伦，可直接关联到华语流行音乐兴趣' },
  { from: 'jj', to: 'cn_pop', weight: 0.90, reason: '明确喜欢林俊杰，可直接关联到华语流行音乐兴趣' },
  { from: 'mayday', to: 'cn_pop', weight: 0.90, reason: '明确喜欢五月天，可直接关联到华语流行音乐兴趣' },
  { from: 'cn_pop', to: 'nostalgia', weight: 0.70, reason: '经典流行音乐兴趣可能增强年代文化与怀旧内容共鸣' },

  { from: 'huanzhu', to: 'classic_tv', weight: 0.94, reason: '《还珠格格》属于经典大众影视内容' },
  { from: 'wulin', to: 'classic_tv', weight: 0.92, reason: '《武林外传》属于经典大众影视内容' },
  { from: 'zhenhuan', to: 'costume_drama', weight: 0.91, reason: '《甄嬛传》可直接关联到古装与剧情型内容兴趣' },
  { from: 'classic_tv', to: 'nostalgia', weight: 0.76, reason: '经典影视内容可能增强怀旧文化偏好' },
  { from: 'costume_drama', to: 'deep_story', weight: 0.68, reason: '剧情型长内容可能形成持续追踪人物与情节的倾向' },

  { from: 'qqzone', to: 'early_web', weight: 0.95, reason: 'QQ空间是明显的早期社交互联网记忆线索' },
  { from: 'tieba', to: 'early_web', weight: 0.88, reason: '贴吧使用经历可提供较明显的早期社区互联网线索' },
  { from: 'early_web', to: 'nostalgia', weight: 0.68, reason: '早期互联网记忆可能与怀旧内容形成关联' },
  { from: 'bilibili_long', to: 'longform_content', weight: 0.90, reason: '偏好长视频是明显的长内容消费线索' },
  { from: 'longform_content', to: 'deep_consume', weight: 0.84, reason: '持续消费长内容通常需要更高的注意投入' },

  { from: 'coupon', to: 'price_compare', weight: 0.93, reason: '主动找优惠券是直接的价格比较行为线索' },
  { from: 'wait_discount', to: 'price_compare', weight: 0.89, reason: '愿意等待促销说明价格会影响购买时点' },
  { from: 'compare_reviews', to: 'decision_research', weight: 0.93, reason: '下单前大量查看评价体现决策前信息搜集' },
  { from: 'price_compare', to: 'price_sensitive', weight: 0.90, reason: '持续比价与优惠搜索通常意味着更高价格敏感度' },
  { from: 'decision_research', to: 'decision_care', weight: 0.90, reason: '信息搜集和比较会增强谨慎决策倾向' },
  { from: 'convenience_first', to: 'convenience_preference', weight: 0.93, reason: '明确把省事放在前面，体现便利优先倾向' },

  { from: 'street_food', to: 'local_life', weight: 0.76, reason: '街边小吃与本地餐饮发现存在直接关联' },
  { from: 'coffee', to: 'local_life', weight: 0.79, reason: '咖啡探店可形成明显的本地生活探索线索' },
  { from: 'citywalk', to: 'local_explore', weight: 0.90, reason: 'City Walk 直接体现对周边空间与新地点的探索' },
  { from: 'travel', to: 'weekend_explore', weight: 0.88, reason: '周末短途旅行体现对周边新体验的主动探索' },
  { from: 'camping', to: 'weekend_explore', weight: 0.86, reason: '露营和户外活动通常需要主动寻找新的活动场景' },
  { from: 'local_life', to: 'local_explore', weight: 0.74, reason: '持续发现本地生活内容可能增强周边探索倾向' },
  { from: 'local_explore', to: 'exploration', weight: 0.84, reason: '主动发现新地点是探索型行为的重要证据' },
  { from: 'weekend_explore', to: 'exploration', weight: 0.82, reason: '主动体验新地点可增加探索倾向' },

  { from: 'finish_video', to: 'deep_consume', weight: 0.82, reason: '经常完整看完感兴趣内容，说明更偏向深度消费' },
  { from: 'save_later', to: 'deep_consume', weight: 0.72, reason: '收藏稍后再看体现对内容的持续追踪意愿' },
  { from: 'deep_story', to: 'deep_consume', weight: 0.74, reason: '持续追踪复杂剧情可增强深度内容消费证据' },
  { from: 'deep_consume', to: 'deep_dive', weight: 0.90, reason: '持续投入内容可进一步汇聚到深挖维度' },

  { from: 'active_search', to: 'active_explore', weight: 0.94, reason: '主动搜索比被动接受推荐更能体现探索主动性' },
  { from: 'compare_reviews', to: 'active_explore', weight: 0.68, reason: '主动查找评价也是主动获取外部信息的一种行为' },
  { from: 'active_explore', to: 'exploration', weight: 0.88, reason: '主动搜索是探索型行为的重要证据' },

  { from: 'comments', to: 'social_context', weight: 0.82, reason: '经常查看评论区，说明会关注他人的表达与群体语境' },
  { from: 'social_context', to: 'social_expression', weight: 0.70, reason: '关注群体语境可能提升内容互动和社交讨论倾向' },
  { from: 'private_consume', to: 'private_mode', weight: 0.92, reason: '明确偏好独自消费内容，属于较强的私人使用线索' },

  { from: 'hot_topics', to: 'trend_follow', weight: 0.92, reason: '主动追近期热点是明显的热点敏感线索' },
  { from: 'trend_follow', to: 'trend_score', weight: 0.88, reason: '持续关注热点可形成较高的趋势敏感度' },
  { from: 'avoid_hot', to: 'stable_interest', weight: 0.92, reason: '明确不追热点，更偏向稳定兴趣而非趋势驱动' },

  { from: 'familiar_content', to: 'familiar_preference', weight: 0.92, reason: '明确更愿意看熟悉内容，体现熟悉优先倾向' },
  { from: 'quick_browse', to: 'quick_consume', weight: 0.90, reason: '快速划走不感兴趣内容，体现快速筛选的消费节奏' },

  { from: 'nostalgia', to: 'nostalgia_score', weight: 0.88, reason: '多个经典文化线索汇聚后形成怀旧维度' },
  { from: 'price_sensitive', to: 'price_score', weight: 0.95, reason: '价格比较行为进一步汇聚到价格敏感维度' },
  { from: 'decision_care', to: 'decision_score', weight: 0.92, reason: '决策前信息搜集进一步汇聚到谨慎决策维度' }
]

const labels = {
  cn_pop: '华语流行音乐兴趣',
  classic_tv: '经典影视兴趣',
  costume_drama: '古装剧情内容兴趣',
  deep_story: '复杂剧情持续追踪',
  early_web: '早期社交互联网记忆',
  longform_content: '长内容偏好',
  nostalgia: '怀旧文化倾向',
  price_compare: '比价行为倾向',
  price_sensitive: '价格敏感度较高',
  decision_research: '决策前信息搜集',
  decision_care: '决策谨慎倾向',
  convenience_preference: '便利优先倾向',
  local_life: '本地生活兴趣',
  local_explore: '本地探索倾向',
  weekend_explore: '周末探索倾向',
  deep_consume: '内容深挖倾向',
  active_explore: '主动探索倾向',
  social_context: '关注群体语境',
  social_expression: '社交讨论倾向',
  private_mode: '私人内容消费倾向',
  trend_follow: '热点跟随倾向',
  trend_score: '热点敏感度',
  stable_interest: '稳定兴趣倾向',
  familiar_preference: '熟悉内容优先',
  quick_consume: '快速筛选倾向',
  exploration: '探索度',
  deep_dive: '深挖度',
  nostalgia_score: '怀旧度',
  price_score: '价格敏感度',
  decision_score: '决策谨慎度'
}

module.exports = { rules, labels }
