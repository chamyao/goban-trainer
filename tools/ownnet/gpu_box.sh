#!/bin/bash
# A rented GPU (Vast.ai) for more training, controlled from a Claude session without SSH, in one command from the
# box's terminal:
#     bash <(curl -fsSL https://raw.githubusercontent.com/chamyao/goban-trainer/main/tools/ownnet/gpu_box.sh)
# Or with no terminal at all: put the token in the Vast account's environment variables as GH_TOKEN and give the
# instance this script as its on-start command. It asks once (if GH_TOKEN isn't set) for a GitHub token (fine-grained: repository chamyao/goban-trainer only, Contents read and write),
# kept in a root-only file here and never printed; then it sets up PyTorch, the code, the checkpoints branch, and the
# control channel (control.sh, as in gpu_run.sh: a new commit to cmd.sh on branch vast-control runs once, its output
# pushed back to out/<commit>.log). No training starts by itself. Ends when the instance is destroyed.
set -e
W="$HOME/goban"; mkdir -p "$W"; cd "$W"
if [ ! -f .token ] && [ -n "$GH_TOKEN" ]; then umask 077; printf %s "$GH_TOKEN" > .token; umask 022; fi
if [ ! -f .token ]; then
  read -rsp "GitHub token (fine-grained, chamyao/goban-trainer only, Contents: read and write; not shown): " T; echo
  [ -n "$T" ] || { echo "No token given."; exit 1; }
  umask 077; printf %s "$T" > .token; umask 022; unset T
fi
command -v git >/dev/null || { apt-get update -qq && apt-get install -y -qq git curl > /dev/null; }
python3 -c "import torch, sys; sys.exit(0 if torch.cuda.is_available() else 1)" 2>/dev/null ||
  { echo "installing PyTorch (CUDA 12.8 build; a few minutes)"; python3 -m pip install -q torch --index-url https://download.pytorch.org/whl/cu128; }
python3 -m pip install -q numpy
python3 -c "import torch; print(torch.cuda.get_device_name(0), torch.__version__)"
REPO=https://github.com/chamyao/goban-trainer
[ -d code ] || git clone -q --depth 1 "$REPO" code
[ -d ck ] || git clone -q --depth 1 --branch ownnet-checkpoints "$REPO" ck
cp code/tools/ownnet/*.py .
sed -n '/^cat > control.sh/,/^CTL$/p' code/tools/ownnet/gpu_run.sh | sed '1d;$d' > control.sh
chmod +x control.sh
pgrep -f "control.sh" >/dev/null || nohup ./control.sh > control.log 2>&1 &
echo "Ready: the controlling session takes it from here (control channel running)."
