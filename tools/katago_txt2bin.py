"""Convert a KataGo network from the old text format (.txt.gz, as katagotraining.org publishes the kata1 b10c128 and
b15c192 nets) to the binary format our engine reads (.bin.gz: weights as "@BIN@" + little-endian float32).

It walks the file in exactly the order engine-src/websrc/engine/katago/loadModelV8.ts reads it (model versions
8..11: ordinary and gpool blocks; 11 names each activation, as Lionffen's b6c64 does with Mish), passing words and
ints through and turning each weight array into binary.

    python3 -I tools/katago_txt2bin.py in.txt.gz out.bin.gz
"""
import gzip
import struct
import sys


class Conv:
    def __init__(self, data):
        self.toks = data.split()
        self.i = 0
        self.out = []

    def tok(self):
        t = self.toks[self.i]; self.i += 1
        self.out.append(t + b"\n")
        return t.decode()

    def int(self):
        return int(self.tok())

    def floats(self, n):
        vals = [float(x) for x in self.toks[self.i:self.i + n]]
        if len(vals) != n:
            raise ValueError("unexpected end of file")
        self.i += n
        self.out.append(b"@BIN@" + struct.pack("<%df" % n, *vals) + b"\n")

    def bn(self):
        self.tok(); c = self.int(); self.tok(); hs = self.int(); hb = self.int()   # name, channels, epsilon, flags
        self.floats(c); self.floats(c)
        if hs: self.floats(c)
        if hb: self.floats(c)

    def act(self, version):
        self.tok()
        if version >= 11: self.tok()

    def conv(self):
        self.tok(); ky, kx, ic, oc = self.int(), self.int(), self.int(), self.int(); self.int(); self.int()
        self.floats(ky * kx * ic * oc)

    def matmul(self):
        self.tok(); ic, oc = self.int(), self.int(); self.floats(ic * oc)

    def matbias(self):
        self.tok(); c = self.int(); self.floats(c)


def convert(data):
    p = Conv(data)
    p.tok()
    v = p.int()
    if not 8 <= v <= 11:
        raise ValueError(f"model version {v}: this converter does 8..11 (newer nets are published as .bin.gz)")
    p.int(); p.int()                                   # input channels, global input channels
    p.tok(); nblocks = p.int()
    for _ in range(5): p.int()                         # trunk, mid, regular, dilated, gpool channels
    p.conv(); p.matmul()
    for _ in range(nblocks):
        kind = p.tok(); p.tok()
        if kind == "ordinary_block":
            p.bn(); p.act(v); p.conv(); p.bn(); p.act(v); p.conv()
        elif kind == "gpool_block":
            p.bn(); p.act(v); p.conv(); p.conv(); p.bn(); p.act(v); p.matmul(); p.bn(); p.act(v); p.conv()
        else:
            raise ValueError(f"block kind {kind}")
    p.bn(); p.act(v)                                   # trunk tip
    p.tok(); p.conv(); p.conv(); p.bn(); p.act(v); p.matmul(); p.bn(); p.act(v); p.conv(); p.matmul()   # policy head
    p.tok(); p.conv(); p.bn(); p.act(v); p.matmul(); p.matbias(); p.act(v)                          # value head
    p.matmul(); p.matbias(); p.matmul(); p.matbias(); p.conv()
    if p.i != len(p.toks):
        raise ValueError(f"{len(p.toks) - p.i} tokens left over: the layout doesn't match")
    return b"".join(p.out)


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    out = convert(gzip.open(src).read())
    with gzip.open(dst, "wb", compresslevel=9) as f:
        f.write(out)
    print(f"{dst}: {len(out)} bytes")
