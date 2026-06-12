# personal-website

Markdown-first personal site for [Xavier Roberts-Gaal](https://xrg.scholars.harvard.edu), in the spirit of ankit.io / sempervirens.io.

## How it works

- Pages live in `content/*.md` (frontmatter: just a `title`).
- `uv run build.py` renders them to plain HTML in `dist/` — the template is a string inside `build.py`, styling is `style.css`. No framework.
- Pushing to `main` auto-builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Local preview

```sh
uv run build.py
python3 -m http.server -d dist
```

## Keeping publications in sync

```sh
uv run sync_scholar.py          # dry run: shows entries on Google Scholar missing from publications.md
uv run sync_scholar.py --write  # appends them under the matching year heading
```

Run it locally (Google Scholar blocks data-center IPs, so this can't be a scheduled action). New entries land under "working papers" — tag them, move published ones, and tidy formatting before committing.

## Updating the CV

`cv.pdf` is a copy of the latest CV from `~/Documents/Admin/CV and Bio/` — replace it and push when there's a new version.
