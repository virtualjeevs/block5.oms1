# How to Recreate These Medical Study Notes
> Instructions for future Claude: how to build an HTML study notes page like `Osteoporosis_Pharmacology_Study_Notes.html`.

---

## 1. What These Notes Are

A single-file HTML study document for a medical school lecture. It has two display modes:
- **Normal mode** — full notes covering all PLOs (Program-Level Objectives) and LOs (Learning Objectives)
- **RAT Mode** — a focused view showing only PLO content, used for Readiness Assessment Test prep

The page is self-contained: no build tools, no frameworks, just one `.html` file with embedded CSS, fonts, and JS.

---

## 2. Fonts & Color System

### Google Fonts (import in `<head>`)
```
Playfair Display — headings (700, 900 weight)
Source Serif 4 — body text (300, 400, 600; italic variants)
JetBrains Mono — labels, badges, captions, monospaced UI
```

### CSS Custom Properties (`:root`)
Define all colors as variables so RAT mode and themes can override them cleanly:

```css
:root {
  --ink: #1a1209;        /* near-black body text */
  --paper: #faf7f2;      /* warm white background */
  --cream: #f2ede4;      /* slightly darker warm bg for cards */
  --accent: #b5341a;     /* red — warnings, oncogenes, section underlines */
  --accent2: #2c5f8a;    /* blue — concepts, h3 borders */
  --gold: #c9922a;       /* gold — exam answers, labels, key callouts */
  --muted: #6b5e4e;      /* muted brown-grey — secondary text */
  --border: #d4cabb;     /* warm grey — dividers, card borders */
  --highlight: #fff3cd;  /* yellow tint — key callout background */
  --highlight2: #ddeeff; /* blue tint — hover state on table rows */
  --green-bg: #e8f5e9;   /* clinical/correct callout background */
  --red-bg: #fce8e8;     /* warning callout background */
  --blue-bg: #e3f0fb;    /* concept callout background */
  --purple-bg: #f0ebff;  /* purple callout background */

  /* RAT Mode dark palette (also reused by Night theme) */
  --rat-bg: #0f1923;
  --rat-surface: #162030;
  --rat-border: #1e3048;
  --rat-accent: #e8b84b;   /* gold — primary highlight in dark mode */
  --rat-accent2: #4aa8d8;  /* blue — secondary highlight */
  --rat-text: #dce8f0;
  --rat-muted: #9fb9cd;
  --rat-green: #3dba7a;
  --rat-red: #e05252;
}
```

---

## 3. Theme System

The page supports 5 visual themes via a `data-theme` attribute on the `<html>` element. This is separate from RAT Mode — themes persist across both normal and RAT mode.

### Available Themes

| Theme | Key Colors | `data-theme` value |
|---|---|---|
| Paper (Default) | Warm cream + dark ink | *(no attribute)* |
| Night | Dark navy + gold/blue | `night` |
| Ocean | Light blue + deep navy | `ocean` |
| Forest | Soft green + deep green | `forest` |
| Sepia | Warm tan + brown | `sepia` |

### Theme CSS Structure
Each theme overrides the `:root` CSS variables. Example:

```css
[data-theme="night"] {
  --ink: #e0e8f0;
  --paper: #0f1923;
  --cream: #162030;
  --accent: #e8b84b;
  --accent2: #4aa8d8;
  /* ... remaining variable overrides ... */
}
/* Then override specific components that need more than variable swaps: */
[data-theme="night"] .hero { background: #070e15; }
[data-theme="night"] .toc-bar { background: #070e15; }
[data-theme="night"] .drug-card { background: #162030; border-color: #1e3048; }
[data-theme="night"] .compare-card.antiresorptive { background: linear-gradient(...); }
```

### Theme Switcher HTML (in fixed bottom-right controls)
```html
<!-- THEME PANEL (popup above the button row) -->
<div class="theme-panel" id="themePanel">
  <div class="theme-panel-title">Choose Theme</div>
  <div class="theme-option active" data-theme="paper" onclick="setTheme('paper',this)">
    <div class="theme-swatch" style="background:linear-gradient(135deg,#faf7f2,#1a1209)"></div>Paper (Default)
  </div>
  <div class="theme-option" data-theme="night" onclick="setTheme('night',this)">
    <div class="theme-swatch" style="background:linear-gradient(135deg,#0f1923,#e8b84b)"></div>Night
  </div>
  <div class="theme-option" data-theme="ocean" onclick="setTheme('ocean',this)">
    <div class="theme-swatch" style="background:linear-gradient(135deg,#e8f4fd,#1565c0)"></div>Ocean
  </div>
  <div class="theme-option" data-theme="forest" onclick="setTheme('forest',this)">
    <div class="theme-swatch" style="background:linear-gradient(135deg,#f0f7f0,#2e7d32)"></div>Forest
  </div>
  <div class="theme-option" data-theme="sepia" onclick="setTheme('sepia',this)">
    <div class="theme-swatch" style="background:linear-gradient(135deg,#faf3e8,#8b4513)"></div>Sepia
  </div>
</div>
```

