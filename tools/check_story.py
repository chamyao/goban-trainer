#!/usr/bin/env python3
"""Check the Three Kingdoms story before it goes anywhere.

    python3 tools/check_story.py              # fast checks on tools/tk_story.py + tk_story_zh.py
    python3 tools/check_story.py --seams      # also print each main scene's end and the next one's start
    python3 tools/check_story.py --build      # also build the maps and cutscenes in a scratch copy
    python3 tools/check_story.py --needs      # write docs/graphics-needs.md: props and characters the story uses that do not exist yet

Fast checks (no build, a second or two):
  - every node's scene exists, every scene is used, edges point at real nodes,
    and every node is reachable from the start
  - every scene has exactly one ["problem"] (the engine plays one per quest)
  - every step is a known step, and every speaker has a voice in CAST
  - every narration, line, scroll, title and boss name card has Chinese in
    tools/tk_story_zh.py, and that file has no duplicate keys
  - "at" in a step is a real node key (a warning when it is another scene's node)

--build copies the working tree into a scratch git worktree, runs
tools/build_tk.py, `mapfactory build` and `mapfactory scenes`, and checks that
every scene that should be a cutscene is one, in the right place (room scenes
in their room). It leaves the working tree alone.

Missing art never fails the check. A prop kind the generator does not know, or a
character kind with no sprite, is a warning here and goes on the --needs list for
the graphics build to draw; the story keeps moving (see docs/three-kingdoms-plan.md).

Exit status is 1 when any check fails, so it can run in CI or before a push.
"""
import argparse
import ast
import re
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"

# Every step the story (and docs/cutscene-format.md) knows. Unknown steps are
# an error: the generator ignores them silently, which hides typos.
STEPS = {
    "n", "say", "spawn", "army", "move", "run", "pose", "fx", "remove", "party", "gain", "lose", "carry", "wait", "scroll",
    "problem", "prop", "board", "unboard", "emote", "give", "surround", "close", "camera", "mood", "light",
    "music", "boss", "victory", "vanish", "still", "crowd",
}
# steps whose 4th/5th fields name a node: [op, id, who?, at, dx, dy]
AT_POS = {"spawn": 3, "army": 4, "move": 2, "run": 2, "fx": 2, "prop": 3, "surround": None, "close": None}
# words in the story text that say what a missing prop kind is, for docs/graphics-needs.md
ALIASES = {"ox": ["ox"], "whitehorse": ["white horse"], "steelbars": ["steel", "iron"], "chest": ["silver"],
           "redbanner": ["banner"], "yellowbanner": ["banner"], "bucket": ["blood"], "staves": ["staves"],
           "straw": ["straw"], "waterbowl": ["water"], "jiazi": ["jiazi"], "book": ["books"], "letter": ["letter"],
           "cart": ["cart"], "post": ["post"], "switches": ["switches", "willow"], "seal": ["seal"]}
ARMY_KINDS = {"militia", "rebel", "horse"}      # kinds the generator draws as armies, besides folk and cast ids
ROLES = {"main", "side", "short", "boss"}
TRIGGERS = {"near", "arrive", "talk"}


def load(name):
    path = TOOLS / f"{name}.py"
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(TOOLS))
    spec.loader.exec_module(mod)
    return mod


def duplicate_keys(path, var="ZH"):
    """Keys that appear twice in a dict literal (Python keeps the last one silently)."""
    tree = ast.parse(Path(path).read_text())
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(getattr(t, "id", None) == var for t in node.targets) \
                and isinstance(node.value, ast.Dict):
            seen, dup = set(), set()
            for k in node.value.keys:
                if isinstance(k, ast.Constant):
                    (dup if k.value in seen else seen).add(k.value)
            return sorted(dup)
    return []


def text_lines(steps):
    """(kind, text) for every string the player reads or hears."""
    for st in steps:
        if st[0] in ("n", "say"):
            yield st[0], st[-1]
        elif st[0] == "scroll":
            yield "scroll title", st[1]
            for p in st[2]:
                yield "scroll", p


