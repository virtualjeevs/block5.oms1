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

  /* Hero-specific vars (override per-theme for correct contrast) */
  --hero-heading: #f5ede0;
  --hero-sub: #c9bcad;
  --hero-meta-bg: rgba(255,255,255,0.07);
  --hero-meta-border: rgba(255,255,255,0.12);
  --hero-meta-label: #8a7a6a;
  --hero-meta-value: #f0e0c8;

  /* Floating UI (font control, controls bar) */
  --floating-ui-bg: #3a3030;
  --floating-ui-fg: #f5ede0;
  --floating-ui-shadow: 0 3px 12px rgba(0,0,0,0.2);

  /* Table quiz cell overlay */
  --quiz-overlay: rgba(44,111,173,0.5);
  --quiz-overlay-hover: rgba(44,111,173,0.78);

  /* Semantic RAT mode aliases — use these in component RAT-mode overrides */
  --rat-mode-bg: #0f1923;
  --rat-mode-surface: #162030;
  --rat-mode-surface-alt: #0f1923;
  --rat-mode-border: #1e3048;
  --rat-mode-text: #dce8f0;
  --rat-mode-text-soft: #c8d8e8;
  --rat-mode-muted: #9fb9cd;
  --rat-mode-accent: #e8b84b;
  --rat-mode-accent2: #4aa8d8;
  --rat-mode-success: #3dba7a;
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
Each theme overrides **all** `:root` CSS variables — not just the core palette, but also the hero, floating-ui, quiz-overlay, and rat-mode semantic aliases. Example (Night theme, abbreviated):

```css
[data-theme="night"] {
  --ink: #e0e8f0;
  --paper: #0f1923;
  --cream: #162030;
  --accent: #e8b84b;
  --accent2: #4aa8d8;
  /* ... remaining base variables ... */

  /* Hero vars */
  --hero-heading: #f4f9ff;
  --hero-sub: #b8cad8;
  --hero-meta-bg: rgba(255,255,255,0.08);
  --hero-meta-border: rgba(255,255,255,0.12);
  --hero-meta-label: #8fa4b8;
  --hero-meta-value: #f4f9ff;

  /* Floating UI */
  --floating-ui-bg: #070e15;
  --floating-ui-fg: #f4f9ff;
  --floating-ui-shadow: 0 3px 12px rgba(0,0,0,0.36);

  /* Quiz overlay */
  --quiz-overlay: rgba(74,168,216,0.42);
  --quiz-overlay-hover: rgba(74,168,216,0.62);

  /* RAT mode semantic aliases */
  --rat-mode-bg: #08111a;
  --rat-mode-surface: #101b27;
  --rat-mode-surface-alt: #0b1520;
  --rat-mode-border: #223247;
  --rat-mode-text: #e0e8f0;
  --rat-mode-text-soft: #c7d6e3;
  --rat-mode-muted: #94abc0;
  --rat-mode-accent: #e8b84b;
  --rat-mode-accent2: #4aa8d8;
  --rat-mode-success: #57c98c;
}
/* Then override specific components that need more than variable swaps: */
[data-theme="night"] .hero { background: #070e15; }
[data-theme="night"] .toc-bar { background: #070e15; border-color: #1e3048; }
[data-theme="night"] .drug-card, [data-theme="night"] .hallmark-card,
[data-theme="night"] .p53-card, [data-theme="night"] .tech-card { background: #162030; border-color: #1e3048; }
```

> **Rule:** Every theme must override all four variable groups: base palette, hero vars, floating-ui vars, and rat-mode aliases. Copy the full block from a reference file rather than writing it from scratch — it's easy to miss a variable.

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
const STORAGE_THEME_KEY = 'lecture-theme'; // use a unique key per lecture file

