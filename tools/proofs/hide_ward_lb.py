# Book 14 prologue (x0b) proof at the engine's hide-and-wait rules: Lady Yan on foot (110 px/s) from Lü Bu's gate to Pang
# Shu's door; looters walk their beats at 30 px/s and see 12 tiles down a 55-degree half-cone; walls stop sight; in a
# cover (the spot's 2x2 tiles, padded 4 px) and still, she's unseen. Counts the hides a way needs.
import sys, math, itertools; sys.path[:0] = ['tools', 'tools/mapfactory']
import plans
P, tables, zh = plans.load("lb"); b = {"plan": P["Chang'an"]["maps"]["burning-ward"]}
mb = plans.MapBuilder(14, "changan--burning-ward", "changan--burning-ward", b["plan"], tables, 1, "The burning ward", "compound"); mb.build(b, [], [], [])
T = 16
spot = {s["id"]: (s["x"], s["y"]) for s in mb.spots}
covers = {s["id"]: (s["x"], s["y"]) for s in mb.spots if s.get("cover")}
def in_cover(tile, ids):
    px, py = (tile[0] + .5) * T, (tile[1] + .9) * T - 3
    for c in ids:
        cx, cy = covers[c]; x0, y0 = (cx - 1) * T - 4, (cy - 1.5) * T - 4
        if x0 <= px <= x0 + 2 * T + 8 and y0 <= py <= y0 + 2 * T + 8: return True
    return False
opaque = lambda t: not (0 <= t[0] < mb.W and 0 <= t[1] < mb.H) or not mb.walkable(t)
ws = []
for w in b["plan"]["watchers"]:
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
def sees(g, R, px, py):
    gx, gy, gd = g; ex, ey = gx, gy - 6; dx, dy = px - ex, py - 6 - ey; d = math.hypot(dx, dy)
    if d > R: return False
    fx, fy = {"up": (0, -1), "down": (0, 1), "left": (-1, 0), "right": (1, 0)}[gd]
    if (dx * fx + dy * fy) / (d or 1) < math.cos(math.pi * 55 / 180): return False
    n = int(d / 4) + 1
    return not any(opaque((int((ex + dx * k / n) // T), int((ey + dy * k / n) // T))) for k in range(1, n))
dt = T / 110.0; H = int(90 / dt)
start = (int(spot["lb-door"][0]), int(spot["lb-door"][1])); gx, gy = spot["pangshu-gate"]
goal = lambda t: math.hypot((t[0] + .5) * T - gx * T, (t[1] + .9) * T - gy * T) <= 36
G = [[guard_at(p, pz, k * dt) for k in range(H)] for p, R, pz in ws]
Rs = [R for p, R, pz in ws]
def seen(tile, k, still, ids):
    if still and in_cover(tile, ids): return False
    px, py = (tile[0] + .5) * T, (tile[1] + .9) * T
    return any(sees(G[i][k], Rs[i], px, py) for i in range(len(ws)))
def ride(ids):
    layer = {start}
    for k in range(1, H):
        nxt = set()
        for tile in layer:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (0, 0)):
                u = (tile[0] + dx, tile[1] + dy)
                if u in nxt or opaque(u): continue
                if not seen(u, k, (dx, dy) == (0, 0), ids):
                    if goal(u): return round(k * dt, 1)
                    nxt.add(u)
        layer = nxt
        if not layer: return None
    return None
print("start seen at t=0:", seen(start, 0, True, []))
print("covers:", list(covers))
print("no cover:", ride([]))
for c in covers: print("only", c, ":", ride([c]))
print("all covers:", ride(list(covers)))
