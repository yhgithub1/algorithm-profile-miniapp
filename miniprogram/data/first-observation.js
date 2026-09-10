const axes = {
  decision: { label: '决策方式', low: '更快做决定', high: '更倾向比较后决定' },
  exploration: { label: '探索方式', low: '更偏熟悉选项', high: '更愿意主动探索' },
  depth: { label: '信息深度', low: '更偏快速浏览', high: '更愿意继续深挖' },
  expression: { label: '表达方式', low: '更偏安静使用', high: '更愿意留下互动' },
  planning: { label: '计划方式', low: '更偏当下决定', high: '更倾向提前安排' }
}

const platformMeta = {
  meituan: {
    id: 'meituan',
    name: '美团',
    icon: '🥡',
    viewName: '生活消费视角',
    color: '#F0B429',
    soft: '#FFF6DB',
    copies: {
      decision: ['你在即时消费中可能更偏向快速完成选择。', '你在即时消费中可能更依赖比较信息再做决定。'],
      exploration: ['你的餐饮选择目前可能更偏熟悉和稳定。', '你的餐饮选择可能存在更明显的尝新倾向。'],
      depth: ['你在点餐场景中可能更倾向快速完成选择。', '你在下单前可能会投入更多时间查看评价、菜单或不同选项。'],
      expression: ['你在本地消费场景里可能更偏向只消费、不留下公开表达。', '你在消费完成后可能更愿意留下评价或公开反馈。'],
      planning: ['你的餐饮决策可能更多发生在需求已经出现之后。', '你的餐饮消费可能存在一定提前安排的习惯。']
    }
  },
  douyin: {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    viewName: '内容注意力视角',
    color: '#7768D8',
    soft: '#F0EEFF',
    copies: {
      decision: ['内容触发行动时，你可能更偏向即时反应。', '内容触发行动时，你可能更愿意继续查证再决定。'],
      exploration: ['你的内容兴趣目前可能更集中在稳定主题。', '你的内容消费可能存在更明显的跨主题探索。'],
      depth: ['你的内容消费可能更偏快速浏览和即时切换。', '你对感兴趣内容可能会继续搜索、重看或追踪。'],
      expression: ['你在内容平台上可能更偏向安静观看。', '你在内容平台上可能更愿意通过互动留下反馈。'],
      planning: ['你对内容的使用可能更偏当下消费。', '你可能会把有用内容保存下来，留到之后再处理。']
    }
  },
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    viewName: '生活决策视角',
    color: '#EF6A64',
    soft: '#FFF0EE',
    copies: {
      decision: ['面对陌生选择时，你可能更容易先凭感觉行动。', '面对陌生选择时，你可能更倾向先查证、比较再决定。'],
      exploration: ['你的生活选择可能更偏熟悉和确定。', '你可能更愿意主动发现新的地点、商品或生活方式。'],
      depth: ['你对攻略和经验信息可能更偏快速扫过。', '你可能会继续查看攻略、评论和他人经验来补充判断。'],
      expression: ['你可能更偏安静浏览，而不是主动公开表达。', '你可能更愿意通过评论、分享或发布留下自己的经验。'],
      planning: ['你的生活决策可能更多发生在临近行动时。', '你可能更倾向先收藏、整理，再在之后采取行动。']
    }
  }
}

