import './v3.css'
import { QUESTIONS, analyzeAnswers } from './logic.js'

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function answeredRows() {
  return QUESTIONS
    .filter(question => state.answers[question.id] !== undefined)
    .map(question => ({
      question,
      option: question.options[state.answers[question.id]]
    }))
}

function nav(left = 'ALGORITHM PROFILE', right = '') {
  return `
    <nav class="nav">
      <div class="brand"><i class="brand-dot"></i><span>${escapeHtml(left)}</span></div>
      <div class="nav-meta">${right}</div>
    </nav>`
}

function renderHome() {
  app.innerHTML = `
    <main class="page home enter">
      ${nav('ALGORITHM PROFILE', 'BEHAVIOR / 01')}
      <section class="home-main">
        <div>
          <p class="home-kicker">你没有填写画像</p>
          <h1 class="home-title">你每天都在<br><span>留下它。</span></h1>
          <p class="home-sub">7 个日常选择。看看算法从什么地方看懂你，又会在哪里误解你。</p>
          <button class="cta" data-action="start">开始观察 <span>→</span></button>
        </div>
        <aside class="home-aside" aria-hidden="true">
          <div class="signal-label">VISIBLE SIGNALS</div>
          <div class="signal-list">
            <div class="signal-word"><span>停留</span><small>01</small></div>
            <div class="signal-word"><span>搜索</span><small>02</small></div>
            <div class="signal-word"><span>收藏</span><small>03</small></div>
            <div class="signal-word"><span>比较</span><small>04</small></div>
            <div class="signal-word"><span>略过</span><small>05</small></div>
          </div>
          <div class="home-note">算法看不到原因。它只能看到这些。</div>
        </aside>
      </section>
    </main>`
}

function renderLog() {
  const rows = answeredRows()
  if (!rows.length) {
    return `<div class="log-empty">等待第一条行为。</div>`
  }
  return rows.slice(-5).reverse().map((row, index) => `
    <div class="log-row">
      <b>${String(rows.length - index).padStart(2, '0')}</b>
      <span>${escapeHtml(row.option.trace)}</span>
    </div>`).join('')
}

function renderObserve() {
  const q = QUESTIONS[state.index]
  const selected = state.answers[q.id]
  const progress = Math.round((state.index / QUESTIONS.length) * 100)
  const rows = answeredRows()

  app.innerHTML = `
    <main class="page observe enter">
      <nav class="nav">
        <button class="nav-button" data-action="back">← 返回</button>
        <div class="nav-meta">${state.index + 1} / ${QUESTIONS.length} · ${escapeHtml(q.kicker)}</div>
      </nav>
      <div class="progress-track"><div class="progress-value" style="width:${progress}%"></div></div>

      <section class="observe-main">
        <div>
          <p class="q-context">${escapeHtml(q.kicker)}</p>
          <h1 class="q-title">${escapeHtml(q.title)}</h1>
          <div class="options">
            ${q.options.map((option, index) => `
              <button class="option ${selected === index ? 'is-chosen' : ''}" data-answer="${index}">
                <span class="option-no">0${index + 1}</span>
                <span class="option-text">${escapeHtml(option.label)}</span>
                <span class="option-arrow">→</span>
              </button>`).join('')}
          </div>
        </div>

        <aside class="log">
          <div class="log-head"><span>OBSERVATION LOG</span><b>${String(rows.length).padStart(2, '0')}</b></div>
          <div class="log-items">${renderLog()}</div>
          <div class="log-status"><i class="pulse"></i>${rows.length < 3 ? '还不足以形成模式' : rows.length < 6 ? '开始出现重复信号' : '已有足够证据进行第一轮推断'}</div>
        </aside>
      </section>
    </main>`
}

function renderReveal() {
  const analysis = analyzeAnswers(state.answers)
  const first = analysis.discoveries?.[0]
  const title = first?.title || '三次选择已经足够让算法形成第一种猜测'
  const lead = first?.lead || '它还不知道你为什么这么做，但已经开始把行为拼成一个方向。'
  const evidence = first?.evidence || []

  app.innerHTML = `
    <main class="page reveal enter">
      ${nav('EARLY SIGNAL', `3 / ${QUESTIONS.length}`)}
      <section class="reveal-main">
        <p class="reveal-label">AFTER THREE SIGNALS</p>
        <h1 class="reveal-title">${escapeHtml(title)}</h1>
        <p class="reveal-lead">${escapeHtml(lead)}</p>
        <div class="reveal-evidence">
          ${evidence.slice(0, 3).map(item => `<span>${escapeHtml(item.trace)}</span>`).join('')}
        </div>
        <button class="cta" data-action="continue">继续，看它会不会改口 <span>→</span></button>
      </section>
    </main>`
}

function feedbackBlock(item) {
  if (!item) return ''
  const value = state.feedback[item.id] || ''
  return `
    <div class="feedback" data-feedback="${escapeHtml(item.id)}">
      <button class="${value === 'right' ? 'active' : ''}" data-feedback-value="right">像我</button>
      <button class="${value === 'unsure' ? 'active' : ''}" data-feedback-value="unsure">不确定</button>
      <button class="${value === 'wrong' ? 'wrong active' : ''}" data-feedback-value="wrong">看错了</button>
    </div>
    ${value === 'wrong' ? '<div class="feedback-note">这就是关键：行为是真的，但原因可能被算法理解错了。</div>' : ''}`
}

