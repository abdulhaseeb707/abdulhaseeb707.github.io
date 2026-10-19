# AGENTS.md: rules for working on this repo

The personal website of **Abdul Haseeb Khan** (Business Economics graduate and MPhil Economics student, Lahore), built with **Next.js**. It is published as static
files on GitHub Pages (https://abdulhaseeb707.github.io) and will later run as a Node server on Oracle Cloud
(see DEPLOY-ORACLE.md). Read this before changing anything.

## 1. One file feeds the website and the CV

- All words and facts live in `content/profile.yaml`: hero, research text, work highlights, about, skills, and the
  full CV (`cv:`). The research charts read `content/research/*.json`, a committed snapshot of the research repo
  made by `npm run sync:research`; project charts read `content/projects/<slug>/*.json`, made by
  `npm run sync:projects` from each project's repo. Never edit those JSON files by hand.
- The CV exists twice, both from the same data: the web page `/cv/` (`app/cv/page.tsx`) and the PDF
  `/Abdul-Haseeb-Khan-CV.pdf` (`app/Abdul-Haseeb-Khan-CV.pdf/route.ts` with `lib/cv/CvDocument.tsx`, react-pdf).
  Never hand-edit or upload a CV PDF.
- **The CV PDF style is the owner's choice ("academic"); keep it.** One serif (Source Serif 4, from
  `@fontsource/source-serif-4`), black and greys only, centred name, a contact line with phone, email, LinkedIn and
  the website (`site.url`), ruled uppercase headings, title and dates on one line, organisation in italics, two pages.
  He rejected the website-styled CV and a copy of his old Europass CV. Keep heading letter-spacing small (about 0.6pt),
  or CV-screening software reads "P R O F I L E". No 50% scholarship on the CV.
- In `cv:` entries, `pdf: false` keeps an entry on the website but out of the PDF, and `linkLabel` is what the PDF
  prints for a link.
- Change facts in `profile.yaml`, not in components. `lib/profile.ts` validates the file and fails the build with a
  readable message if something is wrong.

## 2. Voice

- Short and personal: one line where one line will do. No timelines, no essays.
- First person on the website, plain sentences, no emoji, very little bold. CV text is normal CV style (no "I").
- Banned: passionate, leverage, spearheaded, cutting-edge, delve, unlock, synergy, results-driven, world-class,
  game-changer, seamless.

## 3. Truth rules

- Claim only what `profile.yaml` states or a file proves. Never invent numbers, titles, dates or results.
- The research is an **independent research project / working paper, not peer reviewed**. Never "published".
  Results are **associations**: "is linked to", "moves with"; never "inflation causes/raises/lowers".
- Easy to get wrong: CGPA **3.29/4.00**; Meezan Bank was a **trainee** role, Jun to Sep 2026, ended; the MPhil is
  **in progress**; IOFS 2025 was a **Diploma (II degree) in Economics**.
- Don't call him an **economist** yet (no economist role or finished MPhil). His label, on the site and the CV, is
  `person.label`: "Business Economics graduate · MPhil Economics student · Lahore" (his degree is Business
  Economics; always "MPhil Economics", never just "MPhil").
- The **BRICS Arts Festival** (Nov 2025, online) was **participation** in its financial security programme, not an
  award. `check-site.mjs` fails on the old "Award for ... financial data interpretation" wording.
- The **International Movement on Financial Security** membership is about awareness of financial fraud. It has
  nothing to do with the festival's Entrepreneurship Track; don't link the two.
- On the CV the 2025 Excel Solver project and the 2026 cost optimization project are **one project**: only the
  2026 entry is printed (the 2025 one has `pdf: false`).
- **Cost Optimization with Linear Programming** (`projects`, slug `cost-optimization`): never name the cement
  company anywhere on the site or CV. Call it "a listed Pakistani cement producer with four plants"; plant names are
  fine. `check-site.mjs` fails the build if the name appears. Supply limits and alternative-fuel prices are
  simulated, so the saving is always "modeled", never a real-world result. Dates: Aug – Oct 2026.
- Private data never ships: date of birth, ID numbers, the festival voucher, address, family or money matters. The
  phone number appears **only in the CV PDF** (`cv.showPhone`), never on a web page.

## 4. Design: "Cycles" (mature, minimal, premium, clearly hand-made)

The owner rejected an old-fashioned serif version and a loud, cartoonish one. This direction was approved:

- **Home page order** (the owner's choice): profile first (name, two short lines, portrait), then what I've done
  (`highlights`), what I've studied (the CV's Education entries and skills), papers (the working paper first, then
  `papers`), projects (`projects`: a full card with its main chart for each one with a `slug`, which also gets a
  page at `/projects/<slug>/`; smaller ones as a list), where I've been (`places` and the map), contact. The
  research is a paper entry, not the hero.
- **Light only.** Ivory paper (`--ivory #f4f1ea`) with grain and a faint doodle wallpaper (`app/pattern.svg`,
  generated by `scripts/make-pattern.mjs`, about 10% strength). The research page uses a light line grid instead.
- **Ink on paper.** Text is ink `#111a2b` and slate `#4b5466`. Colour appears only in charts.
- **Chart colours**, in this fixed order and nowhere else: forest `#0e7a5a`, brass `#b7802a`, steel `#2c6db3`;
  de-emphasised data `#c3beb3`. Validated with the dataviz palette validator. Brass also draws thin rules and marks;
  small brass text uses `--brass-ink #8a5f1d` for contrast.
