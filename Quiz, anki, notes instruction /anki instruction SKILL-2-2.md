---
name: contextual-anki
description: Build interactive contextual Anki recall maps — concept-map-style SVG mind maps with occluded flashcard panels, ✓/✗ scoring, spaced repetition review mode, and cross-node jump links. Use when the user wants to convert structured learning objectives, lecture notes, or course content into an active recall study tool. Triggers: "anki", "flashcard", "recall map", "study tool", "active recall", "concept map with cards", "occluded terms". Produces a standalone HTML file (no dependencies) that is safe to open locally or embed.
---

## What this skill builds

A standalone HTML study tool with three layers:
1. **Concept map** (SVG) — nodes for each topic (PLOs, LOs, chapters, etc.) connected to a central thread
2. **Card panel** — per-node flash cards with `{term}` occlusion, clinical/contextual notes, and prev/next navigation
3. **Score + review system** — ✓ knew / ✗ needed buttons per term, spaced repetition review mode for weak spots, cross-node jump links

---

## Inputs needed from user

- **Content source**: the raw card data (JSON, HTML with existing `D={}` object, or plain text lecture notes)
- **Node structure**: how many nodes (PLOs, LOs, chapters), their labels and subtitles
- **Card bodies**: each card needs `t` (title), `b` (body with `{term}` occlusion syntax or raw HTML for table cards), optional `h` (clinical/contextual hint)
- **Cross-links** (optional): which terms should jump to which other nodes

**CRITICAL — never hallucinate card content.** If the user provides a source file, copy card data verbatim. If generating from scratch, ask the user to confirm accuracy before finalizing. Medical/scientific content especially must come from the user's source material.

---

## Data structure

```js
const D = {
  nodeId: {
    label: 'PLO 1',           // short label shown in badge
    sub: 'Full topic title',  // shown in panel header
    type: 'PLO',              // controls badge color ('PLO' = amber, 'LO' = teal, or any string)
    cards: [
      {
        t: 'Card title',       // shown in monospace above body
        b: 'Body text with {occluded term} inline. Multiple {terms} per card.',
        h: 'Optional clinical/contextual note shown below card body'
      }
    ]
  }
};

// Cross-node jump links: term text → [targetNodeId, displayLabel, colorClass]
const LINKS = {
  'GnRH': ['plo2', 'PLO 2', 'amber'],
  'anterior pituitary': ['lo1', 'LO 1', 'teal'],
  // Add for any term that conceptually belongs to another node
  // Note: case-sensitive — add both 'testosterone' and 'Testosterone' if needed
};
```

---

## SVG map layout

The map is a `viewBox="0 0 680 325"` SVG with:
- **Top row**: PLO/concept nodes at y≈16 (4 nodes across x: 50, 200, 350, 500)
- **Center**: a single topic thread node at y≈128, width 330, centered at x=340, using `c-gray` class
- **Bottom row**: LO/detail nodes at y≈256 (same x positions)
- **Connectors**: `<line class="conn">` from each node to the center rect. Each connector x1 must match the center-x of the corresponding node rect (e.g. node at x=50, width=130 → x1=115)
- **Hint label**: `<text class="hint-lbl">` below LO row explaining keyboard shortcuts

Each node is a `<g id="n-{nodeId}" class="node c-amber|c-teal" onclick="selNode('id')">` containing a `<rect>` and two `<text>` elements (label + subtitle). The center node uses `c-gray`.

Scaling: for more/fewer nodes, adjust viewBox width and node spacing proportionally. For 6 nodes per row, use viewBox width ~900 and space nodes ~140px apart.

---

## Term occlusion syntax

In card body strings, wrap any term to be hidden in `{curly braces}`:

```
'All steroids derive from {cholesterol}. Its conversion is {rate-limiting}.'
```

