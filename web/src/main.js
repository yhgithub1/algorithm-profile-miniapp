import './styles.css'
import './compact.css'
import './motion.css'
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

function particles() {
  const rows = Object.entries(state.answers)
  return rows.map(([id], i) => {
    const q = QUESTIONS.find(item => item.id === id)
    const color = q ? PLATFORM_META[q.platform].color : '#999'
    const left = 24 + ((i * 19) % 48)
    const top = 16 + ((i * 27) % 66)
    const width = 22 + ((i * 9) % 30)
    const height = 12 + ((i * 7) % 18)
    const newest = id === state.lastAnswerId ? ' newest' : ''
    return `<i class="data-mark${newest}" style="--c:${color};--x:${left}%;--y:${top}%;--w:${width}px;--h:${height}px;--r:${(i * 29) % 56 - 28}deg"></i>`
  }).join('')
}

function networkMarkup(level = 0) {
  const safe = Math.max(0, Math.min(3, level))
  return `
    <svg class="trace-network level-${safe}" viewBox="0 0 420 420" aria-hidden="true">
      <path pathLength="1" class="network-path path-a" d="M58 286 C116 270 142 224 205 188" />
      <path pathLength="1" class="network-path path-b" d="M365 126 C314 144 287 173 223 194" />
      <path pathLength="1" class="network-path path-c" d="M350 330 C302 306 284 246 225 208" />
      <circle class="network-node node-a" cx="58" cy="286" r="4" />
      <circle class="network-node node-b" cx="365" cy="126" r="4" />
      <circle class="network-node node-c" cx="350" cy="330" r="4" />
    </svg>`
}

function personMarkup(size = 'normal', level = answeredCount()) {
  return `
    <div class="human ${size}" data-projection-target>
      <div class="human-glow"></div>
      <div class="human-head"></div>
      <div class="human-neck"></div>
      <div class="human-torso"></div>
      <div class="human-arm left"></div>
      <div class="human-arm right"></div>
      <div class="human-leg left"></div>
      <div class="human-leg right"></div>
      <div class="human-marks">${particles()}</div>
      <div class="absorb-wave"></div>
    </div>
    ${networkMarkup(Math.min(3, Math.floor(level / 2) + (level > 0 ? 1 : 0)))}`
}

