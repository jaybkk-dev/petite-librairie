# Personal Reading App — La Petite Librairie

A personal reading app for one user. Mobile-first. No authentication, no social features, no onboarding.

---

## Design

The visual design is fully resolved. Two documents govern it:

- **README.md** (Claude Design handoff) — authoritative for all visual decisions: typography, colour tokens, spacing, component behaviour, and fixed copy strings. Where this document and the README conflict on anything visual, the README wins.
- **Screenshots on file** — show the bookcase view with its sort/filter controls and the Lus filter desaturation behaviour. These supersede the bookcase description in the README, which reflects an earlier version.

The prototype files in the README bundle are reference material, not production code.

---

## Language and copy

The app is in French throughout. UI copy is minimal — the interface should be largely self-evident. Where labels or instructions are necessary, impersonal infinitive form only. No second-person address of any kind, neither *tu* nor *vous*.

The following copy strings are fixed and authoritative — reuse exactly:

- *Saisir une note…* (notes placeholder)
- *Sauvegarder le passage* (floating save button in reader)
- *À examiner* (suggestions view title)
- *Ajouter* (primary action on suggestion card)
- *Écarter* (secondary action on suggestion card)
- *Supprimer définitivement ?* (delete confirmation prompt)

---

## Hosting and storage

The app lives as a static site on **GitHub Pages**. Data lives in a **separate, private GitHub data repo** owned by the user, accessed via the GitHub Contents API.

**Repos.**
- App source: `jaybkk-dev/petite-librairie` (public) — auto-deploys to `https://jaybkk-dev.github.io/petite-librairie/` via `.github/workflows/pages.yml` on push to `main`.
- Data: `jaybkk-dev/petite-librairie-data` (private) — JSON snapshots, epubs, agent workflows.

**Authentication.** A fine-grained Personal Access Token (PAT) is entered once in Réglages and stored in `localStorage`. The same PAT is used by the app and by the agents — agent and app commits land in the same repo and pull through the same path.

**Layout of the data repo.**
- Repo root: `books.json`, `inbox.json`, `dismissed.json`, `prefs.json` — JSON snapshots of each collection.
- `/epubs/<book-id>.epub` — active epub files, fetched by the reader.
- `/cemetery/<book-id>.epub` — silent graveyard. When a book entry is deleted and an epub is linked, the file is moved here. Not surfaced in the app.

**Sync model.** Local-first with debounced upstream commits, designed to survive hard refreshes and switches between devices (phone ↔ tablet).

- The local `localStorage` cache is the authoritative read source for the UI; the data repo is the authoritative source between sessions and across devices.
- Mutations apply to local state immediately, mark the affected file dirty, and schedule a debounced push (currently 500ms).
- The dirty list itself is **persisted to localStorage** so it survives a page refresh. A pending push that didn't complete before refresh resumes on the next mount.
- **On mount: push any persisted dirty changes FIRST, then pull.** Pull never overwrites unsynced local state.
- **Safety nets:** the page flushes any pending push on `visibilitychange → hidden` (phone backgrounding) and on `beforeunload` (tab close / refresh). `beforeunload` also blocks navigation with the browser's native "leave site?" dialog while dirty.
- A failed push leaves the dirty flag set; the next mount or visibility flush retries.
- **Réglages → Initialiser le dépôt** is the only operation that intentionally discards remote state: it overwrites all four files with the seed and clears the dirty list.
- The Réglages → "Recharger depuis le dépôt" button is a manual force-pull (intentional discard of local state).

**One writer assumption.** A single user with at most one device active at a time. The agents commit while the app is closed. Conflicts are not expected; if the Contents API returns a SHA mismatch on push, the next sync round refetches the SHA and retries.

