#!/usr/bin/env python3
"""Decode the Notes site's files from the "Notes" folder in Google Drive, without the site.

Download the folder from Drive (right-click > Download), unzip it, then:

    pip install cryptography
    python3 decode.py path/to/Notes            # asks for the password
    -> writes notes.json (every day and note, readable) and photos/ next to it

How the files are made (app.js):
  lock.json   {"salt": base64, "check": ...}  the salt for the password
  key         PBKDF2-HMAC-SHA256(password, salt, 310000 rounds, 64 bytes); the first 32 bytes are the AES-256-GCM key
  notes.enc   base64( 12-byte IV + AES-GCM ciphertext ) of a JSON object:
                "d:YYYY-MM-DD" a day, "n:<id>" a note -> {"t": text, "u": last change (ms), "p": [photo ids],
                "n": name given with *name, "a": archived}
  p-<id>      32 bytes: the image type (e.g. "image/jpeg", padded with spaces), then 12-byte IV + AES-GCM ciphertext
"""
import base64, getpass, hashlib, json, os, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else "."
    lock = json.load(open(os.path.join(folder, "lock.json")))
    password = getpass.getpass("Password: ")
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), base64.b64decode(lock["salt"]), 310000, 64)[:32]
    aes = AESGCM(key)
    unseal = lambda b: aes.decrypt(b[:12], b[12:], None)
    try:
        if unseal(base64.b64decode(lock["check"])) != b"notes-ok":
            raise ValueError
    except Exception:
        sys.exit("Wrong password.")

    notes = json.loads(unseal(base64.b64decode(open(os.path.join(folder, "notes.enc")).read())))
    out = os.path.join(folder, "notes.json")
    json.dump(dict(sorted(notes.items())), open(out, "w"), indent=2, ensure_ascii=False)
    print("wrote", out, f"({len(notes)} days and notes)")

    photos = os.path.join(folder, "photos"); n = 0
    for name in os.listdir(folder):
        if not name.startswith("p-"):
            continue
        raw = open(os.path.join(folder, name), "rb").read()
        kind = raw[:32].decode().strip()
        ext = {"image/png": ".png", "image/gif": ".gif", "image/webp": ".webp", "image/heic": ".heic"}.get(kind, ".jpg")
        os.makedirs(photos, exist_ok=True)
        open(os.path.join(photos, name[2:] + ext), "wb").write(unseal(raw[32:]))
        n += 1
    if n:
        print("wrote", n, "photos to", photos)


if __name__ == "__main__":
    main()