### Theme Switcher JS
```js
let themePanelOpen = false;
function toggleThemePanel() {
  themePanelOpen = !themePanelOpen;
  document.getElementById('themePanel').classList.toggle('open', themePanelOpen);
}
function setTheme(theme, el) {
  document.documentElement.setAttribute('data-theme', theme === 'paper' ? '' : theme);
  if (theme === 'paper') document.documentElement.removeAttribute('data-theme');
  document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  setTimeout(() => {
    themePanelOpen = false;
    document.getElementById('themePanel').classList.remove('open');
  }, 300);
}
// Close panel on outside click
document.addEventListener('click', function(e) {
  const panel = document.getElementById('themePanel');
  const btn = document.getElementById('themeBtn');
  if (themePanelOpen && !panel.contains(e.target) && !btn.contains(e.target)) {
    themePanelOpen = false;
    panel.classList.remove('open');
  }
});
```

---

## 4. Overall Page Structure

```
<body>
  .rat-banner          ← hidden by default, shown in RAT mode
  .hero                ← dark hero header with title + meta stats
  .toc-bar             ← sticky top nav with anchor links
  [.section × N]       ← one per PLO/LO topic
  .rat-toggle          ← fixed bottom-right: Quiz + Theme + RAT Mode buttons
  .theme-panel         ← popup above controls; hidden by default
  .quiz-score-bar      ← fixed top bar; visible only during active quiz
  .quiz-panel          ← fixed right-side quiz config panel
  .lightbox            ← full-screen image overlay
  <footer>
  <script>             ← toggleRat() + theme switcher + table quiz + lightbox logic
```

---

## 5. Component Reference

### 5.1 Hero Block
Dark background (`var(--ink)`), large serif title, subtitle, and a row of stat chips.

```html
<div class="hero">
  <div class="container">
    <div class="hero-tag">Instructor · Institution Name</div>
    <h1>Topic of <span>Lecture</span></h1>      <!-- span gets --accent color -->
    <p class="hero-sub">Short description. Mention RAT Mode.</p>
    <div class="hero-meta">
      <div class="hero-meta-item">
        <span class="label">STAT LABEL</span>
        <span class="value">Stat Value</span>
      </div>
      <!-- repeat hero-meta-item as needed -->
    </div>
  </div>
</div>
```

### 5.2 Sticky TOC Bar
Horizontal scrolling nav. LO-only links get `data-lo-only` so they disappear in RAT mode.

```html
<div class="toc-bar">
  <nav>
    <a href="#section-id">Section Name</a>             <!-- PLO section — always visible -->
    <a href="#lo-section-id" data-lo-only>LO Name</a>  <!-- LO-only — hidden in RAT mode -->
  </nav>
</div>
```

### 5.3 Section Wrapper
Each topic is a `.section` with a `.container` inside. LO-only sections get `data-mode="lo-only"` on the `.section` element (CSS hides these in RAT mode).

```html
<div class="section" id="section-id">           <!-- add data-mode="lo-only" for LO-only -->
  <div class="container">

    <!-- Optional: RAT-mode-only summary header (hidden in normal mode) -->
    <div data-mode="rat-only">
      <div class="rat-plo-header">
        <div class="rat-plo-tag">PLO N — RAT Objective</div>
        <h2>State the PLO verbatim here</h2>
        <p>One-sentence study tip or exam focus.</p>
      </div>
      <ul class="rat-checklist">
        <li><span class="check">✓</span><div><strong>Key term →</strong> brief definition</div></li>
      </ul>
    </div>

    <!-- Normal-mode content -->
    <div class="badge-row">
      <div class="plo-badge">PLO N</div>   <!-- red badge -->
      <div class="lo-badge">LO N</div>     <!-- blue badge; use badge-row when combining -->
    </div>
    <p class="section-label">Category Label</p>
    <h2 class="section-title">Full Section Title</h2>

    <p>Introductory paragraph...</p>

    <!-- Use components below as needed -->

  </div>
</div>
```