- Terms render as filled bars (clickable)
- On click → reveal + show `✓ knew` / `✗ needed` score buttons inline
- After scoring: green (`rev`) = knew it, amber (`needed`) = needed help; unscored but revealed = `unscored` (green soft border, no label)
- Score buttons only appear for revealed-but-unscored terms — condition: `revealed && !scored && !opts.forReview`
- If a revealed term matches a `LINKS` entry and the target ≠ current node → jump link `→ PLO 2` appears

---

## Occlusion CSS — how it works and where it breaks

**Mechanism.** `.occ` renders the hidden term using `background: var(--text); color: transparent`. The text is in the DOM — the bar is just the element's own background painted over invisible text. Width is therefore exactly the natural rendered width of the term.

**The bar-as-length-hint problem.** Because width == text width, `{T}` produces a tiny sliver while `{sex hormone-binding globulin}` produces a wide bar. Users passively absorb answer length as a cue. The fix is `min-width` and `display: inline-block`:

```css
/* ✗ v11 original */
.occ {
  display: inline;
  background: var(--text);
  color: transparent;
  border-radius: 3px;
  cursor: pointer;
  padding: 1px 4px;
  white-space: nowrap;
  user-select: none;
  position: relative;
  transition: background .15s, color .15s;   /* ← border missing from transition */
}

/* ✓ improved */
.occ {
  display: inline-block;        /* more predictable padding/line-height */
  min-width: 3ch;               /* prevents single-char sliver bars */
  background: var(--text);
  color: transparent;
  border-radius: 3px;
  cursor: pointer;
  padding: 1px 6px;             /* slightly more generous horizontal padding */
  white-space: nowrap;
  user-select: none;
  vertical-align: baseline;    /* keeps inline-block anchored to text baseline */
  transition: background .15s, color .15s, border-color .15s;  /* ← border included */
}
```

**Border pop-in.** The revealed/scored states (`.rev`, `.needed`, `.unscored`) all add a `border: 1px solid ...` that isn't present on the base `.occ` — and `border` is not in the original `transition` list. This causes a 1px layout shift the instant a term is clicked. Fix: add `border: 1px solid transparent` to the base `.occ` rule so the space is always reserved and the transition covers `border-color`.

**Hover affordance.** The v11 hover is `opacity: .75` — a dimming signal. A brightening signal is a stronger "this is clickable" cue; replace with:

```css
.occ:not(.rev):not(.needed):not(.unscored):hover {
  filter: brightness(1.15);
  opacity: 1;
}
```

**Table cell override.** Table cells need `display: block` so the bar fills its cell. This requires an explicit override that must not be forgotten:

```css
.tblq td .occ {
  display: block;
  text-align: center;
  white-space: normal;    /* long terms can wrap inside cell */
  padding: 10px 12px;
  min-width: 180px;       /* cells need a larger min than inline bars */
}
```

**Full corrected `.occ` block:**

```css
.occ {
  display: inline-block;
  min-width: 3ch;
  background: var(--text);
  color: transparent;
  border: 1px solid transparent;          /* reserve space for revealed border */
  border-radius: 3px;
  cursor: pointer;
  padding: 1px 6px;
  white-space: nowrap;
  user-select: none;
  vertical-align: baseline;
  transition: background .15s, color .15s, border-color .15s;
}
.occ:not(.rev):not(.needed):not(.unscored):hover {
  filter: brightness(1.15);
}
.occ.rev      { background: var(--green-soft); color: var(--green);  cursor: default; border-color: rgba(52,211,153,.25); }
.occ.needed   { background: var(--amber-soft); color: var(--amber);  cursor: default; border-color: rgba(246,165,51,.25); }
.occ.unscored { background: var(--green-soft); color: var(--green);  cursor: default; border-color: rgba(52,211,153,.20); }
```

---

## Card types

### Standard text cards
The `b` field is a plain string with `{term}` syntax. `parseBody()` processes it.

