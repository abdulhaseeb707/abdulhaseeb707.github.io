# abdulhaseeb707.github.io

My personal website: who I am, my research, things I've done, and my CV.

The website and the CV are built from the same file, so they never disagree. The CV is a normal page at
[/cv/](https://abdulhaseeb707.github.io/cv/) and a PDF made from that page on every build.
Rules for changing this repo are in [AGENTS.md](AGENTS.md).

## Changing something

| I want to… | Edit this |
|---|---|
| Change any text, fact, highlight, skill or CV line | `src/data/profile.yaml` |
| Add a photo or certificate | put it in `src/assets/photos/` or `src/assets/certificates/`, then use it in `profile.yaml` |
| Add a PDF people can open | put it in `public/files/`, then link it as `/files/<name>.pdf` |

Commit and push to `main`. GitHub Actions rebuilds the site and the CV PDF and publishes both in about two
minutes. You can also edit `profile.yaml` on github.com and press Commit changes.

## Running it locally

Needs Node.js (LTS).

```bash
npm install
npm run dev
```

- `npm run dev`: live preview at http://localhost:4321
- `npm run build`: builds `dist/`, prints the CV PDF, then checks the rules
- `npm run preview`: serves the built site

## What's where

```
src/data/profile.yaml      the one content file (website + CV)
src/components/            Hero, Research, Highlights, Places (map), About, Contact
src/pages/cv.astro         the CV page that becomes the PDF
src/pages/research/        the research project page
scripts/build-cv-pdf.mjs   prints /cv/ to PDF
scripts/check-site.mjs     fails the build on wrong claims, private data or off-style design
```
