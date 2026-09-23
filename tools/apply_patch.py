#!/usr/bin/env python3
"""Apply a patch shipped through the Feedback sheet.

Usage: tools/apply_patch.py <file> <expected-sha256>

<file> holds the pasted "[PATCH <sha> part <i>/<n>] <base64>" rows, in any
order, with any other sheet columns or junk around them. The expected sha256
must come from the person who sent the patch (chat, commit message), not from
the sheet itself — the sheet is publicly writable.
"""

import base64
import hashlib
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROW = re.compile(r"\[PATCH ([0-9a-f]{64}) part (\d+)/(\d+)\] ([A-Za-z0-9+/=]+)")


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__.strip())
    text = Path(sys.argv[1]).read_text()
    expected = sys.argv[2].strip().lower()

    parts = {}
    total = None
    for sha, i, n, b64 in ROW.findall(text):
        if sha != expected:
            continue
        total = int(n)
        parts[int(i)] = b64
    if total is None:
        sys.exit("no rows matching that sha256 found in the file")
    missing = sorted(set(range(1, total + 1)) - set(parts))
    if missing:
        sys.exit(f"missing part(s): {missing} of {total}")

    patch = base64.b64decode("".join(parts[i] for i in range(1, total + 1)))
    actual = hashlib.sha256(patch).hexdigest()
    if actual != expected:
        sys.exit(f"sha mismatch: got {actual} — do not apply")

    with tempfile.NamedTemporaryFile(suffix=".patch", delete=False) as f:
        f.write(patch)
        path = f.name
    print(f"verified {len(patch)} bytes, sha256 ok — applying with git am")
    subprocess.run(["git", "am", path], check=True)


if __name__ == "__main__":
    main()