### Table quiz cards
When a card compares multiple items in a grid, the `b` field is **raw HTML** containing a `.tblq-wrap` + `<table class="tblq">`. Row headers (`<th scope="row">`) stay always-visible as anchors; table data cells use `{occlusion}` syntax normally. Prepend a `.tblq-note` banner:

```html
<div class="tblq-note">
  <div class="tblq-copy">Table quiz: the X column stays visible, and each cell can be revealed one by one.</div>
  <div class="tblq-actions">
    <span class="tblq-pill">Quiz Mode On</span>
    <button class="tblq-btn" onclick="event.stopPropagation();revealAll()">Reveal All</button>
    <button class="tblq-btn" onclick="event.stopPropagation();resetCard()">Reset</button>
  </div>
</div>
<div class="tblq-wrap">
  <table class="tblq">
    <thead><tr><th>Step</th><th>Enzyme</th><th>Product</th></tr></thead>
    <tbody>
      <tr><th scope="row">1</th><td>{P450scc}</td><td>{Pregnenolone}</td></tr>
    </tbody>
  </table>
</div>
```

Table cells use `.occ { display:block; text-align:center; min-width:180px }` for proper layout. `.score-row` inside table cells uses `justify-content:center`. The `.tblq-actions` div is `display:none` in CSS (the buttons inside use `event.stopPropagation()`).

Table header gradient uses `--table-head-a` and `--table-head-b` tokens (defined per theme).

---

## Scoring & spaced repetition

**Score mode** — after each term reveal, two inline buttons appear:
- `✓ knew` → term turns green, increments `totKnew`
- `✗ needed` → term turns amber, increments `totNeed`
- Buttons disappear once scored (guarded by `if(sc[nid][cidx][tidx]) return`)

**`knewAllCurrentCard()`** — "Knew all" button in card actions; batch-scores all terms on the current card as `knew`. Enabled only when `allRevealed` is true. Correctly decrements `totNeed` for any term previously scored as `needed` before re-scoring as `knew`.

**Review mode** — triggered by "Review weak spots (N)" button in stats bar (visible when N > 0):
- Collects all terms scored `needed` across all nodes
- Fisher-Yates shuffles the queue
- Presents each as an isolated card: only the target term is blacked out; other `{terms}` in the body render in `color:var(--text-2)` (dim, not occluded)
- An `rsub` context bar shows `"Node Label — Card Title · Term to recall: [amber term]"` above the card
- Navigated with ← →, separate from main card panel
- Review does NOT re-score terms — it is pure recall practice

**Stats bar** tracks: total revealed · knew it · needed help · topics done / total. Also has: "Reveal topic" (current node), "Reveal deck" (all nodes), "Review weak spots" (hidden until N > 0), "reset".

---

## Card actions area

Below the card body, a `.card-actions` bar renders dynamically from `cardMetrics()`:

```js
function cardMetrics(nid, cidx) {
  // returns {total, revealed, unscored, knew, needed, allRevealed}
}
```

**Left side — meta pills**: `X / Y revealed` · `Z knew` · `W needed help` · (if any) `V waiting to score`

**Right side — action buttons**:
- `Reveal this card` [primary/teal] — disabled when `total===0 || allRevealed`
- `Knew all` [amber] — disabled until `allRevealed` is true
- `Reset this card` [ghost] — disabled when nothing has been revealed or scored

---

## Progress persistence

Progress is saved to a **cookie** (not localStorage), not sessionStorage:

```js
const PROGRESS_COOKIE = 'contextual_anki_progress_v1';
// 180-day max-age, SameSite=Lax
```

**Serialization format** (compact JSON):
```json
{
  "c": "currentNodeId",
  "i": 2,
  "r": { "plo1": ["0.1.3", "", "2"] },
  "s": { "plo1": ["0k.1n.3k", "", ""] }
}
```
Revealed term indices are dot-joined. Score tokens use `{idx}k` (knew) or `{idx}n` (needed).

