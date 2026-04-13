# How to Recreate These Medical Study Notes
> Instructions for future Claude: how to build an HTML study notes page like `Carcinogenesis_Study_Notes.html`.

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
Define all colors as variables so RAT mode can override them cleanly:

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

  /* RAT Mode dark palette */
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

## 3. Overall Page Structure

```
<body>
  .rat-banner          ← hidden by default, shown in RAT mode
  .hero                ← dark hero header with title + meta stats
  .toc-bar             ← sticky top nav with anchor links
  [.section × N]       ← one per PLO/LO topic
  .rat-toggle          ← fixed bottom-right RAT Mode button
  .lightbox            ← full-screen image overlay
  <footer>
  <script>             ← toggleRat() + lightbox logic
```

---

## 4. Component Reference

### 4.1 Hero Block
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

### 4.2 Sticky TOC Bar
Horizontal scrolling nav. LO-only links get `data-lo-only` so they disappear in RAT mode.

```html
<div class="toc-bar">
  <nav>
    <a href="#section-id">Section Name</a>             <!-- PLO section — always visible -->
    <a href="#lo-section-id" data-lo-only>LO Name</a>  <!-- LO-only — hidden in RAT mode -->
  </nav>
</div>
```

### 4.3 Section Wrapper
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
    <div class="plo-badge">PLO N</div>   <!-- red badge -->
    <div class="lo-badge">LO N</div>    <!-- blue badge -->
    <p class="section-label">Category Label</p>
    <h2 class="section-title">Full Section Title</h2>

    <p>Introductory paragraph...</p>

    <!-- Use components below as needed -->

  </div>
</div>
```

### 4.4 Callout Boxes
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

### 4.5 Compare Grid (Two-Column Cards)
Side-by-side contrast. Built-in `.gas` (orange/red) and `.brake` (blue) presets for the oncogene vs. TSG analogy. Custom gradient overrides work inline too.

```html
<div class="compare-grid">
  <div class="compare-card gas">
    <span class="card-emoji">🚗</span>
    <h4>Oncogene (Gas Pedal)</h4>
    <p>Description here.</p>
    <ul class="notes-list">
      <li>Point 1</li>
      <li>Point 2</li>
    </ul>
  </div>
  <div class="compare-card brake">
    <span class="card-emoji">🛑</span>
    <h4>TSG (Brake Line)</h4>
    <p>Description here.</p>
    <ul class="notes-list">
      <li>Point 1</li>
      <li>Point 2</li>
    </ul>
  </div>
</div>
```

For other color combos (e.g. gatekeeper vs. caretaker), override with inline `style` on `.compare-card`.

### 4.6 Numbered Step List
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

### 4.7 Notes List (Bulleted)
Replaces default `<ul>` with styled `›` bullets.

```html
<ul class="notes-list">
  <li>First point</li>
  <li>Second point with <strong>emphasis</strong></li>
</ul>
```

### 4.8 Table
Standard HTML `<table>`. `<th>` gets dark background automatically; every even row gets cream background. No extra classes needed.

```html
<table>
  <tr><th>Column A</th><th>Column B</th><th>Column C</th></tr>
  <tr><td>Data</td><td>Data</td><td>Data</td></tr>
</table>
```

### 4.9 Exam Question Block
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

### 4.10 Slide Image + Caption
Images are click-to-zoom via lightbox. Use descriptive `alt` text.

```html
<img src="path/to/slide.png" alt="Description" class="slide-img">
<p class="slide-caption">Slide N — Title of Slide</p>
```

### 4.11 Hallmarks Grid
Auto-fit card grid. Each card gets a different top-border color cycling through accents (applied via `:nth-child` in CSS — no classes needed).

```html
<div class="hallmarks-grid">
  <div class="hallmark-card">
    <div class="hallmark-num">1</div>
    <h4>Hallmark Name</h4>
    <p>Brief description of this hallmark.</p>
  </div>
  <!-- repeat up to ~10 cards -->
</div>
```

### 4.12 p53 Function Grid
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

### 4.13 Tech Card
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

---

## 5. RAT Mode System

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

### Toggle button (fixed bottom-right)
```html
<div class="rat-toggle">
  <div class="rat-pill">PLOs Only Active</div>
  <button class="rat-btn off" id="ratBtn" onclick="toggleRat()">
    <span id="ratIcon">⚡</span>
    <span id="ratLabel">RAT Mode</span>
  </button>
</div>
```

### JS (paste at end of `<body>`)
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

## 6. Lightbox (Click-to-Zoom Images)

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

## 7. Section Checklist

When adding a new topic section, go through this checklist:

- [ ] `.section` has a unique `id` (for TOC anchor)
- [ ] LO-only section? Add `data-mode="lo-only"` to `.section`
- [ ] TOC link added in `.toc-bar nav` (with `data-lo-only` if LO-only)
- [ ] `data-mode="rat-only"` block present for PLO sections
- [ ] `.rat-plo-header` states the PLO verbatim
- [ ] `.rat-checklist` has 4–6 bullet checkpoints
- [ ] Section has `.plo-badge` or `.lo-badge` (or both)
- [ ] At least one callout box used per major concept
- [ ] At least one exam question (`exam-q`) per section
- [ ] RAT banner text updated to name all covered PLOs

---

## 8. Adapting for a New Lecture

1. **Update the hero** — new title, instructor, institution, relevant stats
2. **Update the RAT banner** — list the new PLO topics
3. **Add/remove sections** — one `<div class="section">` per PLO/LO
4. **Pick the right components** — use compare grids for binary contrasts, step lists for processes, hallmark grids for enumerated concepts, p53 grid for function lists
5. **Write RAT summaries first** — the `rat-plo-header` + `rat-checklist` for each PLO forces you to identify the most testable content before writing the full notes
6. **Keep the color system** — don't introduce new colors; map new content onto existing callout types

---

## 9. File Delivery

- Single `.html` file, no external dependencies except Google Fonts CDN
- Works offline if fonts are cached
- No framework, no build step — just open in a browser
- Images can be embedded as base64 `src` for true portability, or referenced as relative paths
