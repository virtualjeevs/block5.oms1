# How to Build Self-Contained HTML Study Notes from a Webarchive + Transcripts
*A future-me instruction manual — written after building LO 42 (Orbit & Ocular CNs)*

---

## What This Produces

A single `.html` file (~2–4 MB) that:
- Is **fully self-contained** — all images base64-embedded, no external asset folder needed
- Has a **tab-based layout** (one tab per LO)
- Uses the **established design system** (cream/warm palette, Crimson Pro / Nunito / IBM Plex Mono)
- Includes a **lightbox figure viewer** with keyboard navigation
- Has **scroll-reveal animations**, callout boxes, comparison tables, and sign grids

---

## Inputs Required

| Input | Format | What it's used for |
|---|---|---|
| Lecture transcripts | `.txt` (plain text) | Content for CN course, clinical presentations |
| Webarchive | `.webarchive` (Safari) | Figures from textbook (Grant's Dissector, etc.) |
| LO list | (from user) | Determines tab structure and content scope |

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

Convert saved JPEGs to base64 strings for embedding:

```python
import base64

imgs = {}
for i in range(47, 60):
    with open(f'/home/claude/notes/assets/fig_{i}.jpg', 'rb') as f:
        imgs[i] = f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode()}"

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

```
<head>  Google Fonts import + all CSS in <style> block  </head>
<body>
  .page-header      ← sticky top bar (block, week, title)
  .lo-nav           ← sticky tab bar (one tab per LO + gallery tab)
  .content-wrap
    #lo42a.lo-section   ← LO A content
    #lo42b.lo-section   ← LO B content
    #lo42c.lo-section   ← LO C content
    #gallery.lo-section ← all figures
  #lightbox           ← fixed overlay for image zoom
  <script>            ← tab switching + reveal + lightbox + IMGS[] array
</body>
```

### 4b — CSS design system (warm cream palette)

```css
:root {
  --cream:       #fdf6ec;   /* page background */
  --cream-mid:   #f5ead8;   /* subtle card backgrounds */
  --ink:         #1f1a14;   /* primary text */
  --ink-soft:    #5c5042;   /* secondary text */
  --ink-muted:   #8a7868;   /* captions, labels */
  --coral:       #c8533a;   /* primary accent (LO badges, active tab, bone names) */
  --teal:        #0e7c7b;   /* section headings, CN IV */
  --gold:        #c8860a;   /* mnemonics, CN V1 */
  --violet:      #6b4fa0;   /* CN III */
  --sky:         #1878b8;   /* CN VI */
  --green:       #2a7a3b;   /* floor wall */
  --border:      rgba(31,26,20,0.12);
}
```

**Fonts** (import from Google Fonts):
- `Crimson Pro` — headings, figure numbers, CN numerals
- `Nunito` — body text, sub-headings
- `IBM Plex Mono` — labels, badges, code, metadata

### 4c — Key CSS components

**Sticky header + nav:**
```css
.page-header { position: sticky; top: 0; z-index: 100; background: var(--ink); }
.lo-nav      { position: sticky; top: 96px; z-index: 99; background: white; border-bottom: 2px solid var(--border-mid); }
/* Adjust top: 96px to match actual header height */
```

**Tab switching (JS):**
```javascript
function showLO(id, btn) {
  document.querySelectorAll('.lo-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.lo-tab').forEach(t  => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(triggerReveal, 80);
}
```

**Scroll reveal:**
```javascript
function triggerReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 55);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.lo-section.active .reveal').forEach(r => obs.observe(r));
}
// Add class="reveal" to any element you want to animate in
// CSS: .reveal { opacity:0; transform:translateY(14px); transition: opacity 0.4s, transform 0.4s; }
//      .reveal.visible { opacity:1; transform:none; }
```

**Lightbox:**
```javascript
// Store all image data URIs in an array at page load
const IMGS = [ /* base64 strings injected by Python */ ];
const CAPS = [ /* caption strings */ ];
let lbIdx = 0;