**`recalcState()`** must be called after `loadProgress()` to recompute all counters from scratch — do not trust totals from the serialized state. It also re-applies `.done-node` to completed SVG nodes.

**`restoreSession()`** runs on page load: `loadProgress()` → `recalcState()` → reopens previously-open node/card panel if it exists.

---

## Theme system

Three complete themes via `data-theme` attribute on `<html>`:

| Theme | Key | Base bg |
|---|---|---|
| Slate (default) | `""` or `"slate"` | `#0b0f1a` dark navy |
| Cream | `"cream"` | `#f4efe4` warm parchment |
| Forest | `"forest"` | `#081512` dark green |

```js
function setTheme(theme) {
  if (theme === 'slate') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  // persist: localStorage.setItem('contextual-anki-theme', theme)
}
// On load: setTheme(localStorage.getItem('contextual-anki-theme') || 'slate')
```

Each theme redefines ALL CSS custom properties including `--table-head-a/b`, `--header-a/b`, `--card-a/b`, `--card-action-bg`, `--nav-bg`, `--nav-bg-hover`, `--nav-text`, `--showall-bg/text`, `--meta-bg`. The theme switcher renders pill buttons in the header with `data-theme` attributes and `.active` class on the current theme.

---

## CSS design tokens (full set)

```css
:root {
  /* Base surfaces */
  --bg: #0b0f1a;
  --surface: #131929;
  --surface-2: #19223a;
  --surface-3: #1f2a42;
  --surface-4: #24314e;       /* new vs skill v1 */

  /* Accent colors — each has soft/mid/dim alpha variants */
  --amber: #f6a533;
  --amber-soft: rgba(246,165,51,.13);
  --amber-mid: rgba(246,165,51,.25);
  --amber-dim: rgba(246,165,51,.55);
  --teal: #2dd4bf;
  --teal-soft: rgba(45,212,191,.12);
  --teal-mid: rgba(45,212,191,.22);
  --teal-dim: rgba(45,212,191,.5);
  --green: #34d399;
  --green-soft: rgba(52,211,153,.13);
  --green-mid: rgba(52,211,153,.22);
  --red: #f87171;
  --red-soft: rgba(248,113,113,.12);
  --red-mid: rgba(248,113,113,.22);

  /* Typography */
  --text: #dde5f0;
  --text-2: #7e90a9;
  --text-3: #3e5065;

  /* Borders */
  --border: #1c2a40;
  --border-2: #243348;

  /* Layout / atmosphere */
  --hero-glow-a: rgba(45,212,191,.08);
  --hero-glow-b: rgba(246,165,51,.09);
  --bg-top: #0b0f1a;
  --bg-bottom: #0d1321;
  --map-shadow: 0 20px 45px rgba(0,0,0,.22);
  --panel-shadow: 0 22px 48px rgba(0,0,0,.24);
  --header-shadow: 0 22px 50px rgba(0,0,0,.24);

  /* Theme-specific component tokens (defined per theme block) */
  --header-a / --header-b    /* panel gradient stops */
  --card-a / --card-b        /* card gradient stops */
  --card-action-bg           /* card actions bar bg */
  --nav-bg / --nav-bg-hover  /* prev/next button bg */
  --nav-text                 /* prev/next button text */
  --showall-bg / --showall-text
  --meta-bg                  /* meta pill bg */
  --table-head-a / --table-head-b  /* table header gradient */
}
```

Body background uses two radial hero glows + a linear vertical gradient:
```css
background:
  radial-gradient(circle at top left, var(--hero-glow-a), transparent 26rem),
  radial-gradient(circle at top right, var(--hero-glow-b), transparent 24rem),
  linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
```

Fonts (via Google Fonts):
- `Crimson Pro` — h1, review panel title (serif, academic weight)
- `DM Sans` — body UI text
- `DM Mono` — badges, labels, card titles, stats, meta pills, eyebrow

