const globalAxes = {
  price: '价格敏感',
  exploration: '探索倾向',
  planning: '计划性',
  depth: '深挖倾向',
  social: '社交表达',
  nostalgia: '经典偏好',
  convenience: '便利优先'
}

const platforms = [
  {
    id: 'takeaway',
    icon: '🥡',
    name: '外卖平台',
    shortName: '外卖',
    color: '#ffedd5',
    accent: '#ea580c',
    subtitle: '从点餐频率、客单价、餐厅选择，看平台可能怎样理解你的生活节奏。',
    dimensions: [
      { id: 'frequency', label: '外卖依赖', low: '偶尔点餐', high: '高频点餐', lowTag: '低频自理型', highTag: '高频外卖型' },
      { id: 'budget', label: '客单预算', low: '经济实惠', high: '品质预算', lowTag: '实惠预算型', highTag: '品质预算型' },
      { id: 'price', label: '优惠敏感', low: '便利优先', high: '先看优惠', lowTag: '便利优先型', highTag: '优惠敏感型' },
      { id: 'novelty', label: '尝新意愿', low: '固定熟店', high: '经常尝新', lowTag: '熟店忠诚型', highTag: '餐厅探索型' },
      { id: 'speed', label: '时效偏好', low: '口味优先', high: '速度优先', lowTag: '口味耐心型', highTag: '效率优先型' }
    ],
    questions: [
      { id: 'frequency', title: '你平时更常自己做饭，还是点外卖？', type: 'single', options: [
        { value: 'cook', label: '基本自己做 / 堂食', effects: { frequency: -28 }, global: { convenience: -12, planning: 8 } },
        { value: '12', label: '每周 1～2 次', effects: { frequency: -8 } },
        { value: '35', label: '每周 3～5 次', effects: { frequency: 16 }, global: { convenience: 8 } },
        { value: 'daily', label: '几乎每天', effects: { frequency: 30 }, global: { convenience: 18 } }
      ]},
      { id: 'budget', title: '你最常见的一顿外卖是多少钱？', type: 'single', options: [
        { value: 'under20', label: '20 元以下', effects: { budget: -24, price: 10 }, global: { price: 10 } },
        { value: '2035', label: '20～35 元', effects: { budget: -6 } },
        { value: '3550', label: '35～50 元', effects: { budget: 12 } },
        { value: '50plus', label: '50 元以上', effects: { budget: 26, price: -8 }, global: { price: -8 } }
      ]},
      { id: 'food', title: '你最常点哪些类型？（可多选）', type: 'multiple', max: 3, options: [
        { value: 'rice', label: '盖饭 / 快餐', effects: { speed: 8 }, global: { convenience: 6 } },
        { value: 'noodle', label: '面 / 粉 / 麻辣烫', effects: { budget: -4 } },
        { value: 'burger', label: '汉堡 / 炸鸡', effects: { speed: 10 }, global: { convenience: 5 } },
        { value: 'drink', label: '咖啡 / 奶茶', effects: { budget: 5, novelty: 5 }, global: { social: 4 } },
        { value: 'light', label: '轻食 / 健身餐', effects: { budget: 8 }, global: { planning: 6 } },
        { value: 'restaurant', label: '品牌餐厅 / 正餐', effects: { budget: 14, speed: -6 } }
      ]},
      { id: 'restaurant', title: '选餐厅时，你通常会怎么选？', type: 'single', options: [
        { value: 'fixed', label: '固定吃熟悉的几家', effects: { novelty: -26 }, global: { exploration: -12 } },
        { value: 'rating', label: '看评分和评论再决定', effects: { novelty: 4, price: 5 }, global: { planning: 12, depth: 7 } },
        { value: 'new', label: '经常点没吃过的新店', effects: { novelty: 28 }, global: { exploration: 18 } },
        { value: 'fast', label: '谁送得快就点谁', effects: { speed: 28 }, global: { convenience: 18 } }
      ]},
      { id: 'coupon', title: '下单前你会特意找红包、满减或优惠券吗？', type: 'single', options: [
        { value: 'always', label: '基本都会', effects: { price: 30 }, global: { price: 24, planning: 8 } },
        { value: 'sometimes', label: '有时会', effects: { price: 10 }, global: { price: 8 } },
        { value: 'rare', label: '很少，想吃就点', effects: { price: -22 }, global: { price: -16, convenience: 8 } }
      ]}
    ]
  },
  {
    id: 'shortvideo',
    icon: '📱',
    name: '短视频平台',
    shortName: '短视频',
    color: '#f3e8ff',
    accent: '#7e22ce',
    subtitle: '不用授权账号，只看你的推荐页与观看动作，反推推荐系统可能给你的标签。',
    dimensions: [
      { id: 'depth', label: '观看深度', low: '快速划过', high: '持续观看', lowTag: '快速浏览型', highTag: '深度观看型' },
      { id: 'initiative', label: '内容主动性', low: '推荐驱动', high: '主动搜索', lowTag: '推荐驱动型', highTag: '主动检索型' },
      { id: 'breadth', label: '兴趣跨度', low: '圈层集中', high: '兴趣广泛', lowTag: '垂直兴趣型', highTag: '多圈层型' },
      { id: 'hotspot', label: '热点敏感', low: '稳定兴趣', high: '追随热点', lowTag: '稳定兴趣型', highTag: '热点敏感型' },
      { id: 'interaction', label: '互动表达', low: '安静观看', high: '评论分享', lowTag: '安静观看型', highTag: '互动表达型' }
    ],
    questions: [
      { id: 'feed', title: '打开短视频 App，你首页最常出现什么？（最多选 4 个）', type: 'multiple', max: 4, options: [
        { value: 'funny', label: '搞笑 / 段子', effects: { hotspot: 8 } },
        { value: 'car', label: '汽车', effects: { breadth: -4 }, global: { depth: 4 } },
        { value: 'digital', label: '数码 / 科技', effects: { breadth: -3 }, global: { depth: 6 } },
        { value: 'food', label: '美食 / 探店', effects: { breadth: 4 }, global: { exploration: 5 } },
        { value: 'travel', label: '旅行', effects: { breadth: 5 }, global: { exploration: 8 } },
        { value: 'knowledge', label: '知识 / 科普', effects: { depth: 8 }, global: { depth: 10 } },
        { value: 'movie', label: '影视 / 解说', effects: { depth: 5 } },
        { value: 'life', label: '生活记录', effects: { interaction: 4 }, global: { social: 4 } },
        { value: 'work', label: '职场 / 商业', effects: { depth: 6 }, global: { planning: 5 } },
        { value: 'hot', label: '热点 / 新闻', effects: { hotspot: 16 }, global: { social: 3 } }
      ]},
      { id: 'watch', title: '遇到感兴趣的视频，你通常会看到什么程度？', type: 'single', options: [
        { value: 'swipe', label: '也会很快划走', effects: { depth: -24 }, global: { depth: -16 } },
        { value: 'half', label: '大概看一半', effects: { depth: -5 } },
        { value: 'finish', label: '经常看完', effects: { depth: 24 }, global: { depth: 18 } },
        { value: 'repeat', label: '会重播 / 看合集', effects: { depth: 32 }, global: { depth: 24 } }
      ]},
      { id: 'search', title: '看到感兴趣的话题后，你会主动搜索吗？', type: 'single', options: [
        { value: 'never', label: '基本不会', effects: { initiative: -24 }, global: { exploration: -6 } },
        { value: 'sometimes', label: '偶尔', effects: { initiative: 8 } },
        { value: 'often', label: '经常搜关键词 / 看主页', effects: { initiative: 28, depth: 8 }, global: { exploration: 12, depth: 10 } }
      ]},
      { id: 'interact', title: '你最常做哪些互动？', type: 'multiple', max: 3, options: [
        { value: 'none', label: '只看，不互动', effects: { interaction: -24 }, global: { social: -14 } },
        { value: 'like', label: '点赞', effects: { interaction: 5 } },
        { value: 'collect', label: '收藏', effects: { interaction: 8, depth: 5 }, global: { depth: 5 } },
        { value: 'comment', label: '评论', effects: { interaction: 20 }, global: { social: 14 } },
        { value: 'share', label: '转发给别人', effects: { interaction: 24 }, global: { social: 18 } }
      ]},
      { id: 'trend', title: '最近爆火的话题，你一般会？', type: 'single', options: [
        { value: 'ignore', label: '不感兴趣就不看', effects: { hotspot: -22 } },
        { value: 'know', label: '刷到就了解一下', effects: { hotspot: 6 } },
        { value: 'follow', label: '会主动追进展 / 玩梗', effects: { hotspot: 28 }, global: { social: 8 } }
      ]}
    ]
  },
  {
    id: 'travel',
    icon: '✈️',
    name: '旅游平台',
    shortName: '旅游',
    color: '#e0f2fe',
    accent: '#0369a1',
    subtitle: '从出游频率、目的地、酒店预算和预订习惯，看旅游平台可能怎样分层你。',
    dimensions: [
      { id: 'frequency', label: '出游频率', low: '低频出游', high: '高频出游', lowTag: '低频出游型', highTag: '高频旅行型' },
      { id: 'budget', label: '住宿预算', low: '经济住宿', high: '品质住宿', lowTag: '经济住宿型', highTag: '品质住宿型' },
      { id: 'planning', label: '行程计划', low: '说走就走', high: '提前规划', lowTag: '随性出发型', highTag: '计划旅行型' },
      { id: 'exploration', label: '目的地探索', low: '熟悉热门', high: '小众探索', lowTag: '经典目的地型', highTag: '目的地探索型' },
      { id: 'compare', label: '比价程度', low: '省事优先', high: '反复比较', lowTag: '省事预订型', highTag: '精细比价型' }
    ],
    questions: [
      { id: 'frequency', title: '你一年大概会出去旅游几次？', type: 'single', options: [
        { value: '0', label: '基本不旅游', effects: { frequency: -30 }, global: { exploration: -10 } },
        { value: '12', label: '1～2 次', effects: { frequency: -8 } },
        { value: '35', label: '3～5 次', effects: { frequency: 16 }, global: { exploration: 8 } },
        { value: '6plus', label: '6 次以上', effects: { frequency: 30 }, global: { exploration: 15 } }
      ]},
      { id: 'destination', title: '你更常选择哪类目的地？', type: 'multiple', max: 3, options: [
        { value: 'nearby', label: '周边短途', effects: { planning: -5 } },
        { value: 'city', label: '热门城市', effects: { exploration: -5 } },
        { value: 'nature', label: '山海 / 自然景区', effects: { exploration: 8 }, global: { exploration: 5 } },
        { value: 'niche', label: '小众城市 / 冷门路线', effects: { exploration: 24 }, global: { exploration: 16 } },
        { value: 'overseas', label: '境外旅行', effects: { budget: 14, planning: 10 }, global: { planning: 8 } }
      ]},
      { id: 'hotel', title: '你通常会选什么价位的酒店？', type: 'single', options: [
        { value: 'under200', label: '200 元以下', effects: { budget: -28, compare: 8 }, global: { price: 10 } },
        { value: '200400', label: '200～400 元', effects: { budget: -8 } },
        { value: '400700', label: '400～700 元', effects: { budget: 14 } },
        { value: '700plus', label: '700 元以上', effects: { budget: 30, compare: -6 }, global: { price: -8 } }
      ]},
      { id: 'booking', title: '你一般提前多久订票 / 酒店？', type: 'single', options: [
        { value: 'same', label: '当天或临时决定', effects: { planning: -28 }, global: { planning: -20 } },
        { value: 'days', label: '提前几天', effects: { planning: -5 } },
        { value: 'weeks', label: '提前几周', effects: { planning: 20 }, global: { planning: 14 } },
        { value: 'months', label: '提前一两个月以上', effects: { planning: 30 }, global: { planning: 20 } }
      ]},
      { id: 'compare', title: '订酒店或机票时，你会反复比较不同平台吗？', type: 'single', options: [
        { value: 'rare', label: '很少，省事最重要', effects: { compare: -24 }, global: { price: -10, convenience: 12 } },
        { value: 'some', label: '会简单比较一下', effects: { compare: 8 }, global: { price: 5 } },
        { value: 'often', label: '经常多平台比价', effects: { compare: 30 }, global: { price: 20, planning: 8 } }
      ]}
    ]
  },
  {
    id: 'shopping',
    icon: '🛒',
    name: '电商平台',
    shortName: '电商',
    color: '#dcfce7',
    accent: '#15803d',
    subtitle: '从购物预算、搜索、收藏和比价习惯，看电商推荐与促销系统可能怎样理解你。',
    dimensions: [
      { id: 'price', label: '价格敏感', low: '省事优先', high: '精细比价', lowTag: '省事购买型', highTag: '精打细算型' },
      { id: 'research', label: '购买研究', low: '快速下单', high: '充分研究', lowTag: '快速决策型', highTag: '研究决策型' },
      { id: 'brand', label: '品牌倾向', low: '性价比优先', high: '品牌优先', lowTag: '性价比型', highTag: '品牌偏好型' },
      { id: 'impulse', label: '冲动购买', low: '计划购买', high: '容易种草', lowTag: '计划消费型', highTag: '容易种草型' },
      { id: 'novelty', label: '新品兴趣', low: '成熟产品', high: '新品尝鲜', lowTag: '成熟选择型', highTag: '新品尝鲜型' }
    ],
    questions: [
      { id: 'buy', title: '买一个几百元的东西前，你通常会？', type: 'single', options: [
        { value: 'direct', label: '看着合适就下单', effects: { research: -24, impulse: 14 }, global: { planning: -10, convenience: 8 } },
        { value: 'review', label: '先看评价', effects: { research: 10 }, global: { depth: 6 } },
        { value: 'compare', label: '查参数、测评、多个平台', effects: { research: 30, price: 12 }, global: { depth: 18, planning: 12 } }
      ]},
      { id: 'coupon', title: '大促、优惠券、跨店满减对你影响大吗？', type: 'single', options: [
        { value: 'big', label: '很大，会等活动', effects: { price: 30, impulse: -5 }, global: { price: 24, planning: 12 } },
        { value: 'some', label: '有优惠更好', effects: { price: 10 }, global: { price: 8 } },
        { value: 'little', label: '不太在意', effects: { price: -24 }, global: { price: -16 } }
      ]},
      { id: 'brand', title: '同类商品里，你更偏向？', type: 'single', options: [
        { value: 'brand', label: '熟悉的大品牌', effects: { brand: 28, novelty: -8 } },
        { value: 'value', label: '参数 / 性价比更重要', effects: { brand: -22, research: 8 }, global: { price: 8, depth: 5 } },
        { value: 'design', label: '颜值 / 风格打动我', effects: { impulse: 12, brand: 5 }, global: { social: 4 } }
      ]},
      { id: 'cart', title: '看到喜欢的东西，你更常？', type: 'single', options: [
        { value: 'buy', label: '很快下单', effects: { impulse: 28, research: -8 }, global: { planning: -8 } },
        { value: 'cart', label: '先加购物车 / 收藏', effects: { impulse: 5, research: 8 }, global: { planning: 6 } },
        { value: 'wait', label: '放几天再决定', effects: { impulse: -24, research: 12 }, global: { planning: 14 } }
      ]},
      { id: 'new', title: '新款、新品刚上市时，你通常？', type: 'single', options: [
        { value: 'early', label: '喜欢第一时间尝鲜', effects: { novelty: 30 }, global: { exploration: 16 } },
        { value: 'watch', label: '先观望评价', effects: { novelty: 5, research: 12 }, global: { depth: 7 } },
        { value: 'mature', label: '更喜欢成熟稳定的款', effects: { novelty: -25 }, global: { exploration: -8, planning: 7 } }
      ]}
    ]
  },
  {
    id: 'content',
    icon: '🎧',
    name: '音乐影视平台',
    shortName: '内容',
    color: '#fee2e2',
    accent: '#be123c',
    subtitle: '从你反复听什么、追新还是怀旧、会不会搜幕后信息，看内容平台眼中的文化兴趣。',
    dimensions: [
      { id: 'nostalgia', label: '经典偏好', low: '追新内容', high: '经典共鸣', lowTag: '追新内容型', highTag: '经典共鸣型' },
      { id: 'depth', label: '内容深挖', low: '看完即走', high: '持续深挖', lowTag: '轻消费型', highTag: '内容深潜型' },
      { id: 'diversity', label: '兴趣跨度', low: '类型集中', high: '跨类型', lowTag: '垂直审美型', highTag: '多元审美型' },
      { id: 'initiative', label: '主动发现', low: '榜单推荐', high: '主动搜索', lowTag: '榜单推荐型', highTag: '主动发现型' },
      { id: 'social', label: '文化表达', low: '自己享受', high: '讨论分享', lowTag: '私人欣赏型', highTag: '文化表达型' }
    ],
    questions: [
      { id: 'era', title: '你平时更容易被哪类内容吸引？', type: 'single', options: [
        { value: 'new', label: '最近的新歌 / 新剧 / 新电影', effects: { nostalgia: -26 }, global: { nostalgia: -20, exploration: 8 } },
        { value: 'mix', label: '新老都会看', effects: { nostalgia: 2, diversity: 8 } },
        { value: 'classic', label: '老歌 / 经典剧 / 老电影', effects: { nostalgia: 30 }, global: { nostalgia: 24 } }
      ]},
      { id: 'repeat', title: '真正喜欢的内容，你会反复听 / 看吗？', type: 'single', options: [
        { value: 'rare', label: '很少重复', effects: { depth: -20 } },
        { value: 'some', label: '偶尔重温', effects: { depth: 8, nostalgia: 5 } },
        { value: 'often', label: '经常循环 / 重刷', effects: { depth: 28, nostalgia: 8 }, global: { depth: 20 } }
      ]},
      { id: 'discover', title: '你通常怎么找到下一首歌 / 下一部剧？', type: 'single', options: [
        { value: 'recommend', label: '首页推荐 / 榜单', effects: { initiative: -22 } },
        { value: 'friend', label: '朋友推荐 / 社交平台看到', effects: { initiative: -4, social: 8 }, global: { social: 7 } },
        { value: 'search', label: '自己搜演员、导演、歌手、主题', effects: { initiative: 28, depth: 10 }, global: { exploration: 10, depth: 10 } }
      ]},
      { id: 'types', title: '你的内容口味有多杂？', type: 'single', options: [
        { value: 'focus', label: '长期就喜欢少数几类', effects: { diversity: -24 }, global: { depth: 5 } },
        { value: 'some', label: '有主线，也会尝试别的', effects: { diversity: 8 } },
        { value: 'wide', label: '音乐影视类型跨度很大', effects: { diversity: 28 }, global: { exploration: 14 } }
      ]},
      { id: 'share', title: '遇到特别喜欢的内容，你会？', type: 'multiple', max: 3, options: [
        { value: 'self', label: '自己收藏就好', effects: { social: -18 }, global: { social: -12 } },
        { value: 'comment', label: '看评论 / 写短评', effects: { social: 10, depth: 6 }, global: { depth: 4 } },
        { value: 'share', label: '发给朋友', effects: { social: 20 }, global: { social: 16 } },
        { value: 'discuss', label: '和别人认真讨论', effects: { social: 26, depth: 8 }, global: { social: 20, depth: 5 } }
      ]}
    ]
  }
]

function getPlatform(id) {
  return platforms.find(item => item.id === id)
}

module.exports = { platforms, globalAxes, getPlatform }
