# How to Build This Quiz Format
> Instructions for reproducing the interactive quiz shell from `index_quiz_format_template_fixed_tools_v4.html`.

---

## 1. What This Is

A single-file HTML quiz interface with two top-level views:

- **Launch screen** — a centred card with title, metadata chips, and an "Open quiz" button
- **Quiz overlay** — a full-screen view with a sticky top bar and a two-column layout containing all controls on the left and the question card on the right

Everything is self-contained: one `.html` file, no frameworks, no build tools. The only external dependency is Google Fonts.

---

## 2. Fonts & Color System

### Google Fonts (import in `<head>`)
```
Crimson Pro — serif headings, question stems, score numbers (400–800 weight)
Nunito — body text, buttons, UI labels (400–800 weight)
IBM Plex Mono — badges, timer display, letter circles, monospaced labels (400–600 weight)
```

```html
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### CSS Custom Properties (`:root`)

```css
:root {
  /* Primary palette */
  --teal: #1A7A6D;        /* primary brand, progress bar, teal buttons */
  --teal-deep: #125E54;   /* hover/dark teal */
  --teal-light: #E3F5F2;  /* teal tinted bg, teaching point explanation */
  --teal-mid: #2BA393;    /* gradient partner for teal */
  --teal-glow: #3EC4B2;   /* bright teal, progress fill end */

  /* Dark navy — top bar, headings, nav buttons */
  --navy: #1B2A4A;
  --navy2: #12203C;

  /* Semantic accent colors */
  --coral: #E07A5F;       /* exam submit button, wrong answers */
  --coral-bg: #FEF0EB;
  --gold: #D4A843;        /* print button, highlight tool, nav dot (answered) */
  --gold-bg: #FDF6E3;
  --gold-warm: #E8C76A;   /* gradient partner for gold */
  --plum: #7B5EA7;        /* decorative radial in overlay background */
  --plum-bg: #F3EEF9;
  --sky: #4A9AE8;
  --sky-bg: #EAF2FC;

  /* Backgrounds */
  --warm: #FBF8F3;        /* page background (lightest) */
  --cream: #F6F3EC;       /* body background */
  --white: #FFFFFF;

  /* Text */
  --ink: #1E1E20;         /* primary body text */
  --ink2: #3E4555;        /* secondary text, tool buttons */
  --slate: #6B7689;       /* subdued labels, descriptions */
  --mist: #A0AAB8;        /* metadata labels, timer labels, chip text */

  /* Borders / dividers */
  --rule: #DBD5C9;
  --rule2: #E9E4DA;       /* chip borders */

  /* Semantic states */
  --green: #2D8659;       /* correct answer */
  --green-bg: #E8F5EE;
  --red: #C44040;         /* incorrect answer */
  --red-bg: #FDF0F0;
  --amber: #C07B1A;
  --amber-bg: #FEF5E6;

  /* Utility */
  --r: 14px;              /* default border-radius */
  --rs: 8px;              /* small border-radius */
  --sh: 0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
  --sh2: 0 8px 32px rgba(0,0,0,0.08);
  --sh3: 0 12px 48px rgba(0,0,0,0.10);
  --tr: 0.25s cubic-bezier(.4,0,.2,1);  /* standard easing for all transitions */
}
```

---

## 3. Overall Page Structure

```
<body>
  .launch-wrap              ← full-viewport landing screen
    .launch-card            ← centred glass card
  .qo#qo[data-fs="md"]     ← full-screen quiz overlay (display:none → .open)
    .qt-bar                 ← sticky dark top bar
    .qin                    ← two-column content grid
      .q-left               ← score panel, mode toggle, timers, tools, exam submit
      .q-right              ← question card (#qA > .qcd)
  #printReviewRoot          ← hidden until Print triggered
  <script>                  ← all JS inline at end of body
```

---

## 4. Component Reference

### 4.1 Launch Screen

A centred card over a radial-gradient background. The **Open quiz** button triggers the overlay.

```html
<div class="launch-wrap">
  <div class="launch-card">
    <h1>Quiz Title Here</h1>
    <p>Short description of this quiz.</p>
    <div class="launch-meta">
      <span class="chip">Chip label</span>
      <span class="chip">Another chip</span>
    </div>
    <button class="launch-btn" id="openDemo">Open quiz</button>
  </div>
</div>
```

Key CSS — the background is a layered radial + linear gradient:

```css
.launch-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at 15% 20%, rgba(62,196,178,.16), transparent 28%),
    radial-gradient(circle at 82% 20%, rgba(123,94,167,.12), transparent 30%),
    linear-gradient(180deg, var(--warm) 0%, var(--cream) 100%);
}
.launch-card {
  max-width: 760px;
  background: rgba(255,255,255,.8);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  border: 1px solid rgba(18,32,60,.08);
  box-shadow: 0 24px 80px rgba(18,32,60,.12);
  padding: 32px;
}
.chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--white);
  border: 1px solid var(--rule2);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--ink2);
}
```

---

### 4.2 Quiz Overlay Shell

Full-screen fixed overlay that slides in/out with animation. Toggle with `.open` class.

```html
<div class="qo" id="qo" data-fs="md">
  <!-- .qt-bar and .qin go here -->
