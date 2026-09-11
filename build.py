# /// script
# requires-python = ">=3.11"
# dependencies = ["markdown"]
# ///
"""Render content/*.md into dist/*.html. Run with: uv run build.py"""

import re
import shutil
from pathlib import Path

import markdown

ROOT = Path(__file__).parent
CONTENT = ROOT / "content"
DIST = ROOT / "dist"
ASSETS = ["style.css", "script.js", "fishbowl.js", "favicon.svg", "publications.bib", "cv.pdf", "headshot.jpg", "fonts"]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{title}} | Xavier Roberts-Gaal</title>
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="fonts/CheltenhamClassic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/CheltenhamClassicBold.woff2" as="font" type="font/woff2" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<script src="script.js" defer></script>{{scripts}}
</head>
<body class="page-{{page}}">
<div class="layout">
<nav class="side">
  <a class="headshot-link" href="index.html"><img class="headshot" src="headshot.jpg" alt="Xavier Roberts-Gaal" width="300" height="375"></a>
  <hr class="siderule">
  <a class="navlink" href="index.html">About</a>
  <a class="navlink" href="publications.html">Publications</a>
  <a class="navlink" href="reading.html">Reading</a>
  <a class="navlink" href="cv.pdf" target="_blank">CV</a>
  <span class="social">
    <a href="mailto:xavierrobertsgaal@g.harvard.edu"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span class="label">Email</span></a>
    <a href="https://scholar.google.com/citations?user=VwvXaLEAAAAJ&hl=en"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg><span class="label">Google Scholar</span></a>
    <a href="https://twitter.com/xave_rg"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.4l7.3-8.3L1.5 2h6.4l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L7.1 3.8H5.3l12.5 16.3Z"/></svg><span class="label">Twitter</span></a>
    <a href="https://www.linkedin.com/in/xavier-roberts-gaal/"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z"/></svg><span class="label">LinkedIn</span></a>
    <a href="https://github.com/xavierrobertsgaal"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg><span class="label">GitHub</span></a>
    <a href="https://seeingtruly.substack.com/"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 3h21v2.5h-21V3Zm0 5.2h21v2.5h-21V8.2Zm0 5.2V24l10.5-5.9L22.5 24V13.4h-21Z"/></svg><span class="label">Substack</span></a>
    <a href="https://tally.so/r/obZ6aX"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="label">Anon. note</span></a>
  </span>
</nav>
<main>
{{content}}
</main>
{{webring}}
</div>
</body>
</html>
"""


def parse(text: str) -> tuple[dict, str]:
    """Split optional '---'-delimited frontmatter from the markdown body."""
    meta = {}
    if text.startswith("---\n"):
        head, _, text = text[4:].partition("\n---\n")
        for line in head.splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    return meta, text


def render(text: str) -> str:
    """Markdown -> HTML with the extension set every page and partial shares."""
    return markdown.markdown(text, extensions=["extra", "smarty"])


def new_tab_links(html: str) -> str:
    """Open external links in a new tab. Internal links are all relative, so
    any absolute http(s) href is external. rel=noopener cuts window.opener;
    noreferrer is deliberately omitted so linked sites still see referrals."""
    return re.sub(
        r'<a (?![^>]*\btarget=)(?=[^>]*href="https?://)([^>]*)>',
        r'<a \1 target="_blank" rel="noopener">',
        html,
    )


def prune_nav(template: str, built: set[str]) -> str:
    """Drop nav links whose page wasn't built (e.g. a draft), so the nav never
    points at a missing page. Non-page links like cv.pdf are left untouched."""
    def keep(match: re.Match) -> str:
        href = match["href"]
        drafted = href.endswith(".html") and href.removesuffix(".html") not in built
        return "" if drafted else match[0]

    return re.sub(
        r'[ \t]*<a class="navlink" href="(?P<href>[^"]+)">.*?</a>\n',
        keep,
        template,
    )


def main() -> None:
    DIST.mkdir(exist_ok=True)
    for asset in ASSETS:
        src = ROOT / asset
        if src.is_dir():
            shutil.copytree(src, DIST / asset, dirs_exist_ok=True)
        else:
            shutil.copy(src, DIST / asset)
    # Only top-level, non-partial markdown files are pages. Nested files
    # (e.g. content/drafts/*.md) fall outside this glob, so they never build.
    pages = [p for p in sorted(CONTENT.glob("*.md")) if not p.name.startswith("_")]
    built = {p.stem for p in pages}

    _, webring_body = parse((CONTENT / "_webring.md").read_text())
    webring = f'<footer class="webring">\n{render(webring_body)}\n</footer>'
    template = prune_nav(TEMPLATE, built)
    for path in pages:
        meta, body = parse(path.read_text())
        html = render(body)
        page = template.replace("{{title}}", meta.get("title", path.stem))
        page = page.replace("{{page}}", path.stem)
        page = page.replace(
            f'class="navlink" href="{path.stem}.html"',
            f'class="navlink active" href="{path.stem}.html"',
        )
        page = page.replace("{{content}}", html)
        # Pages with `bare: true` frontmatter drop the site chrome (side nav
        # and webring) — the fishbowl game supplies its own way home.
        if meta.get("bare") == "true":
            page = re.sub(r'<nav class="side">.*?</nav>\n', "", page, flags=re.S)
            page = page.replace("{{webring}}", "")
        else:
            page = page.replace("{{webring}}", webring)
        # Page-specific JS: only the fishbowl game loads its script.
        page = page.replace(
            "{{scripts}}",
            '\n<script src="fishbowl.js" defer></script>' if path.stem == "fishbowl" else "",
        )
        out = DIST / f"{path.stem}.html"
        out.write_text(new_tab_links(page))
        print(f"built {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
