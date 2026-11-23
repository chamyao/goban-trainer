import json,subprocess,sys
p=subprocess.Popen(["./katago","analysis","-config","bin/analysis_example.cfg","-model","/home/user/goban-trainer/engine/katago-small.bin.gz","-override-config","numAnalysisThreads=4,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,bufsize=1)
gs=[json.loads(l) for l in open(sys.argv[1])]
for i,g in enumerate(gs):
  p.stdin.write(json.dumps({"id":str(i),"moves":g["record"],"rules":"chinese","komi":7.5,"boardXSize":19,"boardYSize":19,"maxVisits":200})+"\n")
p.stdin.flush()
res={}
for _ in gs:
  a=json.loads(p.stdout.readline()); res[int(a["id"])]=a["rootInfo"]["scoreLead"]
for i,g in enumerate(gs): print(g["bot"],g["game"],g["how"],"kg-small lead(B):",round(res[i],1))
p.kill()