</div>
```

```css
.qo {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 200;
  overflow-y: auto;
  background:
    radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--teal-glow) 18%, transparent), transparent 24%),
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--plum) 16%, transparent), transparent 22%),
    linear-gradient(180deg, var(--warm) 0%, var(--cream) 100%);
}
.qo.open  { display: block; animation: fi .35s cubic-bezier(.4,0,.2,1); }
.qo.closing { display: block; pointer-events: none; animation: fo .34s cubic-bezier(.4,0,.2,1) forwards; }

@keyframes fi { from { opacity: 0; transform: scale(0.985); } to { opacity: 1; transform: none; } }
@keyframes fo { from { opacity: 1; } to { opacity: 0; } }
```

**Open/close JS:**
```js
openDemo.addEventListener('click', () => qo.classList.add('open'));

closeQuiz.addEventListener('click', () => {
  qo.classList.add('closing');
  setTimeout(() => qo.classList.remove('open', 'closing'), 320);
});
```

---

### 4.3 Top Bar (`.qt-bar`)

Sticky dark glass bar. Left: quiz title. Right: font size control + Print / Reset / Close buttons.

```html
<div class="qt-bar">
  <h2>Quiz Title</h2>
  <div class="qt-btns">
    <div class="fs-ctrl">
      <span class="fs-label">Text</span>
      <button class="fs-btn" data-fs-btn="sm">A-</button>
      <button class="fs-btn" data-fs-btn="md">A</button>
      <button class="fs-btn" data-fs-btn="lg">A+</button>
      <button class="fs-btn" data-fs-btn="xl">A++</button>
    </div>
    <button class="qt-btn print" id="printQuiz">Print</button>
    <button class="qt-btn reset" id="resetQuiz">Reset</button>
    <button class="qt-btn close" id="closeQuiz">Close</button>
  </div>
</div>
```

```css
.qt-bar {
  position: sticky; top: 0; z-index: 12;
  padding: 18px 26px;
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  color: #fff;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--navy2) 94%, transparent),
    color-mix(in srgb, var(--navy) 92%, transparent));
  border-bottom: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 28px rgba(18,32,60,.16);
}
.qt-btn.reset, .qt-btn.close {
  background: rgba(255,255,255,.07); color: rgba(255,255,255,.78);
  border: 1px solid rgba(255,255,255,.1);
}
.qt-btn.print {
  background: linear-gradient(135deg, var(--gold-warm), var(--gold));
  color: var(--navy2); font-weight: 900;
}
```

---

### 4.4 Two-Column Content Grid (`.qin`)

```css
.qin {
  max-width: 1380px;
  margin: 0 auto;
  padding: 28px 28px 84px;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 18px 24px;
  align-items: start;
}
```

Below 920px it collapses to a single column. Below 700px the top bar stacks vertically and nav buttons go full-width. See Section 11 for full breakpoint details.

---

### 4.5 Score Panel

Three stat boxes in a 3-column grid. Each `.score-box` has a `.sv` (large number) and `.sl` (label). Add `.correct` or `.incorrect` modifier to colour the number.

```html
<div class="score-panel">
  <div class="score-box">
    <div class="sv" id="svCurrent">1</div>
    <div class="sl">Current</div>
  </div>
  <div class="score-box correct">
    <div class="sv" id="svCorrect">0</div>
    <div class="sl">Correct</div>
  </div>
  <div class="score-box incorrect">
    <div class="sv" id="svIncorrect">0</div>
    <div class="sl">Incorrect</div>
  </div>
