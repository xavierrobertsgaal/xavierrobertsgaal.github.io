# /// script
# requires-python = ">=3.11"
# dependencies = ["markdown"]
# ///
"""Render content/*.md into dist/*.html. Run with: uv run build.py"""

import shutil
from pathlib import Path

import markdown

ROOT = Path(__file__).parent
CONTENT = ROOT / "content"
DIST = ROOT / "dist"
ASSETS = ["style.css", "publications.bib", "cv.pdf"]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{title}} | xavier roberts-gaal</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header>
  <a class="name" href="index.html">xavier roberts-gaal</a>
  <nav>
    <a href="index.html">about</a>
    <a href="publications.html">publications</a>
    <a href="talks.html">talks</a>
    <a href="cv.pdf">cv</a>
    <a href="https://seeingtruly.substack.com/">blog</a>
  </nav>
</header>
<main>
{{content}}
</main>
<footer>
  <a href="mailto:xavierrobertsgaal@g.harvard.edu">email</a> ·
  <a href="https://twitter.com/xave_rg">twitter</a> ·
  <a href="https://www.linkedin.com/in/xavier-roberts-gaal/">linkedin</a> ·
  <a href="https://github.com/xavierrobertsgaal">github</a> ·
  <a href="https://seeingtruly.substack.com/">substack</a>
</footer>
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


def main() -> None:
    DIST.mkdir(exist_ok=True)
    for asset in ASSETS:
        shutil.copy(ROOT / asset, DIST / asset)
    for path in sorted(CONTENT.glob("*.md")):
        meta, body = parse(path.read_text())
        html = markdown.markdown(body, extensions=["extra", "smarty"])
        page = TEMPLATE.replace("{{title}}", meta.get("title", path.stem))
        page = page.replace("{{content}}", html)
        out = DIST / f"{path.stem}.html"
        out.write_text(page)
        print(f"built {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