function openLB(i) {
  lbIdx = i;
  document.getElementById('lb-img').src = IMGS[i];
  document.getElementById('lightbox-cap').textContent = CAPS[i];
  document.getElementById('lightbox').classList.add('open');
}
// Keyboard nav: Escape / ArrowLeft / ArrowRight
```

**Assigning images to `<img>` tags on load:**
```javascript
// Use a simple ID map — cleaner than querying by position
const ID_MAP = { "i47":0, "i48":1, "i50":3, /* etc */ };
Object.entries(ID_MAP).forEach(([id, idx]) => {
  const el = document.getElementById(id);
  if (el) el.src = IMGS[idx];
});
// Give each <img> tag a unique id="i47", id="i48" etc. in the HTML
```

### 4d — Injecting base64 data via Python

```python
html = r"""<!DOCTYPE html>...(all your HTML)...<script>"""

# Inject the IMGS array
html += "const IMGS = [\n"
for i in range(47, 60):
    html += f'  "{imgs[i]}",\n'
html += "];\n\n"

html += """const CAPS = [...];
// rest of your JS
</script></body></html>"""

with open('/mnt/user-data/outputs/MyNotes.html', 'w') as f:
    f.write(html)
```

---

## Step 5 — Validate Before Delivering

```python
# Check image count
assert html.count('data:image/jpeg;base64') == 13

# Check no double-embedded (sanity)
print(f"File size: {len(html)/1024:.0f} KB")

# Spot-check JS strings for unescaped apostrophes
# (apostrophes inside single-quoted JS strings will break the page)
# Either use double quotes for JS strings, or escape: it\'s → it\\'s
# Better: use json.dumps() for any Python string going into JS
import json
safe_string = json.dumps(my_python_string)  # auto-escapes everything
```

```bash
# Node can't check .html files directly, but you can extract and check JS:
node -e "const x = 'your js snippet here'"
```

---

## Reusable Component Patterns

### Callout box
```html
<div class="callout callout-coral">
  <div class="callout-label">⚠️ Label</div>
  Content goes here.
</div>
<!-- Variants: callout-teal, callout-gold, callout-sky, callout-violet, callout-coral -->
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

### Flow row (nerve course)
```html
<div class="flow-row">
  <span class="flow-node">Interpeduncular fossa</span>
  <span class="flow-arrow">→</span>
  <span class="flow-node">Subarachnoid space</span>
  <span class="flow-note">(sandwiched: PCA above, SCA below)</span>
</div>
```

### Figure thumbnail (inline in section)
```html
<div class="fig-thumb" onclick="openLB(3)">
  <img id="i50" src="" alt="Figure 7.50">
  <!-- src="" is intentional — filled by JS on load -->
  <div class="fig-caption">
    <span class="fig-num">FIGURE 7.50</span>
    <span class="fig-text">Sagittal section through the orbit</span>
  </div>
</div>
```

---

## Common Gotchas

| Problem | Cause | Fix |
|---|---|---|
| All images show same file | URL matching using partial string that hits first match | Use `.replace('&amp;', '&')` and match full URL via `url in url_to_data` (exact key lookup) |
| Images not showing in browser | Using `assets/` relative paths in a rendered environment | Embed as base64 — always |
| JS syntax error on load | Apostrophe inside single-quoted JS string | Wrap Python strings in `json.dumps()` before injecting into JS |
| `node --check` fails on `.html` | Node doesn't handle `.html` extension | Extract JS block to `.js` to check, or just test in browser |
| Reveals don't trigger on tab switch | `IntersectionObserver` only fires for elements already in the DOM | Call `triggerReveal()` inside `showLO()` after a short `setTimeout` |
| Nav bar overlaps content on scroll | Sticky nav `top` value doesn't account for header height | Measure actual header height and set `top: Npx` on `.lo-nav` |
| biplist not available | Not installed in container | `pip install biplist --break-system-packages -q` |

---

## File Output

```
/mnt/user-data/outputs/
  LO42_Orbit_CN_Notes.html    ← single self-contained file, ~2.6 MB
```

No `assets/` folder needed. The file works offline, in any browser, on any device.
Drop it into the study hub like any other week's notes.

---

## Time Breakdown (for future estimation)

| Task | Approx. time |
|---|---|
| Parsing webarchive + extracting 13 figures | ~5 tool calls |
| Reading + digesting 3 transcripts | ~3 tool calls |
| Writing HTML + CSS (full page) | 1 large `create_file` call |
| Building Python script to inject base64 + write output | 1 script call |
| Total | ~10–12 tool calls |

Total context used is heavy — if doing >15 figures or >4 LOs, split into two sessions.
