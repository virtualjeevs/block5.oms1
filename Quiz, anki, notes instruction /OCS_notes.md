# How to Build Self-Contained HTML Study Notes from a Webarchive + Transcripts
*A future-me instruction manual — updated after building LO 42F–H (Meninges, Cranial Fossae & Brain)*

---

## What This Produces

A single `.html` file (~2–4 MB) that:
- Is **fully self-contained** — all images base64-embedded, no external asset folder needed
- Has a **scroll-based anchor nav** (one link per LO, active link highlights as you scroll)
- Uses the **established design system** (cream/warm palette, Crimson Pro / Nunito / IBM Plex Mono)
- Includes a **lightbox figure viewer** with keyboard navigation and image counter
- Has **scroll-reveal animations**, callout boxes, comparison tables, sign grids, and flow rows
- Has a **quiz mode engine** that automatically makes any `.comp-table` interactively testable

---

## Inputs Required

| Input | Format | What it's used for |
|---|---|---|
| Lecture transcripts | `.txt` (plain text) | Content, clinical presentations, Dr. Willard quotes |
| Webarchive | `.webarchive` (Safari) | Figures from textbook (Grant's Dissector, Moore's COA, etc.) |
| LO list | (from user) | Determines section structure and content scope |

---

## Step 1 — Parse the Webarchive for Figures

Safari `.webarchive` files are Apple binary plist format. Use `biplist` to read them.

```bash
pip install biplist --break-system-packages -q
```

```python
import biplist, re, os, base64

archive_path = "/mnt/user-data/uploads/YourFile.webarchive"
data = biplist.readPlist(archive_path)

# Three top-level keys:
# - WebMainResource   (the HTML page)
# - WebSubresources   (all assets: JS, CSS, images)
# - WebSubframeArchives

main_html = data['WebMainResource']['WebResourceData'].decode('utf-8', errors='replace')
resources  = data['WebSubresources']
```

### 1a — Build a URL → bytes map for all JPEG resources

```python
url_to_data = {}
for r in resources:
    url  = r.get('WebResourceURL', '')
    mime = r.get('WebResourceMIMEType', '')
    raw  = r.get('WebResourceData', b'')
    if mime.startswith('image/jpeg'):
        url_to_data[url] = raw

print(f"Total JPEG resources: {len(url_to_data)}")
```

### 1b — Get figure captions from `alt` attributes

The alt text on `<img>` tags is the cleanest source of captions:

```python
captions = {}
for fig_n_int in range(47, 60):          # adjust range for your figures
    pattern = f'ch007-online_f{fig_n_int:03d}.jpeg'   # adjust chapter/pattern
    idx = main_html.find(pattern)
    if idx >= 0:
        snippet = main_html[max(0, idx-500):idx+100]
        alt_match = re.search(r'alt=["\']([^"\']+)["\']', snippet)
        if alt_match:
            captions[fig_n_int] = alt_match.group(1)
```

### 1c — Extract figure images by matching URLs from the HTML

The HTML contains `<img src="https://...">` tags inside `data-id="...fig054..."` divs.
Match those URLs against the `url_to_data` dict built in 1a:

```python
os.makedirs('/home/claude/notes/assets', exist_ok=True)

for fig_n_int in range(47, 60):
    fig_n = f"{fig_n_int:03d}"
    idx   = main_html.find(f'data-id="...-fig{fig_n}"')   # adjust prefix
    if idx < 0:
        continue

    snippet = main_html[idx:idx+2000]
    url_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', snippet)
    if not url_match:
        continue

    full_url = url_match.group(1).replace('&amp;', '&')
    if full_url in url_to_data:
        with open(f'/home/claude/notes/assets/fig_{fig_n_int}.jpg', 'wb') as f:
            f.write(url_to_data[full_url])
        print(f"fig {fig_n_int}: {len(url_to_data[full_url])} bytes")
```

> **Gotcha:** Always use `.replace('&amp;', '&')` when pulling URLs from HTML —
> the HTML-encoded ampersands won't match the raw dict keys.

### 1d — Verify all images are unique

```python
sizes = {n: os.path.getsize(f'/home/claude/notes/assets/fig_{n}.jpg') for n in range(47, 60)}
assert len(set(sizes.values())) == len(sizes), "Duplicate images — check URL matching!"
```

---

## Step 2 — Read and Digest the Transcripts

```bash
cat /mnt/user-data/uploads/CN-III-transcript.txt
cat /mnt/user-data/uploads/CN-IV_mp4-transcript.txt
cat /mnt/user-data/uploads/CN-VI-transcript.txt
```

