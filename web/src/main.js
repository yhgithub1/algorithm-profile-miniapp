import './styles.css'
import './compact.css'
import './motion.css'
import './editorial.css'
import { QUESTIONS, PLATFORM_META, analyzeAnswers } from './logic.js'

const app = document.querySelector('#app')

const state = {
  screen: 'home',
  index: 0,
  answers: {},
  feedback: {},
  previewShown: false,
  lastAnswerId: ''
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

function answerRows() {
  return Object.entries(state.answers).map(([id, optionIndex]) => {
    const question = QUESTIONS.find(item => item.id === id)
    const option = question?.options?.[optionIndex]
    if (!question || !option) return null
    return {
      id,
      color: PLATFORM_META[question.platform]?.color || '#7c746c',
      view: PLATFORM_META[question.platform]?.view || '',
      trace: option.trace || option.label
    }
  }).filter(Boolean)
}

function traceFieldMarkup(size = 'normal') {
  const rows = answerRows()
  const visible = rows.slice(-5)
  return `
    <div class="trace-field ${size}" data-projection-target>
      <div class="trace-field-head">
        <span>OBSERVED</span>
        <b>${String(rows.length).padStart(2, '0')}</b>
      </div>
      <div class="trace-field-body">
        <div class="signal-spine"></div>
        ${rows.length === 0 ? `
          <div class="empty-signal">
            <i></i><i></i><i></i><i></i>
            <span>NO SIGNAL</span>
          </div>
        ` : visible.map((row, index) => `
          <div class="signal-row ${row.id === state.lastAnswerId ? 'newest' : ''}" style="--signal:${row.color};--delay:${index * 55}ms">
            <i></i>
            <div>
              <small>${escapeHtml(row.view)}</small>
              <span>${escapeHtml(row.trace)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="absorb-wave"></div>
    </div>`
}

function recentTrace() {
  const rows = answerRows()
  return rows.length ? rows[rows.length - 1].trace : ''
}

function renderHome() {
  app.innerHTML = `
    <main class="page editorial-home screen-enter">
      <nav class="topbar"><span>ALGORITHM PROFILE</span><span>BEHAVIOR / 01</span></nav>
      <section class="home-editorial">
        <div class="home-copy motion-copy">
          <p class="eyebrow">算法眼里的你</p>
          <h1>可能不是你。</h1>
          <p class="home-sub">7 个日常选择。看看它会从这些碎片里，错把你理解成什么。</p>
          <button class="primary-button" data-action="start">开始 <span>→</span></button>
        </div>
        <div class="home-traces motion-visual">
          ${traceFieldMarkup('home')}
        </div>
      </section>
    </main>`
  enterScreen()
}

function renderObserve() {
  const q = QUESTIONS[state.index]
  const meta = PLATFORM_META[q.platform]
  const selected = state.answers[q.id]
  const progress = ((state.index + 1) / QUESTIONS.length) * 100

  app.innerHTML = `
    <main class="page editorial-observe screen-enter" style="--accent:${meta.color}">
      <nav class="topbar observe-bar">
        <button class="ghost-button" data-action="back">←</button>
        <span>${String(state.index + 1).padStart(2, '0')} / ${String(QUESTIONS.length).padStart(2, '0')}</span>
        <span>${escapeHtml(meta.view)}</span>
      </nav>
      <div class="editorial-progress"><i style="width:${progress}%"></i></div>

      <section class="observe-editorial">
        <div class="question-zone motion-copy">
          <p class="scene-label">${escapeHtml(q.kicker)}</p>
          <h2>${escapeHtml(q.title)}</h2>
          <div class="editorial-options">
            ${q.options.map((opt, i) => `
              <button class="editorial-option ${selected === i ? 'selected' : ''}" data-answer="${i}">
                <span>${escapeHtml(opt.label)}</span>
                <i>↗</i>
              </button>`).join('')}
          </div>
        </div>

        <aside class="trace-side motion-visual">
          ${traceFieldMarkup('side')}
          ${recentTrace() ? `<div class="recent-trace">刚刚记录：${escapeHtml(recentTrace())}</div>` : ''}
        </aside>
      </section>
    </main>`
  enterScreen()
}

function renderMidReveal() {
  const analysis = analyzeAnswers(state.answers)
  const first = analysis.discoveries[0]

  app.innerHTML = `
    <main class="page editorial-reveal screen-enter">
      <nav class="topbar dark-bar"><span>EARLY SIGNAL</span><span>03 / ${String(QUESTIONS.length).padStart(2, '0')}</span></nav>
      <section class="reveal-editorial">
        <div class="reveal-index">01</div>
        <div class="reveal-copy motion-copy">
          <p class="eyebrow">算法已经开始下结论</p>
          <h1>${escapeHtml(first?.title || '已经出现第一条重复信号')}</h1>
          <p>${escapeHtml(first?.lead || '三次选择还不足以定义你，但已经足以让推荐系统开始形成方向。')}</p>
          <button class="primary-button light" data-action="continue">继续，看它会不会改口 <span>→</span></button>
        </div>
        <div class="reveal-lines" aria-hidden="true"><i></i><i></i><i></i></div>
      </section>
    </main>`
  enterScreen()
}

function feedbackButtons(item, dark = false) {
  return `
    <div class="feedback-row compact-feedback ${dark ? 'feedback-dark' : ''}" data-feedback="${item.id}">
      <button data-feedback-value="right" class="${state.feedback[item.id] === 'right' ? 'active' : ''}">像我</button>
      <button data-feedback-value="unsure" class="${state.feedback[item.id] === 'unsure' ? 'active' : ''}">不确定</button>
      <button data-feedback-value="wrong" class="${state.feedback[item.id] === 'wrong' ? 'wrong active' : ''}">看错了</button>
    </div>`
}

function renderResult() {
  const analysis = analyzeAnswers(state.answers)
  const first = analysis.discoveries[0]
  const rest = analysis.discoveries.slice(1)

  app.innerHTML = `
    <main class="result-page editorial-result screen-enter">
      <nav class="topbar result-topbar"><span>DISCOVERY</span><button class="text-button" data-action="restart">重来</button></nav>

      <section class="finding-hero">
        <div class="finding-number">01</div>
        <div class="finding-copy motion-copy">
          <p class="eyebrow">最强的一条行为模式</p>
          <h1>${escapeHtml(first?.title || '这些选择之间开始出现结构')}</h1>
          <p class="finding-lead">${escapeHtml(first?.lead || '')}</p>
          ${first ? feedbackButtons(first, true) : ''}
          ${state.feedback[first?.id] === 'wrong' ? '<div class="hero-wrong">这条会被降权。行为相同，不代表原因相同。</div>' : ''}
        </div>
        <div class="finding-signal motion-visual">${traceFieldMarkup('result')}</div>
      </section>

      <div class="result-section-label"><span>OTHER SIGNALS</span></div>

      <section class="discoveries editorial-discoveries">
        ${rest.map((item, i) => `
          <article class="editorial-discovery scroll-reveal" style="--delay:${i * 70}ms">
            <div class="discovery-no">0${i + 2}</div>
            <div class="discovery-content">
              <h2>${escapeHtml(item.title)}</h2>
              <p class="discovery-lead">${escapeHtml(item.lead)}</p>
              <details class="why-details">
                <summary>为什么这么说</summary>
                <p>${escapeHtml(item.body)}</p>
                <div class="evidence-grid compact-evidence">
                  ${item.evidence.map(ev => `<span><b>${escapeHtml(ev.platform)}</b>${escapeHtml(ev.trace)}</span>`).join('')}
                </div>
              </details>
              ${feedbackButtons(item)}
              ${state.feedback[item.id] === 'wrong' ? '<div class="wrong-note compact-wrong">这条应该被降权。</div>' : ''}
            </div>
          </article>`).join('')}
      </section>

      <section class="editorial-insights scroll-reveal">
        <article>
          <p class="mini-label">最容易看错你</p>
          <h3>${escapeHtml(analysis.blindSpot.title)}</h3>
          <details class="why-details"><summary>展开</summary><p>${escapeHtml(analysis.blindSpot.body)}</p></details>
        </article>
        <article>
          <p class="mini-label">推荐会怎么放大它</p>
          <h3>${escapeHtml(analysis.loop.title)}</h3>
          <div class="compact-loop">
            ${analysis.loop.steps.map((step, i) => `<div><b>${i + 1}</b><span>${escapeHtml(step)}</span>${i < analysis.loop.steps.length - 1 ? '<i>↓</i>' : ''}</div>`).join('')}
          </div>
        </article>
      </section>

      <details class="platform-details editorial-platforms scroll-reveal">
        <summary>三个平台分别看到了什么？</summary>
        <div class="platform-grid compact-platform-grid">
          ${analysis.platforms.map(p => `
            <article class="platform-panel" style="--accent:${p.color};--soft:${p.soft}">
              <div class="platform-top"><span class="platform-dot"></span><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.view)}</small></div></div>
              <div class="platform-traces">${(p.traces || []).slice(0, 2).map(t => `<span>${escapeHtml(t)}</span>`).join('') || '<span>痕迹不足</span>'}</div>
            </article>`).join('')}
        </div>
      </details>

      <footer class="result-footer editorial-footer scroll-reveal">
        <p>平台看到的是行为，不是你本人。</p>
      </footer>
    </main>`

  enterScreen()
  setupScrollReveal()
}

function render() {
  if (state.screen === 'home') renderHome()
  if (state.screen === 'observe') renderObserve()
  if (state.screen === 'reveal') renderMidReveal()
  if (state.screen === 'result') renderResult()
}

function enterScreen() {
  const page = app.querySelector('.screen-enter')
  if (!page) return
  requestAnimationFrame(() => page.classList.add('is-ready'))
}

function setupScrollReveal() {
  const rows = [...app.querySelectorAll('.scroll-reveal')]
  if (!rows.length) return
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.12 })
  rows.forEach(row => observer.observe(row))
}

function animateChoiceToProjection(source, color) {
  const target = app.querySelector('[data-projection-target]')
  if (!source || !target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()

  const a = source.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const sx = a.right - 20
  const sy = a.top + a.height / 2
  const tx = b.left + 28
  const ty = b.top + b.height * .5

  const pulse = document.createElement('span')
  pulse.className = 'motion-trace editorial-trace'
  pulse.style.setProperty('--trace-color', color)
  document.body.appendChild(pulse)

  const animation = pulse.animate([
    { transform: `translate3d(${sx}px, ${sy}px, 0) scaleX(.2)`, opacity: 0 },
    { transform: `translate3d(${sx + (tx - sx) * .35}px, ${sy + (ty - sy) * .22}px, 0) scaleX(1)`, opacity: .75, offset: .35 },
    { transform: `translate3d(${tx}px, ${ty}px, 0) scaleX(.35)`, opacity: 0 }
  ], { duration: 420, easing: 'cubic-bezier(.2,.72,.18,1)', fill: 'forwards' })

  return animation.finished.catch(() => {}).then(() => pulse.remove())
}

async function transitionRender(mutator, { scrollTop = false } = {}) {
  const page = app.querySelector('main')
  if (page && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await page.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-6px)' }
    ], { duration: 130, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {})
  }
  mutator()
  render()
  if (scrollTop) window.scrollTo({ top: 0 })
}

async function chooseAnswer(index, source) {
  const question = QUESTIONS[state.index]
  const meta = PLATFORM_META[question.platform]
  await animateChoiceToProjection(source, meta.color)
  state.answers[question.id] = index
  state.lastAnswerId = question.id

  if (state.index === 2 && !state.previewShown) {
    state.previewShown = true
    await transitionRender(() => { state.screen = 'reveal' })
    return
  }

  if (state.index >= QUESTIONS.length - 1) {
    await transitionRender(() => { state.screen = 'result' }, { scrollTop: true })
    return
  }

  await transitionRender(() => { state.index += 1 })
}

app.addEventListener('click', event => {
  const answer = event.target.closest('[data-answer]')
  if (answer) {
    chooseAnswer(Number(answer.dataset.answer), answer)
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
    transitionRender(() => {
      state.screen = 'observe'
      state.index = 0
      state.answers = {}
      state.previewShown = false
      state.feedback = {}
      state.lastAnswerId = ''
    })
    return
  }

  if (action === 'back') {
    transitionRender(() => {
      if (state.index === 0) state.screen = 'home'
      else state.index -= 1
    })
    return
  }

  if (action === 'continue') {
    transitionRender(() => {
      state.screen = 'observe'
      state.index = 3
    })
    return
  }

  if (action === 'restart') {
    transitionRender(() => {
      state.screen = 'home'
      state.index = 0
      state.answers = {}
      state.previewShown = false
      state.feedback = {}
      state.lastAnswerId = ''
    }, { scrollTop: true })
  }
})

render()