</div>
```

```css
.score-box .sv { font-family: 'Crimson Pro', serif; font-size: 36px; font-weight: 800; color: var(--navy); }
.score-box.correct .sv  { color: var(--green); }
.score-box.incorrect .sv { color: var(--red); }
/* Each box gets a subtle gradient accent bar across the top via ::before */
.score-box::before {
  content: '';
  position: absolute; left: 16px; right: 16px; top: 0; height: 4px;
  border-radius: 0 0 999px 999px;
  background: linear-gradient(90deg, rgba(26,122,109,.16), rgba(62,196,178,.5));
}
```

---

### 4.6 Mode Toggle

Two-button pill toggle — Learn Mode and Exam Mode. Active button gets a dark navy gradient.

```html
<div class="mode-toggle" id="modeToggle">
  <button class="mode-btn active" id="modeLearn">
    <span class="mode-icon">🧠</span>Learn Mode
  </button>
  <button class="mode-btn" id="modeExam">
    <span class="mode-icon">📝</span>Exam Mode
  </button>
</div>
```

```js
function setMode(mode) {
  quizMode = mode;
  modeLearn.classList.toggle('active', mode === 'learn');
  modeExam.classList.toggle('active', mode === 'exam');
  updateExamButton();
}
modeLearn.addEventListener('click', () => setMode('learn'));
modeExam.addEventListener('click', () => setMode('exam'));
```

---

### 4.7 Timer Panel

Two cards stacked vertically: a stopwatch (count up) and a countdown.

```html
<div class="timer-panel">

  <!-- Stopwatch -->
  <div class="timer-card">
    <div class="timer-lbl">Timer</div>
    <div class="timer-time" id="timerTime">00:00</div>
    <button class="tbtn" id="timerStart">▶</button>
    <button class="tbtn" id="timerPause">⏸</button>
    <button class="tbtn" id="timerReset">↺</button>
  </div>

  <!-- Countdown -->
  <div class="cd-card">
    <div class="timer-lbl">Countdown</div>
    <div class="cd-time" id="cdTime">05:00</div>
    <div class="cd-controls">
      <button class="cd-pm" id="cdMinus">−</button>
      <div class="cd-val" id="cdVal">5</div>
      <div class="cd-unit">min</div>
      <button class="cd-pm" id="cdPlus">+</button>
      <button class="cd-go" id="cdGo">Start</button>
    </div>
  </div>