def known_folk_kinds():
    """Folk kinds drawn by the map factory's vocabulary (so a spawn of f_<kind> has art)."""
    try:
        text = (TOOLS / "mapfactory" / "vocab.py").read_text()
    except OSError:
        return set()
    return set(re.findall(r"folk\.([a-z_]+)", text))


def drawn_characters():
    """Character ids the game draws (TK_CHARS entries in tk.js and tk-town.js)."""
    ids = set()
    for f in ("tk.js", "tk-town.js"):
        try:
            ids |= set(re.findall(r"\b([a-z][a-z0-9_]*)\s*:\s*\{\s*name:", (ROOT / f).read_text()))
        except OSError:
            pass
    return ids


def known_props():
    """Prop kinds the scene generator knows (PROPS in tools/mapfactory/scenes.py), or None if unreadable."""
    try:
        tree = ast.parse((TOOLS / "mapfactory" / "scenes.py").read_text())
    except (OSError, SyntaxError):
        return None
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(getattr(t, "id", None) == "PROPS" for t in node.targets) \
                and isinstance(node.value, ast.Dict):
            return {k.value for k in node.value.keys if isinstance(k, ast.Constant)}
    return None


def check_world(w, ZH, CAST, errors, warnings, needs=None, folk=None):
    name = f"World {w['n']}"
    nodes = {n["key"]: n for n in w["nodes"]}
    if len(nodes) != len(w["nodes"]):
        errors.append(f"{name}: duplicate node keys")
    for a, b in w["edges"]:
        for k in (a, b):
            if k not in nodes:
                errors.append(f"{name}: edge ({a}, {b}) names unknown node {k!r}")

    # reachability from the first node
    adj = {k: [] for k in nodes}
    for a, b in w["edges"]:
        if a in adj and b in nodes:
            adj[a].append(b)
    start = w["nodes"][0]["key"]
    seen, q = {start}, deque([start])
    while q:
        for m in adj[q.popleft()]:
            if m not in seen:
                seen.add(m)
                q.append(m)
    for k in nodes:
        if k not in seen:
            errors.append(f"{name}: node {k!r} is not reachable from {start!r}")

    scenes = w["scenes"]
    used = {}
    for k, n in nodes.items():
        sc = n.get("scene")
        if sc:
            if sc not in scenes:
                errors.append(f"{name}: node {k!r} names scene {sc!r}, which does not exist")
            used.setdefault(sc, []).append(k)
        if n.get("role") not in ROLES and n.get("role") is not None:
            errors.append(f"{name}: node {k!r} has role {n['role']!r}")
        if n.get("trigger") not in TRIGGERS | {None}:
            errors.append(f"{name}: node {k!r} has trigger {n['trigger']!r}")
        if n.get("room") and not n.get("place"):
            errors.append(f"{name}: node {k!r} has a room but no place")
        for g in n.get("gate", []):   # a gated battle: defeat scenes (no board) until its needs hold
            if g.get("else") not in scenes:
                errors.append(f"{name}: node {k!r} gate names scene {g.get('else')!r}, which does not exist")
            for c in (g.get("needs") if isinstance(g.get("needs"), list) else [g.get("needs")]):
                if not isinstance(c, str) or c.split(":")[0] not in ("node", "item", "mark"):
                    errors.append(f"{name}: node {k!r} gate condition {c!r} is not node:/item:/mark:")
    for sc, ks in used.items():
        if len(ks) > 1:
            errors.append(f"{name}: scene {sc!r} is on several nodes: {ks}")
    gate_scenes = {g.get("else") for n in nodes.values() for g in n.get("gate", [])}   # played by a gate, not by a node
    for sc in scenes:
        if sc not in used and sc not in gate_scenes:
            warnings.append(f"{name}: scene {sc!r} is not on any node")

    props = known_props()

    def need(kind, what, where, steps):
        if needs is None:
            return
        n = needs.setdefault((what, kind), {"scenes": [], "lines": []})
        if where not in n["scenes"]:
            n["scenes"].append(where)
            lines = [t for k, t in text_lines(steps) if k in ("n", "say")]
            words = ALIASES.get(kind, [kind])
            hit = [t for t in lines if any(w in t.lower() for w in words)]
            n["lines"].extend((hit or lines)[:1])

    def scan(steps, where, own_node=None, need_problem=False):
        # a still stays up only through lines, waits and music (tk-cutscene.js): one followed straight
        # by a spawn or a move is hidden at once and never seen
        for i, st in enumerate(steps):
            if st[0] != "still":
                continue
            seen = 0
            for nx in steps[i + 1:]:
                if nx[0] in ("n", "say"):
                    seen += 1
                elif nx[0] not in ("wait", "music", "together"):
                    break
            if not seen:
                warnings.append(f"{name}: {where}: still {st[1]!r} is hidden at once (no line before the next {nx[0] if i + 1 < len(steps) else 'end'!r})")
        problems = [s for s in steps if s[0] == "problem"]
        if need_problem and not problems:   # several are fine: posed in turn, each kept on its own (NODE~2, …)
            errors.append(f"{name}: {where} has no problem (needs at least 1)")
        for st in steps:
            op = st[0]
            if op not in STEPS:
                errors.append(f"{name}: {where} uses unknown step {op!r}")
                continue
            if op == "party" and len(st) > 2 and not isinstance((st[2] or {}).get("to"), dict) \
                    and (st[2] or {}).get("to") not in {n["key"] for n in w["nodes"]}:
                errors.append(f"{name}: {where}: handoff to {(st[2] or {}).get('to')!r}, which is no node")
            if op == "party" and len(st) > 2 and isinstance((st[2] or {}).get("to"), dict) \
                    and st[2]["to"].get("place") not in {n.get("place") for n in w["nodes"]}:
                errors.append(f"{name}: {where}: handoff to place {st[2]['to'].get('place')!r}, which the story never visits")
            if op == "say" and st[1] not in CAST:
                errors.append(f"{name}: {where}: speaker {st[1]!r} has no voice in CAST")
            if op == "problem" and len(st) > 1 and st[1] not in CAST:
                errors.append(f"{name}: {where}: problem setter {st[1]!r} has no voice in CAST")
            if op == "prop" and props is not None and st[2] not in props:
                need(st[2], "prop", where, steps)
            if op in ("spawn", "army") and isinstance(st[2], str) and st[2] not in CAST and st[2] not in ARMY_KINDS \
                    and not (st[2].startswith("f_") and (("folk." + st[2][2:]) in (folk or {}) or st[2][2:] in known_folk_kinds())) \
                    and st[2] not in drawn_characters():
                need(st[2], "character", where, steps)
            idx = AT_POS.get(op)
            if idx is not None and len(st) > idx and isinstance(st[idx], str):
                at = st[idx]
                if at not in nodes:
                    errors.append(f"{name}: {where}: {op} at unknown node {at!r}")
                elif own_node and at != own_node:
                    warnings.append(f"{name}: {where}: {op} at {at!r}, not this scene's node {own_node!r}")
        for kind, t in text_lines(steps):
            if t not in ZH:
                errors.append(f"{name}: {where}: no Chinese for {kind}: {t[:70]!r}")

    # scenes with no board: a node's with "board": False, and every gate's defeat scene
    boardless = {n["scene"] for n in nodes.values() if n.get("board") is False and n.get("scene")}
    boardless |= {g.get("else") for n in nodes.values() for g in n.get("gate", [])}
    for sc, body in scenes.items():
        own = used.get(sc, [None])[0]
        attached = sc in used and sc not in boardless
        scan(body["steps"], f"scene {sc!r}", own, need_problem=attached)
        if body["title"] not in ZH:
            errors.append(f"{name}: scene {sc!r}: no Chinese for title {body['title']!r}")
    scan(w.get("opening", []), "opening")
    scan(w.get("closing", []), "closing")

    for k, n in nodes.items():
        b = n.get("boss")
        if b:
            if b.get("taunt") and b["taunt"] not in ZH:
                errors.append(f"{name}: boss {k!r}: no Chinese for taunt: {b['taunt'][:70]!r}")
            # the name card shows the English name and title side by side, each looked up on its own
            for part in [p.strip() for p in b.get("title", "").split(",", 1) if p.strip()]:
                if part not in ZH:
                    errors.append(f"{name}: boss {k!r}: no Chinese for name card part {part!r}")
    for key, it in w.get("items", {}).items():
        if "zh" not in it:
            errors.append(f"{name}: item {key!r} has no zh name")
    return nodes, used


