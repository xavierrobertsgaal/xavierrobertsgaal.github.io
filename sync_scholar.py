# /// script
# requires-python = ">=3.11"
# dependencies = ["scholarly"]
# ///
"""Check Google Scholar for publications missing from content/publications.md.

Prints missing entries as formatted markdown; pass --write to also append
them under the matching year heading. Run with: uv run sync_scholar.py
Google Scholar blocks data-center IPs, so run this locally, not in CI.
"""

import re
import sys
from pathlib import Path

from scholarly import scholarly

SCHOLAR_ID = "VwvXaLEAAAAJ"
MY_SURNAME = "Roberts-Gaal"
PUBS_MD = Path(__file__).parent / "content" / "publications.md"


def normalize(title: str) -> str:
    return re.sub(r"[^a-z0-9]", "", title.lower())


def format_author(full_name: str) -> str:
    """'Xavier Roberts-Gaal' -> 'Roberts-Gaal, X.', bolding my own name."""
    parts = full_name.strip().split()
    surname = parts[-1]
    initials = " ".join(f"{p[0]}." for p in parts[:-1])
    cite = f"{surname}, {initials}" if initials else surname
    return f"**{cite}**" if surname == MY_SURNAME else cite


def format_entry(pub: dict) -> str:
    bib = pub["bib"]
    authors = [format_author(a) for a in bib.get("author", "").split(" and ")]
    if len(authors) > 1:
        author_str = ", ".join(authors[:-1]) + ", & " + authors[-1]
    else:
        author_str = authors[0] if authors else ""
    year = bib.get("pub_year", "n.d.")
    title = bib.get("title", "Untitled")
    url = pub.get("pub_url", "")
    title_md = f"[{title}]({url})" if url else title
    venue = bib.get("citation", "") or bib.get("venue", "")
    venue_md = f" *{venue}*." if venue else ""
    return f"- {author_str} ({year}). {title_md}.{venue_md}"


def main() -> None:
    existing = normalize(PUBS_MD.read_text())
    print(f"fetching scholar profile {SCHOLAR_ID}...")
    author = scholarly.fill(
        scholarly.search_author_id(SCHOLAR_ID), sections=["publications"]
    )
    missing = []
    for pub in author["publications"]:
        title = pub["bib"]["title"]
        if normalize(title) not in existing:
            missing.append(scholarly.fill(pub))
            print(f"  missing: {title}")
    if not missing:
        print("publications.md is up to date with google scholar.")
        return

    entries = [format_entry(pub) for pub in missing]
    print("\n" + "\n".join(entries))

    if "--write" in sys.argv:
        # New Scholar items are almost always preprints: file them under
        # working papers; move and tag them by hand afterwards.
        text = PUBS_MD.read_text()
        heading = "## working papers"
        idx = text.index(heading) + len(heading)
        text = text[:idx] + "\n\n" + "\n".join(entries) + text[idx:]
        PUBS_MD.write_text(text)
        n = len(entries)
        print(f"\nappended {n} entr{'y' if n == 1 else 'ies'} under '{heading}' — add tags and reorder as needed")
    else:
        print("\n(dry run — pass --write to append these to publications.md)")


if __name__ == "__main__":
    main()