</div>
```

**Stopwatch JS:**
```js
let timerInt = null;
let timerSec = 0;
function renderTimer() {
  const m = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const s = String(timerSec % 60).padStart(2, '0');
  timerTime.textContent = `${m}:${s}`;
}
document.getElementById('timerStart').addEventListener('click', () => {
  if (timerInt) return;
  timerInt = setInterval(() => { timerSec += 1; renderTimer(); }, 1000);
});
document.getElementById('timerPause').addEventListener('click', () => { clearInterval(timerInt); timerInt = null; });
document.getElementById('timerReset').addEventListener('click', () => {
  clearInterval(timerInt); timerInt = null; timerSec = 0; renderTimer();
});
```

**Countdown JS:**
```js
let cdMinutes = 5;
let cdInt = null;
let cdSec = cdMinutes * 60;
function renderCountdown() {
  const m = String(Math.floor(cdSec / 60)).padStart(2, '0');
  const s = String(cdSec % 60).padStart(2, '0');
  cdTime.textContent = `${m}:${s}`;
}
document.getElementById('cdMinus').addEventListener('click', () => {
  if (cdInt) return;
  cdMinutes = Math.max(1, cdMinutes - 1);
  cdSec = cdMinutes * 60; renderCountdown();
});
document.getElementById('cdPlus').addEventListener('click', () => {
  if (cdInt) return;
  cdMinutes = Math.min(99, cdMinutes + 1);
  cdSec = cdMinutes * 60; renderCountdown();
});
cdGo.addEventListener('click', () => {
  if (cdInt) { clearInterval(cdInt); cdInt = null; cdGo.textContent = 'Start'; return; }
  cdGo.textContent = 'Pause';
  cdInt = setInterval(() => {
    if (cdSec <= 0) { clearInterval(cdInt); cdInt = null; cdGo.textContent = 'Start'; return; }
    cdSec -= 1; renderCountdown();
  }, 1000);
});
```

---

### 4.8 Tool Panel

Three tool buttons plus a status label. Highlight and Strikeout toggle on/off; active state is visually distinct per tool.

```html
<div class="tool-panel">
  <button class="q-tool" id="toolHighlight">Highlight tool</button>
  <button class="q-tool" id="toolStrike">Strikeout tool</button>
  <button class="q-tool" id="toolReveal">Reveal explanation</button>