def seams(w):
    """Print each main-road scene's last line and the next scene's first line, to read for gaps."""
    nodes = {n["key"]: n for n in w["nodes"]}
    order, seen = [], set()
    adj = {}
    for a, b in w["edges"]:
        adj.setdefault(a, []).append(b)
    def next_main(k):
        """The nearest main or boss node after k, going through side and shortcut roads if need be."""
        q, visited = deque(adj.get(k, [])), set()
        while q:
            m = q.popleft()
            if m in visited:
                continue
            visited.add(m)
            if nodes[m].get("role") in ("main", "boss"):
                return m
            q.extend(adj.get(m, []))
        return None

    k = w["nodes"][0]["key"]
    while k and k not in seen:
        seen.add(k)
        order.append(k)
        k = next_main(k)

    def first_last(sc):
        lines = [s for s in sc["steps"] if s[0] in ("n", "say")]
        return (lines[0][-1] if lines else ""), (lines[-1][-1] if lines else "")

    prev = None
    for k in order:
        sc = w["scenes"].get(nodes[k].get("scene"))
        if not sc:
            continue
        first, last = first_last(sc)
        if prev:
            print(f"   ... {prev[:110]}")
        print(f"{k:>5}  {sc['title']}\n       starts: {first[:110]}")
        prev = last
    closing = [s for s in w.get("closing", []) if s[0] in ("n", "say")]
    if prev and closing:
        print(f"   ... {prev[:110]}\n closing  starts: {closing[0][-1][:110]}")