**Note:** When displaying multiple badges together, wrap them in a `<div class="badge-row">` (flex container with gap). For a single badge you can use it unwrapped.

### 5.4 Callout Boxes
Five flavors. All share the `.callout` base class plus a modifier:

| Modifier | Color | Use for |
|---|---|---|
| `callout-key` | Yellow | Key concept or definition |
| `callout-concept` | Blue | Mechanism or theory |
| `callout-clinical` | Green | Clinical pearl or application |
| `callout-warning` | Red | Pitfall, exception, or danger |
| `callout-purple` | Purple | Special/nuanced concept |

```html
<div class="callout callout-key">
  <div class="callout-title">🔑 Title of Callout</div>
  <p>Content goes here.</p>
</div>
```

### 5.5 Box Warning (FDA Boxed Warning)
A distinct component for US Boxed Warnings — heavier border treatment than a standard callout, with a bold label block. Do not use `.callout-warning` for Boxed Warnings; use `.box-warning` instead.

```html
<div class="box-warning">
  <span class="bw-label">☐ US Boxed Warnings</span>
  <p><strong>1. Warning text here.</strong> Explanation.<br>
  <strong>2. Second warning.</strong> Explanation.</p>
</div>
```

### 5.6 Compare Grid (Two-Column Cards)
Side-by-side contrast. Built-in `.antiresorptive` (blue gradient) and `.anabolic` (green gradient) presets for pharmacology content. Custom gradient overrides work inline too.

```html
<div class="compare-grid">
  <div class="compare-card antiresorptive">
    <span class="card-emoji">🛡️</span>
    <h4>Antiresorptive (Preservation)</h4>
    <p>Description here.</p>
    <ul class="notes-list">
      <li>Point 1</li>
    </ul>
  </div>
  <div class="compare-card anabolic">
    <span class="card-emoji">🏗️</span>
    <h4>Anabolic (Formation)</h4>
    <p>Description here.</p>
    <ul class="notes-list">
      <li>Point 1</li>
    </ul>
  </div>
</div>
```

For other color combos (e.g. agonist vs. antagonist), override with inline `style` on `.compare-card`:

```html
<div class="compare-card" style="background: var(--green-bg); border-color: #2e7d32;">
```

> **Note:** The original `.gas`/`.brake` presets (oncogene analogy) are replaced in this lecture by `.antiresorptive`/`.anabolic`. Use whichever fits the content, or use inline overrides for anything else.

### 5.7 Numbered Step List
Auto-numbered steps with red circle counters.

```html
<ol class="step-list">
  <li>
    <div>
      <strong>Step Name</strong>
      Description of this step.
    </div>
  </li>
</ol>
```

### 5.8 Notes List (Bulleted)
Replaces default `<ul>` with styled `›` bullets.

```html
<ul class="notes-list">
  <li>First point</li>
  <li>Second point with <strong>emphasis</strong></li>
</ul>
```

### 5.9 Table
Standard HTML `<table>`. `<th>` gets dark background automatically; every even row gets cream background. No extra classes needed. **Tables also participate in the Table Quiz system** — columns can be hidden and revealed interactively.

```html
<table>
  <tr><th>Column A</th><th>Column B</th><th>Column C</th></tr>
  <tr><td>Data</td><td>Data</td><td>Data</td></tr>
</table>
```

### 5.10 Exam Question Block
Dark card with a hidden/revealed answer. The red "EXAM Q" label is injected via CSS `::before`.

```html
<div class="exam-q">
  <p><strong>Q:</strong> Write the question here.</p>
  <div class="answer">
    <div class="label">Answer</div>
    <p>Write the answer here with <strong>key terms bolded</strong>.</p>
  </div>
</div>
```

### 5.11 Slide Image + Caption
Images are click-to-zoom via lightbox. Use descriptive `alt` text.

```html
<img src="path/to/slide.png" alt="Description" class="slide-img">
<p class="slide-caption">Slide N — Title of Slide</p>
```

### 5.12 Drug Grid / Drug Card
Auto-fit card grid for listing individual drugs within a class. Similar visual structure to the Hallmarks Grid, but with a blue top border and a `.generic` subtitle line for dosing/route info. Use one `.drug-card` per drug.

```html
<div class="drug-grid">
  <div class="drug-card">
    <h4>Drug Name</h4>
    <div class="generic">Route / dosing schedule</div>
    <p style="font-size:0.83rem; margin-top:6px; color:var(--muted);">Key distinguishing clinical note</p>
  </div>
  <!-- repeat per drug -->
</div>
```

