# Poker puzzles (poker.js, data/poker.json)

Heads-up 100bb postflop spots, answered by a game-theory solver ahead of time.

1. `RUSTFLAGS="-A dangerous_implicit_autorefs" cargo build --release` builds `pkgen`, a small wrapper around
   [postflop-solver](https://github.com/b-inary/postflop-solver) (AGPL-3.0; so `src/` here is AGPL-3.0 too).
   Only these tools use it. The site ships only its answers, as data.
2. `python3 run.py` solves each spot in `spots.json` from the flop into `out/<id>.json` (a few minutes each, 3–4 GB).
3. `python3 build.py` picks the puzzles: at each decision, hands whose answer is clear (one action ≥ 70%) and where a
   wrong choice costs at least 0.3 bb (or 3% of the pot), then writes `data/poker.json`.

Bet sizes are kept few so a flop solve fits in memory: flop BTN 33%/75%, BB lead 50%; turn and river 75%; raises 3x;
all-in. Solved to under 0.5% of the pot from a perfect strategy.
