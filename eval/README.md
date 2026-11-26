# Evaluation records

The scripts and every game behind the strength ladder (copied from the training session's scratch space so they're
kept): staircases and fixed matches against KataGo's human-SL net (mil.jsonl.games.jsonl, rejudge.jsonl.games.jsonl,
anchor5.jsonl), checkpoint-vs-checkpoint games (selfplay.jsonl, st2/, st3/), and the joint fit
(jointfit_final.py -> jointfit-final.json). The milestone networks themselves are the .bin files under run1/,
run1-gpu/, run2-gpu/, run3-gpu/, styles2/, styles3/ (bin2pt.py turns one back into a checkpoint).

Added 2026-11-26: the 10k-tier games (s10/), the search tests (srch/: search.py, distilled value head), the
score-network measurement (scoremeas/: b10c128 and b15c192 against kata1-b18c384nbt), the Takemiya / Go Seigen
closeness tests (takeval/: takeval.py, newtop3.py, results and saved predictions), and the pro-style student's ladder
games (ps/). jointfit_final.py fits everything, including these.
