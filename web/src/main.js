import './styles.css'
import './compact.css'
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
    return q ? PLATFORM_META[q.platform].color : '#999'
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
    <main class="page home-page compact-home">
      <nav class="topbar"><span>ALGORITHM PROFILE</span><span class="topbar-note">WEB</span></nav>
      <section class="home-grid compact-home-grid">
        <div class="hero-copy fade-up">
          <p class="eyebrow">算法眼里的你</p>
          <h1>可能不是你。</h1>
          <p class="hero-desc compact-desc">7 个日常选择，看它会怎么理解你。</p>
          <div class="hero-actions">
            <button class="primary-button" data-action="start">开始 <span>→</span></button>
            <span class="microcopy">约 1 分钟</span>
          </div>
        </div>

        <div class="hero-visual fade-up delay-1">
          <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>
          ${personMarkup('large')}
          <div class="visual-label compact-label">它还什么都不知道</div>
        </div>
      </section>
    </main>`
}

function recentTrace() {
  const ids = Object.keys(state.answers)
  if (!ids.length) return ''
  const id = ids[ids.length - 1]
  const question = QUESTIONS.find(item => item.id === id)
  if (!question) return ''
  const selected = state.answers[id]
  return question.options[selected]?.trace || ''
}

function renderObserve() {
  const q = QUESTIONS[state.index]
  const meta = PLATFORM_META[q.platform]
  const count = answeredCount()
  const selected = state.answers[q.id]
  const progress = Math.round((state.index / QUESTIONS.length) * 100)

  app.innerHTML = `
    <main class="page observe-page compact-observe" style="--accent:${meta.color};--soft:${meta.soft}">
      <nav class="topbar observe-bar">
        <button class="ghost-button" data-action="back">←</button>
        <span>${state.index + 1} / ${QUESTIONS.length}</span>
        <span class="view-pill">${meta.view}</span>
      </nav>
      <div class="progress"><i style="width:${progress}%"></i></div>

      <section class="observe-grid compact-observe-grid">
        <div class="question-zone fade-up">
          <p class="scene-label">${escapeHtml(q.kicker)}</p>
          <h2>${escapeHtml(q.title)}</h2>
          <div class="options compact-options">
            ${q.options.map((opt, i) => `
              <button class="option-card ${selected === i ? 'selected' : ''}" data-answer="${i}">
                <span>${escapeHtml(opt.label)}</span>
                <i>→</i>
              </button>`).join('')}
          </div>
        </div>

        <aside class="live-zone compact-live fade-up delay-1">
          <div class="live-caption"><span>LIVE</span><b>${count}</b></div>
          <div class="live-stage">
            ${personMarkup('medium')}
            <div class="live-ring ring-one"></div><div class="live-ring ring-two"></div>
          </div>
          <div class="compact-signal">${count < 3 ? '正在收集碎片' : count < 6 ? '开始出现模式' : '可以形成判断了'}</div>
          ${recentTrace() ? `<div class="last-trace">${escapeHtml(recentTrace())}</div>` : ''}
        </aside>
      </section>
    </main>`
}

function renderMidReveal() {
  const analysis = analyzeAnswers(state.answers)
  const first = analysis.discoveries[0]

  app.innerHTML = `
    <main class="page reveal-page compact-reveal">
      <nav class="topbar"><span>EARLY SIGNAL</span><span>3 / ${QUESTIONS.length}</span></nav>
      <section class="reveal-wrap compact-reveal-wrap">
        <div class="reveal-person">${personMarkup('large')}</div>
        <div class="reveal-copy fade-up">
          <p class="eyebrow">它已经开始猜了</p>
          <h2>${escapeHtml(first?.title || '已经出现第一条重复信号')}</h2>
          <button class="primary-button" data-action="continue">继续验证 <span>→</span></button>
        </div>
      </section>
    </main>`
}

function feedbackButtons(item) {
  return `
    <div class="feedback-row compact-feedback" data-feedback="${item.id}">
      <button data-feedback-value="right" class="${state.feedback[item.id] === 'right' ? 'active' : ''}">像我</button>
      <button data-feedback-value="unsure" class="${state.feedback[item.id] === 'unsure' ? 'active' : ''}">不确定</button>
      <button data-feedback-value="wrong" class="${state.feedback[item.id] === 'wrong' ? 'wrong active' : ''}">看错了</button>
    </div>`
}

function renderResult() {
  const analysis = analyzeAnswers(state.answers)

  app.innerHTML = `
    <main class="page result-page compact-result">
      <nav class="topbar"><span>DISCOVERY</span><button class="text-button" data-action="restart">重来</button></nav>

      <section class="result-hero compact-result-hero">
        <div class="result-title fade-up">
          <p class="eyebrow">不是性格结论</p>
          <h1>${analysis.discoveries.length} 个<br><span>行为发现</span></h1>
        </div>
        <div class="result-person fade-up delay-1">${personMarkup('large')}</div>
      </section>

      <section class="discoveries compact-discoveries">
        ${analysis.discoveries.map((item, i) => `
          <article class="discovery-card compact-discovery-card fade-up" style="--delay:${i * 80}ms">
            <div class="discovery-no">0${i + 1}</div>
            <div class="discovery-content">
              <h2>${escapeHtml(item.title)}</h2>
              <p class="discovery-lead compact-lead">${escapeHtml(item.lead)}</p>

              <details class="why-details">
                <summary>为什么这么说</summary>
                <p>${escapeHtml(item.body)}</p>
                <div class="evidence-grid compact-evidence">
                  ${item.evidence.map(ev => `<span><b>${ev.platform}</b>${escapeHtml(ev.trace)}</span>`).join('')}
                </div>
              </details>

              ${feedbackButtons(item)}
              ${state.feedback[item.id] === 'wrong' ? '<div class="wrong-note compact-wrong">这条应该被降权。</div>' : ''}
            </div>
          </article>`).join('')}
      </section>

      <section class="blind-loop-grid compact-insights">
        <article class="blind-card compact-insight-card">
          <p class="mini-label">最容易看错你</p>
          <h3>${escapeHtml(analysis.blindSpot.title)}</h3>
          <details class="why-details dark-details"><summary>展开</summary><p>${escapeHtml(analysis.blindSpot.body)}</p></details>
        </article>

        <article class="loop-card compact-insight-card">
          <p class="mini-label">推荐会怎么放大它</p>
          <h3>${escapeHtml(analysis.loop.title)}</h3>
          <div class="loop-steps compact-loop">
            ${analysis.loop.steps.map((step, i) => `<div><b>${i + 1}</b><span>${escapeHtml(step)}</span>${i < analysis.loop.steps.length - 1 ? '<i>↓</i>' : ''}</div>`).join('')}
          </div>
        </article>
      </section>

      <details class="platform-details">
        <summary>三个平台分别看到了什么？</summary>
        <div class="platform-grid compact-platform-grid">
          ${analysis.platforms.map(p => `
            <article class="platform-panel" style="--accent:${p.color};--soft:${p.soft}">
              <div class="platform-top"><span class="platform-dot"></span><div><b>${p.name}</b><small>${p.view}</small></div></div>
              <div class="platform-traces">${(p.traces || []).slice(0, 2).map(t => `<span>${escapeHtml(t)}</span>`).join('') || '<span>痕迹不足</span>'}</div>
            </article>`).join('')}
        </div>
      </details>

      <footer class="result-footer compact-footer">
        <p>平台看到的是行为，不是你本人。</p>
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
  }, 360)
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
    state.screen = 'observe'
    state.index = 0
    state.answers = {}
    state.previewShown = false
    state.feedback = {}
    render()
    return
  }

  if (action === 'back') {
    if (state.index === 0) state.screen = 'home'
    else state.index -= 1
    render()
    return
  }

  if (action === 'continue') {
    state.screen = 'observe'
    state.index = 3
    render()
    return
  }

  if (action === 'restart') {
    state.screen = 'home'
    state.index = 0
    state.answers = {}
    state.previewShown = false
    state.feedback = {}
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

render()
