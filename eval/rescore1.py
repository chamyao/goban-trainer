"""Rescore finished games: the small net has no score/ownership head, so the reference GTP's final_score is
unreliable. Use b18c384nbt-humanv0 (rank_9d) as the main model: area count from its ownership at the final position
(trailing passes dropped), plus its scoreLead. Prints both; winner by scoreLead."""
import json,subprocess,sys
p=subprocess.Popen(["./katago","analysis","-config","bin/analysis_example.cfg","-model","human.bin.gz","-override-config","humanSLProfile=rank_9d,numAnalysisThreads=1,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,bufsize=1)
gs=[json.loads(l) for l in open(sys.argv[1]) if l.strip()]
gs=[g for g in gs if "record" in g]
for i,g in enumerate(gs):
  rec=g["record"]
  while rec and rec[-1][1]=="pass": rec=rec[:-1]
  p.stdin.write(json.dumps({"id":str(i),"moves":rec,"rules":"chinese","komi":7.5,"boardXSize":19,"boardYSize":19,"maxVisits":50,"includeOwnership":True})+"\n")
p.stdin.flush()
for _ in gs:
  a=json.loads(p.stdout.readline())
  if "error" in a: raise SystemExit(a)
  g=gs[int(a["id"])]; o=a["ownership"]
  g["area"]=round(sum(o)-7.5,1); g["lead"]=round(a["rootInfo"]["scoreLead"],1)
  g["winner2"]="bot" if (g["lead"]>0)==g["bot_black"] else "ref"
p.kill()
json.dump([{k:v for k,v in g.items() if k!="record"} for g in gs],open(sys.argv[1]+".rescored.json","w"),indent=0)
for g in gs: print(f'{str(g.get("step", g.get("ckpt", "")))[-12:]:12} {g["game"]:2} {g["rank"]:9} gtp:{g["winner"]:3} {g["how"]:8} | 9d-net lead(B) {g["lead"]:6} area {g["area"]:6} -> {g["winner2"]}{"" if g["winner2"]==g["winner"] else "  FLIP"}')
