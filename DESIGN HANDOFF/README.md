# Handoff — La Petite Librairie

## Overview

**La Petite Librairie** is a personal reading app for a single user. It is mobile-first, French throughout, and aesthetically aims to feel like a private object — a paper notebook, a kept ledger — rather than a product. There is no authentication, no social features, no onboarding, no second-person address anywhere in the copy. All UI text uses the impersonal infinitive (e.g. *Saisir une note…*, *Sauvegarder le passage*, *Écarter*).

## About the design files

The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look, layout, and behaviour. They are **not** production code to copy directly. Your task is to recreate these designs in the target codebase's environment (React Native, SwiftUI, Flutter, Vue, etc.) using its established patterns, libraries, and component conventions. If no environment exists yet, choose the most appropriate framework for a single-user mobile reading app and implement the designs there.

The HTML prototype uses inline-React + Babel and a custom canvas wrapper purely as a presentation device — none of that scaffolding should travel into the production app.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, and interactions are all decided. Recreate pixel-perfectly using the codebase's existing libraries; treat the design tokens table below as authoritative.

## Frame

All screens are designed at **390 × 844** (iPhone 14/15 logical px). A 54px status-bar gutter and an 84px bottom tab-bar gutter are reserved on every tabbed screen. The Reader is the only view that hides the tab bar.

## Brand lockup

Two-line ink-on-paper mark, used on the Library header, splash, About page, and print cover.

```
La petite          ← Cormorant Garamond, weight 500, sentence case, italic *off*
LIBRAIRIE          ← Inter Tight, weight 800, all-caps, letter-spacing 2.4px
```

The two lines are stacked with `line-height: 1`, the small line ~11px and the big line ~10px (the caps tracking makes them feel balanced). No badge, no enclosure, no rule. Ink only.

## Design tokens

```
/* Paper + ink palette */
--paper:        #f4efe6   /* default background */
--paper-deep:   #ece5d6   /* secondary surface */
--ink:          #1a1612   /* primary text */
--ink-soft:     #3d362c   /* secondary text, body of justifs */
--ink-mute:     #7a6f5e   /* tertiary text, eyebrows */
--ink-faint:    #b8ad97   /* numerals, separators in copy */
--rule:         rgba(26,22,18,0.12)   /* hairline rules */
--rule-strong:  rgba(26,22,18,0.22)   /* section dividers */
--accent:       #7a2418   /* ox-blood — accent, en-cours dot, links */
--accent-soft:  #a64a3a   /* underlines under links */

/* Reader — night mode */
--night-bg:     #0f0c08
--night-fg:     #d4c5a8
--night-soft:   #8a7d65
--night-mute:   #5a5040

/* Type families (load from Google Fonts) */
serif:  "Cormorant Garamond"   weights 400, 500, 600 + italic 400, 500
sans:   "Inter Tight"           weights 400, 500, 600, 700, 800
mono:   "JetBrains Mono"        weights 400, 500
```

### Type scale (used across screens)

**Italic is reserved for book titles.** Wherever a book's title appears — list rows, detail view, inbox cards, bookcase spines, the running title in the reader — it is set in serif italic. All other text is upright (roman), including justifications, notes, saved passages, body copy, placeholders, meta lines, and system messages.

| Role | Family | Size | Weight | Tracking | Casing |
|---|---|---|---|---|---|
| Page title (Bibliothèque, À examiner) | serif | 32 | 400 | -0.5 | sentence |
| Book title (rows, detail, inbox, spine, reader running title) | serif italic | 21 / 32 | 400 | -0.1 / -0.4 | sentence |
| Saved passage / notes / "Pourquoi" | serif | 14.5 – 16 | 400 | 0 | sentence |
| Body sans (author lines) | sans | 13 | 400 | 0 | sentence |
| Eyebrow / table label | mono | 9 – 9.5 | 400 | 0.9 – 1.4 | UPPERCASE |
| Status badge | mono | 9.5 | 400 | 0.8 | UPPERCASE |
| Numerals (entry no., year, page) | mono | 10 – 11 | 400 | 0.5 | — |
| Action buttons (Ajouter, Acheter…) | mono | 10 – 11 | 400 | 1.0 – 1.2 | UPPERCASE |
| Reader body | serif | 18 – 20 | 400 | 0 | justified, hyphens auto |