---

## Header structure

```html
<header>
  <div class="hero-top">
    <div class="hero-copy">
      <div class="eyebrow">Block 5 · Week 40 · Dr. Johnson</div>  <!-- course metadata -->
      <h1>Deck Title</h1>
      <p id="deckMeta" class="sub"></p>  <!-- filled by JS: "N topics · M cards" -->
    </div>
    <div class="theme-switch">
      <button class="theme-btn active" data-theme="slate" onclick="setTheme('slate')">Slate</button>
      <button class="theme-btn" data-theme="cream" onclick="setTheme('cream')">Cream</button>
      <button class="theme-btn" data-theme="forest" onclick="setTheme('forest')">Forest</button>
    </div>
  </div>
</header>
```

Deck meta is generated dynamically:
```js
document.getElementById('deckMeta').textContent =
  `Active recall map · ${Object.keys(D).length} topics · ${Object.values(D).reduce((n,node)=>n+node.cards.length,0)} cards`;
```

---

## Legend

Between the header and the map, a legend row labels the two node types:
```html
<div class="legend">
  <div class="legend-item"><div class="lswatch" style="background:var(--amber)"></div>Program Learning Outcomes (PLO)</div>
  <div class="legend-item"><div class="lswatch" style="background:var(--teal)"></div>Lecture Objectives (LO)</div>
</div>
```

---

## Complete feature checklist

- [ ] SVG mind map with clickable nodes (c-amber PLO top, c-teal LO bottom, c-gray center)
- [ ] Legend above map (amber = PLO, teal = LO)
- [ ] Header: eyebrow metadata + H1 + dynamic deck meta + theme switcher (Slate / Cream / Forest)
- [ ] Card panel with `{term}` occlusion and click-to-reveal
- [ ] Table quiz cards with `.tblq-wrap` HTML in `b` field
- [ ] Progress dots per node (gray → partial amber → done green)
- [ ] ✓ / ✗ score buttons inline after each reveal (disappear once scored)
- [ ] Card-level metrics bar (revealed / knew / needed / waiting-to-score pills)
- [ ] "Knew all" button (amber, enabled only when all terms revealed)
- [ ] "Reset this card" button (ghost)
- [ ] Cross-node jump links on revealed terms (check `link[0] !== nid`)
- [ ] "Reveal this card" button per card
- [ ] "Reveal topic" button (current node, disabled when none open)
- [ ] "Reveal deck" button (all nodes)
- [ ] Prev / Next card navigation
- [ ] Stats bar (revealed · knew · needed · done N/total)
- [ ] Spaced repetition review mode (shuffled weak-spot queue, rsub context bar)
- [ ] Review panel: only target term occluded; others dim but visible
- [ ] Completed nodes fade on map (.done-node → opacity .45)
- [ ] Cookie-based progress persistence (180 days, compact serialization)
- [ ] restoreSession() on page load
- [ ] Keyboard: ← → navigate (routed to review or main depending on which panel is open), Esc close
- [ ] Reset all button
- [ ] Three themes persisted to localStorage
- [ ] Responsive: @media(max-width:720px) full-width action rows

---

## Common mistakes to avoid

