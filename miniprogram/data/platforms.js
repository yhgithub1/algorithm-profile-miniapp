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
    id: 'meituan',
    icon: '🥡',
    name: '美团',
    shortName: '美团',
    color: '#fff7d6',
    accent: '#d97706',
    subtitle: '从外卖频率、客单价、吃什么、餐厅选择和优惠习惯，看美团可能怎样理解你的生活节奏。',
    dimensions: [
      { id: 'frequency', label: '外卖依赖', low: '偶尔点餐', high: '高频点餐', lowTag: '低频外卖型', highTag: '高频外卖型' },
      { id: 'budget', label: '客单预算', low: '经济实惠', high: '品质预算', lowTag: '实惠预算型', highTag: '品质预算型' },
      { id: 'price', label: '优惠敏感', low: '便利优先', high: '先看优惠', lowTag: '便利优先型', highTag: '优惠敏感型' },
      { id: 'novelty', label: '餐厅探索', low: '固定熟店', high: '经常尝新', lowTag: '熟店忠诚型', highTag: '餐厅探索型' },
      { id: 'speed', label: '时效偏好', low: '口味优先', high: '速度优先', lowTag: '口味优先型', highTag: '效率优先型' }
    ],
    questions: [
      { id: 'frequency', title: '你平时更常自己做饭 / 堂食，还是点外卖？', type: 'single', options: [
        { value: 'cook', label: '基本自己做 / 堂食', effects: { frequency: -30 }, global: { convenience: -14, planning: 8 } },
        { value: '12', label: '每周点 1～2 次', effects: { frequency: -8 } },
        { value: '35', label: '每周点 3～5 次', effects: { frequency: 16 }, global: { convenience: 8 } },
        { value: 'daily', label: '几乎每天都点', effects: { frequency: 30 }, global: { convenience: 18 } }
      ]},
      { id: 'budget', title: '你最常见的一顿外卖是多少钱？', type: 'single', options: [
        { value: 'under20', label: '20 元以下', effects: { budget: -24, price: 10 }, global: { price: 12 } },
        { value: '2035', label: '20～35 元', effects: { budget: -6 } },
        { value: '3550', label: '35～50 元', effects: { budget: 12 } },
        { value: '50plus', label: '50 元以上', effects: { budget: 26, price: -8 }, global: { price: -8 } }
      ]},
      { id: 'food', title: '你最常点什么？（最多选 3 个）', type: 'multiple', max: 3, options: [
        { value: 'rice', label: '盖饭 / 快餐', effects: { speed: 8 }, global: { convenience: 6 } },
        { value: 'noodle', label: '面 / 粉 / 麻辣烫', effects: { budget: -4 } },
        { value: 'burger', label: '汉堡 / 炸鸡', effects: { speed: 10 }, global: { convenience: 5 } },
        { value: 'drink', label: '咖啡 / 奶茶', effects: { budget: 5, novelty: 5 }, global: { social: 4 } },
        { value: 'light', label: '轻食 / 健身餐', effects: { budget: 8 }, global: { planning: 6 } },
        { value: 'restaurant', label: '品牌餐厅 / 正餐', effects: { budget: 14, speed: -6 } }
      ]},
      { id: 'restaurant', title: '在美团选餐厅时，你通常怎么选？', type: 'single', options: [
        { value: 'fixed', label: '固定吃熟悉的几家', effects: { novelty: -26 }, global: { exploration: -12 } },
        { value: 'rating', label: '看评分和评论再决定', effects: { novelty: 4, price: 5 }, global: { planning: 12, depth: 7 } },
        { value: 'new', label: '经常点没吃过的新店', effects: { novelty: 28 }, global: { exploration: 18 } },
        { value: 'fast', label: '谁送得快就点谁', effects: { speed: 28 }, global: { convenience: 18 } }
      ]},
      { id: 'coupon', title: '下单前你会特意找红包、满减或神券吗？', type: 'single', options: [
        { value: 'always', label: '基本都会', effects: { price: 30 }, global: { price: 24, planning: 8 } },
        { value: 'sometimes', label: '有时会', effects: { price: 10 }, global: { price: 8 } },
        { value: 'rare', label: '很少，想吃就点', effects: { price: -22 }, global: { price: -16, convenience: 8 } }
      ]}
    ]
  },
  {
    id: 'douyin',
    icon: '🎵',
    name: '抖音',
    shortName: '抖音',
    color: '#f5f3ff',
    accent: '#7c3aed',
    subtitle: '看你的推荐页里都是什么、会不会看完、搜索、收藏和追热点，模拟抖音可能给你的兴趣画像。',
    dimensions: [
      { id: 'depth', label: '观看深度', low: '快速划过', high: '持续观看', lowTag: '快速浏览型', highTag: '深度观看型' },
      { id: 'initiative', label: '内容主动性', low: '推荐驱动', high: '主动搜索', lowTag: '推荐驱动型', highTag: '主动检索型' },
      { id: 'breadth', label: '兴趣跨度', low: '圈层集中', high: '兴趣广泛', lowTag: '垂直兴趣型', highTag: '多圈层型' },
      { id: 'hotspot', label: '热点敏感', low: '稳定兴趣', high: '追随热点', lowTag: '稳定兴趣型', highTag: '热点敏感型' },
      { id: 'interaction', label: '互动表达', low: '安静观看', high: '评论分享', lowTag: '安静观看型', highTag: '互动表达型' }
    ],
    questions: [
      { id: 'feed', title: '打开抖音，你首页最常出现什么？（最多选 4 个）', type: 'multiple', max: 4, options: [
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
      { id: 'search', title: '刷到感兴趣的话题后，你会主动搜关键词或点主页吗？', type: 'single', options: [
        { value: 'never', label: '基本不会', effects: { initiative: -24 }, global: { exploration: -6 } },
        { value: 'sometimes', label: '偶尔', effects: { initiative: 8 } },
        { value: 'often', label: '经常会', effects: { initiative: 28, depth: 8 }, global: { exploration: 12, depth: 10 } }
      ]},
      { id: 'interact', title: '你在抖音最常做哪些互动？', type: 'multiple', max: 3, options: [
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
    id: 'xiaohongshu',
    icon: '📕',
    name: '小红书',
    shortName: '小红书',
    color: '#fff1f2',
    accent: '#e11d48',
    subtitle: '从首页内容、搜索攻略、收藏清单、种草与分享习惯，看小红书可能怎样理解你的生活方式。',
    dimensions: [
      { id: 'initiative', label: '主动搜索', low: '首页驱动', high: '主动做攻略', lowTag: '推荐驱动型', highTag: '攻略搜索型' },
      { id: 'planning', label: '决策规划', low: '随性看看', high: '收藏后执行', lowTag: '随性感受型', highTag: '计划执行型' },
      { id: 'exploration', label: '生活探索', low: '熟悉偏好', high: '尝新发现', lowTag: '稳定偏好型', highTag: '生活探索型' },
      { id: 'social', label: '表达分享', low: '只看不发', high: '评论发布', lowTag: '安静浏览型', highTag: '表达分享型' },
      { id: 'commercial', label: '种草响应', low: '理性筛选', high: '容易被种草', lowTag: '理性筛选型', highTag: '种草响应型' }
    ],
    questions: [
      { id: 'feed', title: '你的小红书首页最常是什么？（最多选 4 个）', type: 'multiple', max: 4, options: [
        { value: 'food', label: '美食 / 探店', effects: { exploration: 8 }, global: { exploration: 6 } },
        { value: 'travel', label: '旅行 / 攻略', effects: { planning: 8, exploration: 8 }, global: { planning: 6, exploration: 8 } },
        { value: 'beauty', label: '美妆 / 穿搭', effects: { commercial: 8 } },
        { value: 'home', label: '家居 / 装修', effects: { planning: 10 }, global: { planning: 8 } },
        { value: 'digital', label: '数码 / 效率工具', effects: { initiative: 5 }, global: { depth: 6 } },
        { value: 'fitness', label: '健身 / 健康生活方式', effects: { planning: 8 } },
        { value: 'work', label: '职场 / 学习', effects: { initiative: 8 }, global: { depth: 7 } },
        { value: 'emotion', label: '情感 / 日常生活', effects: { social: 5 }, global: { social: 4 } }
      ]},
      { id: 'search', title: '遇到要买、要吃、要去的东西，你会先上小红书搜攻略吗？', type: 'single', options: [
        { value: 'rare', label: '很少，首页看看就好', effects: { initiative: -24, planning: -8 } },
        { value: 'sometimes', label: '偶尔会搜', effects: { initiative: 8 } },
        { value: 'often', label: '经常先搜评价 / 攻略', effects: { initiative: 30, planning: 12 }, global: { planning: 12, depth: 10 } }
      ]},
      { id: 'collect', title: '看到有用的笔记，你通常会？', type: 'single', options: [
        { value: 'scroll', label: '看看就过去', effects: { planning: -20 } },
        { value: 'like', label: '点赞留个印象', effects: { planning: -4, social: 4 } },
        { value: 'collect', label: '收藏，之后真的会翻', effects: { planning: 24 }, global: { planning: 16, depth: 8 } },
        { value: 'list', label: '整理成自己的清单 / 攻略', effects: { planning: 32, initiative: 12 }, global: { planning: 22, depth: 12 } }
      ]},
      { id: 'social', title: '你在小红书会评论、发笔记或分享给朋友吗？', type: 'single', options: [
        { value: 'silent', label: '基本只看', effects: { social: -26 }, global: { social: -16 } },
        { value: 'comment', label: '偶尔评论 / 私信', effects: { social: 10 }, global: { social: 6 } },
        { value: 'share', label: '经常转给朋友', effects: { social: 20 }, global: { social: 16 } },
        { value: 'post', label: '自己也会发笔记', effects: { social: 30 }, global: { social: 24 } }
      ]},
      { id: 'plant', title: '被一篇“种草”笔记打动后，你通常会？', type: 'single', options: [
        { value: 'ignore', label: '看看而已，不太会买', effects: { commercial: -26 }, global: { price: 4 } },
        { value: 'compare', label: '会再查评价 / 比价', effects: { commercial: -6, planning: 12 }, global: { price: 10, depth: 8 } },
        { value: 'save', label: '先收藏，之后可能买', effects: { commercial: 10, planning: 8 } },
        { value: 'buy', label: '经常直接去搜同款 / 下单', effects: { commercial: 28 }, global: { convenience: 8 } }
      ]}
    ]
  },
  {
    id: 'taobao',
    icon: '🛒',
    name: '淘宝',
    shortName: '淘宝',
    color: '#fff7ed',
    accent: '#ea580c',
    subtitle: '从搜索、比价、收藏、活动和新品习惯，看淘宝可能怎样判断你的购买意图和消费决策。',
    dimensions: [
      { id: 'price', label: '价格敏感', low: '省事优先', high: '精细比价', lowTag: '便利购买型', highTag: '精细比价型' },
      { id: 'research', label: '购买研究', low: '快速下单', high: '做足功课', lowTag: '快速决策型', highTag: '研究决策型' },
      { id: 'impulse', label: '即时购买', low: '长期考虑', high: '容易下单', lowTag: '延迟决策型', highTag: '即时购买型' },
      { id: 'brand', label: '品牌倾向', low: '性价比优先', high: '品牌优先', lowTag: '性价比导向型', highTag: '品牌偏好型' },
      { id: 'novelty', label: '新品兴趣', low: '熟悉稳定', high: '喜欢新品', lowTag: '稳定购买型', highTag: '新品探索型' }
    ],
    questions: [
      { id: 'research', title: '淘宝买东西前，你一般会做多少功课？', type: 'single', options: [
        { value: 'quick', label: '看着合适就买', effects: { research: -26, impulse: 20 }, global: { convenience: 14, planning: -8 } },
        { value: 'review', label: '会看评价 / 买家秀', effects: { research: 10 }, global: { depth: 6 } },
        { value: 'compare', label: '会看参数、问大家、同款对比', effects: { research: 28, price: 8 }, global: { depth: 14, planning: 12 } }
      ]},
      { id: 'price', title: '你会不会为了优惠等 618、双 11 或者领券？', type: 'single', options: [
        { value: 'rare', label: '很少，想买就买', effects: { price: -24, impulse: 10 }, global: { price: -16, convenience: 10 } },
        { value: 'sometimes', label: '价格合适会等', effects: { price: 10 } },
        { value: 'often', label: '经常比价、凑券、等活动', effects: { price: 30, impulse: -8 }, global: { price: 24, planning: 12 } }
      ]},
      { id: 'brand', title: '同类商品里，你更偏向？', type: 'single', options: [
        { value: 'value', label: '参数够用、性价比高就行', effects: { brand: -26, price: 8 }, global: { price: 8 } },
        { value: 'balanced', label: '品牌和价格都会看', effects: { brand: 4 } },
        { value: 'brand', label: '更信任熟悉品牌', effects: { brand: 26 }, global: { convenience: 6 } }
      ]},
      { id: 'decision', title: '看到喜欢的东西，你通常怎么下单？', type: 'single', options: [
        { value: 'instant', label: '经常当场下单', effects: { impulse: 30 }, global: { planning: -14, convenience: 10 } },
        { value: 'cart', label: '先放购物车再说', effects: { impulse: -2, research: 6 } },
        { value: 'collect', label: '收藏很久，降价才买', effects: { impulse: -26, price: 12 }, global: { price: 10, planning: 12 } }
      ]},
      { id: 'new', title: '新品、首发或新品牌会吸引你吗？', type: 'single', options: [
        { value: 'stable', label: '还是熟悉款更放心', effects: { novelty: -26 }, global: { exploration: -12 } },
        { value: 'look', label: '会看看，但不一定买', effects: { novelty: 8 } },
        { value: 'try', label: '喜欢尝试新品 / 新品牌', effects: { novelty: 28 }, global: { exploration: 18 } }
      ]}
    ]
  }
]

function getPlatform(id) {
  return platforms.find(item => item.id === id)
}

module.exports = { platforms, globalAxes, getPlatform }