### Spacing

Most rows pad `20px 24px`. Section dividers are 0.5px hairlines using `--rule` (between rows) or `--rule-strong` (between sections). No rounded corners anywhere except where noted (the few buttons are square; the iOS device frame in the canvas presentation is 48px).

## Screens

### 1 · Bibliothèque (List)

**Default view.** Scrollable list of books.

- **Header**: lockup at top-left, then a 32px serif "Bibliothèque" line + entry-count tag (e.g. `010 ouvrages`) in mono, right-aligned. Below: a two-up segmented control (`Liste` / `Étagère`), 0.5px outline, square, mono caps, 9px padding. Active segment fills with `--ink`, label `--paper`.
- **Row** (52px+): `[entry no. mono] [title in serif italic] [author · year mono] [status badge]`. Tap anywhere to expand inline.
- **Expanded panel**: padded 60px on the left (under the entry no.), tinted `rgba(26,22,18,0.025)`, dashed top rule. Two stacked fields:
  - **Pourquoi** (eyebrow mono caps) → serif justification text, soft ink.
  - **Notes** (eyebrow mono caps) → free-text serif on a single hairline underline. Empty state: placeholder *Saisir une note…* in `--ink-faint`.
- **Status badge**: 6×6 dot + caps mono label.
  - `À lire` — dot `--ink-faint`
  - `En cours` — dot `--accent`
  - `Lu` — dot `--ink-soft`
  - `Abandonné` — empty ring (border `--ink-mute`), title gets line-through in `--ink-mute`

### 2 · Étagère (Bookcase)

**Same data, visual mode.** Reached via the header toggle — *not* a tab.

- Books are rendered as vertical wooden spines on shelves, grouped and labelled by status: `En cours`, `Lus, ordonnés par fin de lecture`, `À lire`, `Abandonnés`.
- **Spine**: width 22–28px depending on status (lus are widest, à-lire slimmest), height proportional to `book.spineH` (a per-book ratio, ~240px max). Background = `book.spineColor`. Text = `book.spineText`, written vertically (`writing-mode: vertical-rl; transform: rotate(180deg)`). Each spine has four hairline decorative rib lines top and bottom.
- Title is serif italic; author surname (last word) is mono caps tracked. Abandoned spines render at `opacity: 0.55`.
- **Shelf board**: 8px tall gradient strip (`#6b5638 → #4a3a25 → #2e2418`), 2px shadow underneath. Spines sit on it with `align-items: flex-end`.

### 3 · Fiche (Book detail)

A single-column card, scrollable.

1. Top strip: `← Bibliothèque` + entry-no. counter (`05 / 10`).
2. Title block (28px padding):
   - Eyebrow: `Fiche`
   - **Author name** as a link to French Wikipedia (e.g. `https://fr.wikipedia.org/wiki/Julien_Gracq`) — accent colour, 0.5px underline, opens in default browser. Trailing `↗` glyph.
   - Title: serif italic 32, `text-wrap: pretty`.
   - Meta line: `year · source` in mono, `--ink-mute`.
3. **Status / dates table** (3 rows): `Statut | <badge>`, `Commencé | <date>`, `Terminé | <date>`. Hairline between rows.
4. **Notes**: serif body, no ornament.
5. **Passages** (eyebrow + count): each passage is a left-bordered block (1px `--accent` border), serif body in `«»` guillemets, page number in mono below.
6. **Acquisition** block (separated by `--rule-strong` and tinted `rgba(122,36,24,0.04)` if you want to tint — current spec leaves it untinted):
   - 2-col grid: `Plateforme | Vivlio (FNAC)` · `Prix | 12,99 €` · `DRM | Adobe ADEPT` · `Bangkok | Disponible — VPN non requis`
   - Primary CTA: full-width `Acheter sur Vivlio →`, `--ink` background, `--paper` text, mono caps, square.
   - **Message à transférer**: a pre-composed shareable note in serif inside a 0.5px outline box, slightly tinted background. Two square secondary buttons follow: `Copier`, `Partager`.

### 4 · Liseuse (Reader)

Full-screen, distraction-free. Hides the tab bar. Has a day variant (paper) and night variant (`--night-bg`).

