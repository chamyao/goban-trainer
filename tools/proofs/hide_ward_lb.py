# Book 14 prologue (x0b) proof at the engine's hide-and-wait rules. Lady Yan walks on foot (110 px/s) from Lü Bu's
# door to Pang Shu's. The looters walk their beats at 30 px/s and see their cone (in tiles) down a 55-degree
# half-cone, and walls stop sight. In a cover (the spot's 2x2 tiles, padded 4 px), standing still, she is unseen.
# Covers and ways in are read from the built map; every way in is a cover (plans.entry_covers).
#
# Worked backwards in time: for every tile and every moment, the fastest unseen way from there to Pang Shu's door,
# with waits. It proves:
#   - with cover, there is a way through, and it's quick (the fastest from her door);
#   - without cover there is none (or only a slow one), so hiding is the point;
#   - from every cover, whatever moment she gets there, all her waiting on the way is short (Testing: no cover
#     should hold her for most of a minute). The worst ride minus the best ride, at any arrival in a 60 s window.
import sys, math, json, copy; sys.path[:0] = ['tools', 'tools/mapfactory']
import plans
P, tables, zh = plans.load("lb")
T = 16; dt = T / 110.0
built = json.load(open("data/tk_maps/w14/changan--burning-ward.map.json"))
covers = {s["id"]: (s["x"], s["y"]) for s in built["spots"] if s.get("cover")}
spot = {s["id"]: (s["x"], s["y"]) for s in built["spots"]}
MAX_WAIT = 22   # s: all the waiting from any cover to the door, at the worst moment to arrive


def run(watchers, horizon=150, arrive=60, verbose=False, nocover=False):
    plan = copy.deepcopy(P["Chang'an"]["maps"]["burning-ward"]); plan["watchers"] = watchers
    mb = plans.MapBuilder(14, "w", "w", plan, tables, 1, "w", "compound"); mb.build({"plan": plan}, [], [], [])
    opaque = lambda t: not (0 <= t[0] < mb.W and 0 <= t[1] < mb.H) or not mb.walkable(t)
    def in_cover(tile):
        px, py = (tile[0] + .5) * T, (tile[1] + .9) * T - 3
        for cx, cy in covers.values():
            x0, y0 = (cx - 1) * T - 4, (cy - 1.5) * T - 4
            if x0 <= px <= x0 + 2 * T + 8 and y0 <= py <= y0 + 2 * T + 8: return True
        return False
    ws = []
    for w in watchers:
        out = plans.MapBuilder.watch(mb, w)
        ws.append(([(x * T, y * T) for x, y in out["beat"]], out["cone"] * T, out.get("pause")))
    def guard_at(pts, pz, t):
        x, y = pts[0]; d0 = "down"; leg = 0; tt = 0.0; v = 30.0
        for _ in range(10000):
            tx, ty = pts[leg]; dx, dy = tx - x, ty - y; d = math.hypot(dx, dy)
            if d > 0:
                dr = ("left" if dx < 0 else "right") if abs(dx) > abs(dy) else ("up" if dy < 0 else "down")
                if tt + d / v >= t:
                    f = (t - tt) * v / d; return x + dx * f, y + dy * f, dr
                tt += d / v; d0 = dr; x, y = tx, ty
            if pz and abs(tx / T - pz[0]) < .01 and abs(ty / T - pz[1]) < .01:
                if tt + pz[2] >= t: return x, y, d0
                tt += pz[2]
            leg = (leg + 1) % len(pts)
    free = [(x, y) for y in range(mb.H) for x in range(mb.W) if not opaque((x, y))]
    H = int(horizon / dt)
    cos55 = math.cos(math.pi * 55 / 180)
    vis_cache = {}
    def visible_from(ex, ey, R, gd):
        key = (int(ex), int(ey), gd, R)
        if key in vis_cache: return vis_cache[key]
        fx, fy = {"up": (0, -1), "down": (0, 1), "left": (-1, 0), "right": (1, 0)}[gd]
        out = set()
        for (x, y) in free:
            px, py = (x + .5) * T, (y + .9) * T
            dx, dy = px - ex, py - 6 - ey; d = math.hypot(dx, dy)
            if d > R: continue
            if (dx * fx + dy * fy) / (d or 1) < cos55: continue
            n = int(d / 4) + 1
            if not any(opaque((int((ex + dx * k / n) // T), int((ey + dy * k / n) // T))) for k in range(1, n)):
                out.add((x, y))
        vis_cache[key] = out; return out
    seen = []
    for k in range(H):
        s = set()
        for pts, R, pz in ws:
            gx, gy, gd = guard_at(pts, pz, k * dt)
            s |= visible_from(gx, gy - 6, R, gd)
        seen.append(s)
    cov = set() if nocover else {t for t in free if in_cover(t)}
    gx, gy = spot["pangshu-gate"]
    goal = {t for t in free if math.hypot((t[0] + .5) * T - gx * T, (t[1] + .9) * T - gy * T) <= 36}
    INF = 10 ** 9
    # ttg[k][tile]: steps to the goal from tile at step k (moving or waiting), never seen
    nxt = {t: (0 if t in goal else INF) for t in free}
    ttg = [None] * H; ttg[H - 1] = nxt
    for k in range(H - 2, -1, -1):
        cur = {}
        sk1 = seen[k + 1]
        for t in free:
            if t in goal: cur[t] = 0; continue
            best = INF
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (0, 0)):
                u = (t[0] + dx, t[1] + dy)
                v = nxt.get(u)
                if v is None or v >= best: continue
                still = (dx, dy) == (0, 0)
                if u in sk1 and not (still and u in cov): continue
                best = v + 1
            cur[t] = best
        ttg[k] = cur; nxt = cur
    # from each cover: for every arrival step in [0, arrive) s, the ride to the goal (s), from the cover's own tile
    res = {}
    for cid, (cx, cy) in covers.items():
        t = (int(cx), int(cy))
        if t not in ttg[0]: res[cid] = None; continue
        rides = [ttg[k][t] * dt if ttg[k][t] < INF else None for k in range(0, int(arrive / dt))]
        res[cid] = (min(r for r in rides if r) if any(rides) else None, max(r if r else 999 for r in rides))
    return res

if __name__ == "__main__":
    W = P["Chang'an"]["maps"]["burning-ward"]["watchers"]
    r, nc = run(W), run(W, nocover=True)
    fastest, without = r["cover-way-start"][0], nc["cover-way-start"][0]
    print(f"fastest way from her door: {fastest:.1f} s; without cover: {'none' if without is None else f'{without:.1f} s'}")
    worst = 0
    for k, v in r.items():
        if k.endswith("pangshu-house"): continue
        best, slow = v; wait = slow - best
        worst = max(worst, wait)
        print(f"  {k:32s} fastest {best:5.1f} s, at the worst moment {slow:5.1f} s: waiting at most {wait:4.1f} s")
    print(f"worst waiting from any cover: {worst:.1f} s (limit {MAX_WAIT} s)")
    assert fastest < 30 and (without is None or without >= 45) and worst <= MAX_WAIT
