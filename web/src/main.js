import './styles.css'
import { QUESTIONS, PLATFORM_META, analyzeAnswers } from './logic.js'

const app = document.querySelector('#app')
const state = {
  screen: 'home',
  index: 0,
  answers: {},
  feedback: {},
  previewShown: false
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function answeredCount() {
  return Object.keys(state.answers).length
}

function particles() {
  const colors = Object.entries(state.answers).map(([id]) => {
    const q = QUESTIONS.find(item => item.id === id)
    return PLATFORM_META[q.platform].color
  })
  return colors.map((color, i) => {
    const left = 20 + ((i * 23) % 58)
    const top = 14 + ((i * 31) % 70)
    const size = 14 + ((i * 7) % 18)
    return `<i class="data-mark" style="--c:${color};--x:${left}%;--y:${top}%;--s:${size}px;--r:${(i * 37) % 90 - 45}deg"></i>`
  }).join('')
}

function personMarkup(size = 'normal') {
  return `
    <div class="human ${size}">
      <div class="human-glow"></div>
      <div class="human-head"></div>
      <div class="human-neck"></div>
      <div class="human-torso"></div>
      <div class="human-arm left"></div>
      <div class="human-arm right"></div>
      <div class="human-leg left"></div>
      <div class="human-leg right"></div>
      <div class="human-marks">${particles()}</div>
    </div>`
}

function renderHome() {
  app.innerHTML = `
    <main class="page home-page">
      <nav class="topbar"><span>ALGORITHM PROFILE</span><span class="topbar-note">Web V2</span></nav>
      <section class="home-grid">
        <div class="hero-copy fade-up">
          <p class="eyebrow">不是测试，是一次被算法观察的体验</p>
          <h1>互联网认识的你，<br><span>可能和你认识的自己不一样。</span></h1>
          <p class="hero-desc">它看不到你的动机，只能从一次次选择里猜。给我几个日常行为，我把这些碎片拼起来，看看算法最容易在哪些地方理解你，也最容易在哪些地方看错你。</p>
          <div class="hero-actions">
            <button class="primary-button" data-action="start">开始留下痕迹 <span>↗</span></button>
            <span class="microcopy">约 1 分钟 · 不读取任何平台账号</span>
          </div>
        </div>
        <div class="hero-visual fade-up delay-1">
          <div class="visual-label">现在，它几乎什么都不知道。</div>
          <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>
          ${personMarkup('large')}
          <div class="lens-chip chip-a">生活消费</div>
          <div class="lens-chip chip-b">内容注意力</div>
          <div class="lens-chip chip-c">生活决策</div>
        </div>
      </section>
      <section class="home-footer fade-up delay-2">
        <div><b>01</b><span>回答真实场景，不回答“你觉得自己是什么人”</span></div>
        <div><b>02</b><span>算法只保留行为证据，不强行把你塞进固定类型</span></div>
        <div><b>03</b><span>结果重点展示跨场景模式、矛盾和误判</span></div>
      </section>
    </main>`
}

function renderObserve() {
  const q = QUESTIONS[state.index]
  const meta = PLATFORM_META[q.platform]
  const count = answeredCount()
  const selected = state.answers[q.id]
  const progress = Math.round((state.index / QUESTIONS.length) * 100)

  app.innerHTML = `
    <main class="page observe-page" style="--accent:${meta.color};--soft:${meta.soft}">
      <nav class="topbar observe-bar">
        <button class="ghost-button" data-action="back">←</button>
        <span>${String(state.index + 1).padStart(2, '0')} / ${String(QUESTIONS.length).padStart(2, '0')}</span>
        <span class="view-pill">${meta.name} · ${meta.view}</span>
      </nav>
      <div class="progress"><i style="width:${progress}%"></i></div>
      <section class="observe-grid">
        <div class="question-zone fade-up">
          <p class="scene-label">${escapeHtml(q.kicker)}</p>
          <h2>${escapeHtml(q.title)}</h2>
          <div class="options">
            ${q.options.map((opt, i) => `
              <button class="option-card ${selected === i ? 'selected' : ''}" data-answer="${i}">
                <span class="option-index">0${i + 1}</span>
                <span>${escapeHtml(opt.label)}</span>
                <i>↗</i>
              </button>`).join('')}
          </div>
          <p class="question-note">没有“正确答案”。这里记录的是你在具体场景里的选择，不是人格自评。</p>
        </div>
        <aside class="live-zone fade-up delay-1">
          <div class="live-caption"><span>LIVE PROJECTION</span><b>${count} 条痕迹</b></div>
          <div class="live-stage">
            ${personMarkup('medium')}
            <div class="live-ring ring-one"></div><div class="live-ring ring-two"></div>
            <div class="signal-copy">${count < 3 ? '算法还在收集碎片' : count < 6 ? '开始出现一些重复模式' : '已经能形成第一轮行为发现'}</div>
          </div>
          <div class="trace-stack">
            ${Object.entries(state.answers).slice(-3).reverse().map(([id, idx]) => {
              const question = QUESTIONS.find(item => item.id === id)
              const option = question.options[idx]
              const m = PLATFORM_META[question.platform]
              return `<div class="trace-line"><i style="background:${m.color}"></i><span>${escapeHtml(option.trace)}</span></div>`
            }).join('') || '<div class="trace-empty">你的第一条行为痕迹会出现在这里。</div>'}
          </div>
        </aside>
      </section>
    </main>`
}

function renderMidReveal() {
  const analysis = analyzeAnswers(state.answers)
  const first = analysis.discoveries[0]
  app.innerHTML = `
    <main class="page reveal-page">
      <nav class="topbar"><span>EARLY SIGNAL</span><span>3 个场景之后</span></nav>
      <section class="reveal-wrap">
        <div class="reveal-person">${personMarkup('large')}</div>
        <div class="reveal-copy fade-up">
          <p class="eyebrow">算法已经忍不住开始猜了</p>
          <h2>${first ? escapeHtml(first.title) : '已经出现第一条可重复的行为信号'}</h2>
          <p>${first ? escapeHtml(first.lead) : '三次选择还不足以定义你，但已经足够让推荐系统开始形成方向。'}</p>
          <div class="early-evidence">
            ${(first?.evidence || []).slice(0, 2).map(item => `<span><b>${item.platform}</b>${escapeHtml(item.trace)}</span>`).join('')}
          </div>
          <p class="reveal-note">这还不是结论。接下来几次选择，可能会强化它，也可能把它推翻。</p>
          <button class="primary-button" data-action="continue">继续，看它会不会改口 <span>→</span></button>
        </div>
      </section>
    </main>`
}

function renderResult() {
  const analysis = analyzeAnswers(state.answers)
  app.innerHTML = `
    <main class="page result-page">
      <nav class="topbar"><span>BEHAVIOR DISCOVERY</span><button class="text-button" data-action="restart">重新观察</button></nav>
      <section class="result-hero">
        <div class="result-title fade-up">
          <p class="eyebrow">你给的是普通选择，真正有意思的是它们之间的关系。</p>
          <h1>我发现了 ${analysis.discoveries.length} 个<br><span>你可能没主动总结过的行为模式。</span></h1>
          <p>不是“你是什么人”，而是不同场景放在一起后，哪些行为开始呈现结构。</p>
        </div>
        <div class="result-person fade-up delay-1">${personMarkup('large')}</div>
      </section>

      <section class="discoveries">
        ${analysis.discoveries.map((item, i) => `
          <article class="discovery-card fade-up" style="--delay:${i * 80}ms">
            <div class="discovery-no">0${i + 1}</div>
            <div class="discovery-content">
              <h2>${escapeHtml(item.title)}</h2>
              <p class="discovery-lead">${escapeHtml(item.lead)}</p>
              <p class="discovery-body">${escapeHtml(item.body)}</p>
              <div class="evidence-title">这条发现来自</div>
              <div class="evidence-grid">
                ${item.evidence.map(ev => `<span><b>${ev.platform}</b>${escapeHtml(ev.trace)}</span>`).join('')}
              </div>
              <div class="feedback-row" data-feedback="${item.id}">
                <button data-feedback-value="right" class="${state.feedback[item.id] === 'right' ? 'active' : ''}">比较像我</button>
                <button data-feedback-value="unsure" class="${state.feedback[item.id] === 'unsure' ? 'active' : ''}">不确定</button>
                <button data-feedback-value="wrong" class="${state.feedback[item.id] === 'wrong' ? 'wrong active' : ''}">看错了</button>
              </div>
              ${state.feedback[item.id] === 'wrong' ? '<div class="wrong-note">算法看到了行为，却可能误解了原因。这条模式应该被降权，而不是继续硬解释。</div>' : ''}
            </div>
          </article>`).join('')}
      </section>

      <section class="blind-loop-grid">
        <article class="blind-card">
          <p class="mini-label">MOST LIKELY TO MISREAD</p>
          <h2>算法最可能误解你的地方</h2>
          <h3>${escapeHtml(analysis.blindSpot.title)}</h3>
          <p>${escapeHtml(analysis.blindSpot.body)}</p>
        </article>
        <article class="loop-card">
          <p class="mini-label">FEEDBACK LOOP</p>
          <h2>${escapeHtml(analysis.loop.title)}</h2>
          <div class="loop-steps">
            ${analysis.loop.steps.map((step, i) => `<div><b>0${i + 1}</b><span>${escapeHtml(step)}</span>${i < analysis.loop.steps.length - 1 ? '<i>↓</i>' : ''}</div>`).join('')}
          </div>
        </article>
      </section>

      <section class="platform-section">
        <div class="section-heading">
          <p class="mini-label">THREE WINDOWS</p>
          <h2>同一个人，被三个场景看成了三个局部。</h2>
        </div>
        <div class="platform-grid">
          ${analysis.platforms.map(p => `
            <article class="platform-panel" style="--accent:${p.color};--soft:${p.soft}">
              <div class="platform-top"><span class="platform-dot"></span><div><b>${p.name}</b><small>${p.view}</small></div></div>
              <div class="platform-traces">${p.traces.map(t => `<span>${escapeHtml(t)}</span>`).join('') || '<span>这次没有留下足够痕迹</span>'}</div>
              <p>它只能从这些行为往下猜，无法知道你的真实动机。</p>
            </article>`).join('')}
        </div>
      </section>

      <footer class="result-footer">
        <p>平台看到的是行为，不是你本人。</p>
        <span>本页面仅做行为模拟推演，不代表任何平台真实后台画像，也不是人格或心理评估。</span>
      </footer>
    </main>`
}

function render() {
  if (state.screen === 'home') renderHome()
  if (state.screen === 'observe') renderObserve()
  if (state.screen === 'reveal') renderMidReveal()
  if (state.screen === 'result') renderResult()
}

function chooseAnswer(index) {
  const question = QUESTIONS[state.index]
  state.answers[question.id] = index
  renderObserve()
  setTimeout(() => {
    if (state.index === 2 && !state.previewShown) {
      state.previewShown = true
      state.screen = 'reveal'
      render()
      return
    }
    if (state.index >= QUESTIONS.length - 1) {
      state.screen = 'result'
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    state.index += 1
    render()
  }, 420)
}

app.addEventListener('click', event => {
  const answer = event.target.closest('[data-answer]')
  if (answer) {
    chooseAnswer(Number(answer.dataset.answer))
    return
  }
  const feedback = event.target.closest('[data-feedback-value]')
  if (feedback) {
    const wrap = feedback.closest('[data-feedback]')
    state.feedback[wrap.dataset.feedback] = feedback.dataset.feedbackValue
    renderResult()
    return
  }
  const action = event.target.closest('[data-action]')?.dataset.action
  if (!action) return
  if (action === 'start') {
    state.screen = 'observe'; state.index = 0; state.answers = {}; state.previewShown = false; state.feedback = {}; render(); return
  }
  if (action === 'back') {
    if (state.index === 0) { state.screen = 'home' } else { state.index -= 1 }
    render(); return
  }
  if (action === 'continue') {
    state.screen = 'observe'; state.index = 3; render(); return
  }
  if (action === 'restart') {
    state.screen = 'home'; state.index = 0; state.answers = {}; state.previewShown = false; state.feedback = {}; render(); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

render()