The transcripts are raw speech-to-text. Key things to extract:
- **Origin** of each nerve (nucleus, brainstem level)
- **Course** through subarachnoid space → cavernous sinus → SOF → annulus → muscle
- **Clinical signs** described by the lecturer (Dr. Willard's own words and examples)
- **Named pearls** (e.g., "idiopathic unremitting torticollis = trochlear palsy until proven otherwise")

Write the content into the HTML by paraphrasing the transcript, not quoting it verbatim.

---

## Step 3 — Base64-Encode All Images

Convert saved JPEGs to base64 strings for embedding. **Use named string keys, not integer indices** — this prevents index mismatches and lets the same figure appear in multiple sections cleanly.

The key naming convention is `{source}_{fignum}` — e.g. `"gd_36"` for Grant's Fig 7.36, `"coa_28"` for COA Fig 8.28.

```python
import base64

# Use named keys — not integers
imgs = {}
fig_key_map = {
    47: "gd_47",
    48: "gd_48",
    50: "coa_50",
    # ... map each file to its textbook key
}

for fig_n, key in fig_key_map.items():
    with open(f'/home/claude/notes/assets/fig_{fig_n}.jpg', 'rb') as f:
        imgs[key] = f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode()}"

total_kb = sum(len(v) for v in imgs.values()) / 1024
print(f"Total embedded size: {total_kb:.0f} KB ({total_kb/1024:.1f} MB)")
# Expect ~2–3 MB for 13 mid-quality JPEGs — totally fine for a local HTML file
```

---

## Step 4 — Build the HTML

Write the HTML as a Python string and inject the base64 data via string concatenation.
**Do not use an f-string for the whole HTML** — the CSS contains curly braces that will break it.
Use a raw string `r"""..."""` for the HTML body, then concatenate the JS data block separately.

### 4a — HTML skeleton structure

The nav uses **scroll-based anchor links**, not JavaScript tab switching. All sections live on one long page; the nav link becomes `.active` as you scroll into each section via `IntersectionObserver`.

```
<head>  Google Fonts import + all CSS in <style> block  </head>
<body>
  .page-header         ← sticky top bar (block, week, title)
  .lo-anchor-nav       ← sticky anchor nav (one <a href="#loXX"> per LO + gallery)
  .content-wrap
    <section id="lo42f" class="lo-section">   ← LO F content + inline figures
    <hr class="section-divider">
    <section id="lo42g" class="lo-section">   ← LO G content + inline figures
    <hr class="section-divider">
    <section id="lo42h" class="lo-section">   ← LO H content + inline figures
    <hr class="section-divider">
    <section id="gallery" class="lo-section"> ← complete figure gallery
  #lightbox              ← fixed overlay for image zoom
  <script>               ← assignImages + lightbox + scroll reveal + quiz engine + IMGS/CAPS dicts
</body>
```

### 4b — CSS design system (warm cream palette)

```css
:root {
  --cream:       #fdf6ec;   /* page background */
  --cream-mid:   #f5ead8;   /* card backgrounds, callouts */
  --cream-dk:    #ede0ca;   /* flow nodes, label pills, slightly darker fills */
  --ink:         #1f1a14;   /* primary text, header background */
  --ink-soft:    #5c5042;   /* secondary text, em */
  --ink-muted:   #8a7868;   /* captions, flow notes, muted labels */
  --coral:       #c8533a;   /* primary accent (LO badges, active nav, table first-col) */
  --teal:        #0e7c7b;   /* h3 headings, LO badge variant */
  --gold:        #b8770a;   /* mnemonics, callouts, LO badge variant */
  --violet:      #6b4fa0;   /* callout variant, LO badge variant */
  --sky:         #1878b8;   /* CN VI, callout variant */
  --green:       #2a7a3b;   /* callout variant */
  --border:      rgba(31,26,20,0.12);
  --border-mid:  rgba(31,26,20,0.18);   /* stronger borders, table headers */
  --shadow:      0 2px 16px rgba(31,26,20,0.09);
}
```

> ⚠️ Note: `--gold` is `#b8770a`, not `#c8860a` — the warmer/darker value reads better on cream.

**Fonts** (import from Google Fonts):
- `Crimson Pro` — headings, section titles, figure numbers
- `Nunito` — body text, sub-headings, lightbox captions
- `IBM Plex Mono` — badges, labels, flow nodes, table first-column, mnemonic pills

**LO badge color assignment:** each LO section gets its own badge color. First LO = `.lo-badge` (coral, default). Subsequent LOs use `.lo-badge.teal`, `.lo-badge.gold`, `.lo-badge.violet` in order.

### 4c — Key CSS components

**Sticky header + anchor nav:**
```css
.page-header {
  position: sticky; top: 0; z-index: 100;
  background: var(--ink);
  padding: 10px 28px;
  border-bottom: 3px solid var(--coral);
}
.lo-anchor-nav {
  position: sticky; top: 51px; z-index: 99;  /* 51px = actual header height */
  background: #fff;
  border-bottom: 2px solid var(--border-mid);
  display: flex; overflow-x: auto;
  scrollbar-width: none;
}
.lo-anchor-nav a {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px; font-weight: 500;
  color: var(--ink-soft);
  text-decoration: none;
  padding: 11px 20px;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;
}
.lo-anchor-nav a:hover,
.lo-anchor-nav a.active { color: var(--coral); border-bottom-color: var(--coral); }
```

> The `top: 51px` must match the actual rendered header height. Measure it after building — if the header wraps to two lines it'll be taller.

**Scroll reveal (global observer — no tab switching needed):**
```javascript
// Set up one observer at page load — it watches all .reveal elements globally
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.reveal').forEach(r => revealObs.observe(r));

// CSS:
// .reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.5s, transform 0.5s; }
// .reveal.visible { opacity: 1; transform: none; }
```

> No `triggerReveal()` function needed — because there's no tab switching. The observer handles everything as the user scrolls down the single long page.

**Active nav highlight on scroll:**
```javascript
const sections = document.querySelectorAll('.lo-section');
const navLinks = document.querySelectorAll('.lo-anchor-nav a');
const scrollObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.lo-anchor-nav a[href="#${e.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });
sections.forEach(s => scrollObs.observe(s));
```

**Lightbox (key-based, with counter):**
```javascript
// IMGS and CAPS are dicts keyed by string (e.g. "coa_28", "gd_36")
// IMG_KEYS is a separate ordered array for prev/next navigation
const IMG_KEYS = ["coa_28", "coa_29", "gd_36", /* ... all keys in order */];

let lbIdx = 0;
let lbKey = '';

function openLB(key) {
  lbKey = key;
  lbIdx = IMG_KEYS.indexOf(key);
  document.getElementById('lb-img').src = IMGS[key];
  document.getElementById('lb-cap').textContent = CAPS[key] || '';
  document.getElementById('lb-counter').textContent = (lbIdx + 1) + ' / ' + IMG_KEYS.length;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';  // lock page scroll
}

function shiftLB(dir) {
  lbIdx = (lbIdx + dir + IMG_KEYS.length) % IMG_KEYS.length;
  lbKey = IMG_KEYS[lbIdx];
  document.getElementById('lb-img').src = IMGS[lbKey];
  document.getElementById('lb-cap').textContent = CAPS[lbKey] || '';
  document.getElementById('lb-counter').textContent = (lbIdx + 1) + ' / ' + IMG_KEYS.length;
}

function closeLB(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lb-close')) return;
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'Escape') closeLB(null);
  if (e.key === 'ArrowLeft')  shiftLB(-1);
  if (e.key === 'ArrowRight') shiftLB(1);
});
```

**Assigning images to `<img>` tags on load (suffix selector):**
```javascript
// Image IDs use the pattern id="i_{key}" — e.g. id="i_coa_28"
// The suffix selector lets one key populate multiple images if the same figure
// appears in both an inline section AND the gallery tab
function assignImages() {
  Object.entries(IMGS).forEach(([key, src]) => {
    document.querySelectorAll(`[id$="_${key}"]`).forEach(el => { el.src = src; });
  });
}
window.addEventListener('load', assignImages);
```

### 4d — Injecting base64 data via Python

IMGS and CAPS are JS objects (dicts), not arrays. This is more robust — keys can be reordered, skipped, or extended without breaking anything.

```python
import json

html = r"""<!DOCTYPE html>...(all your HTML)...<script>"""

# Inject IMGS dict
html += "const IMGS = {\n"
for key, data_uri in imgs.items():
    html += f'  {json.dumps(key)}: {json.dumps(data_uri)},\n'
html += "};\n\n"

# Inject CAPS dict
caps = {
    "gd_36": "Grant's Fig 7.36 — Coronal section through the superior sagittal sinus",
    "coa_28": "COA Fig 8.28 — Meninges and their relationship to calvaria, brain, and spinal cord",
    # ...
}
html += f"const CAPS = {json.dumps(caps, indent=2)};\n\n"

# Inject ordered key list for lightbox prev/next
html += f"const IMG_KEYS = {json.dumps(list(imgs.keys()))};\n\n"

html += """
// rest of your JS (openLB, shiftLB, assignImages, etc.)
</script></body></html>"""

with open('/mnt/user-data/outputs/MyNotes.html', 'w') as f:
    f.write(html)
```

> Using `json.dumps()` for ALL Python strings going into JS auto-escapes apostrophes, Unicode, and special characters. Never interpolate strings manually.

---

## Step 5 — Validate Before Delivering

```python
# Check image count matches what was extracted
assert html.count('data:image/jpeg;base64') == len(imgs)

# Check no accidental double-embed
print(f"File size: {len(html)/1024:.0f} KB")

# Spot-check that keys appear in both IMGS and IMG_KEYS
for key in imgs:
    assert f'"{key}"' in html, f"Key {key} missing from injected JS"
```

```bash
# Node can't check .html files directly, but you can extract and check JS:
node -e "const x = 'your js snippet here'"
```

---

## Image Placement Strategy

> This is the biggest change from the original approach. **Don't dump all figures in a single gallery section.** Place them inline, immediately after the content they illustrate.

### The pattern

Each major sub-topic in a section ends with a `<div class="fig-grid reveal">` containing 2–4 directly relevant figures. The full gallery section then repeats all figures for browsing. This means:

- Figures appear **in context**, right after the text that references them
- The reader doesn't have to switch tabs or scroll to a distant gallery to see what's being described
- The lightbox still lets them cycle through all figures in order regardless of where they click from

### When to group figures

Group 2–4 thematically related figures together in one `fig-grid`. Don't interleave single figures between every paragraph — that breaks the prose flow. Place the grid at a **natural section break**: after a table, after a list, after a callout box.

```
[h3: The Three Cranial Fossae]
[comp-table: anterior / middle / posterior]
[h3: Dural Folds]
[sign-grid: falx, tentorium, incisura, diaphragma sellae]
[callout: Dr. Willard's key observation]
[fig-grid: COA 8.30, COA 8.29, GD 7.40, GD 7.41]   ← placed here, after the dural fold content

[h3: Dural Venous Sinuses]
[comp-table: sinus locations]
[callout: epidural vs subdural bleeding]
[fig-grid: COA 8.31, COA 8.32, GD 7.36, GD 7.39]   ← placed here, after the sinus content
```

### fig-grid sizing variants

```css
.fig-grid       { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }  /* default */
.fig-grid.wide  { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }  /* for big figures */
```

Use `.wide` when figures have fine detail that needs more real estate (anatomical cross-sections, labeled diagrams). Use default for overview figures, clinical photos, and dissection shots.

---

## Reusable Component Patterns

### Callout box
```html
<div class="callout callout-coral">
  <div class="callout-label">⚠️ Label</div>
  Content goes here.
</div>
<!-- Variants: callout-teal, callout-gold, callout-sky, callout-violet, callout-coral, callout-green -->
```

### Sign grid (clinical presentations)
```html
<div class="sign-grid">
  <div class="sign-item">
    <span class="sign-icon">👁️</span>
    <div class="sign-label">Eye Position</div>
    <div class="sign-text">Down and Out</div>
    <div class="sign-detail">Explanation of mechanism...</div>
  </div>
</div>
```

### Flow row (nerve course, CSF pathway, etc.)
```html
<div class="flow-row">
  <span class="flow-node">Lateral Ventricles</span>
  <span class="flow-arrow">→</span>
  <span class="flow-node">Foramina of Monro</span>
  <span class="flow-arrow">→</span>
  <span class="flow-node">3rd Ventricle</span>
  <span class="flow-note">(narrow midline slit)</span>
</div>
```

### Two-column layout (side-by-side comparisons)
```html
<div class="two-col">
  <div>
    <h4>Anterior Circulation (ICA)</h4>
    <ul>...</ul>
  </div>
  <div>
    <h4>Posterior Circulation (Vertebrobasilar)</h4>
    <ul>...</ul>
  </div>
</div>
<!-- CSS: .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          @media (max-width: 680px) { .two-col { grid-template-columns: 1fr; } } -->
```

### Inline mnemonic pill
```html
Mnemonic: <span style="font-family:'IBM Plex Mono',monospace; background:var(--cream-dk); padding:1px 6px; border-radius:3px;">O TOM CAT</span>
```

### Label pill (inline badge)
```html
<span class="label-pill">V1</span>
<!-- CSS: font-family IBM Plex Mono, cream-dk background, small padding -->
```

### Figure thumbnail (inline in section)
```html
<!-- Key points:
  - onclick passes the string KEY, not an integer index
  - id uses the pattern i_{key} — suffix selector in assignImages() fills src="" on load
  - always include fig-source to credit the textbook
  - wrap multiple thumbs in .fig-grid or .fig-grid.wide
-->
<div class="fig-grid reveal">
  <div class="fig-thumb" onclick="openLB('coa_28')">
    <img id="i_coa_28" src="" alt="Meninges and calvaria">
    <div class="fig-caption">
      <span class="fig-num">COA Fig 8.28</span>
      <span class="fig-text">Meninges and their relationship to calvaria, brain, and spinal cord</span>
      <span class="fig-source">Moore's Clinically Oriented Anatomy, 8e</span>
    </div>
  </div>
  <div class="fig-thumb" onclick="openLB('gd_36')">
    <img id="i_gd_36" src="" alt="Coronal section through superior sagittal sinus">
    <div class="fig-caption">
      <span class="fig-num">Grant's Fig 7.36</span>
      <span class="fig-text">Coronal section through the superior sagittal sinus and meninges</span>
      <span class="fig-source">Grant's Dissector, 17e</span>
    </div>
  </div>
</div>
```

### Quiz mode (automatic — no extra HTML needed)

Every `.comp-table` on the page automatically gets a quiz bar injected by `initQuizTables()`. When quiz mode is toggled on, all non-first-column cells blur and show a "Tap to reveal" mask. A progress bar tracks how many cells have been revealed.

```javascript
// Call after DOM is ready
document.addEventListener('DOMContentLoaded', initQuizTables);
if (document.readyState !== 'loading') initQuizTables();

// The full engine handles:
// - wrapping each table in .quiz-wrap
// - injecting .quiz-bar with toggle, reveal-all, hide-all buttons
// - injecting .quiz-progress fill bar
// - blurring .cell-inner and showing .cell-mask on quiz-hidden cells
// - animating revealed cells with revealPop keyframe
// - updating progress bar on each reveal
```

No additional HTML markup is needed — just write your `.comp-table` normally and the quiz engine picks it up automatically. The bar renders above each table with a dark header row containing "Table Quiz" label + controls.

---

## Common Gotchas

| Problem | Cause | Fix |
|---|---|---|
| All images show same file | URL matching using partial string that hits first match | Use `.replace('&amp;', '&')` and match full URL via exact dict key lookup |
| Images not showing in browser | Using `assets/` relative paths in a rendered environment | Embed as base64 — always |
| JS syntax error on load | Apostrophe inside single-quoted JS string | Use `json.dumps()` for ALL Python strings going into JS |
| `node --check` fails on `.html` | Node doesn't handle `.html` extension | Extract JS block to `.js` to check, or just test in browser |
| Nav bar overlaps content on scroll | Sticky nav `top` value doesn't account for header height | Measure actual header height (typically `51px` for single-line header) and set `top: Npx` on `.lo-anchor-nav` |
| Reveals don't animate | Using tab-switching architecture | Use scroll-based anchor nav — single global `IntersectionObserver` handles all reveals automatically |
| Same figure needs to appear in two places | `getElementById` can only find one element | Use the `id$="_key"` suffix selector: `querySelectorAll('[id$="_coa_28"]')` hits both `i_coa_28` in the section and `gallery_coa_28` in the gallery |
| Lightbox prev/next wraps wrong | Using IMGS dict key order (insertion order) for navigation | Maintain a separate `IMG_KEYS` array in the desired nav order; use `IMG_KEYS.indexOf(key)` to find current position |
| biplist not available | Not installed in container | `pip install biplist --break-system-packages -q` |

---

## File Output

```
/mnt/user-data/outputs/
  LO42FGH_Meninges_Brain.html    ← single self-contained file, ~2–4 MB
```

No `assets/` folder needed. The file works offline, in any browser, on any device.
Drop it into the study hub like any other week's notes.

---

## Time Breakdown (for future estimation)

| Task | Approx. time |
|---|---|
| Parsing webarchive + extracting figures | ~5 tool calls |
| Reading + digesting transcripts | ~3 tool calls |
| Writing HTML + CSS (full page) | 1 large `create_file` call |
| Building Python script to inject base64 + write output | 1 script call |
| Total | ~10–12 tool calls |

Total context used is heavy — if doing >15 figures or >4 LOs, split into two sessions.
