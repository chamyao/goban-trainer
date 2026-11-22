"""A train.py checkpoint -> the browser's weights file (ownnet.js reads it).

Batch norms folded into the convolutions; float16. Layout: "GTNN" magic, a uint32 header length, a JSON header
({blocks, ch, planes, step, val_acc, tensors: [[name, shape], ...]}), then each tensor in order (float16, C order).

    python3 export.py CKPT.pt OUT.bin
"""
import json, struct, sys
import numpy as np, torch

def fold(conv_w, bn):
    g, b, m, v, eps = bn["weight"], bn["bias"], bn["running_mean"], bn["running_var"], 1e-5
    s = g / torch.sqrt(v + eps)
    return conv_w * s[:, None, None, None], b - m * s

def main():
    ck = torch.load(sys.argv[1], map_location="cpu"); sd = ck["model"]; cfg = ck["cfg"]
    bn = lambda p: {k: sd[f"{p}.{k}"] for k in ("weight", "bias", "running_mean", "running_var")}
    T = []
    w, b = fold(sd["stem.weight"], bn("bstem")); T += [("stem.w", w), ("stem.b", b)]
    for i in range(cfg["blocks"]):
        for j in (1, 2):
            w, b = fold(sd[f"tower.{i}.c{j}.weight"], bn(f"tower.{i}.b{j}")); T += [(f"b{i}.c{j}.w", w), (f"b{i}.c{j}.b", b)]
    w, b = fold(sd["pconv.weight"], bn("pbn")); T += [("pconv.w", w), ("pconv.b", b), ("pfc.w", sd["pfc.weight"]), ("pfc.b", sd["pfc.bias"])]
    w, b = fold(sd["vconv.weight"], bn("vbn")); T += [("vconv.w", w), ("vconv.b", b), ("vfc1.w", sd["vfc1.weight"]), ("vfc1.b", sd["vfc1.bias"]),
                                                     ("vfc2.w", sd["vfc2.weight"]), ("vfc2.b", sd["vfc2.bias"])]
    head = {**cfg, "step": ck["step"], "val_acc": round(ck["val"]["val_acc"], 4), "tensors": [[n, list(t.shape)] for n, t in T]}
    hj = json.dumps(head).encode()
    hj += b" " * ((-len(hj) - 8) % 2)   # keep the float16 data 2-aligned
    with open(sys.argv[2], "wb") as f:
        f.write(b"GTNN"); f.write(struct.pack("<I", len(hj))); f.write(hj)
        for _, t in T: f.write(t.detach().numpy().astype(np.float16).tobytes())
    print(sys.argv[2], head["step"], head["val_acc"])

if __name__ == "__main__":
    main()
