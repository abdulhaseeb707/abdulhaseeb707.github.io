# AGENTS.md: rules for working on this repo

The personal website of **Abdul Haseeb Khan** (Lahore), published at https://abdulhaseeb707.github.io with
GitHub Pages. Read this before changing anything.

## 1. One file feeds the website and the CV

- All content is in `src/data/profile.yaml`: who he is, the research paper, highlights, about, skills and the
  full CV (`cv:`).
- The CV is a normal web page at `/cv/` (`src/pages/cv.astro`). On every build `scripts/build-cv-pdf.mjs` prints
  that page to `/Abdul-Haseeb-Khan-CV.pdf`. Never hand-edit or upload a CV PDF.
- Change facts in `profile.yaml`, never in `.astro` markup. The site and the CV then update together.

## 2. Voice: a personal site, not a column

- Short. One line where one line will do. No timelines, no essays, no long "story" paragraphs.
- First person, plain sentences ("I represented Pakistan…"). No emoji, no arrows like "you are here", not much
  bold.
- Banned phrases: passionate, leverage, spearheaded, cutting-edge, delve, unlock, synergy, results-driven,
  world-class, game-changer, seamless, "in today's fast-paced world".
- CV text (the `cv:` block) is normal CV style: action verbs, no "I".

## 3. Truth rules

- Only claim what `profile.yaml` already states or a file proves. Never invent numbers, titles, dates or results.
- The research is an **independent research project / working paper, not peer reviewed**. Never say
  "published" or "publication". Results are **associations**: write "is linked to" or "moves with", never
  "inflation causes" or "raises". Use the exact figures already in `profile.yaml` (`research.exact`); don't
  round or change them.
- Facts that are easy to get wrong: CGPA **3.29/4.00**; Meezan Bank was a **trainee** role, Jun to Sep 2026,
  now ended; MPhil is **in progress**; IOFS 2025 was a **Diploma (II degree) in Economics**.
- Private data never ships: date of birth, ID numbers, the festival voucher, home address, family or money
  matters. The phone number appears **only in the CV PDF** (`cv.showPhone`), never on a web page.

## 4. Design: young, bold, clearly hand-made

The direction is a "data zine": confident, playful, colorful, like a well-made student magazine or The
Pudding, never a corporate template and never an AI-generated landing page.

- **Light theme only.** No dark mode, no theme toggle.
- Type: Bricolage Grotesque (headlines, numbers), Instrument Sans (text), DM Mono (small labels, tags).
- Color: paper `#fbf8f1`, ink `#141414`, and flat blocks of green `#0f7a4d`, yellow `#ffd84d`, coral `#ff8a65`,
  sky `#acd5ff`, mint `#c9f0d9`. Tokens live in `src/styles/tokens.css`; don't add colors outside them.
- Flat only: **no gradients, no shadows (box or text), no blur, no glass, no glow, no neon.** Depth comes from
  2px ink outlines, color blocks and a slight tilt on photos and stickers.
- Real photos and the real research charts are the imagery. No stock or AI images.
- Text sizes use `clamp()` with **both width and height** (`vw` and `vh`) so short laptop screens don't get a
  giant headline. On the owner's laptop (1536x695 CSS px) the CV buttons must be visible without scrolling.
- Test every change at: 360x740, 390x844, 768x1024, 1024x768, 1366x657, 1536x695, 1920x969, 2560x1329 and
  3440x1329. No sideways scrolling at any size.
- Motion is small (hover lift, photo shuffle, reveal fade) and off under `prefers-reduced-motion`.
- The page must work without JavaScript: menu, links and images all still work.

## 5. Git and GitHub rules (set by the owner)

1. **No AI attribution anywhere**: no "Co-Authored-By" trailers, no "Generated with" lines, nothing in commits,
   PR descriptions, the site, the footer or the README.
2. **Commit as the owner**: `Abdul Haseeb Khan <190069163+abdulhaseeb707@users.noreply.github.com>`.
3. **Ask the owner before pushing anything** to GitHub.
4. **Don't change the research repo** (`abdulhaseeb707/inflation-corporate-profitability-pakistan`) without the
   owner's OK, not even its homepage field.

## 6. Commands and tooling

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Build into `dist/`, print the CV PDF, then run the rule check |
| `npm run preview` | Serve the built `dist/` |
| `npm run photos` | Resize full-size photos from `_archive/originals/` into `src/assets/` |

- Node.js LTS. On Windows the CV PDF is printed with the installed Microsoft Edge; on Linux/CI with Playwright's
  Chromium (`npx playwright install chromium`).
- Python 3.15 is available through `uv` for helper scripts.
- In a shell opened before a tool was installed, refresh PATH first:
  `$env:Path = "$env:USERPROFILE\.local\bin;" + [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
- Research figures come from the research repo (`outputs/figures/`) and are copied into `src/assets/research/`.
- `_archive/` (originals, old site, private files) and `incoming/` (new files from the owner) are gitignored.

## 7. Checklist before asking to push

1. `npm run build` passes, including `scripts/check-site.mjs` (wrong claims, private data, AI attribution,
   gradients/shadows, dark theme, emoji, banned phrases).
2. The CV PDF is 2 pages and matches `/cv/`.
3. Every size in section 4 checked: no sideways scroll, CV buttons visible on the first screen.