def build_check(w, nodes, used, errors):
    """Build maps and cutscenes in a scratch worktree with the working-tree story files overlaid."""
    tmp = Path(tempfile.mkdtemp(prefix="check_story_"))
    wt = tmp / "wt"
    try:
        subprocess.run(["git", "-C", str(ROOT), "worktree", "add", "-q", "--detach", str(wt), "HEAD"], check=True)
        changed = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-m", "-o", "--exclude-standard"],
                                 capture_output=True, text=True, check=True).stdout.split()
        for f in changed:
            src = ROOT / f
            if src.is_file():
                (wt / f).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, wt / f)
        for label, cmd in [("build_tk", ["tools/build_tk.py"]),
                           ("mapfactory build", ["tools/mapfactory", "build", "--world", str(w["n"])]),
                           ("mapfactory scenes", ["tools/mapfactory", "scenes", "--world", str(w["n"])])]:
            r = subprocess.run([sys.executable, *cmd], cwd=wt, capture_output=True, text=True)
            if r.returncode != 0:
                tail = (r.stdout + r.stderr).strip().splitlines()[-3:]
                errors.append(f"{label} failed: " + " | ".join(tail))
                if "KeyError" in " ".join(tail):
                    errors.append("  (a KeyError in scenes.py is usually a prop kind the generator does not know yet; "
                                  "see the warnings above or run --needs, and ask Graphics for the placeholder fallback)")
                return
        out = wt / f"data/tk_maps/w{w['n']}"
        cuts = json.loads((out / "cutscenes.json").read_text())["scenes"]
        region = json.loads((out / "region.json").read_text())
        pid = {p["id"] for p in region["places"]}
        for sc, ks in used.items():
            n = nodes[ks[0]]
            if sc not in cuts:
                errors.append(f"build: scene {sc!r} did not become a cutscene")
                continue
            place = cuts[sc]["place"]
            if place not in pid:
                errors.append(f"build: scene {sc!r} is staged in unknown place {place!r}")
            if n.get("room") and "--" not in place:
                errors.append(f"build: scene {sc!r} should play in room {n['room']!r}, but plays in {place!r}")
        print(f"build ok: {len(cuts)} cutscenes, {len(pid)} places")
    except subprocess.CalledProcessError as e:
        errors.append(f"build: could not make the scratch worktree: {e}")
    finally:
        subprocess.run(["git", "-C", str(ROOT), "worktree", "remove", "--force", str(wt)], capture_output=True)
        shutil.rmtree(tmp, ignore_errors=True)