const baseQuestions = [
  {
    id: 'meal_choice',
    platform: 'meituan',
    scene: '中午 12:10',
    title: '今天不知道吃什么，你打开外卖软件后更像哪一种？',
    options: [
      { value: 'fixed', label: '还是那几家，省得想', trace: '不知道吃什么时会优先选熟悉的店', signals: { exploration: -0.85, decision: -0.30 } },
      { value: 'search', label: '突然想吃什么就直接搜', trace: '会按当下想吃的东西主动搜索', signals: { exploration: 0.30, decision: -0.20 } },
      { value: 'new', label: '先看看附近有没有没吃过的', trace: '会主动浏览附近没试过的餐厅', signals: { exploration: 0.90, depth: 0.25 } },
      { value: 'coupon', label: '先看今天有什么券和活动', trace: '会先查看优惠再决定吃什么', signals: { decision: 0.55, planning: 0.25 } }
    ]
  },
  {
    id: 'meal_compare',
    platform: 'meituan',
    scene: '准备下单',
    title: '两家店看起来都不错，你通常会怎么结束这次选择？',
    options: [
      { value: 'quick', label: '差不多就行，挑一家下单', trace: '相似餐厅之间通常会较快做决定', signals: { decision: -0.75, depth: -0.45 } },
      { value: 'review', label: '重点看看差评和真实图片', trace: '下单前会重点查看差评和真实图片', signals: { decision: 0.70, depth: 0.70 } },
      { value: 'compare', label: '来回比较价格、评分和配送', trace: '会在多家餐厅之间来回比较', signals: { decision: 0.95, depth: 0.85 } },
      { value: 'familiar', label: '最后还是回到更熟悉的那家', trace: '比较后仍更容易回到熟悉餐厅', signals: { exploration: -0.65, decision: 0.25 } }
    ]
  },
  {
    id: 'video_interest',
    platform: 'douyin',
    scene: '刷到感兴趣的视频',
    title: '一个视频真的戳中你了，接下来你最可能做什么？',
    options: [
      { value: 'finish', label: '看完就继续往下刷', trace: '感兴趣的内容看完后通常继续刷', signals: { depth: -0.20, planning: -0.20 } },
      { value: 'profile', label: '点进作者主页再看看', trace: '会进入作者主页继续看相关内容', signals: { depth: 0.65, exploration: 0.30 } },
      { value: 'search', label: '顺手搜一下这个话题', trace: '会主动搜索感兴趣话题的更多信息', signals: { depth: 0.90, decision: 0.40, exploration: 0.35 } },
      { value: 'collect', label: '先收藏，之后有空再看', trace: '会把感兴趣内容收藏到以后', signals: { planning: 0.80, depth: 0.30 } }
    ]
  },
  {
    id: 'video_hot',
    platform: 'douyin',
    scene: '突然爆火的话题',
    title: '一个原本和你没关系的话题突然刷屏，你一般会？',
    options: [
      { value: 'skip', label: '不相关就直接划走', trace: '对无关热点通常直接略过', signals: { exploration: -0.45, depth: -0.25 } },
      { value: 'know', label: '刷到就顺便了解一下', trace: '对热点会做轻量了解', signals: { exploration: 0.20, depth: 0.15 } },
      { value: 'follow', label: '会继续追后续发生了什么', trace: '会继续追踪热点后续进展', signals: { exploration: 0.40, depth: 0.70 } },
      { value: 'talk', label: '会评论、转发或和朋友聊', trace: '会围绕热点留下互动或分享', signals: { expression: 0.90, exploration: 0.25 } }
    ]
  },
  {
    id: 'buy_unknown',
    platform: 'xiaohongshu',
    scene: '突然很想买一个陌生东西',
    title: '但你之前完全不了解它，你通常会怎么做？',
    options: [
      { value: 'buy', label: '喜欢就先买了再说', trace: '面对陌生商品也可能直接行动', signals: { decision: -0.90, planning: -0.55 } },
      { value: 'reviews', label: '先看看大家真实评价', trace: '购买陌生商品前会先看他人评价', signals: { decision: 0.65, depth: 0.45 } },
      { value: 'guide', label: '搜几篇攻略、测评再决定', trace: '购买陌生商品前会主动搜攻略和测评', signals: { decision: 0.90, depth: 0.85, planning: 0.30 } },
      { value: 'save', label: '先收藏，过几天还想要再说', trace: '会先收藏陌生商品，延迟决定', signals: { decision: 0.55, planning: 0.90 } }
    ]
  },
  {
    id: 'weekend_plan',
    platform: 'xiaohongshu',
    scene: '周末想出去走走',
    title: '朋友说“找个地方玩吧”，你更像下面哪一种？',
    options: [
      { value: 'go', label: '先出门，到了再决定', trace: '周末出行更可能先行动再决定细节', signals: { planning: -0.90, decision: -0.45 } },
      { value: 'familiar', label: '去熟悉的地方最省心', trace: '周末活动更偏向熟悉地点', signals: { exploration: -0.75, planning: -0.15 } },
      { value: 'search', label: '搜附近最近有什么新的', trace: '会主动寻找新的周末去处', signals: { exploration: 0.85, depth: 0.35 } },
      { value: 'plan', label: '提前查路线、评价和时间', trace: '出行前会提前查路线、评价和时间', signals: { planning: 0.95, decision: 0.55, depth: 0.45 } }
    ]
  }
]

