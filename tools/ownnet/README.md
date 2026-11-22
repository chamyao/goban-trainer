# The site's own Go network

The user: "train my own ai to be stronger than 10k ... store some of the milestones along the way ... play handicap
games". A small residual network (6 blocks × 64 channels) learns from KGS dan games (supervised: the move a 4d+
player chose, and who won), on a CPU. Its checkpoints along the way are the milestones: a range of strengths.

1. **Data.** KGS games by 4d+ players, from https://u-go.net/gamerecords/ (2011–2014: 59,576 games). Handicap games
   are kept (28% of the positions), so the network knows them: Black's stones set, komi 0.5, White first.
   `python3 prep.py kgs.npz <dir of .sgf> 0.5` keeps half the positions (5.86M).
2. **Training.** `python3 train.py kgs.npz run1 --blocks 6 --ch 64 --steps 40000 --batch 256 --every 2500`:
   SGD, cosine schedule, the 8 board symmetries; a checkpoint (`m<step>.pt`) every 2,500 steps and at steps 250,
   500, 1000, 1500 (the weak milestones). About 250 positions a second on 4 CPU cores.
3. **Calibration.** `arena.py` plays a staircase of games against KataGo's human-SL model at set ranks
   (b18c384nbt-humanv0, humanSLProfile rank_Xk/Xd), as for the Play tab's bots: `python3 arena.py own:<ckpt> START
   GAMES out.jsonl [H]` (H > 0: the bot takes Black with H stones; H < 0: it gives H as White). Needs a native
   KataGo build and the models next to it (see the top of arena.py). `ownbot.py` plays a checkpoint (one policy
   evaluation, the most likely legal move).
4. **The browser.** `python3 export.py <ckpt> engine/ownnet/<name>.bin` (batch norms folded in, float16);
   `engine/ownnet.js` runs it in plain JavaScript (matches PyTorch to 4 decimals, ~0.4 s a move).