def write_needs(needs, story):
    """docs/graphics-needs.md: what the story uses that the graphics build does not have yet."""
    titles = {sc: body["title"] for w in story.WORLDS for sc, body in w["scenes"].items()}
    out = ["# Graphics needs",
           "",
           "Generated by `python3 tools/check_story.py --needs`. Do not edit by hand.",
           "",
           "Props and characters the story uses that the scene generator or the character art does not have yet.",
           "The story is never blocked on these: a missing prop is drawn as a placeholder (once the generator",
           "fallback is in) and a missing character falls back to a folk stand-in. Draw the real thing, register",
           "it, and it drops off this list the next time the script runs.",
           ""]
    if not needs:
        out.append("Nothing is missing.")
    for what in ("prop", "character"):
        rows = sorted((k, n) for (w_, k), n in needs.items() if w_ == what)
        if not rows:
            continue
        out += [f"## {what.capitalize()}s", "", "| Kind | Used in | What the text says |", "|---|---|---|"]
        for k, n in rows:
            scenes = "; ".join(titles.get(sc, sc) for sc in n["scenes"])
            lines = " ".join(n["lines"][:2]).replace("|", "/")
            out.append(f"| `{k}` | {scenes} | {lines[:200]} |")
        out.append("")
    (ROOT / "docs" / "graphics-needs.md").write_text("\n".join(out) + "\n")
    print(f"wrote docs/graphics-needs.md ({len(needs)} kinds)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seams", action="store_true", help="print each main scene's start against the previous end")
    ap.add_argument("--build", action="store_true", help="build maps and cutscenes in a scratch worktree")
    ap.add_argument("--needs", action="store_true", help="write docs/graphics-needs.md")
    ap.add_argument("--world", type=int, help="check one world (default: all)")
    args = ap.parse_args()

    story, zh = load("tk_story"), load("tk_story_zh")
    errors, warnings = [], []
    dup = duplicate_keys(TOOLS / "tk_story_zh.py")
    for k in dup:
        errors.append(f"tk_story_zh.py: duplicate ZH key {str(k)[:80]!r}")
    for k, v in zh.ZH.items():
        if not str(v).strip():
            errors.append(f"tk_story_zh.py: empty Chinese for {str(k)[:80]!r}")

    needs = {}
    for w in story.WORLDS:
        if args.world and w["n"] != args.world:
            continue
        nodes, used = check_world(w, zh.ZH, zh.CAST, errors, warnings, needs, zh.FOLK_VOICE)
        if args.seams:
            print(f"\n== World {w['n']}: {w['name']} ==")
            seams(w)
        if args.build:
            build_check(w, nodes, used, errors)

    for (what, kind), n in sorted(needs.items()):
        warnings.append(f"needs art: {what} {kind!r}, used in {', '.join(n['scenes'])}")
    if args.needs:
        write_needs(needs, story)
    for m in warnings:
        print("warning:", m)
    for m in errors:
        print("ERROR:", m)
    n = sum(len(w["scenes"]) for w in story.WORLDS if not args.world or w["n"] == args.world)
    print(f"{n} scenes checked: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
