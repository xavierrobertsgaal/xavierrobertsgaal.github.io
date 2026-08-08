# personal-website

Markdown-first personal site, deployed to GitHub Pages from `main`.

- Python runs via uv only (never pip or bare python). Scripts carry PEP 723 inline deps: `uv run build.py`, `uv run sync_scholar.py`. Local dev: `uv run serve.py` builds, serves `dist/` at localhost:5500, and live-reloads the browser on content/style/template edits.
- Content is `content/*.md`; `build.py` renders it to `dist/` (gitignored). The HTML template lives as a string in `build.py`; all styling in `style.css`. Keep it that way — no framework, no extra directories.
- Design: simple and minimal (ankit.io-like), blue/purple palette defined in `:root` of `style.css`.
- `sync_scholar.py` diffs publications.md against Google Scholar profile `VwvXaLEAAAAJ`; `--write` appends missing entries under "## working papers" (tag and reorder by hand after). Local runs only — Scholar blocks CI IPs.
- Publications mirror the CV's scheme: working/published sections, tag pills (m = moral cognition, c = culture and social cognition, AI), `\*` = shared first-authorship.
- `content/drafts/reading.md` is the curated reading list, **currently drafted (not deployed)**: same tag-pill/filter scheme as publications (tags: debate, oversight, meta), plus per-entry **Takeaways** / **My thoughts** paragraphs classed via attr_list (`{: .takeaways }` / `{: .thoughts }`); an entry template lives in an HTML comment at the top of the file.
- `content/drafts/` holds work-in-progress pages. `build.py` only globs the top level of `content/`, so nested files never build or deploy, and `prune_nav` strips their nav links from the template automatically. Move a file up into `content/` to publish it — the nav link comes back on its own.
- `/fishbowl` is a pass-the-phone party-game SPA: markup in `content/fishbowl.md` (raw HTML skeleton, **no inline JS** — the smarty extension would mangle it), logic in top-level `fishbowl.js`, loaded only on that page via the `{{scripts}}` placeholder in build.py's TEMPLATE. Game state persists to localStorage key `fishbowl.v1` (bump to invalidate old saves). Deliberately absent from the nav — reached by URL.
- `_`-prefixed files in `content/` are partials, not pages: `build.py` renders them into the template rather than emitting a `*.html`. `content/_webring.md` is the bottom-of-every-page webring — `build.py` wraps it in `<footer class="webring">` and injects it at `{{webring}}`. Keep it one line (left link, centered label, right link); `.webring` lays it out as a `1fr auto 1fr` grid.
- The canonical CV lives in `/Users/mir318/Documents/Admin/CV and Bio/`; to update the site copy, replace `cv.pdf` with the latest PDF from there.