A single card can span the full row with `style="grid-column: span 2;"` when there's only one drug in a class.

### 5.13 Hallmarks Grid
Auto-fit card grid. Each card gets a different top-border color cycling through accents (applied via `:nth-child` in CSS — no classes needed). Use for enumerated concepts like disease hallmarks or functional roles.

```html
<div class="hallmarks-grid">
  <div class="hallmark-card">
    <div class="hallmark-num">1</div>
    <h4>Hallmark Name</h4>
    <p>Brief description of this hallmark.</p>
  </div>
  <!-- repeat up to ~8 cards -->
</div>
```

### 5.14 p53 Function Grid
Small icon cards for listing functional roles.

```html
<div class="p53-grid">
  <div class="p53-card">
    <div class="icon">🛑</div>
    <h4>Function Name</h4>
    <p>One sentence explanation.</p>
  </div>
</div>
```

### 5.15 Tech Card
Larger card for describing a technology or test (e.g. FISH, PCR, MammaPrint).

```html
<div class="tech-card">
  <h4>Technology Name</h4>
  <p>Description. Mechanism. Clinical use.</p>
  <ul class="notes-list">
    <li>Key fact 1</li>
  </ul>
</div>
```

### 5.16 REMS Badge
Inline purple badge for calling out FDA Risk Evaluation and Mitigation Strategy (REMS) requirements. Place immediately after the drug name or within a sentence.

```html
Denosumab <span class="rems-badge">REMS</span>
```

### 5.17 Potency Bar
Visual horizontal bar for representing relative potency. Set width as a percentage of some maximum in the series.

```html
<div class="potency-bar">
  <div class="potency-fill" style="width: 70%;"></div>
  <span>Drug Name — Relative potency: 2,000×</span>
</div>
```

---

## 6. RAT Mode System

### How it works
- `body.rat-mode` is toggled by `toggleRat()` in JS
- `[data-mode="lo-only"]` elements → `display: none` in RAT mode
- `[data-mode="rat-only"]` elements → `display: none` by default, `display: block` in RAT mode
- `.toc-bar nav a[data-lo-only]` links → hidden in RAT mode
- All RAT mode color overrides live in the `body.rat-mode ...` block at the top of the CSS

### What to put in `data-mode="rat-only"` blocks
Each PLO section should have a `data-mode="rat-only"` div at the top containing:
1. A `.rat-plo-header` with the PLO stated verbatim and a study tip
2. A `.rat-checklist` summarizing the 4–6 most testable facts for that PLO

### Toggle button (fixed bottom-right — now part of a 3-button stack)
The RAT Mode button is now the bottom button in a stack that also includes Theme and Quiz. All three live inside `.rat-toggle`.

```html
<div class="rat-toggle">
  <div class="rat-pill">PLOs Only Active</div>
  <button class="quiz-btn" id="quizBtn" onclick="toggleQuizPanel()">
    <span>🧩</span>
    <span id="quizBtnLabel">Table Quiz</span>
  </button>
  <button class="theme-btn" id="themeBtn" onclick="toggleThemePanel()" title="Switch theme">
    <span>🎨</span>
    <span>Theme</span>
  </button>
  <button class="rat-btn off" id="ratBtn" onclick="toggleRat()">
    <span id="ratIcon">⚡</span>
    <span id="ratLabel">RAT Mode</span>
  </button>
</div>
```

### JS (RAT Mode — paste at end of `<body>`)
```js
let ratActive = false;
function toggleRat() {
  ratActive = !ratActive;
  const body = document.body;
  const btn = document.getElementById('ratBtn');
  const icon = document.getElementById('ratIcon');
  const label = document.getElementById('ratLabel');
  if (ratActive) {
    body.classList.add('rat-mode');
    btn.classList.replace('off', 'on');
    icon.textContent = '✕';
    label.textContent = 'Exit RAT';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    body.classList.remove('rat-mode');
    btn.classList.replace('on', 'off');
    icon.textContent = '⚡';
    label.textContent = 'RAT Mode';
  }
}
```

---

## 7. Table Quiz System

An interactive self-testing feature. Users open the quiz panel, select which columns of which tables to hide, start the quiz, then click hidden cells to reveal answers one by one. A score bar tracks progress.

### How it works
1. User clicks **Table Quiz** button → right-side `.quiz-panel` slides in
2. Panel auto-detects all `<table>` elements on the page, labeled by the nearest heading above them
3. User clicks column name buttons to select which columns to hide
4. User clicks **Start Quiz** → selected column cells become blue tiles with "?" 
5. Clicking any hidden cell reveals its original content and increments the score
6. Score bar shows `revealed / total` with a progress fill
7. Reset restores all cells and reopens the panel