function renderHome() {
  app.innerHTML = `
    <main class="page home-page compact-home screen-enter">
      <nav class="topbar"><span>ALGORITHM PROFILE</span><span class="topbar-note">WEB</span></nav>
      <section class="home-grid compact-home-grid">
        <div class="hero-copy motion-copy">
          <p class="eyebrow">算法眼里的你</p>
          <h1>可能不是你。</h1>
          <p class="hero-desc compact-desc">7 个日常选择，看它会怎么理解你。</p>
          <div class="hero-actions">
            <button class="primary-button" data-action="start">开始 <span>→</span></button>
            <span class="microcopy">约 1 分钟</span>
          </div>
        </div>

        <div class="hero-visual motion-visual">
          ${personMarkup('large', 0)}
          <div class="visual-label compact-label">它还什么都不知道</div>
        </div>
      </section>
    </main>`

  enterScreen()
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
    <main class="page observe-page compact-observe screen-enter" style="--accent:${meta.color};--soft:${meta.soft}">
      <nav class="topbar observe-bar">
        <button class="ghost-button" data-action="back">←</button>
        <span>${state.index + 1} / ${QUESTIONS.length}</span>
        <span class="view-pill">${meta.view}</span>
      </nav>
      <div class="progress"><i style="width:${progress}%"></i></div>

      <section class="observe-grid compact-observe-grid">
        <div class="question-zone motion-copy">
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

        <aside class="live-zone compact-live motion-visual">
          <div class="live-caption"><span>LIVE</span><b>${count}</b></div>
          <div class="live-stage">
            ${personMarkup('medium', count)}
          </div>
          <div class="compact-signal">${count < 3 ? '正在收集碎片' : count < 6 ? '开始出现模式' : '可以形成判断了'}</div>
          ${recentTrace() ? `<div class="last-trace">${escapeHtml(recentTrace())}</div>` : ''}
        </aside>
      </section>
    </main>`

  enterScreen()
}

function renderMidReveal() {
  const analysis = analyzeAnswers(state.answers)
  const first = analysis.discoveries[0]

  app.innerHTML = `
    <main class="page reveal-page compact-reveal screen-enter">
      <nav class="topbar"><span>EARLY SIGNAL</span><span>3 / ${QUESTIONS.length}</span></nav>
      <section class="reveal-wrap compact-reveal-wrap">
        <div class="reveal-person motion-visual">${personMarkup('large', 3)}</div>
        <div class="reveal-copy motion-copy">
          <p class="eyebrow">它已经开始猜了</p>
          <h2>${escapeHtml(first?.title || '已经出现第一条重复信号')}</h2>
          <button class="primary-button" data-action="continue">继续验证 <span>→</span></button>
        </div>
      </section>
    </main>`

  enterScreen(true)
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
    <main class="page result-page compact-result screen-enter">
      <nav class="topbar"><span>DISCOVERY</span><button class="text-button" data-action="restart">重来</button></nav>

      <section class="result-hero compact-result-hero">
        <div class="result-title motion-copy">
          <p class="eyebrow">不是性格结论</p>
          <h1>${analysis.discoveries.length} 个<br><span>行为发现</span></h1>
        </div>
        <div class="result-person motion-visual">${personMarkup('large', 7)}</div>
      </section>

      <section class="discoveries compact-discoveries">
        ${analysis.discoveries.map((item, i) => `
          <article class="discovery-card compact-discovery-card scroll-reveal" style="--delay:${i * 70}ms">
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

      <section class="blind-loop-grid compact-insights scroll-reveal">
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

      <details class="platform-details scroll-reveal">
        <summary>三个平台分别看到了什么？</summary>
        <div class="platform-grid compact-platform-grid">
          ${analysis.platforms.map(p => `
            <article class="platform-panel" style="--accent:${p.color};--soft:${p.soft}">
              <div class="platform-top"><span class="platform-dot"></span><div><b>${p.name}</b><small>${p.view}</small></div></div>
              <div class="platform-traces">${(p.traces || []).slice(0, 2).map(t => `<span>${escapeHtml(t)}</span>`).join('') || '<span>痕迹不足</span>'}</div>
            </article>`).join('')}
        </div>
      </details>

      <footer class="result-footer compact-footer scroll-reveal">
        <p>平台看到的是行为，不是你本人。</p>
      </footer>
    </main>`

  enterScreen(true)
  setupScrollReveal()
}

function render() {
  if (state.screen === 'home') renderHome()
  if (state.screen === 'observe') renderObserve()
  if (state.screen === 'reveal') renderMidReveal()
  if (state.screen === 'result') renderResult()
}

function enterScreen(resolveHuman = false) {
  const page = app.querySelector('.screen-enter')
  if (!page) return
  requestAnimationFrame(() => page.classList.add('is-ready'))
  if (resolveHuman) {
    const human = page.querySelector('.human')
    if (human) human.classList.add('resolve-in')
  }
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
  }, { threshold: 0.16 })

  rows.forEach(row => observer.observe(row))
}

function animateChoiceToProjection(source, color) {
  const target = app.querySelector('[data-projection-target]')
  if (!source || !target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve()
  }

  const a = source.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const sx = a.right - 26
  const sy = a.top + a.height / 2
  const tx = b.left + b.width / 2
  const ty = b.top + b.height * .48
  const dx = tx - sx
  const dy = ty - sy

  source.classList.add('committed')
  target.classList.add('absorbing')

  const pulse = document.createElement('span')
  pulse.className = 'motion-trace'
  pulse.style.setProperty('--trace-color', color)
  document.body.appendChild(pulse)

  const animation = pulse.animate([
    { transform: `translate3d(${sx}px, ${sy}px, 0) scale(.35)`, opacity: 0 },
    { transform: `translate3d(${sx + dx * .18}px, ${sy + dy * .08 - 34}px, 0) scale(1)`, opacity: .92, offset: .18 },
    { transform: `translate3d(${sx + dx * .62}px, ${sy + dy * .54 - 48}px, 0) scale(.72)`, opacity: .78, offset: .62 },
    { transform: `translate3d(${tx}px, ${ty}px, 0) scale(.12)`, opacity: 0 }
  ], {
    duration: 520,
    easing: 'cubic-bezier(.2,.72,.18,1)',
    fill: 'forwards'
  })

  return animation.finished.catch(() => {}).then(() => {
    pulse.remove()
    source.classList.remove('committed')
    target.classList.remove('absorbing')
  })
}

async function transitionRender(mutator, { scrollTop = false } = {}) {
  const page = app.querySelector('main')
  if (page && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await page.animate([
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      { opacity: 0, transform: 'translateY(-8px)', filter: 'blur(3px)' }
    ], { duration: 150, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {})
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
