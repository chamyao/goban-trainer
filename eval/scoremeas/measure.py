"""How far off are the small KataGo nets' score and ownership, against a strong one?
Positions: kyu-level games (our bots vs KataGo human-SL 5k, anchor5.jsonl), at move 60 / 140 / 220.
Each net analyses each position (KataGo analysis engine, Chinese rules, komi 7.5); the teacher is
kata1-b18c384nbt at TV visits. Out: per net and stage, mean |score - teacher|, share off by > 5 and > 10 points,
ownership agreement on the points the teacher calls (|own| > 0.6).   python3 measure.py OUT.jsonl"""
import json, subprocess, sys, random, os
K = "../kg"; N = "../nets"
games = [json.loads(l) for l in open(f"{K}/anchor5.jsonl")]
random.Random(7).shuffle(games)
pos = []
for g in games:
    rec = g["record"]
    for st in (60, 140, 220):
        if len(rec) > st + 10 and len([p for p in pos if p["st"] == st]) < 40: pos.append({"st": st, "moves": rec[:st]})
NETS = [("b18-teacher", f"{N}/kata1-b18c384nbt-s9996604416-d4316597426.bin.gz", int(os.environ.get("TV", 300))),
        ("b10-200v", f"{N}/kata1-b10c128-s1141046784-d204142634.txt.gz", 200),
        ("b15-200v", f"{N}/kata1-b15c192-s1672170752-d466197061.txt.gz", 200),
        ("b10-raw", f"{N}/kata1-b10c128-s1141046784-d204142634.txt.gz", 1),
        ("b15-raw", f"{N}/kata1-b15c192-s1672170752-d466197061.txt.gz", 1)]
out = open(sys.argv[1], "a")
done = {(json.loads(l)["net"], json.loads(l)["i"]) for l in open(sys.argv[1])} if os.path.exists(sys.argv[1]) else set()
for name, path, visits in NETS:
    p = subprocess.Popen([f"{K}/katago", "analysis", "-config", f"{K}/bin/analysis_example.cfg", "-model", path, "-override-config",
        "numAnalysisThreads=1,numSearchThreadsPerAnalysisThread=4,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
    for i, q in enumerate(pos):
        if (name, i) in done: continue
        p.stdin.write(json.dumps({"id": str(i), "moves": q["moves"], "rules": "chinese", "komi": 7.5, "boardXSize": 19, "boardYSize": 19,
                                  "maxVisits": visits, "includeOwnership": True}) + "\n"); p.stdin.flush()
        a = json.loads(p.stdout.readline())
        out.write(json.dumps({"net": name, "i": i, "st": q["st"], "score": a["rootInfo"]["scoreLead"], "own": [round(x, 2) for x in a["ownership"]]}) + "\n"); out.flush()
    p.stdin.close(); p.wait(); print(name, "done", flush=True)