let themePanelOpen = false;
function toggleThemePanel() {
  themePanelOpen = !themePanelOpen;
  document.getElementById('themePanel').classList.toggle('open', themePanelOpen);
}
function syncThemeOptions(theme) {
  document.querySelectorAll('.theme-option').forEach(function(option) {
    option.classList.toggle('active', option.dataset.theme === theme);
  });
}
function setTheme(theme, el, skipStorage) {
  if (theme === 'paper') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  syncThemeOptions(theme);
  if (!skipStorage) localStorage.setItem(STORAGE_THEME_KEY, theme);
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

> **Upgrade from older version:** `setTheme()` now accepts a third `skipStorage` parameter and delegates active-class sync to `syncThemeOptions()`. The old approach of querying `.theme-option` inside `setTheme()` is replaced by this helper.

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
Images use `.slide-img` and are automatically wired to the click-to-zoom lightbox by the JS at the bottom of the file. Always add a `.slide-caption` below.

```html
<img src="path/to/slide.png" alt="Description of image content" class="slide-img">
<p class="slide-caption">Slide N — Title of Slide</p>
```

#### Option A — Relative path (simplest, but file must travel with the HTML)
Point `src` at a file next to (or in a subfolder of) the HTML file. The page will only display correctly if the image file is present in the same relative location.

```html
<img src="slides/slide-04-cell-cycle.png" alt="Cell cycle diagram" class="slide-img">
<p class="slide-caption">Slide 4 — Cell Cycle Overview</p>
```

This is fine while working locally, but **breaks if you send the HTML file without the images folder**.

#### Option B — Base64 inline (self-contained, recommended for sharing)
Embed the image data directly in the `src` attribute. The file becomes larger but is completely portable — one file, no dependencies.

**How to get the base64 string:**

*In a terminal (macOS/Linux):*
```bash
base64 -i slide-04.png | tr -d '\n'
```

*In Python (any OS):*
```python
import base64
with open("slide-04.png", "rb") as f:
    print(base64.b64encode(f.read()).decode())
```

*In a browser console (if you already have the file open):*
```js
// Paste this into DevTools console after dragging the image into a tab
const img = document.querySelector('img');
const canvas = document.createElement('canvas');
canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
canvas.getContext('2d').drawImage(img, 0, 0);
console.log(canvas.toDataURL('image/png'));
```

**Then paste the result into the HTML:**
```html
<img
  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  alt="Cell cycle diagram"
  class="slide-img"
>
<p class="slide-caption">Slide 4 — Cell Cycle Overview</p>
```

Use `image/jpeg` for JPEGs and `image/webp` for WebP files:
```html
src="data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
src="data:image/webp;base64,UklGRlAA..."
```

#### Option C — Paste a screenshot directly (Claude workflow)
If you're asking Claude to build the notes file, you can paste or upload screenshots of lecture slides directly in the chat. Claude will embed them as base64 automatically and place them with the correct `.slide-img` + `.slide-caption` markup.

#### Sizing and layout notes
- `.slide-img` is `width: 100%` by default — it fills the content column (max 860px)
- To display two images side by side, wrap them in a flex container:

```html
<div style="display:flex; gap:16px; margin:16px 0;">
  <div style="flex:1;">
    <img src="..." alt="..." class="slide-img" style="margin:0;">
    <p class="slide-caption">Slide 3A</p>
  </div>
  <div style="flex:1;">
    <img src="..." alt="..." class="slide-img" style="margin:0;">
    <p class="slide-caption">Slide 3B</p>
  </div>
</div>
```

- To constrain a small image to half-width, use `style="width:50%;"` on the `<img>`
- The lightbox always shows the image at its natural size (up to 92vw / 88vh), so high-resolution source images zoom in nicely

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

### 5.17 Font Size Control
A floating A+/A− control rendered as part of the `.rat-toggle` stack. Adjusts `document.body.style.fontSize` between 12px and 24px. No external state — resets to 16px on page reload.

```html
<!-- Inside .rat-toggle, above the theme-btn -->
<div class="font-btn-row">
  <span class="font-label">Text</span>
  <button class="font-btn" onclick="changeFontSize(1)" title="Increase font size">A+</button>
  <span class="font-sep">|</span>
  <button class="font-btn" onclick="changeFontSize(-1)" title="Decrease font size">A−</button>
</div>
```

```css
.font-btn-row { display: flex; align-items: center; background: var(--floating-ui-bg);
  color: var(--floating-ui-fg); padding: 7px 10px; border-radius: 30px;
  box-shadow: var(--floating-ui-shadow); font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem; letter-spacing: 0.1em; gap: 2px; }
.font-btn { background: none; border: none; cursor: pointer; color: var(--floating-ui-fg);
  font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 1rem;
  padding: 2px 8px; border-radius: 6px; transition: background 0.15s; line-height: 1; }
.font-btn:hover { background: rgba(255,255,255,0.18); }
.font-sep { color: rgba(255,255,255,0.2); padding: 0 3px; }
.font-label { font-size: 0.58rem; opacity: 0.7; padding: 0 5px;
  text-transform: uppercase; letter-spacing: 0.1em; }
```

```js
let currentFontSize = 16;
function changeFontSize(delta) {
  currentFontSize = Math.min(24, Math.max(12, currentFontSize + delta));
  document.body.style.fontSize = currentFontSize + 'px';
}
```

Add RAT mode override in the `body.rat-mode` block:
```css
body.rat-mode .font-btn-row { background: var(--rat-mode-surface-alt) !important; color: var(--rat-mode-text) !important; }
body.rat-mode .font-btn { color: var(--rat-mode-text) !important; }
body.rat-mode .font-sep, body.rat-mode .font-label { color: var(--rat-mode-muted) !important; }
```

### 5.18 Inline Text Elements (Domain-Specific)
Two inline elements for genetics/genomics content. Can be adapted for other domains.

```html
<!-- SNP identifier chip — monospaced, cream background -->
<span class="snp-code">rs2736098</span>

<!-- Gene name — blue, monospaced, slightly smaller -->
<span class="gene-tag">TP53</span>
```

```css
.snp-code { font-family: 'JetBrains Mono', monospace; background: var(--cream);
  border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 0.82rem; }
.gene-tag { font-family: 'JetBrains Mono', monospace; color: var(--accent2);
  font-size: 0.88rem; font-weight: 500; }
```

> These are deliberately un-themed (they inherit well from variable-based colors), so no per-theme overrides are needed. Adapt names for other domains — e.g. `.drug-code`, `.pathway-tag`.



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

### Toggle button (fixed bottom-right — a stacked control bar)
The RAT Mode button sits at the bottom of a fixed stack that also includes a Font Size control and Theme switcher. All live inside `.rat-toggle`.

```html
<div class="rat-toggle">
  <div class="rat-pill">PLOs Only Active</div>
  <div class="font-btn-row">
    <span class="font-label">Text</span>
    <button class="font-btn" onclick="changeFontSize(1)" title="Increase font size">A+</button>
    <span class="font-sep">|</span>
    <button class="font-btn" onclick="changeFontSize(-1)" title="Decrease font size">A−</button>
  </div>
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

> **Note:** The separate Table Quiz button has been removed from this stack. Quiz controls are now injected inline above each table by JavaScript — see Section 7.

### JS (RAT Mode — paste at end of `<body>`)
```js
const STORAGE_RAT_KEY = 'lecture-rat-mode'; // use a unique key per lecture file

let ratActive = false;
function applyRatState(nextState) {
  ratActive = !!nextState;
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
  localStorage.setItem(STORAGE_RAT_KEY, ratActive ? '1' : '0');
}
function toggleRat() {
  applyRatState(!ratActive);
}
```

### Persistence: restoring state on load
Call `initVisualState()` on `DOMContentLoaded` to restore both theme and RAT mode from `localStorage`:

```js
function initVisualState() {
  var savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'paper';
  setTheme(savedTheme, null, true); // skipStorage=true avoids re-writing same value
  applyRatState(localStorage.getItem(STORAGE_RAT_KEY) === '1');
}
document.addEventListener('DOMContentLoaded', function() {
  initVisualState();
  initTableQuiz(); // see Section 7
});
```

> **Storage key naming:** Use a unique key per lecture file (e.g. `'harrison-cancer-genomics-theme'`) so that different lecture files don't overwrite each other's saved state.

---

## 7. Table Quiz System

An interactive self-testing feature. A quiz toolbar (`.tq-bar`) is **automatically injected above every `<table>` by JavaScript** — no manual HTML needed. Users select columns to hide, start the quiz, then click blurred cells to reveal answers one by one.

### How it works (per-table inline approach)
1. On `DOMContentLoaded`, `initTableQuiz()` loops over all `<table>` elements
2. For each table it injects a `.tq-bar` directly above the table in the DOM
3. User clicks **🧩 Quiz this table** → column name buttons appear
4. User selects which columns to hide → **▶ Start** button enables
5. On Start: selected column cells are wrapped in `.tq-cell-content` (content blurred) and the cell gets `.quiz-hidden-cell` class + a "tap to reveal" overlay
6. Clicking a hidden cell removes the class and restores the original HTML
7. A live `N / total revealed` score shows in the toolbar; displays 🎉 on completion
8. **↺ Reset** restores all cells and returns the toolbar to its initial state

### Required CSS
```css
/* Inline quiz toolbar — injected above each table */
.tq-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin-bottom: 6px; padding: 8px 12px; background: var(--cream);
  border: 1px solid var(--border); border-radius: 8px; }