function evidenceToggle(item) {
  if (!item?.evidence?.length) return ''
  return `
    <details class="evidence-toggle">
      <summary>查看它用了哪些行为证据</summary>
      <div class="evidence-strip">
        ${item.evidence.map(ev => `<span class="evidence-chip"><b>${escapeHtml(ev.platform)}</b>${escapeHtml(ev.trace)}</span>`).join('')}
      </div>
    </details>`
}

function renderResult() {
  const analysis = analyzeAnswers(state.answers)
  const discoveries = analysis.discoveries || []
  const primary = discoveries[0] || {
    id: 'fallback',
    title: '你的行为还没有形成一个足够稳定的单一模式',
    lead: '这并不是“没有结果”。它说明不同场景下的你，本来就不必一致。',
    evidence: []
  }
  const secondary = discoveries.slice(1, 3)
  const blindSpot = analysis.blindSpot || {
    title: '行为相同，不代表原因相同。',
    body: '平台能记录你的选择，却无法直接知道你为什么这么选。'
  }
  const loop = analysis.loop || { title: '行为会改变下一轮你看到的内容', steps: [] }
  const platforms = analysis.platforms || []

  app.innerHTML = `
    <main class="page result enter">
      ${nav('YOUR TRACE', '<button class="nav-button" data-action="restart">重新开始</button>')}

      <section class="result-hero">
        <p class="result-prompt">算法先看到了这一点</p>
        <h1 class="result-title">${escapeHtml(primary.title)}</h1>
        <p class="result-lead">${escapeHtml(primary.lead)}</p>
        ${feedbackBlock(primary)}
        ${evidenceToggle(primary)}
      </section>

      ${secondary.length ? `
        <section class="findings">
          ${secondary.map((item, index) => `
            <article class="finding reveal-item">
              <div class="finding-no">0${index + 2}</div>
              <div>
                <h2>${escapeHtml(item.title)}</h2>
                <p>${escapeHtml(item.lead)}</p>
                ${evidenceToggle(item)}
                ${feedbackBlock(item)}
              </div>
            </article>`).join('')}
        </section>` : ''}

      <section class="misread reveal-item">
        <div class="misread-label">MOST LIKELY TO MISREAD</div>
        <h2>${escapeHtml(blindSpot.title)}</h2>
        <p>${escapeHtml(blindSpot.body)}</p>
      </section>

      <section class="loop reveal-item">
        <div class="section-label">FEEDBACK LOOP</div>
        <h2>${escapeHtml(loop.title)}</h2>
        <div class="loop-grid">
          ${(loop.steps || []).slice(0, 4).map((step, index) => `
            <div class="loop-step"><b>0${index + 1}</b><span>${escapeHtml(step)}</span></div>`).join('')}
        </div>
      </section>

      <details class="platform-details reveal-item">
        <summary>最后再看：三个平台分别只看到了什么</summary>
        <div class="platform-grid">
          ${platforms.map(platform => `
            <article class="platform">
              <small>${escapeHtml(platform.view || '')}</small>
              <h3>${escapeHtml(platform.name || '')}</h3>
              ${(platform.traces || []).slice(0, 2).map(trace => `<p>${escapeHtml(trace)}</p>`).join('') || '<p>这次没有留下足够痕迹。</p>'}
            </article>`).join('')}
        </div>
      </details>

      <footer class="footer">行为是真实的。解释只是概率。</footer>
    </main>`

  setupReveal()
}

function setupReveal() {
  const items = [...app.querySelectorAll('.reveal-item')]
  if (!items.length) return
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    })
  }, { threshold: .12 })
  items.forEach(item => observer.observe(item))
}

function render() {
  if (state.screen === 'home') renderHome()
  else if (state.screen === 'observe') renderObserve()
  else if (state.screen === 'reveal') renderReveal()
  else renderResult()
}

async function chooseAnswer(index, button) {
  if (button?.classList.contains('is-chosen')) return
  button?.classList.add('is-chosen')
  await sleep(220)

  const question = QUESTIONS[state.index]
  state.answers[question.id] = index

  if (state.index === 2 && !state.previewShown) {
    state.previewShown = true
    state.screen = 'reveal'
    render()
    return
  }

  if (state.index >= QUESTIONS.length - 1) {
    state.screen = 'result'
    render()
    window.scrollTo({ top: 0 })
    return
  }

  state.index += 1
  render()
}

app.addEventListener('click', event => {
  const answer = event.target.closest('[data-answer]')
  if (answer) {
    chooseAnswer(Number(answer.dataset.answer), answer)
    return
  }

  const feedbackButton = event.target.closest('[data-feedback-value]')
  if (feedbackButton) {
    const group = feedbackButton.closest('[data-feedback]')
    if (!group) return
    state.feedback[group.dataset.feedback] = feedbackButton.dataset.feedbackValue
    renderResult()
    return
  }

  const action = event.target.closest('[data-action]')?.dataset.action
  if (!action) return

  if (action === 'start') {
    state.screen = 'observe'
    state.index = 0
    state.answers = {}
    state.feedback = {}
    state.previewShown = false
    render()
  } else if (action === 'back') {
    if (state.index === 0) state.screen = 'home'
    else state.index -= 1
    render()
  } else if (action === 'continue') {
    state.screen = 'observe'
    state.index = 3
    render()
  } else if (action === 'restart') {
    state.screen = 'home'
    state.index = 0
    state.answers = {}
    state.feedback = {}
    state.previewShown = false
    window.scrollTo({ top: 0 })
    render()
  }
})

render()
