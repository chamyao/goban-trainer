"""An exported .bin (export.py: batch norms folded, float16) -> a train.py-style checkpoint ownbot.py can play:
the folded conv weights, and each batch norm made the identity plus the folded bias."""
import json, struct, sys
import numpy as np, torch
sys.path.insert(0, "../kgs"); import train
b = open(sys.argv[1], "rb").read(); hl = struct.unpack("<I", b[4:8])[0]; head = json.loads(b[8:8 + hl]); off = 8 + hl; T = {}
for name, shape in head["tensors"]:
    n = int(np.prod(shape)); T[name] = torch.from_numpy(np.frombuffer(b, np.float16, n, off).astype(np.float32).reshape(shape)); off += 2 * n
net = train.Net(head["blocks"], head["ch"]); sd = net.state_dict()
def bn(prefix, bias):
    sd[f"{prefix}.weight"] = torch.ones_like(bias); sd[f"{prefix}.bias"] = bias
    sd[f"{prefix}.running_mean"] = torch.zeros_like(bias); sd[f"{prefix}.running_var"] = torch.full_like(bias, 1 - 1e-5)
sd["stem.weight"] = T["stem.w"]; bn("bstem", T["stem.b"])
for i in range(head["blocks"]):
    for j in (1, 2): sd[f"tower.{i}.c{j}.weight"] = T[f"b{i}.c{j}.w"]; bn(f"tower.{i}.b{j}", T[f"b{i}.c{j}.b"])
sd["pconv.weight"] = T["pconv.w"]; bn("pbn", T["pconv.b"]); sd["pfc.weight"] = T["pfc.w"]; sd["pfc.bias"] = T["pfc.b"]
sd["vconv.weight"] = T["vconv.w"]; bn("vbn", T["vconv.b"])
for k in ("vfc1", "vfc2"): sd[f"{k}.weight"] = T[f"{k}.w"]; sd[f"{k}.bias"] = T[f"{k}.b"]
net.load_state_dict(sd)
torch.save({"model": net.state_dict(), "cfg": net.cfg, "step": head["step"], "val": {"val_acc": head["val_acc"]}}, sys.argv[2]); print("ok", head["step"])