</div>
<div class="tool-status" id="toolStatus">Tool mode: none</div>
```

Active tool CSS:
```css
.q-tool.active.hl-tool { background: #FFF8B8; border-color: #D3AF2B; color: #6B5C00; }
.q-tool.active.st-tool { background: var(--red-bg); border-color: rgba(196,64,64,.44); color: var(--red); }
.tool-status.active-highlight { color: #8a6a00; }
.tool-status.active-strike   { color: var(--red); }
```

JS:
```js
let toolMode = null;
function setToolMode(mode) {
  toolMode = toolMode === mode ? null : mode; // second click toggles off
  updateToolUI();
}
toolHighlight.addEventListener('click', () => setToolMode('highlight'));
toolStrike.addEventListener('click', () => setToolMode('strike'));
toolReveal.addEventListener('click', () => exBlock.classList.toggle('vis'));
```

See Section 5 for how highlight/strikeout interact with question stems and answer choices.

---

### 4.9 Exam Submit Row

Shown at the bottom of the left column. Only active in Exam Mode.

```html
<div class="exam-submit-row">
  <div class="exam-progress" id="examProgress">0 of 5 answered</div>
  <button class="exam-submit-btn" id="submitExam">Submit Exam</button>
</div>
```

```css
.exam-submit-row.exam-live { box-shadow: 0 0 0 3px rgba(224,122,95,.10), 0 14px 34px rgba(18,32,60,.08); }
.exam-submit-row.exam-done .exam-submit-btn {
  background: linear-gradient(135deg, var(--green), #3aa56f);
}
.exam-submit-btn:disabled { opacity: .45; cursor: not-allowed; }
```

---

### 4.10 Question Card (`.qcd`)

The main question container. Contains a progress bar, question body, answer choices, submit button, explanation block, and navigation bar.

```html
<div class="qcd">
  <!-- Thin progress bar at top -->
  <div class="qpg"><div class="qpf" style="width: 20%;"></div></div>

  <!-- Question body -->
  <div class="qbd">
    <div class="qnum">Question 1 of 5</div>
    <div class="qstem" id="qStem">
      <span class="stem-text">Question stem text goes here.</span>
    </div>

    <!-- Answer choices -->
    <div class="ach">
      <div class="ac" data-choice="0"><div class="cl">A</div><div class="ctx">Choice A text.</div></div>
      <div class="ac" data-choice="1"><div class="cl">B</div><div class="ctx">Choice B text.</div></div>
      <div class="ac" data-choice="2"><div class="cl">C</div><div class="ctx">Choice C text.</div></div>
      <div class="ac" data-choice="3"><div class="cl">D</div><div class="ctx">Choice D text.</div></div>
    </div>

    <!-- Submit (per-question, learn mode) -->
    <div class="submit-row">
      <button class="submit-btn" id="submitOne" disabled>Submit Answer</button>
    </div>

    <!-- Explanation block (hidden until graded) -->
    <div class="exb" id="exBlock">
      <div class="exs exc">
        <div class="exl">Correct Answer</div>
        <div class="ext">Why this answer is correct.</div>
      </div>
      <div class="exs exe">
        <div class="exl">Teaching Point</div>
        <div class="ext">The key clinical or conceptual pearl.</div>
      </div>
      <div class="exs exw">
        <div class="exl">Why the Others Are Wrong</div>
        <div class="ext">
          <div class="wce"><strong>A</strong> — Explanation for A.</div>
          <div class="wce"><strong>B</strong> — Explanation for B.</div>
          <div class="wce"><strong>D</strong> — Explanation for D.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation bar -->
  <div class="qnv">
    <button class="nb" id="prevBtn">← Previous</button>
    <div class="qdots">
      <button class="qd cur"></button>
      <button class="qd asel"></button>
      <button class="qd"></button>
      <button class="qd acor"></button>
      <button class="qd ainc"></button>
    </div>
    <button class="nb pr" id="nextBtn">Next →</button>
  </div>
</div>
```

**Progress bar:** set `width` as a percentage of total questions completed. Update it with JS as questions are answered.

**Explanation section modifiers:**

| Class | Left border | Background | Use for |
|---|---|---|---|
| `.exc` | `--green` | `--green-bg` | Correct answer rationale |
| `.exe` | `--teal` | `--teal-light` | Teaching point / pearl |
| `.exw` | `--red` | `--red-bg` | Why distractors are wrong |

**Show/hide explanation:**
```js
exBlock.classList.add('vis');    // show
exBlock.classList.remove('vis'); // hide
```

---

### 4.11 Answer Choice States

Each `.ac` element has a `data-choice` attribute (0-indexed). States are applied as CSS classes:

| Class | Meaning | Visual |
|---|---|---|
| *(none)* | Unselected, interactive | Warm cream background |
| `.sel` | Selected by user | Teal border, lighter bg |
| `.cor` | Correct answer revealed | Green border + bg |
| `.inc` | Incorrect — user's wrong pick | Red border + bg |
| `.shc` | Show correct (without user picking it) | Same as `.cor` |
| `.dis` | Disabled — no further interaction | Cursor default, no hover |
| `.hl-applied` | Highlighted by tool | Yellow background, gold circle |
| `.st-applied` | Struck out by tool | Red-tinted bg, strikethrough text |

The letter circle (`.cl`) also updates its background/color to match the state.

**Grading JS:**
```js
const correctChoice = 2; // 0-indexed index of the correct answer
function gradeCurrentQuestion() {
  if (selectedChoice === null) return false;
  choiceEls.forEach(c => c.classList.add('dis'));
  choiceEls[correctChoice].classList.add('cor');
  if (selectedChoice !== String(correctChoice)) {
    const picked = choiceEls.find(c => c.dataset.choice === selectedChoice);
    if (picked) picked.classList.add('inc');
  }
  exBlock.classList.add('vis');
  return true;
}
```

---

### 4.12 Navigation Dots

One `.qd` dot per question. Click to jump between questions.

```html
<div class="qdots">
  <button class="qd cur"></button>    <!-- current question -->
  <button class="qd asel"></button>   <!-- answered, not yet graded -->
  <button class="qd"></button>        <!-- unanswered -->
  <button class="qd acor"></button>   <!-- answered correctly -->
  <button class="qd ainc"></button>   <!-- answered incorrectly -->
</div>
```

| Class | Color | Meaning |
|---|---|---|
| `.cur` | Teal | Question currently displayed |
| `.acor` | Green | Graded correct |
| `.ainc` | Red | Graded incorrect |
| `.asel` | Gold | Selected but not yet submitted |
| *(none)* | White | Not yet visited |

---

## 5. Tool System (Highlight & Strikeout)

Both tools work on two targets: the **question stem** and **individual answer choices**.

### On answer choices
Clicking a choice while a tool is active toggles the tool's class on that choice. The two tools are mutually exclusive (applying one removes the other).

```js
choiceEls.forEach(choice => {
  choice.addEventListener('click', e => {
    if (toolMode === 'highlight') {
      choice.classList.toggle('hl-applied');
      choice.classList.remove('st-applied');
      return;
    }
    if (toolMode === 'strike') {
      choice.classList.toggle('st-applied');
      choice.classList.remove('hl-applied');
      return;
    }
    // ... normal selection logic
  });
});
```

### On the question stem
The stem supports two behaviours:
- **Text selected:** wraps only the selected text in a `<span class="stem-hl">` or `<span class="stem-st">`
- **No text selected (or click without selection):** toggles the entire `.qstem` element with `.hl-applied` or `.st-applied`

```js
function applyStemMarkup(type) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  if (!qStem.contains(range.commonAncestorContainer)) return false;
  const wrapper = document.createElement('span');
  wrapper.className = type === 'highlight' ? 'stem-hl' : 'stem-st';
  try { range.surroundContents(wrapper); }
  catch (e) { const frag = range.extractContents(); wrapper.appendChild(frag); range.insertNode(wrapper); }
  sel.removeAllRanges();
  return true;
}
function toggleWholeStem(type) {
  if (type === 'highlight') {
    qStem.classList.toggle('hl-applied');
    qStem.classList.remove('st-applied');
  } else {
    qStem.classList.toggle('st-applied');
    qStem.classList.remove('hl-applied');
  }
}
qStem.addEventListener('click', e => {
  if (!toolMode) return;
  const didApply = applyStemMarkup(toolMode);
  if (!didApply) toggleWholeStem(toolMode);
  e.preventDefault();
});
```

Stem highlight/strikeout CSS:
```css
/* Inline spans (text selection) */
.qstem .stem-hl { background: #FFF1A6; border-radius: 6px; padding: 0 .12em; box-shadow: 0 0 0 1px rgba(212,168,67,.18); }
.qstem .stem-st { text-decoration: line-through; text-decoration-color: var(--red); color: #8B2C2C !important; }

/* Whole stem */
.qstem.hl-applied { background: linear-gradient(180deg, #FFF4A8, #FFF7C9) !important; box-shadow: inset 0 0 0 2px rgba(212,168,67,.34); }
.qstem.st-applied { background: linear-gradient(180deg, #FFF3F3, #FFF8F8) !important; box-shadow: inset 0 0 0 2px rgba(196,64,64,.22); }

/* Hover glow when tool is active */
.qstem.tool-hover { box-shadow: inset 0 0 0 2px rgba(26,122,109,.16); background: rgba(26,122,109,.04); }
```

**Clearing all markup on reset:**
```js
function clearStemMarkup() {
  qStem.classList.remove('hl-applied', 'st-applied', 'tool-hover');
  qStem.querySelectorAll('.stem-hl, .stem-st').forEach(span => {
    span.replaceWith(document.createTextNode(span.textContent));
  });
  qStem.normalize(); // merge adjacent text nodes
}
```

---

## 6. Quiz Modes

### Learn Mode (default)
- User selects a choice → **Submit Answer** button enables
- Clicking Submit → `gradeCurrentQuestion()` runs → correct/incorrect highlighted, explanation shown
- User can then proceed to the next question

### Exam Mode
- User answers all questions first (no immediate feedback)
- `.submit-btn` per question is hidden/disabled
- The left-column **Submit Exam** button grades everything at once when clicked
- After exam submission, `examSubmitted = true` prevents re-grading

```js
submitExamBtn.addEventListener('click', () => {
  if (quizMode !== 'exam') return;
  if (examSubmitted) return;
  if (!gradeCurrentQuestion()) return;
  examSubmitted = true;
  examProgress.textContent = 'Exam submitted';
  updateExamButton();
});
```

### Mode state management
```js
let quizMode = 'learn'; // 'learn' | 'exam'
let examSubmitted = false;

function updateExamButton() {
  const inExam = quizMode === 'exam';
  submitExamBtn.disabled = !inExam || examSubmitted || selectedChoice === null;
  examSubmitRow.classList.toggle('exam-live', inExam && !examSubmitted);
  examSubmitRow.classList.toggle('exam-done', examSubmitted);
  submitExamBtn.textContent = examSubmitted ? 'Exam Submitted' : 'Submit Exam';
}
```

---

## 7. Font Size System

Font size is controlled by a `data-fs` attribute on the `#qo` element, set by the A- / A / A+ / A++ buttons in the top bar.

**HTML buttons:**
```html
<div class="fs-ctrl">
  <span class="fs-label">Text</span>
  <button class="fs-btn" data-fs-btn="sm">A-</button>
  <button class="fs-btn" data-fs-btn="md">A</button>
  <button class="fs-btn" data-fs-btn="lg">A+</button>
  <button class="fs-btn" data-fs-btn="xl">A++</button>
</div>
```

**CSS (attribute selectors on `#qo`):**
```css
#qo[data-fs="sm"] .ctx { font-size: 13px; }
#qo[data-fs="md"] .ctx { font-size: 16px; }
#qo[data-fs="lg"] .ctx { font-size: 19px; }
#qo[data-fs="xl"] .ctx { font-size: 22px; }
```

**JS:**
```js
document.querySelectorAll('[data-fs-btn]').forEach(btn => {
  btn.addEventListener('click', () => {
    qo.dataset.fs = btn.dataset.fsBtn;
  });
});
```

Only `.ctx` (answer choice text) is resized — the question stem, explanation, and UI labels are unaffected. Extend the selectors to `.qstem` or `.ext` if broader resizing is needed.

---

## 8. Print Review System

The Print button generates a print-friendly version of the current question and its result, hides the quiz UI, and calls `window.print()`.

### How it works
1. `buildPrintReviewMarkup()` generates HTML from current question state (stem text, choices, correct answer, teaching point, wrong-choice explanations)
2. The markup is injected into `#printReviewRoot`
3. `body.print-review-active` class is added → CSS hides `.launch-wrap` and `.qo`, shows `#printReviewRoot`
4. `window.print()` fires 50ms later
5. `afterprint` event removes `print-review-active` class, restoring the quiz UI

**Required HTML (place before `</body>`):**
```html
<div id="printReviewRoot" aria-hidden="true"></div>
```

**Required CSS:**
```css
#printReviewRoot { display: none; }
body.print-review-active .launch-wrap,
body.print-review-active .qo { display: none !important; }
body.print-review-active #printReviewRoot { display: block; padding: 32px; background: #fff; }

/* Print-specific layout classes */
.print-shell { max-width: 980px; margin: 0 auto; font-family: 'Nunito', sans-serif; }
.print-card { break-inside: avoid; border: 1px solid #ddd; border-radius: 16px; padding: 20px; margin-bottom: 18px; }
.print-choice.correct { border-color: #2D8659; background: #E8F5EE; }
.print-choice.incorrect { border-color: #C44040; background: #FDF0F0; }
.print-explainer.correct-box { background: #E8F5EE; border-left: 4px solid #2D8659; }
.print-explainer.teach-box   { background: #E3F5F2; border-left: 4px solid #1A7A6D; }
.print-explainer.wrong-box   { background: #FDF0F0; border-left: 4px solid #C44040; }

@media print {
  body.print-review-active .launch-wrap,
  body.print-review-active .qo { display: none !important; }
  body.print-review-active #printReviewRoot { display: block !important; padding: 0; }
}
```

**JS skeleton:**
```js
function buildPrintReviewMarkup() {
  const stemText = qStem.textContent.trim();
  // ... build HTML string from choiceEls, exBlock content
  return `<div class="print-shell">...</div>`;
}

function printQuizReview() {
  document.getElementById('printReviewRoot').innerHTML = buildPrintReviewMarkup();
  document.body.classList.add('print-review-active');
  setTimeout(() => window.print(), 50);
}

window.addEventListener('afterprint', () => {
  document.body.classList.remove('print-review-active');
});

printQuizBtn.addEventListener('click', printQuizReview);
```

> When building `buildPrintReviewMarkup()`, always run user-visible text through `escapeHTML()` before inserting it into the HTML string to prevent injection if your question data contains `<`, `>`, or `&`.

```js
function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```

---

## 9. Animations

All animated elements use `cubic-bezier(.4,0,.2,1)` — Google's Material "standard" easing.

| Animation | Keyframe | Used on |
|---|---|---|
| `fi` | opacity 0→1, scale .985→1 | Overlay open, explanation show |
| `fo` | opacity 1→0 | Overlay close |
| `slideUp` | opacity 0→1, translateY 12px→0 | Score panel, mode toggle, tool panel |
| `cardIn` | opacity 0→1, translateY 16px→0, scale .99→1 | Question card |
| `qBarOut` | opacity 1→0, translateY 0→-12px | Top bar on close |
| `qSheetOut` | opacity+scale+blur out | Content grid on close |

Staggered `animation-delay` on left-column panels creates a cascade effect:
```css
.score-panel { animation: slideUp .4s cubic-bezier(.4,0,.2,1) both; }
.mode-toggle { animation: slideUp .4s .04s cubic-bezier(.4,0,.2,1) both; }
.timer-panel { animation: slideUp .4s .08s cubic-bezier(.4,0,.2,1) both; }
.tool-panel  { animation: slideUp .4s .14s cubic-bezier(.4,0,.2,1) both; }
```

The closing animation runs the top bar and content grid out independently via `.qo.closing` sub-selectors, giving a layered exit feel.

---

## 10. Responsive Breakpoints

**≤ 920px:** Single-column layout; timer panel goes 2-column; tool panel goes 3-column.
```css
@media (max-width: 920px) {
  .qin { grid-template-columns: 1fr; padding: 22px 18px 72px; gap: 16px; }
  .timer-panel { grid-template-columns: 1fr 1fr; }
  .tool-panel  { grid-template-columns: 1fr 1fr 1fr; }
}
```

**≤ 700px:** Top bar stacks vertically; nav buttons go full width; stem/choice text shrinks slightly.
```css
@media (max-width: 700px) {
  .qt-bar { flex-direction: column; align-items: flex-start; }
  .qin { padding: 18px 14px 64px; }
  .timer-panel, .tool-panel { grid-template-columns: 1fr; }
  .qnv { flex-direction: column; align-items: stretch; }
  .qdots { order: 3; }
  .nb { width: 100%; }
  .qstem { font-size: 24px; }
}
```

---

## 11. Adapting for Real Quiz Content

When converting the template from placeholder content to a real multi-question quiz:

1. **Define question data** as a JS array of objects:
```js
const questions = [
  {
    stem: "A 34-year-old woman presents with...",
    choices: ["Option A", "Option B", "Option C", "Option D"],
    correct: 2, // 0-indexed
    explanation: { correct: "...", teaching: "...", wrongs: ["A — ...", "B — ...", "D — ..."] }
  },
  // ...
];
```

2. **Replace `renderQuestion(index)`** to populate `.qnum`, `#qStem`, `.ach`, `.exb` from the question data object

3. **Update nav dots** — generate one `.qd` per question, update classes as the user progresses

4. **Update the progress bar** — `qpf.style.width = ((index + 1) / total * 100) + '%'`

5. **Update score counters** — track `correct` and `incorrect` counts across all questions, update `#svCorrect`, `#svIncorrect`, `#svCurrent`

6. **Wire Prev/Next buttons** — `prevBtn` decrements index, `nextBtn` increments (disabled on first/last)

7. **Launch screen** — update chips to reflect real question count, topic, and mode

8. **Print review** — `buildPrintReviewMarkup()` should loop over all answered questions, not just the current one

9. **Change the page `<title>`** and the top bar `<h2>` to the quiz topic name

10. **Swap print header title** — update "Quiz Template Answer Review" in `buildPrintReviewMarkup()` to your quiz name