**Home-screen install.** The app installs from the GitHub Pages URL as a PWA — *Add to Home Screen* on iOS Safari or *Install app* on Android Chrome opens it chromeless, no browser URL bar. Wired up via `public/manifest.webmanifest` (`display: "standalone"`, theme/background `#f4efe6`, 192/512 icons), the iOS meta tags in `index.html` (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`), and a 180px apple-touch-icon. Icons are the *La Petite LIBRAIRIE* logo composited on the cream paper background. No service worker — offline caching is not needed since data lives in the data repo and the app already survives reloads via `localStorage`. Standalone mode requires HTTPS, so it only takes effect on the deployed Pages URL, not the local dev server.

---

## Mobile epub import

Epubs encountered on the go — downloaded in the browser, received via messaging, AirDropped, or sitting in the Files app — must be addable from the phone without returning to the PC. An *Importer un epub* action in the Bibliothèque opens the system file picker, then commits the selected file to the epub repo via the GitHub Contents API using the same PAT the acquisition agent writes with. The book entry is created in the same write so the title appears in the library immediately.

Title, author, and year are prefilled from the epub's embedded metadata where available, and editable before the entry is saved. The `source` field is set to a manual marker (e.g. *IMPORT MANUEL — <date>*) consistent with the suggestions card source format.

The Contents API caps at ~25MB per request, which covers typical epubs (1–5MB). For larger files the fallback is a direct upload via github.com on mobile — not surfaced in the app.

A real epub is on hand for testing at `library/Annie Ernaux - La place - Prix Renaudot 1984.epub` — usable for the import flow, metadata prefill, and reader rendering.

---

## Data schema

The following schema is authoritative (from the README's `data.jsx`):

**Book entry:** `n, title, author, year, status, start, end, source, note, justif, spineH, spineColor, spineText, passages[]`

**Inbox entry:** `title, author, year, src, why`

**Reader prefs:** `fontSize, nightMode`

**Per-book:** read position (page or %)

The `spineH`, `spineColor`, and `spineText` fields may be made user-editable per book in a future iteration.

---

## Seed list

The app ships with 23 books. The `justif` field for each is listed below. These strings are fixed — they appear in the expanded row in the Library and in the Book Detail view.

1. **Kamel Daoud — Meursault, contre-enquête** (2013)
L'Arabe anonyme de L'Étranger prend la parole. Voix narrative stupéfiante, colère et beauté, français d'Algérie ciselé. Le roman francophone du 21e siècle qui ressemble le plus à un « monument ».

2. **Maylis de Kerangal — Réparer les vivants** (2014)
Une seule journée, un cœur à transplanter. Phrase longue, haletante, style immédiatement reconnaissable. Du pur plaisir de lecture pour qui aime la langue travaillée.

3. **Laurent Gaudé — Le Soleil des Scorta** (2004)
Saga d'une famille du Sud de l'Italie sur plusieurs générations. Goncourt 2004. Prose lyrique, épique, chaleur humaine. Pour qui aime Cohen pour son souffle, Gaudé en offre un autre registre.

4. **Hervé Le Tellier — L'Anomalie** (2020)
Un avion atterrit deux fois — même avion, mêmes passagers, six mois d'intervalle. Goncourt 2020. Thriller littéraire intelligent, drôle, vertigineux.

5. **Mohamed Mbougar Sarr — La Plus secrète Mémoire des hommes** (2021)
Goncourt 2021. Un jeune écrivain sénégalais part à la recherche d'un auteur mythique disparu. Hommage à la littérature, à l'acte d'écrire. Ambitieux, érudit, jamais pédant.

6. **Jean-Baptiste Andrea — Veiller sur elle** (2023)
Goncourt 2023. Italie du 20e siècle, un sculpteur et une aristocrate, l'art et l'amour. Très accessible, grande générosité narrative, émotionnellement fort.

7. **Patrick Modiano — Dora Bruder** (1997)
Enquête sur une adolescente juive disparue pendant l'Occupation. Style épuré, presque fantomatique. Court, hanté. Nobel 2014. Souvent considéré comme son chef-d'œuvre.

8. **Leïla Slimani — Chanson douce** (2016)
Incipit fulgurant — la nounou a tué les enfants, on le sait dès la première page. Tout le roman est la question du pourquoi. Style précis, tension parfaite. Goncourt 2016.

9. **Virginie Despentes — Vernon Subutex** (trilogie, 2015–2017)
Paris contemporain, une galerie de personnages autour d'un ancien disquaire SDF. Voix unique, brute, drôle, lucide. Radiographie sociale sans complaisance.

10. **Marie NDiaye — Trois femmes puissantes** (2009)
Trois récits, trois femmes face à l'injustice. Prose étrange, envoûtante, légèrement onirique. Goncourt 2009. Une des voix les plus singulières de la littérature française contemporaine.

11. **Jonathan Littell — Les Bienveillantes** (2006)
900 pages dans la tête d'un officier SS cultivé. Goncourt et Grand Prix de l'Académie. Monstre littéraire, dérangeant, fascinant. Américain écrivant directement en français.

12. **Mathias Énard — Boussole** (2015)
Une nuit entière dans la tête d'un musicologue viennois amoureux de l'Orient. Goncourt 2015. Érudition portée par une phrase magnifique.

13. **David Foenkinos — Charlotte** (2014)
La vie de Charlotte Salomon, peintre juive allemande. Style atypique — phrases courtes, presque versifiées. Renaudot 2014. Plus de profondeur que ce que l'auteur laisse habituellement attendre.

14. **Delphine de Vigan — D'après une histoire vraie** (2015)
Jeu troublant entre fiction et réalité, entre une auteure et son double. Renaudot 2015. Haletant, intelligent.

15. **Gaël Faye — Petit Pays** (2016)
Enfance au Burundi, au bord du génocide rwandais. Goncourt des lycéens 2016. Style lumineux et douloureux à la fois.

16. **Scholastique Mukasonga — Notre-Dame du Nil** (2012)
Rwanda, un lycée de filles juste avant le génocide. Renaudot 2012. Voix unique dans la littérature francophone africaine. Beauté formelle, tension sourde.

17. **Boualem Sansal — Le Village de l'Allemand** (2008)
Deux frères algériens découvrent que leur père était un officier SS. Shoah et Algérie, identité et honte. Percutant.

18. **Nicolas Mathieu — Leurs enfants après eux** (2018)
Goncourt 2018. Quatre étés dans une vallée lorraine en déclin, des adolescents qui grandissent. Prose précise et incarnée — corps, alcool, musique, désillusion.

19. **Pascal Quignard — Tous les matins du monde** (1991)
Court, dense, méditation sur la musique et la mort au 17e siècle. Style d'une épure absolue — l'opposé de Cohen, mais le même rapport obsessionnel à la phrase.

20. **Yasmina Khadra — Les Hirondelles de Kaboul** (2002)
L'Afghanistan des Taliban vu de l'intérieur, quatre destins croisés. Prose lumineuse au service d'une tragédie. Officier algérien écrivant directement en français.

21. **Éric-Emmanuel Schmitt — La Part de l'autre** (2001)
Deux vies parallèles — Hitler admis aux Beaux-Arts de Vienne, et Hitler refusé. Stimulant, troublant, bien construit. Statut : Lu.

22. **Sylvain Tesson — Dans les forêts de Sibérie** (2011)
Journal d'une retraite de six mois dans une cabane au bord du lac Baïkal. Prose sublime, solitude assumée. Médicis Essai 2011. Statut : Lu.

23. **Andreï Makine — Le Testament français** (1995)
Un Russe écrivant directement en français, mieux que la plupart des Français. Goncourt et Médicis la même année. Mémoire, identité, langue. Statut : Lu.

---

## Views

### Library (list mode)

The default view. A scrollable list of all books. Each row displays: entry number, title in italic, author name, year, status badge, and a trash icon. The status badge cycles through four states on tap: À lire / En cours / Lu / Abandonné. Tapping anywhere else on the row expands it inline to reveal the justification text and a free-text notes field.

**Sort (fixed, not user-configurable):** by status group in this order — *En cours → À lire → Lu → Abandonné* — then alphabetically by title within each group. Leading articles (`Le`, `La`, `Les`, `L'`, `Un`, `Une`, `Des`, `Du`) are stripped for sort purposes; possessives, demonstratives, prepositions, and quantifiers are not. Comparison is locale-aware French, accent-insensitive.

**Abandoned books** render with a strikethrough on the title.

**Delete:** a trash icon appears on each row. Tapping it triggers a confirmation prompt (*Supprimer définitivement ?*). On confirmation:
- If no epub is linked to the book: the entry is permanently deleted.
- If an epub is linked: the entry is deleted and the epub file is silently moved to the `/cemetery` folder. No feedback to the user beyond the book disappearing from the list.

The trash icon is present in list mode only — not in the bookcase, not in the book detail view.

### Library (bookcase / étagère mode)

Accessed via the Étagère / Liste toggle in the Library header — not a separate tab. Étagère is the default mode and the leftmost segment.

A single unified bookcase displaying all books as vertical spines, packed greedily into multiple shelf rows of fixed (viewport) width. The bookcase has two control rows above it:

**Classer par:** Acquisition (default) / Auteur / Titre — sorts all spines accordingly.

**Filtrer:** Tous / Lus / Non lus — when a filter is active, non-matching spines fade to reduced opacity (no grayscale, titles must remain readable), matching spines retain full colour. No books are hidden — the bookcase stays visually coherent.

There are no grouped shelves and no per-status sections. Abandoned books appear at reduced opacity regardless of the active filter.

**Spine size rule (permanent):** every book is assigned exactly one of three discrete sizes — `short` (215px), `medium` (250px), or `tall` (300px). No interpolation, no per-book ratios. Width is uniform at `28px`. The size is assigned by combined `title + surname` length: `≤ 18` → short, `19 – 27` → medium, `≥ 28` → tall. New books are auto-bucketed via `computeSpineSize(title, author)` in `src/lib/spine.ts`; the field stays editable per book for manual override in a future iteration.

**Shelf rule (permanent):** each shelf row's spines area is fixed at the tall height (300px), regardless of which spines occupy it. The shelf board sits immediately below at 16px thick. The gap between the top of the tallest spine present and the underside of the shelf above never exceeds the thickness of the shelf board itself — when a `tall` spine is on the row, the gap is zero; when only shorter spines are present, they sit on the shelf with natural air above (a real-bookshelf look).

**Shelf board:** 16px thick, oak wood-grain texture (vertical grain stripes over a tan-brown base, with a subtle top highlight and bottom shadow for board depth). A 2px ground shadow falls underneath each board.

Tapping a spine opens that book's detail view.

### Book Detail

A single-column scrollable card. Fields: author (tappable Wikipedia link), title, year, source, status, start and end dates, justification text, free-text notes, and a list of saved passages. Each passage is displayed with guillemets and a page reference.

Below the reading fields, an acquisition block shows: platform, price, DRM status, Bangkok availability, direct purchase link, and a pre-composed transferable message for someone else to complete the purchase.

The author's name is a tappable link throughout the app — list rows, detail view, and bookcase spines — opening the author's French Wikipedia page in the device's default browser. URL pattern: `https://fr.wikipedia.org/wiki/<Author_With_Underscores>`.

### Reader (Liseuse)

Full-screen, distraction-free. Hides the tab bar. Day and night modes.

Adjustable font size. Night mode toggle persists. Text selection triggers a floating save button (*Sauvegarder le passage*) — tapping it appends the selected passage and current page reference to the book's `passages[]` array. No toast, no confirmation — the button dismisses and the passage is saved.

Progress shown as page number and percentage at the bottom. Epub rendering: epub.js is a known option — use it or propose a better alternative.

**Opening the Reader on an *À lire* book auto-transitions its status to *En cours* and stamps the start date.** Books already *En cours*, *Lu*, or *Abandonné* are not affected — opening one of those is a re-read or revisit and shouldn't change the record. The Lecture tab opens the most recently-read book (then falls back to the first *En cours* book that has an epub attached).

### Suggestions (Boîte de réception)

Cards of agent-generated candidates not yet in the library. Each card shows: source line (e.g. *LA GRANDE LIBRAIRIE — 14 AVRIL 2026*), title, author, year, and a short why excerpt. Two actions: *Ajouter* (primary, full-width) and *Écarter* (secondary). Dismissed cards are permanently removed — no undo, no archive.

The header carries two utility buttons in addition to the title and count: *↻ Lancer une recherche* fires the Discovery workflow on demand (confirms before dispatching, then surfaces "Recherche lancée. Les nouvelles suggestions arriveront dans quelques minutes."); *+ Ajouter une suggestion* opens a sheet to add a candidate manually with a free-text source note.

Three source types are valid:
- Agent-generated (automated pipeline with source and date)
- Manual (user adds a candidate directly with a personal source note, e.g. *CONVERSATION — 09 AVRIL 2026*)
- Both display identically in the card format

---

## Navigation

Bottom tab bar, fixed, four items: Bibliothèque / Suggestions / Lecture / Réglages. The Étagère is accessed from within the Bibliothèque via the header toggle — it is not a tab. The Lecture tab deep-links to the currently active book.

---

## Agents

Both agents run on **GitHub Actions inside the data repo itself**, alongside the JSON files and epubs they read and write. Both support `workflow_dispatch` — the app triggers them via the GitHub REST API using the user's PAT (which has `Actions: Read and Write` for that purpose). The Discovery Agent additionally runs on a weekly `schedule:` cron (Friday 08:00 UTC). Cold-start latency on `workflow_dispatch` is ~20–30s — accepted as a tradeoff for keeping the entire stack on a single platform.

Because the workflows commit to their own repo, they use the auto-provisioned `${{ secrets.GITHUB_TOKEN }}` for writes — no separate PAT needs to be stored as a secret. The only repo-level secrets the workflows need are `ANTHROPIC_API_KEY` and `YOUTUBE_API_KEY`.

### Discovery Agent

Runs on the Friday cron and on-demand from the Suggestions header (*↻ Lancer une recherche*). Monitors a configurable list of sources defined in `agents/config/sources.json` — editable without touching the code. Implemented source types:

- `youtube_channels` — channels by handle (e.g. `@lagrandelibrairie`), resolved to a channel ID and pulled via YouTube Data API v3. Episode title + description form the raw material; transcripts are not yet used.
- `rss_feeds` — generic Atom/RSS feeds parsed with `rss-parser`. Currently wired to *Le Monde des Livres*, *Télérama — Livres*, *Libération — Livres*. HTML in item bodies is stripped before going to Claude.

Each source carries a `lookback_days` window (default 14). All collected items are fed one by one through `agents/discovery/filter.ts`, which calls Claude Opus 4.7 with `thinking: adaptive`, `effort: high`, and a JSON-schema output. The model evaluates each item against `agents/config/taste-profile.md` and returns zero or more `{title, author, year, why}` candidates. Candidates that match an entry in `books.json`, `inbox.json`, or `dismissed.json` (keyed on `author::title`, lowercase) are dropped. Survivors are appended to `inbox.json` in a single commit with a French source line of the form `LE MONDE DES LIVRES — 14 AVRIL 2026`.

Backlist discovery (Babelio + prize longlists, surfaced by affinity rather than recency) is described in `agents/config/sources.json` as a future source type but **not yet implemented** — only the new-publications pipeline currently runs.

Dismissed candidates are permanently recorded and excluded from all future runs.

### Acquisition Agent

Triggered manually from the book detail view. Takes author and title, checks availability across platforms (DRM-free and Bangkok-accessible options prioritised), and returns: platform, format, price, availability from Bangkok, and direct URL.

**URL verification is mandatory.** LLMs reliably hallucinate URLs that pattern-match a platform's structure but don't exist (`shop.vivlio.com/product/<isbn>_<isbn>_<X>/<slug>` — Claude invents `_1` for the `<X>` segment when the actual ID is something like `_10060`). To prevent this, the agent runs URL verification at two layers: (1) the system prompt requires Claude to use the `web_fetch` tool on candidate URLs and confirm the title/author appear on the page before returning, and (2) the agent code does an HTTP GET (with browser-style headers) on the returned URL as a safety net. If either layer rejects the URL, `url` is set to empty and the transferable message is dropped — better no link than a 404 forwarded to a friend.

The agent does not generate the **transferable purchase message**. That message is built from a fixed template in `agents/acquisition/lookup.ts` — addressed to a specific recipient ("Béné"), with WhatsApp as the requested transfer channel and the title/author/platform/price/url interpolated in. The template is hardcoded and exact; do not let the model improvise it. If the lookup returns "Indisponible", a verified URL is missing, or no URL was found, the message is omitted.

Writes the result back to the book's acquisition block. Does not complete purchases.

---

## Taste profile

Stored as an editable config file, not hardcoded. Describes what this reader responds to — the agent uses it to find candidates in the same territory as the loved references, not to build a list of exclusions.

**What this reader responds to:**
Style above all else. The writing voice should be distinctive and recognisable — language as craft, as subject, as register, not merely a vehicle for plot. Francophone literature broadly: France, North Africa, West Africa, Quebec, Belgium, Switzerland, and beyond. Contemporary fiction in the widest sense — recent publications and backlist titles are equally valid. No era cutoff.

Translations into French are valid candidates when the source language is one the reader does not speak. Translations from Spanish or English should not be suggested — the reader accesses those in the original.

**Loved reference points — use as anchors:**
- Albert Cohen (Belle du Seigneur, complete works) — the benchmark. Lyrical excess, obsessive relationship to language, Jewish Mediterranean voice.
- Annie Ernaux — spare, precise, autobiographical. Class and memory as literary subjects.
- Romain Gary / Émile Ajar — loved selectively. Assess the specific title rather than the name — the lyrical, warm register of La Promesse de l'Aube yes; the cynical later work less so.
- Amélie Nothomb — light, witty, formally clever. Many titles read and enjoyed.
- Éric-Emmanuel Schmitt — stimulating, well-constructed.
- Michel Tremblay — complete works read and loved. Quebec voice, working-class Montreal, theatricality in prose.
- Joris-Karl Huysmans — decadent, dense, stylistically extreme.
- Marguerite Yourcenar — erudite, controlled, historical scope.
- Muriel Barbery (L'Élégance du hérisson), Anna Gavalda — accessible, warm, widely read. Popularity is not a disqualifier.
- Patrick Modiano, Virginie Despentes, Marie NDiaye, David Foenkinos, Delphine de Vigan — various titles read across each, all enjoyed.
- Flaubert (Madame Bovary) — stylistic benchmark.

**One firm exclusion:**
Houellebecq — never suggest.

**Feedback layer:**
The profile evolves over time. Dismissed cards are recorded and inform future runs. The user can explicitly flag authors or titles — *ne plus suggérer cet auteur* or *davantage dans ce registre* — and those signals are appended to the config and applied to future runs. The config structure should accommodate this cleanly without requiring manual editing of the core profile.

---

## APIs and external dependencies

Directions, not mandates — better alternatives should be proposed where they exist.

- **YouTube Data API** — La Grande Librairie episodes and metadata
- **youtube-transcript-api** (or equivalent) — episode transcripts
- **Claude API** — content interpretation, taste filtering, acquisition lookup
- **epub.js** (or equivalent) — in-browser epub rendering
- **Babelio** — backlist discovery source
- **Wikipedia** — French Wikipedia author links; direct URL construction from author name, no API needed