1. **Never invent card content** — always copy verbatim from user source. If source is ambiguous, ask.
2. **Score buttons must be inside the card body render**, not as a separate form — they fire `scoreIt(event, nid, cidx, tidx, score)` with `e.stopPropagation()`.
3. **Jump links should not appear for the node currently open** — check `link[0] !== nid` before rendering.
4. **`initNode(id)` must be called before accessing `tr[id]` or `sc[id]`** — both default to undefined.
5. **Review mode has its own render loop** (`renderReview()`) — do not mix with the main `render()`.
6. **`revealAll()` must mark terms without a score** — they stay `unscored` (green soft border, no ✓/✗) until the user explicitly scores them. Don't auto-score as `knew`.
7. **Keyboard listener must check which panel is open** — review panel gets ← → first; if neither is open, ignore arrow keys.
8. **`knewAllCurrentCard()` must handle already-needed terms** — decrement `totNeed` before incrementing `totKnew` if `prev === 'needed'`.
9. **`recalcState()` must be called after `loadProgress()`** — do not re-use totals from the cookie payload.
10. **Table quiz cards: `event.stopPropagation()` on tblq-btn clicks** — prevents the click from bubbling to `.occ` reveal handlers.
11. **LINKS keys are case-sensitive** — if a term appears capitalized and lowercase in different cards, add both variants (e.g. `'testosterone'` and `'Testosterone'`).
12. **Connector x1/x2 coordinates must match node center-x** — a node at `x=50, width=130` has center-x 115; the connector to the center rect should use `x1="115"`.
13. **`parseBody()` must accept an `opts` object** for dual-mode use (main vs review). Never hard-code the render path.
14. **Progress cookie uses `SameSite=Lax; path=/`** — omitting these causes the cookie to be dropped in some browsers.
15. **`.occ` must have `border: 1px solid transparent` on the base rule** — otherwise `.rev`/`.needed`/`.unscored` add a border that wasn't there, causing a 1px layout shift. Always include `border-color` in the transition list.
16. **Use `display: inline-block` not `display: inline` on `.occ`** — `inline` makes padding and line-height inconsistent across browsers; `inline-block` is predictable. Add `vertical-align: baseline` to keep it anchored to surrounding text.
17. **Add `min-width: 3ch` to `.occ`** — without it, single-character terms render as unclickable slivers. The `3ch` floor still lets the bar be wide enough to click while not obscuring the length signal entirely.
18. **Table cell `.occ` override is mandatory** — `.tblq td .occ` must override to `display: block; white-space: normal; min-width: 180px`. If this rule is missing, table bars will be inline-sized and misaligned inside cells.

---

## `parseBody()` function signature

```js
function parseBody(body, nid, cidx, opts = {}) {
  // opts.forReview      — boolean, true when rendering in review mode
  // opts.targetTermIdx  — term index that is the review target (others shown dim)
  // opts.revealedSet    — Set<number> of which terms have been revealed in review mode
  let i = 0;
  return body.replace(/\{([^}]+)\}/g, (_, t) => {
    const idx = i++;
    // ... resolve revealed, scored, isTarget from opts or tr/sc
    // if forReview: non-target terms render as <span style="color:var(--text-2)">{t}</span>
    // score buttons only if (revealed && !scored && !opts.forReview)
    // jump links only if (revealed && LINKS[t] && LINKS[t][0] !== nid)
  });
}
```

---

## State variables

```js
let cur = null;      // currently-open node id
let ci = 0;          // current card index within cur
let tr = {};         // tr[nid][cardIdx] = Set<termIdx> — revealed terms
let sc = {};         // sc[nid][cardIdx][termIdx] = 'knew' | 'needed'
let done = new Set(); // node ids where all terms are revealed
let totRev = 0, totKnew = 0, totNeed = 0;
let revQueue = [], revIdx = 0, revTr = {};  // review mode state
```

---

## Extending the pattern

**Add more card types**: add an `img` field to cards and render an `<img>` tag before the body for image occlusion (hide enzyme pathway diagrams, anatomical labels, etc.).

**Streak/session tracking**: add a session object `{date, correct, total}` and show a streak counter in the header.

**Print mode**: a `@media print` stylesheet that reveals all terms and removes interactive elements, producing a readable summary sheet.

**Multiple decks**: wrap `D` in a deck selector — the map reloads with a different node set based on which lecture/week is selected.

**Additional themes**: follow the same CSS variable override pattern in a new `html[data-theme="X"]` block; add a `data-theme="X"` button to the `.theme-switch` div and extend `setTheme()`.