### Required HTML (place before `</body>`)
```html
<!-- QUIZ SCORE BAR (fixed top, hidden until quiz starts) -->
<div class="quiz-score-bar" id="quizScoreBar">
  <span>📊 QUIZ MODE</span>
  <span class="score-num" id="quizScoreText">0 / 0</span>
  <div class="quiz-progress-track">
    <div class="quiz-progress-fill" id="quizProgressFill" style="width:0%"></div>
  </div>
  <span id="quizCompleteMsg" class="quiz-complete-msg" style="display:none">🎉 Complete!</span>
</div>

<!-- QUIZ PANEL (fixed right side) -->
<div class="quiz-panel" id="quizPanel">
  <button class="quiz-close-btn" onclick="toggleQuizPanel()" title="Close">✕</button>
  <div class="quiz-panel-title">Table Quiz</div>
  <div class="quiz-panel-sub">Select columns to test yourself</div>
  <div id="quizTableList"></div>
  <button class="quiz-start-btn" id="quizStartBtn" onclick="startQuiz()" disabled>▶ Start Quiz</button>
  <button class="quiz-reset-btn" id="quizResetBtn" onclick="resetQuiz()" style="display:none">↺ Reset All</button>
</div>
```

### No special markup needed on tables
The quiz JS automatically queries all `<table>` elements. No classes or `data-` attributes are needed on individual tables. The panel labels each table using the nearest `h2`, `h3`, or `h4` found above it in the DOM.

### JS (Table Quiz — paste alongside RAT mode and theme JS)
The quiz JS manages: `buildQuizPanel()`, `updateQuizStartBtn()`, `toggleQuizPanel()`, `startQuiz()`, `revealCell()`, `updateQuizScoreBar()`, `resetQuiz()`. Copy the full block from the source file — it is ~130 lines and manages all state internally via `quizSelections` map and `originalCellContent` Map.

---

## 8. Lightbox (Click-to-Zoom Images)

```html
<!-- Place once before </body> -->
<div class="lightbox" id="lightbox" aria-hidden="true">
  <img id="lightboxImg" alt="Zoomed slide image">
</div>
```

```js
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(img) {
  lightboxImg.src = img.src;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
}
function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}
document.querySelectorAll('.slide-img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img));
});
lightbox.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
```

---

## 9. Section Checklist

When adding a new topic section, go through this checklist:

- [ ] `.section` has a unique `id` (for TOC anchor)
- [ ] LO-only section? Add `data-mode="lo-only"` to `.section`
- [ ] TOC link added in `.toc-bar nav` (with `data-lo-only` if LO-only)
- [ ] `data-mode="rat-only"` block present for PLO sections
- [ ] `.rat-plo-header` states the PLO verbatim
- [ ] `.rat-checklist` has 4–6 bullet checkpoints
- [ ] Section has `.plo-badge` or `.lo-badge` (or both, in a `.badge-row`)
- [ ] At least one callout box used per major concept
- [ ] At least one exam question (`exam-q`) per section
- [ ] Use `.box-warning` (not `.callout-warning`) for any US Boxed Warnings
- [ ] Drug sections use `.drug-grid` + `.drug-card` to list individual agents
- [ ] Add `.rems-badge` inline for any drug with an FDA REMS program
- [ ] RAT banner text updated to name all covered PLOs

---

## 10. Adapting for a New Lecture

1. **Update the hero** — new title, instructor, institution, relevant stats
2. **Update the RAT banner** — list the new PLO topics
3. **Add/remove sections** — one `<div class="section">` per PLO/LO
4. **Pick the right components** — use drug grids for drug class breakdowns, compare grids for binary contrasts, step lists for processes, hallmark grids for enumerated concepts, p53 grid for function lists
5. **Write RAT summaries first** — the `rat-plo-header` + `rat-checklist` for each PLO forces you to identify the most testable content before writing the full notes
6. **Keep the color system** — don't introduce new colors; map new content onto existing callout types. Use `.box-warning` for regulatory/safety warnings, `.callout-warning` for clinical pitfalls.
7. **Theme system is plug-and-play** — copy the theme CSS block and JS verbatim; no edits needed per lecture

---

## 11. File Delivery

- Single `.html` file, no external dependencies except Google Fonts CDN
- Works offline if fonts are cached
- No framework, no build step — just open in a browser
- Images can be embedded as base64 `src` for true portability, or referenced as relative paths
