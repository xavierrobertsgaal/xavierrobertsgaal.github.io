# personal-website

Markdown-first personal site, deployed to GitHub Pages from `main`.

- Python runs via uv only (never pip or bare python). Scripts carry PEP 723 inline deps: `uv run build.py`, `uv run sync_scholar.py`.
- Content is `content/*.md`; `build.py` renders it to `dist/` (gitignored). The HTML template lives as a string in `build.py`; all styling in `style.css`. Keep it that way — no framework, no extra directories.
- Design: simple and minimal (ankit.io-like), blue/purple palette defined in `:root` of `style.css`.
- `sync_scholar.py` diffs publications.md against Google Scholar profile `VwvXaLEAAAAJ`; `--write` appends missing entries under "## working papers" (tag and reorder by hand after). Local runs only — Scholar blocks CI IPs.
- Publications mirror the CV's scheme: working/published sections, tag pills (m = moral cognition, c = culture and social cognition, AI), `\*` = shared first-authorship.
- The canonical CV lives in `/Users/mir318/Documents/Admin/CV and Bio/`; to update the site copy, replace `cv.pdf` with the latest PDF from there.
