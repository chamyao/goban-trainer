# Postflop Trainer

`poker/` is a standalone page (`https://chamyao.github.io/goban-trainer/poker/`) for practicing heads-up postflop
play from a 6-max, 100bb table. Two players saw the flop; you play one of them and a GTO opponent plays the other
until the river (or a fold). Then every decision you made is graded.

## Playing

- A hand: a random spot, flop, seat (in or out of position, configurable), your hand and the opponent's hand.
- Buttons (or keys **1–6**) for your actions; the bet sizes are the ones the solver used (see below).
- At the end you see the opponent's cards and a review of your line:
  - for each decision, the GTO frequencies **for your exact hand**, the EV each action gives up against the best
    one, and how often your whole range takes each action;
  - each decision is tagged GTO / Fine / Inaccuracy / Mistake / Blunder by its EV loss (as a share of the pot then);
  - the line score is `100 · exp(−3 · EV lost / flop pot)`, with a letter (A+ ≥ 95, A ≥ 88, B ≥ 78, C ≥ 65, D ≥ 50).
- EV is measured against the opponent's GTO *range* at that point, not the cards they actually held, so a good
  line that loses to a lucky river still grades well.
- **Enter** for the next hand, **R** to replay the same cards (new runout, new opponent mixing).
- Settings choose the spots, your seat and the opponent's speed; stats stay in the browser (localStorage).

## Spots

| id | spot | pot / behind |
|---|---|---|
| `btn-bb` | BTN open 2.5, BB call | 5.5 / 97.5 |
| `co-bb` | CO open, BB call | 5.5 / 97.5 |
| `utg-bb` | UTG open, BB call | 5.5 / 97.5 |
| `co-btn` | CO open, BTN call | 6.5 / 97.5 |
| `bb3-btn` | BTN open, BB 3-bet to 11, BTN call | 22.5 / 89 |
| `btn3-co` | CO open, BTN 3-bet to 8.5, CO call | 18.5 / 91.5 |

The preflop ranges are hand-written approximations of 100bb 6-max solver ranges (`RANGES` in `solver/build.py`).

Bet sizes: single-raised pots bet 33% / 75% on the flop, 66% on the turn, 50% / 100% on the river; 3-bet pots
25% / 60%, 66%, 50% / 100%. A raise is to 3× the bet; after a raise the only re-raise is all-in; all-in is also
offered once the stack is no more than 1.5 pots, and a bet of 80% of the stack or more becomes all-in.

## How it's precomputed

Everything is solved offline, so the page only looks numbers up:

- `solver/solver.c` is a heads-up postflop solver: discounted CFR (α 1.5, β 0, γ 2) in vector form, range vs range,
  with an O(n log n) showdown. Each flop is solved to within 0.3% of the pot of a Nash equilibrium
  (exploitability measured by best response), in about 40 s on 4 cores.
- To keep the tree small enough to solve fast and ship to a browser, the turn and river come from a **sampled
  set** of cards per flop (6 turns, 4 rivers after each). The game deals from that set, so every runout you see
  was solved. A combo's chance weights are renormalized for the sampled cards it blocks.
- Moves that GTO never makes still get sensible answers: during solving the off-turn player always plays every
  action with at least 0.1% reach, so the opponent has learned what to do after your off-tree lines.
- The output keeps, for 14 combos of each player per flop (sampled by range weight, so the opponent's hand
  follows its range), the GTO frequencies and EV loss of every action at every decision node, plus the whole
  range's frequencies. That's about 0.6 MB per flop, gzipped (`data/*.bin.gz`); `data/manifest.json` lists them.

Rebuild (about 20 minutes for all 25 flops):

```sh
python3 poker/solver/build.py              # all spots
python3 poker/solver/build.py --only co-bb # one spot (the manifest keeps the others)
python3 poker/solver/build.py --quick      # 50 iterations, for testing
```

Add flops in `FLOPS`, spots in `SPOTS` / `RANGES`. Options: `--T` / `--R` sampled turns / rivers, `--K` exported
combos per player, `--iters`, `--target` (exploitability, as a fraction of the pot).

`node poker/solver/inspect.mjs poker/data/<file>.bin.gz` prints a solve's first decisions;
`node poker/tests/engine.test.mjs` plays random hands through every solve and checks the bookkeeping.

## File format (`PKR1`, little-endian)

```
"PKR1"  f32 pot  f32 stack  f32 exploitability  u32 iterations  u8 flop[3]
u32 nodeCount, then per node: u8 type (0 decision, 1 chance, 2 fold, 3 showdown)
  decision: u8 player (0 OOP, 1 IP)  u8 nActions  { u8 kind (fold check call bet raise allin)  f32 chipsAdded  u32 child }
  chance:   u8 nCards  { u8 card (rank*4+suit, cdhs)  u32 child }
u8 rangeFreq[sum of nActions over decision nodes]          (0..255)
per player: u16 K  { u8 card1  u8 card2  f32 weight }  u32 D (sum of that player's nActions)
            per combo: u8 freq[D] (0..255)  u8 evLoss[D] (units of 0.5% of the pot at that node)
```
