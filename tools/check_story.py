#!/usr/bin/env python3
"""Check the Three Kingdoms story before it goes anywhere.

    python3 tools/check_story.py              # fast checks on tools/tk_story.py + tk_story_zh.py
    python3 tools/check_story.py --seams      # also print each main scene's end and the next one's start
    python3 tools/check_story.py --build      # also build the maps and cutscenes in a scratch copy

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

Exit status is 1 when any check fails, so it can run in CI or before a push.
"""
import argparse
import ast
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
    "n", "say", "spawn", "army", "move", "run", "pose", "fx", "remove", "party", "gain", "wait", "scroll",
    "problem", "prop", "board", "unboard", "emote", "give", "surround", "close", "camera", "mood", "light",
    "music", "boss", "victory",
}
# steps whose 4th/5th fields name a node: [op, id, who?, at, dx, dy]
AT_POS = {"spawn": 3, "army": 4, "move": 2, "run": 2, "fx": 2, "prop": 3, "surround": None, "close": None}
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


def check_world(w, ZH, CAST, errors, warnings):
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
    for sc, ks in used.items():
        if len(ks) > 1:
            errors.append(f"{name}: scene {sc!r} is on several nodes: {ks}")
    for sc in scenes:
        if sc not in used:
            warnings.append(f"{name}: scene {sc!r} is not on any node")

    def scan(steps, where, own_node=None, need_problem=False):
        problems = [s for s in steps if s[0] == "problem"]
        if need_problem and len(problems) != 1:
            errors.append(f"{name}: {where} has {len(problems)} problems (needs exactly 1)")
        for st in steps:
            op = st[0]
            if op not in STEPS:
                errors.append(f"{name}: {where} uses unknown step {op!r}")
                continue
            if op == "say" and st[1] not in CAST:
                errors.append(f"{name}: {where}: speaker {st[1]!r} has no voice in CAST")
            if op == "problem" and len(st) > 1 and st[1] not in CAST:
                errors.append(f"{name}: {where}: problem setter {st[1]!r} has no voice in CAST")
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

    for sc, body in scenes.items():
        own = used.get(sc, [None])[0]
        attached = sc in used
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


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seams", action="store_true", help="print each main scene's start against the previous end")
    ap.add_argument("--build", action="store_true", help="build maps and cutscenes in a scratch worktree")
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

    for w in story.WORLDS:
        if args.world and w["n"] != args.world:
            continue
        nodes, used = check_world(w, zh.ZH, zh.CAST, errors, warnings)
        if args.seams:
            print(f"\n== World {w['n']}: {w['name']} ==")
            seams(w)
        if args.build:
            build_check(w, nodes, used, errors)

    for m in warnings:
        print("warning:", m)
    for m in errors:
        print("ERROR:", m)
    n = sum(len(w["scenes"]) for w in story.WORLDS if not args.world or w["n"] == args.world)
    print(f"{n} scenes checked: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