- **Type:** Instrument Serif for headlines (italic green for one emphasised phrase), Geist for text and UI, Geist
  Mono for labels, axes and dates. Big numbers use Geist, never the serif.
- **Illustration language:** moon phases (the header mark waxes as you scroll; each research step is a phase; on
  Education a full moon is a finished degree, a half moon one in progress) and dots (the research page moon is 6,683
  dots, one per firm-year). On the home page the portrait is the full moon, a paper disc on a dotted orbit. Thin line
  doodles only.
- **Flat:** no gradients, shadows, blur, glass or glow. Hairline borders (`--hair`) and space do the separating.
- **Sizes** use `clamp()` on width and height (`--fs-hero` etc. in `app/globals.css`). On the owner's laptop
  (1536x695) the name in the hero is about 64px (other page titles about 57px) and the CV button is on the first
  screen.
- **Charts** follow the dataviz skill: one axis (never dual), thin 2px lines, hairline grid, direct labels, a legend
  for 2+ series, emphasis instead of rainbow, hover and keyboard read-outs, and a "Show the numbers" table under
  every chart. Charts are drawn at real pixel width so labels stay readable on phones.
- Motion is small (moon drawing in, slow orbit, fades) and off under `prefers-reduced-motion`.

## 5. Git and GitHub rules (set by the owner)

1. **No AI attribution anywhere**: no "Co-Authored-By" trailers, no "Generated with" lines, nothing in commits,
   PR descriptions, the site, the footer or the README.
2. **Commit as the owner**: `Abdul Haseeb Khan <190069163+abdulhaseeb707@users.noreply.github.com>`.
3. **Ask the owner before pushing anything** to GitHub.
4. **Don't change the research repo** (`abdulhaseeb707/inflation-corporate-profitability-pakistan`) without the
   owner's OK, not even its homepage field.

## 6. Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local preview at http://localhost:3000 (makes the doodle tile and WebP photos first) |
| `npm run build` | Static export to `out/` (GitHub Pages), CV PDF included, then `scripts/check-site.mjs` |
| `NEXT_OUTPUT=standalone npm run build` | Node server build for Oracle Cloud (used by the `Dockerfile`) |
| `NEXT_BASE_PATH=/portfolio-preview npm run build` | Same static export for a sub-folder address (a preview repo). Plain `<a>`/`<img>` paths go through `withBase()` in `lib/base.ts` |
| `npm run serve` | Serve the built `out/` at http://localhost:3000 |
| `npm run qa` | Screenshots of `out/` at the nine screen sizes plus overflow and CV-button checks |
| `npm run sync:research` | Refresh `content/research/*.json` from the research repo |
| `npm run sync:projects` | Refresh `content/projects/<slug>/*.json` from each project repo (list in `scripts/sync-projects.mjs`) |
| `npm run photos` | Resize the owner's full-size originals (see section 7) into `assets/`; the map is in `scripts/optimize-originals.mjs` |

- Node.js LTS. `npm run qa` uses the installed Microsoft Edge on Windows.
- Python 3.15 is available through `uv` for helper scripts.
- `out/`, `.next/` and generated assets are gitignored.

## 7. The owner's folder (`Desktop\Portfolio`, next to this repo)

This repo is the `files` folder inside `C:\Users\Abdul Haseeb\Desktop\Portfolio`. The owner's originals live in that
parent folder, outside git, in numbered folders (a `READ ME.txt` there explains them to the owner):

| Folder | What is in it |
|---|---|
| `1 Add new files here` | The owner's drop box for new material. Start here when asked to update the site |
| `2 Photos` | Full-size originals by event (`IOFS 2025 - Krasnoyarsk`, `Festival of Youth 2026 - Ekaterinburg`, `Portrait`) |
| `3 Certificates` | Diplomas, certificates, award graphics |
| `4 CV` | Dated copies of the generated CV PDF, for emailing |
| `5 Research` | Charts from the paper and links to the paper, summary, slides and code |
| `6 Website design` | The approved "Cycles" direction board |
| `7 Old website` | The previous site and the old CV (wrong facts, reference only) |
| `8 Private - never goes online` | Voucher and other private papers. Never read into the site |

When the owner adds something to `1 Add new files here`:

1. Read it, check it against section 3 (truth and privacy), and ask about anything unclear.
2. Photos and certificates: move the original into `2 Photos/<event>/` or `3 Certificates/` with a plain name
   (`YYYY-MM-DD What it shows.jpg`), add it to the map in `scripts/optimize-originals.mjs`, run `npm run photos`,
   then reference the `assets/` path in `profile.yaml`. PDFs that the site links to are copied to `public/files/`.
3. Facts and text go into `content/profile.yaml`.
4. Private papers go to `8 Private - never goes online` and nowhere else.
5. Leave `1 Add new files here` with only its `How to use this folder.txt`.

## 8. Checklist before asking to push

1. `npm run build` passes (content validation, CV PDF is 2 pages, `check-site.mjs` clean).
2. `npm run qa` passes at all nine sizes: no sideways scroll, a CV download on the first screen of every page.
3. Look at the screenshots: nothing overlaps, charts read clearly, the doodles stay behind the text.
