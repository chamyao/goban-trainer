# The in-game feedback inbox: reads the Goban sheet (a Drive .ods export, as the Drive connector saves it) and
# prints the Feedback rows newer than a timestamp, one JSON line each. Used by the hourly feedback routine.
# usage: python3 -I tools/feedback_inbox.py <drive download json> [since-iso]
import sys, json, base64, zipfile, io, xml.etree.ElementTree as ET
d = json.load(open(sys.argv[1])); since = sys.argv[2] if len(sys.argv) > 2 else ""
z = zipfile.ZipFile(io.BytesIO(base64.b64decode(d["content"])))
ns = {"table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0", "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0"}
root = ET.fromstring(z.read("content.xml"))
T = "{urn:oasis:names:tc:opendocument:xmlns:table:1.0}"
for t in root.iter(T + "table"):
    if t.get(T + "name") != "Feedback": continue
    for r in t.iter(T + "table-row"):
        cells = []
        for c in r.findall(T + "table-cell"):
            txt = "\n".join("".join(p.itertext()) for p in c.findall("text:p", ns))
            cells += [txt] * int(c.get(T + "number-columns-repeated", "1") if txt else 1)
        if cells and cells[0][:2] == "20" and cells[0] > since:
            print(json.dumps({"ts": cells[0], "user": cells[1] if len(cells) > 1 else "", "msg": cells[2] if len(cells) > 2 else "", "ctx": cells[3] if len(cells) > 3 else ""}, ensure_ascii=False))
