# The site's own Go network: checkpoints of the training run

Each `run1/m<step>.bin` is a checkpoint from `tools/ownnet/train.py` (on main), exported with `tools/ownnet/export.py`:
batch norms folded in, float16, about 1.5 MB, the format `engine/ownnet.js` reads. `log.jsonl` is the training log
(held-out accuracy per checkpoint); `milestones.jsonl` the rank tests (evalwatch.py: 8 games against KataGo's
human-SL model at set ranks; "20.5k" means below the weakest reference, 20k).

Training data: KGS 4d+ games (2011-2014) and CWI professional games, half and half (12.0M positions).
