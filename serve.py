# /// script
# requires-python = ">=3.11"
# dependencies = ["markdown", "livereload"]
# ///
"""Local dev server with live reload. Run with: uv run serve.py

Builds dist/ once, then rebuilds and refreshes the browser whenever content,
styling, the build script, or client JS changes. Serves at http://localhost:5500.
"""

import importlib

from livereload import Server

import build

ROOT = build.ROOT


def rebuild() -> None:
    # Reload so edits to build.py (template, nav, logic) take effect live too,
    # not just content and styling.
    importlib.reload(build)
    build.main()


if __name__ == "__main__":
    rebuild()  # build once before serving
    server = Server()
    for pattern in ("content/*.md", "style.css", "script.js", "fishbowl.js", "build.py"):
        server.watch(str(ROOT / pattern), rebuild)
    print("serving http://localhost:5500  (Ctrl-C to stop)")
    server.serve(root=str(build.DIST), port=5500, host="localhost", open_url_delay=None)
