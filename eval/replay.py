import json, subprocess
g = json.load(open("g4000-0.json")); rec = g["record"]
p = subprocess.Popen(["./katago", "analysis", "-config", "bin/analysis_example.cfg", "-model", "/home/user/goban-trainer/engine/katago-small.bin.gz", "-override-config",
     "numAnalysisThreads=1,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],
     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
q = {"id": "g", "moves": rec, "rules": "chinese", "komi": 7.5, "boardXSize": 19, "boardYSize": 19, "maxVisits": 100,
     "analyzeTurns": list(range(len(rec) + 1)), "includeOwnership": False}
p.stdin.write(json.dumps(q) + "\n"); p.stdin.flush()
res = {}
while len(res) < len(rec) + 1:
    a = json.loads(p.stdout.readline()); res[a["turnNumber"]] = a
p.kill()
wr = [res[t]["rootInfo"]["winrate"] for t in range(len(rec) + 1)]
lead = [res[t]["rootInfo"]["scoreLead"] for t in range(len(rec) + 1)]
drops = []
for t, (c, m) in enumerate(rec):
    if c == "B":
        best = res[t]["moveInfos"][0]["move"] if res[t]["moveInfos"] else "?"
        drops.append((wr[t] - wr[t + 1], t + 1, m, best, round(wr[t], 2), round(wr[t + 1], 2), round(lead[t], 1), round(lead[t + 1], 1)))
drops.sort(reverse=True)
print("final lead (Black):", round(lead[-1], 1), " winrate path every 20 moves:", [round(wr[t], 2) for t in range(0, len(rec) + 1, 20)])
for d in drops[:6]: print(f"move {d[1]}: bot played {d[2]}, KataGo prefers {d[3]}; Black's win chance {d[4]:.0%} -> {d[5]:.0%}")
json.dump({"wr": wr, "lead": lead, "drops": drops[:6]}, open("g4000-0.an.json", "w"))
