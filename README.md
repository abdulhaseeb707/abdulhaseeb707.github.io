# abdulhaseebkhan.online

My personal website: who I am, my research on inflation and company profits in Pakistan (explained in six charts),
the work I've done, and my CV.

The website and the CV come from the same file, so they never disagree. The CV is a web page at
[/cv/](https://abdulhaseebkhan.online/cv/) and a PDF made from the same data. Rules for changing this repo are in
[AGENTS.md](AGENTS.md).

## Changing something

| I want to… | Edit this |
|---|---|
| Change any text, fact, highlight, skill or CV line | `content/profile.yaml` |
| Update the research numbers after the research repo changes | run `npm run sync:research` |
| Add a photo or certificate | put it in `assets/photos/` or `assets/certificates/`, then use it in `profile.yaml` |
| Add a PDF people can open | put it in `public/files/`, then link it as `/files/<name>.pdf` |

Commit and push to `main`. GitHub Actions rebuilds the site and the CV and publishes them in about two minutes.

## Running it locally

```bash
npm install
npm run dev
```

- `npm run dev`: preview at http://localhost:3000
- `npm run build`: static site in `out/`, with the CV PDF, then the rule check
- `npm run qa`: screenshots at nine screen sizes

## Moving to a server

The same code runs as a Node server in Docker. See [DEPLOY-ORACLE.md](DEPLOY-ORACLE.md).

## What's where

```
content/profile.yaml        all words and facts (website + CV)
content/research/           numbers behind the charts (from the research repo)
app/                        pages: home, research, CV page, CV PDF, 404
components/                 hero, moon, work grid, about, contact, viewer
components/charts/          the six research charts
lib/cv/CvDocument.tsx       the CV PDF layout
scripts/                    doodle tile, image sizes, research sync, checks, screenshots
```
