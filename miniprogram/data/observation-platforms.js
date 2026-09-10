const observationAxes = {
  decision: { label: '决策方式', low: '快速凭感觉', high: '比较后决定' },
  exploration: { label: '探索方式', low: '熟悉优先', high: '主动尝新' },
  depth: { label: '信息深度', low: '快速浏览', high: '持续深挖' },
  expression: { label: '表达方式', low: '只看不表达', high: '主动互动' },
  planning: { label: '计划方式', low: '临时决定', high: '提前规划' }
}

const observationPlatforms = [
  {
    id: 'meituan',
    icon: '🥡',
    name: '美团',
    shortName: '美团',
    color: '#fff6cf',
    accent: '#d89b00',
    viewName: '生活消费视角',
    observes: ['即时消费', '餐饮选择', '本地生活节奏'],
    subtitle: '它更容易看到你怎么吃、怎么选、什么时候决定，但看不到你为什么这样做。',
    inferenceCopy: {
      decision: {
        positive: '你在餐饮选择上可能更依赖比较信息之后再决定。',
        negative: '你在即时餐饮场景中可能更倾向快速做决定。'
      },
      exploration: {
        positive: '你的餐饮选择可能存在更明显的尝新倾向。',
        negative: '你的餐饮选择目前可能更偏向熟悉和稳定。'
      },
      depth: {
        positive: '你在下单前可能会投入更多时间查看评价、菜单或不同选项。',
        negative: '你在外卖场景中可能更偏向快速完成选择，而不是持续比较。'
      },
      expression: {
        positive: '你在消费完成后可能更愿意通过评价或图片留下公开反馈。',
        negative: '你在本地消费场景里可能更偏向只消费、不留下公开表达。'
      },
      planning: {
        positive: '你的餐饮消费可能存在一定提前安排和计划习惯。',
        negative: '你的餐饮决策可能更多发生在需求已经出现之后。'
      }
    },
    questions: [
      {
        id: 'frequency',
        title: '过去一周，你大概点过几次外卖？',
        options: [
          { value: 'rare', label: '基本没点', trace: '过去一周基本没有点外卖', signals: {} },
          { value: '12', label: '1～2 次', trace: '过去一周点外卖 1～2 次', signals: {} },
          { value: '35', label: '3～5 次', trace: '过去一周点外卖 3～5 次', signals: {} },
          { value: 'daily', label: '几乎每天', trace: '过去一周几乎每天点外卖', signals: {} }
        ]
      },
      {
        id: 'restaurant',
        title: '决定吃哪家时，你最常怎么做？',
        options: [
          { value: 'fixed', label: '固定吃熟悉的几家', trace: '更常选择熟悉餐厅', signals: { exploration: -0.9 } },
          { value: 'rating', label: '先看评分和评论', trace: '会先看评分和评论', signals: { decision: 0.8, depth: 0.35 } },
          { value: 'new', label: '经常试没吃过的新店', trace: '经常尝试没吃过的新店', signals: { exploration: 0.9 } },
          { value: 'fast', label: '哪家快就选哪家', trace: '会优先选择送得更快的餐厅', signals: { decision: -0.35, planning: -0.25 } }
        ]
      },
      {
        id: 'coupon',
        title: '下单前，你会特意看红包、神券或满减吗？',
        options: [
          { value: 'always', label: '基本都会看', trace: '下单前基本都会查看优惠', signals: { decision: 0.45, planning: 0.25 } },
          { value: 'sometimes', label: '有时会看', trace: '有时会查看优惠', signals: { decision: 0.15 } },
          { value: 'rare', label: '很少，想吃就点', trace: '很少为了优惠改变下单', signals: { decision: -0.25, planning: -0.15 } }
        ]
      },
      {
        id: 'timing',
        title: '通常什么时候开始决定这一顿吃什么？',
        options: [
          { value: 'early', label: '提前一两个小时就会想', trace: '会提前一两个小时安排吃什么', signals: { planning: 0.85 } },
          { value: 'meal', label: '到饭点再决定', trace: '通常到饭点才决定吃什么', signals: { planning: -0.35 } },
          { value: 'hungry', label: '饿了才开始找', trace: '通常饿了之后才开始找吃的', signals: { planning: -0.85 } }
        ]
      },
      {
        id: 'browse',
        title: '打开商家页面后，你一般会看多久？',
        options: [
          { value: 'same', label: '直接点熟悉的菜', trace: '打开商家后常直接点熟悉的菜', signals: { exploration: -0.45, depth: -0.45, decision: -0.25 } },
          { value: 'menu', label: '看看菜单就下单', trace: '会浏览菜单后再下单', signals: { depth: 0.15 } },
          { value: 'review', label: '会看评价、图片再选', trace: '会查看评价和图片再选', signals: { depth: 0.65, decision: 0.55 } },
          { value: 'compare', label: '会来回比较几家', trace: '会在多家餐厅之间来回比较', signals: { depth: 0.9, decision: 0.9, exploration: 0.25 } }
        ]
      },
      {
        id: 'review',
        title: '吃完之后，你通常会留下评价吗？',
        options: [
          { value: 'never', label: '基本不评价', trace: '消费后基本不留下评价', signals: { expression: -0.85 } },
          { value: 'stars', label: '偶尔点个星', trace: '偶尔只留下星级评价', signals: { expression: -0.2 } },
          { value: 'words', label: '会写几句感受', trace: '会写文字评价', signals: { expression: 0.65 } },
          { value: 'photo', label: '会晒图或详细评价', trace: '会晒图或留下详细评价', signals: { expression: 0.95 } }
        ]
      }
    ]
  },
  {
    id: 'douyin',
    icon: '🎵',
    name: '抖音',
    shortName: '抖音',
    color: '#f2efff',
    accent: '#7057d9',
    viewName: '内容注意力视角',
    observes: ['停留方式', '兴趣变化', '互动表达'],
    subtitle: '它更容易看到你在哪些内容上停留、搜索和互动，但看不到你真正的内在动机。',
    inferenceCopy: {
      decision: {
        positive: '当内容涉及行动或选择时，你可能更倾向进一步查证后再决定。',
        negative: '你对内容触发的行动可能更偏即时反应。'
      },
      exploration: {
        positive: '你的内容消费可能存在更明显的跨主题探索。',
        negative: '你的推荐兴趣目前可能更集中在少数稳定主题。'
      },
      depth: {
        positive: '你对感兴趣内容可能会继续搜索、重看或追踪，而不只停留在一次观看。',
        negative: '你的内容消费目前可能更偏快速浏览和即时切换。'
      },
      expression: {
        positive: '你在内容平台上可能更愿意通过评论、转发或公开互动留下反馈。',
        negative: '你在内容平台上可能更偏向安静观看而不是公开表达。'
      },
      planning: {
        positive: '你可能会把有用内容保存下来，留到之后再处理或行动。',
        negative: '你对内容的使用更可能发生在当下，而不是提前安排。'
      }
    },
    questions: [
      {
        id: 'feed',
        title: '最近刷抖音时，你的内容更像哪一种状态？',
        options: [
          { value: 'focused', label: '长期就是固定几类内容', trace: '推荐内容长期集中在少数主题', signals: { exploration: -0.75 } },
          { value: 'mainline', label: '有主线，也会出现别的', trace: '有稳定主线，也会浏览其他主题', signals: { exploration: 0.2 } },
          { value: 'wide', label: '什么都刷，跨度很大', trace: '浏览主题跨度很大', signals: { exploration: 0.85 } }
        ]
      },
      {
        id: 'watch',
        title: '遇到真正感兴趣的视频，你通常会？',
        options: [
          { value: 'swipe', label: '也可能很快划走', trace: '感兴趣的视频也常快速划过', signals: { depth: -0.75 } },
          { value: 'finish', label: '大多会看完', trace: '感兴趣的视频大多会看完', signals: { depth: 0.6 } },
          { value: 'repeat', label: '会重看、看合集', trace: '会重看或继续看同主题合集', signals: { depth: 0.95 } }
        ]
      },
      {
        id: 'search',
        title: '刷到感兴趣的话题后，你会继续搜吗？',
        options: [
          { value: 'never', label: '基本不会', trace: '刷到感兴趣内容后很少继续搜索', signals: { depth: -0.35, decision: -0.2 } },
          { value: 'sometimes', label: '偶尔会', trace: '偶尔会继续搜索相关内容', signals: { depth: 0.25 } },
          { value: 'often', label: '经常搜关键词、点主页', trace: '经常继续搜索关键词或进入主页', signals: { depth: 0.8, decision: 0.35, exploration: 0.35 } }
        ]
      },
      {
        id: 'interact',
        title: '你最常留下哪种互动？',
        options: [
          { value: 'none', label: '只看，不互动', trace: '通常只看而不互动', signals: { expression: -0.9 } },
          { value: 'like', label: '偶尔点赞', trace: '主要通过点赞留下反馈', signals: { expression: -0.1 } },
          { value: 'comment', label: '会评论', trace: '会在感兴趣内容下评论', signals: { expression: 0.65 } },
          { value: 'share', label: '会转发给别人', trace: '会把内容转发给别人', signals: { expression: 0.85 } }
        ]
      },
      {
        id: 'trend',
        title: '突然爆火的话题，你一般会怎么处理？',
        options: [
          { value: 'ignore', label: '不相关就直接略过', trace: '对不相关热点会直接略过', signals: { exploration: -0.2, decision: 0.15 } },
          { value: 'know', label: '刷到就了解一下', trace: '刷到热点时通常会了解一下', signals: { exploration: 0.25 } },
          { value: 'follow', label: '会继续追进展', trace: '会继续追踪热点后续进展', signals: { exploration: 0.45, depth: 0.5 } }
        ]
      },
      {
        id: 'useful',
        title: '刷到“以后可能有用”的内容时，你通常会？',
        options: [
          { value: 'forget', label: '看完就过去了', trace: '有用内容看完后通常不会保存', signals: { planning: -0.75, depth: -0.25 } },
          { value: 'collect', label: '先收藏，以后再看', trace: '会先收藏有用内容留到以后', signals: { planning: 0.75, depth: 0.25 } },
          { value: 'search', label: '马上继续查相关信息', trace: '会立即继续查证相关信息', signals: { decision: 0.8, depth: 0.65 } },
          { value: 'share', label: '发给朋友一起看', trace: '会把有用内容转发给朋友', signals: { expression: 0.8, planning: 0.15 } }
        ]
      }
    ]
  },
  {
    id: 'xiaohongshu',
    icon: '📕',
    name: '小红书',
    shortName: '小红书',
    color: '#fff0ef',
    accent: '#d85f5b',
    viewName: '生活决策视角',
    observes: ['攻略习惯', '收藏行动', '生活方式探索'],
    subtitle: '它更容易看到你如何搜攻略、收藏、查证和行动，但同样无法确认这些行为背后的真实原因。',
    inferenceCopy: {
      decision: {
        positive: '你在生活消费决策中可能更依赖多条信息相互验证后再行动。',
        negative: '你在生活方式选择中可能更愿意快速形成决定。'
      },
      exploration: {
        positive: '你可能更愿意主动发现新的地点、产品或生活方式。',
        negative: '你目前表现出的生活选择可能更偏向熟悉和稳定。'
      },
      depth: {
        positive: '面对真正感兴趣的问题，你可能会继续搜同主题内容并做更深的信息收集。',
        negative: '你的浏览可能更多停留在快速获得灵感，而不是持续深挖。'
      },
      expression: {
        positive: '你可能更愿意通过评论、分享或发布内容表达体验。',
        negative: '你可能更习惯把小红书当作私人信息工具，而不是公开表达空间。'
      },
      planning: {
        positive: '你的收藏和攻略行为可能会被用于后续真实安排，而不只是即时浏览。',
        negative: '你的使用方式可能更偏随手看看、当下决定。'
      }
    },
    questions: [
      {
        id: 'before',
        title: '准备买东西、吃饭或出去玩之前，你会先打开小红书吗？',
        options: [
          { value: 'never', label: '基本不会', trace: '做生活决策前很少先搜索攻略', signals: { decision: -0.4, depth: -0.25 } },
          { value: 'sometimes', label: '重要的事会搜一下', trace: '重要决策前会先搜索攻略', signals: { decision: 0.45, depth: 0.25 } },
          { value: 'often', label: '基本都会先搜', trace: '多数生活决策前都会先搜索攻略', signals: { decision: 0.85, depth: 0.5, planning: 0.35 } }
        ]
      },
      {
        id: 'notes',
        title: '同一个问题，你一般会看多少篇笔记？',
        options: [
          { value: 'one', label: '看到一篇差不多就够', trace: '同一问题通常只看少量笔记', signals: { depth: -0.65, decision: -0.25 } },
          { value: 'few', label: '会看三五篇', trace: '同一问题会比较三五篇笔记', signals: { depth: 0.45, decision: 0.4 } },
          { value: 'many', label: '会一直搜到心里有数', trace: '会持续搜索直到信息比较充分', signals: { depth: 0.9, decision: 0.8 } }
        ]
      },
      {
        id: 'collect',
        title: '你收藏笔记之后，通常会怎么样？',
        options: [
          { value: 'forget', label: '收藏完经常忘了', trace: '收藏后经常不会再次查看', signals: { planning: -0.45 } },
          { value: 'review', label: '需要时会翻出来', trace: '会在需要时重新查看收藏', signals: { planning: 0.45, depth: 0.2 } },
          { value: 'list', label: '会整理成清单并执行', trace: '会把收藏整理成清单再行动', signals: { planning: 0.9, decision: 0.45 } }
        ]
      },
      {
        id: 'planted',
        title: '被某个产品或地点“种草”后，你更常怎么做？',
        options: [
          { value: 'act', label: '觉得不错就去试', trace: '被种草后较快采取行动', signals: { decision: -0.65, exploration: 0.45, planning: -0.25 } },
          { value: 'verify', label: '继续查差评和其他平台', trace: '被种草后会继续查证差评和其他来源', signals: { decision: 0.9, depth: 0.65 } },
          { value: 'save', label: '先放着，之后再说', trace: '被种草后通常先保存而不立即行动', signals: { planning: 0.45, decision: 0.25 } }
        ]
      },
      {
        id: 'explore',
        title: '你更喜欢哪种内容？',
        options: [
          { value: 'familiar', label: '自己已经熟悉的主题', trace: '更常浏览熟悉主题', signals: { exploration: -0.75 } },
          { value: 'mixed', label: '熟悉为主，偶尔看看新的', trace: '以熟悉主题为主，也会尝试新内容', signals: { exploration: 0.15 } },
          { value: 'new', label: '经常主动找新店、新东西、新玩法', trace: '经常主动寻找新的生活方式和地点', signals: { exploration: 0.9 } }
        ]
      },
      {
        id: 'expression',
        title: '用完一个好东西或去过一家店后，你会？',
        options: [
          { value: 'silent', label: '自己知道就好', trace: '有体验后通常不公开表达', signals: { expression: -0.85 } },
          { value: 'comment', label: '偶尔评论一下', trace: '偶尔会留下评论', signals: { expression: 0.25 } },
          { value: 'share', label: '会分享给朋友', trace: '会主动把体验分享给朋友', signals: { expression: 0.65 } },
          { value: 'post', label: '会自己发笔记', trace: '会主动发布自己的体验', signals: { expression: 0.95 } }
        ]
      }
    ]
  }
]

function getObservationPlatform(id) {
  return observationPlatforms.find(item => item.id === id)
}

module.exports = { observationPlatforms, observationAxes, getObservationPlatform }