- **Top chrome** (38px): single `←` glyph (back to fiche), centred running title (serif italic, 13px, soft ink), trailing `Aa` (font size) + `☼/☾` (night toggle). 0.5px hairline below.
- **Body**: padding `36px 32px 40px`. Serif 18–20px, `text-align: justify; hyphens: auto; line-height: 1.55`. First paragraph indented 1.4em. Chapter eyebrow centred in mono caps.
- **Selection → floating save button**: appears centred above the selection. `--ink` background (or `#1a1612` in night), paper text, mono caps `Sauvegarder le passage`. A bookmark glyph + label, with a small downward triangle pointer underneath. On tap, the selected passage is appended to the book's `passages` array (page number derived from current scroll position).
- **Bottom strip** (36px): `p. <n> / <total>` left, `<percent>` right. Mono caps.
- **Font size** is adjustable (state). **Night mode** is a toggle; persists.

### 5 · Suggestions (Inbox)

Cards of agent-generated candidate books.

- **Header**: eyebrow `Suggestions de l'agent`, page title `À examiner` in 32 serif, count tag right-aligned in mono.
- **Card** (one per recommendation):
  - Source line in mono caps eyebrow (e.g. `LA GRANDE LIBRAIRIE — 14 AVRIL 2026`)
  - Title in serif italic 22px
  - Author · year in sans + mono mix
  - **Why** excerpt: serif 14.5px, soft ink, left 1px hairline border in `--rule-strong`
  - Two actions: full-width primary `Ajouter` (ink/paper) + narrower secondary `Écarter` (0.5px outline). Mono caps.
- Dismissed cards disappear permanently — no undo, no archive, no count of dismissed.

## Bottom tab bar

Fixed 84px tall (incl. 30px safe-area padding-bottom). 0.5px top hairline. Four equal-width tabs:

1. **Bibliothèque** — book-spines glyph
2. **Suggestions** — tray glyph
3. **Lecture** — open-book glyph (deep-linked to the currently-being-read book)
4. **Réglages** — gear glyph

Active tab: glyph + 10px caps label tinted `--accent`, label weight 600. Inactive: `--ink-mute`, weight 400.

The Étagère is **not** a tab — it lives behind the Library's header toggle.

## State

Local persistence is fine (single user, single device). Key collections:

- `books[]` — see `data.jsx` for shape: `n, title, author, year, status, start, end, source, note, justif, spineH, spineColor, spineText, passages[]`
- `inbox[]` — `title, author, year, src, why`
- Reader prefs: `fontSize`, `nightMode`
- Per-book read position (page or %)

Status state machine for any book row (cycle on tap of badge, optional): `À lire → En cours → Lu → Abandonné → À lire`. Source files cycle through these labels as written.

## Files in this bundle

- **`La Petite Librairie (standalone).html`** — the single-file inlined prototype. Open in any browser to see all five views laid out on a pannable canvas.
- **`source/`** — the editable source split across modules:
  - `data.jsx` — design tokens (`TOKENS`), status table (`STATUS`), seed `BOOKS[]`, seed `INBOX[]`. **Treat as authoritative.**
  - `chrome.jsx` — status bar, tab bar, screen shell.
  - `library.jsx` · `bookcase.jsx` · `detail.jsx` · `reader.jsx` · `inbox.jsx` — one file per view.
  - `La Petite Librairie.html` — the un-inlined entry point that pulls the modules together.

## Notes for the implementer

- **Copy is fixed.** Where the prototype shows `Saisir une note…`, `Sauvegarder le passage`, `À examiner`, `Écarter`, etc., reuse those strings exactly. Never use *tu* or *vous*; never address the user directly.
- **No emoji, no rounded corners** (except inside the iOS device frame, which is presentation-only). Hairlines, square buttons, infinitive verbs.
- **Wikipedia link** opens in the device's default browser (`Linking.openURL` on RN, `UIApplication.shared.open` on iOS, `Intent.ACTION_VIEW` on Android). URL pattern: `https://fr.wikipedia.org/wiki/<Author_With_Underscores>`.
- **Bookcase** is the slow-burn pleasure of the app — the spines should look hand-set, not generated. Consider letting `spineColor`/`spineText`/`spineH` be user-editable per book in a future iteration.
- **Reader** must support epub natively. Selection-to-save should write to the book's `passages` with the current page reference; no toast, no "saved!" — the floating button just dismisses.