.tq-toggle { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.1em; text-transform: uppercase; background: var(--accent2);
  color: #fff; border: none; border-radius: 20px; padding: 5px 12px; cursor: pointer; }
.tq-toggle.active { background: var(--accent); }
.tq-cols { display: flex; flex-wrap: wrap; gap: 5px; flex: 1; }
.tq-col-btn { font-size: 0.72rem; padding: 3px 9px; border: 1px solid var(--border);
  border-radius: 12px; background: var(--paper); cursor: pointer;
  font-family: 'JetBrains Mono', monospace; transition: all 0.15s; }
.tq-col-btn.sel { background: var(--accent2); color: #fff; border-color: var(--accent2); }
.tq-start { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  background: #2e7d32; color: #fff; border: none; border-radius: 20px; padding: 5px 12px; cursor: pointer; }
.tq-start:disabled { opacity: 0.35; cursor: not-allowed; }
.tq-reset { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  background: #b5341a; color: #fff; border: none; border-radius: 20px; padding: 5px 13px; cursor: pointer; }
.tq-score { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--muted); }
.tq-score.done { color: #2e7d32; font-weight: 700; }

/* Hidden cell: content blurred, overlay shows "tap to reveal" */
.quiz-hidden-cell { position: relative !important; cursor: pointer !important; }
.quiz-hidden-cell .tq-cell-content { filter: blur(5px) !important; user-select: none !important;
  pointer-events: none !important; opacity: 0.4 !important; }
.quiz-hidden-cell::after { content: 'tap to reveal' !important; position: absolute !important;
  inset: 0 !important; display: flex !important; align-items: center !important;
  justify-content: center !important; background: var(--quiz-overlay) !important;
  color: #fff !important; font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.6rem !important; font-weight: 700 !important; letter-spacing: 0.12em !important;
  text-transform: uppercase !important; border-radius: 4px !important; }
.quiz-hidden-cell:hover::after { background: var(--quiz-overlay-hover) !important; }
```

Also add RAT mode overrides for the quiz toolbar in the `body.rat-mode ...` block:
```css
body.rat-mode .tq-bar { background: var(--rat-mode-surface) !important; border-color: var(--rat-mode-border) !important; }
body.rat-mode .tq-score { color: var(--rat-mode-muted) !important; }
body.rat-mode .tq-col-btn { background: var(--rat-mode-bg) !important; border-color: var(--rat-mode-border) !important; color: var(--rat-mode-text) !important; }
body.rat-mode .tq-col-btn.sel { background: var(--rat-mode-accent2) !important; border-color: var(--rat-mode-accent2) !important; color: #08111a !important; }
```

### No special markup needed on tables
The quiz JS automatically queries all `<table>` elements. No classes or `data-` attributes are required. Column labels are read from `<th>` text content.

### JS (Table Quiz — call `initTableQuiz()` from `DOMContentLoaded`)
`initTableQuiz()` is ~130 lines. It creates per-table state (selectedCols Set, hiddenCells Map, running flag, score counters) and builds the entire `.tq-bar` DOM dynamically. Copy the full function from the source file — key functions inside: `toggleBtn.onclick`, `startBtn.onclick`, `resetBtn.onclick`, `updateScore()`.

> **Architecture note:** This replaces the older global `.quiz-panel` / `.quiz-score-bar` approach. There is no longer a single quiz panel or a quiz button in the floating controls — everything is self-contained per table.

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

When setting up a new lecture file:

- [ ] `STORAGE_THEME_KEY` and `STORAGE_RAT_KEY` constants are unique to this file
- [ ] `initVisualState()` and `initTableQuiz()` both called in `DOMContentLoaded`
- [ ] All four theme variable groups overridden in each `[data-theme="..."]` block

---

## 10. Adapting for a New Lecture

1. **Update the hero** — new title, instructor, institution, relevant stats
2. **Update the RAT banner** — list the new PLO topics
3. **Add/remove sections** — one `<div class="section">` per PLO/LO
4. **Pick the right components** — use drug grids for drug class breakdowns, compare grids for binary contrasts, step lists for processes, hallmark grids for enumerated concepts, p53 grid for function lists
5. **Write RAT summaries first** — the `rat-plo-header` + `rat-checklist` for each PLO forces you to identify the most testable content before writing the full notes
6. **Keep the color system** — don't introduce new colors; map new content onto existing callout types. Use `.box-warning` for regulatory/safety warnings, `.callout-warning` for clinical pitfalls.
7. **Theme system is plug-and-play** — copy the full theme CSS block (all four variable groups) and JS verbatim; no edits needed per lecture
8. **Change the localStorage keys** — update `STORAGE_THEME_KEY` and `STORAGE_RAT_KEY` constants to a unique per-lecture string so different files don't share state
9. **Table Quiz is automatic** — `initTableQuiz()` requires no per-table setup; just include it and call it from `DOMContentLoaded`
10. **Font size control** — copy the `.font-btn-row` HTML and `changeFontSize()` JS verbatim; no edits needed

---

## 11. File Delivery

- Single `.html` file, no external dependencies except Google Fonts CDN
- Works offline if fonts are cached
- No framework, no build step — just open in a browser
- **Images:** use base64-embedded `src` for true portability (one file, zero broken images); use relative paths only if the image folder will always travel with the HTML — see Section 5.11 for the full workflow
