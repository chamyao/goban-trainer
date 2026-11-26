import json, sys, collections
rs = [json.loads(l) for l in open(sys.argv[1])]
T = {r["i"]: r for r in rs if r["net"] == "b18-teacher"}
agg = collections.defaultdict(list)
for r in rs:
    if r["net"] == "b18-teacher" or r["i"] not in T: continue
    t = T[r["i"]]; e = abs(r["score"] - t["score"])
    pts = [(a, b) for a, b in zip(r["own"], t["own"]) if abs(b) > 0.6]
    agree = sum((a > 0) == (b > 0) for a, b in pts) / max(1, len(pts))
    for k in (r["st"], "all"): agg[(r["net"], k)].append((e, agree))
print(f"{'net':10s} {'stage':>6s} {'n':>3s} {'mean |err|':>10s} {'>5 pts':>7s} {'>10 pts':>7s} {'owner agree':>11s}")
for (net, st), v in sorted(agg.items(), key=lambda x: (x[0][0], str(x[0][1]))):
    n = len(v); print(f"{net:10s} {str(st):>6s} {n:3d} {sum(e for e,_ in v)/n:10.1f} {100*sum(e>5 for e,_ in v)/n:6.0f}% {100*sum(e>10 for e,_ in v)/n:6.0f}% {100*sum(a for _,a in v)/n:10.1f}%")