const supplementQuestions = [
  {
    id: 'supp_decision', targetAxis: 'decision', platform: 'xiaohongshu', scene: '评价意见不一致',
    title: '一个稍贵的东西，评价里有人夸也有人劝退，你会？',
    options: [
      { value: 'feel', label: '还是相信自己的第一感觉', trace: '评价分歧时更愿意相信自己的第一感觉', signals: { decision: -0.75 } },
      { value: 'bad', label: '重点看差评到底在骂什么', trace: '评价分歧时会重点研究差评原因', signals: { decision: 0.60, depth: 0.45 } },
      { value: 'cross', label: '换几个地方继续查', trace: '评价分歧时会跨来源继续查证', signals: { decision: 0.95, depth: 0.70 } },
      { value: 'later', label: '纠结太久就先不买', trace: '难以判断时会延迟购买决定', signals: { decision: 0.65, planning: 0.45 } }
    ]
  },
  {
    id: 'supp_exploration', targetAxis: 'exploration', platform: 'meituan', scene: '熟悉与新鲜之间',
    title: '一家常吃的店和一家评分不错的新店同时出现，你会？',
    options: [
      { value: 'old', label: '大概率还是选常吃的', trace: '熟店和新店并列时更常选择熟店', signals: { exploration: -0.90 } },
      { value: 'mood', label: '看当天心情', trace: '熟店和新店之间没有稳定选择', signals: { exploration: 0.05 } },
      { value: 'new', label: '更想试试新的', trace: '熟店和新店并列时更愿意尝试新店', signals: { exploration: 0.90 } }
    ]
  },
  {
    id: 'supp_depth', targetAxis: 'depth', platform: 'douyin', scene: '看见一个陌生观点',
    title: '一个视频里的观点让你有点意外，你通常会停在哪一步？',
    options: [
      { value: 'pass', label: '知道有这回事就够了', trace: '遇到陌生观点时通常不会继续查', signals: { depth: -0.80 } },
      { value: 'comments', label: '看看评论区怎么说', trace: '遇到陌生观点会继续查看评论', signals: { depth: 0.35 } },
      { value: 'search', label: '再搜几个来源确认一下', trace: '遇到陌生观点会继续搜索其他来源', signals: { depth: 0.95, decision: 0.55 } }
    ]
  },
  {
    id: 'supp_expression', targetAxis: 'expression', platform: 'douyin', scene: '真的很喜欢一条内容',
    title: '你最容易留下哪一种“我来过”的痕迹？',
    options: [
      { value: 'none', label: '基本什么都不留', trace: '即使喜欢内容也常不留下互动', signals: { expression: -0.95 } },
      { value: 'like', label: '点个赞就够了', trace: '喜欢内容时主要通过点赞反馈', signals: { expression: -0.15 } },
      { value: 'collect', label: '更常收藏起来', trace: '喜欢内容时更常选择收藏', signals: { expression: 0.15, planning: 0.35 } },
      { value: 'share', label: '会评论或发给别人', trace: '喜欢内容时会评论或分享给别人', signals: { expression: 0.95 } }
    ]
  },
  {
    id: 'supp_planning', targetAxis: 'planning', platform: 'xiaohongshu', scene: '看到以后可能会用到的攻略',
    title: '你觉得它“以后肯定有用”，接下来最像哪一种？',
    options: [
      { value: 'pass', label: '看完就算了，需要时再找', trace: '有用攻略看完后通常不提前保存', signals: { planning: -0.85 } },
      { value: 'save', label: '先收藏，等需要时再翻', trace: '会提前收藏可能以后有用的攻略', signals: { planning: 0.70 } },
      { value: 'organize', label: '会顺手整理到自己的清单', trace: '会把可能有用的信息提前整理进清单', signals: { planning: 0.95, depth: 0.35 } }
    ]
  }
]

module.exports = { axes, platformMeta, baseQuestions, supplementQuestions }
