#!/usr/bin/env python3
"""Ship local commits to the Feedback sheet as base64 git patches.

Usage: tools/send_patch.py [range]   (default: origin/main..HEAD)

Each chunk lands as a feedback row: "[PATCH <sha256> part <i>/<n>] <base64>".
Apply on the other machine with tools/apply_patch.py. The sheet is publicly
writable, so only apply patches whose sha256 was announced out of band.
"""

import base64
import hashlib
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

CHUNK = 40000  # base64 chars per row; Sheets caps a cell at 50k

ROOT = Path(__file__).resolve().parent.parent


def api_url() -> str:
    app_js = (ROOT / "app.js").read_text()
    m = re.search(r"https://script\.google\.com/macros/s/[\w-]+/exec", app_js)
    if not m:
        sys.exit("no Apps Script URL found in app.js")
    return m.group(0)


def main() -> None:
    rng = sys.argv[1] if len(sys.argv) > 1 else "origin/main..HEAD"
    patch = subprocess.run(
        ["git", "-C", str(ROOT), "format-patch", "--stdout", rng],
        capture_output=True, text=True, check=True,
    ).stdout
    if not patch.strip():
        sys.exit(f"no commits in {rng}")

    sha = hashlib.sha256(patch.encode()).hexdigest()
    b64 = base64.b64encode(patch.encode()).decode()
    parts = [b64[i:i + CHUNK] for i in range(0, len(b64), CHUNK)]
    url = api_url()

    for i, part in enumerate(parts, 1):
        body = json.dumps({
            "username": "patch-bot",
            "kind": "feedback",
            "data": {
                "message": f"[PATCH {sha} part {i}/{len(parts)}] {part}",
                "context": rng,
            },
        }).encode()
        req = urllib.request.Request(
            url, data=body,
            headers={"Content-Type": "text/plain;charset=utf-8"},
        )
        with urllib.request.urlopen(req) as res:
            if res.status != 200:
                sys.exit(f"part {i}/{len(parts)} failed: HTTP {res.status}")
        print(f"sent part {i}/{len(parts)}")

    print(f"\npatch sha256: {sha}")
    print(f"{len(parts)} row(s), {len(patch)} bytes of patch")
    print("apply with: tools/apply_patch.py <file-with-pasted-rows>")


if __name__ == "__main__":
    main()
