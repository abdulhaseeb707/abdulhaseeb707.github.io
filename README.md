# abdulhaseeb707.github.io

The personal website of **Abdul Haseeb Khan**: my story in the order it happened, my projects, and my CV.

**The website generates the CV.** Both are built from the same file, so they never disagree.
Rules for anyone (person or AI agent) changing this repo are in [AGENTS.md](AGENTS.md).

## Changing something

| I want to… | Edit this |
|---|---|
| Change any fact, story chapter, skill, service or CV line | `src/data/profile.yaml` |
| Write or update a project page | `src/content/projects/<name>.md` |
| Add a photo or certificate | put it in `src/assets/photos/` or `src/assets/certificates/`, then reference it in `profile.yaml` |
| Add a PDF people can open (slides, report, certificate) | put it in `public/files/`, then link it as `/files/<name>.pdf` |

Save, commit and push to `main`. GitHub Actions rebuilds the site **and** the CV PDF and publishes both
(about two minutes). You can also edit `profile.yaml` directly on github.com and press **Commit changes**.

## Running it on your computer

Needs Node.js (LTS).

```bash
npm install
npx playwright install chromium
npm run dev
```

- `npm run dev`: live preview at http://localhost:4321
- `npm run build`: builds the site into `dist/`, prints the CV to `dist/Abdul-Haseeb-Khan-CV.pdf`, then checks the rules
- `npm run preview`: serves the built site

## What's where

```
src/data/profile.yaml      the one content file
src/content/projects/      project stories (draft: true hides one until its files are ready)
src/components/            page sections: opening, timeline, map, work, contact
src/pages/cv.astro         the CV layout that becomes the PDF
scripts/build-cv-pdf.mjs   prints /cv/ to PDF with headless Chromium
scripts/check-site.mjs     fails the build on wrong claims, private data or "AI look" styling
```
