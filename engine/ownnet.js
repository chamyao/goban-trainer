/* The site's own Go network (trained on KGS dan games: see tools/ownnet/), run in plain JavaScript: one evaluation
   gives a policy over the 361 points and pass, and a value (+1: the side to move wins). The weights file
   (engine/ownnet/*.bin, from tools/ownnet/export.py) holds the batch norms folded in, as float16.
   Inputs, as in training (tools/ownnet/train.py, planes()): own stones with 1/2/3+ liberties, the opponent's the
   same, empty, the ko point, the last four moves, ones, Black to move, komi from the side to move (/15). */
const OwnNet = (() => {
  const N = 19, NN = 361, P = 17, W = 21;   // W: a padded row (a zero border)

  function half(h) {   // float16 bits -> number
    const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 31, f = h & 1023;
    return e === 0 ? s * f * 5.960464477539063e-8 : e === 31 ? (f ? NaN : s * Infinity) : s * Math.pow(2, e - 15) * (1 + f / 1024);
  }
  function load(buf) {
    const dv = new DataView(buf);
    if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== "GTNN") throw new Error("not a GTNN weights file");
    const hl = dv.getUint32(4, true), head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, hl)));
    let off = 8 + hl;
    const t = {};
    for (const [name, shape] of head.tensors) {
      const n = shape.reduce((a, b) => a * b, 1), a = new Float32Array(n);
      for (let i = 0; i < n; i++) a[i] = half(dv.getUint16(off + 2 * i, true));
      t[name] = a; off += 2 * n;
    }
    return { head, t, ch: head.ch, blocks: head.blocks };
  }

  // a 3x3 convolution (padding 1) on padded maps [cin][W*W] -> [cout][W*W] (border left 0), + bias, then relu
  function conv3(inp, cin, w, b, cout, out, relu, res) {
    for (let o = 0; o < cout; o++) {
      const oo = o * W * W;
      for (let y = 1; y <= N; y++) for (let x = 1; x <= N; x++) out[oo + y * W + x] = b[o];
      for (let i = 0; i < cin; i++) {
        const ii = i * W * W, wo = (o * cin + i) * 9;
        for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) {
          const k = w[wo + ky * 3 + kx]; if (k === 0) continue;
          const sh = (ky - 1) * W + (kx - 1);
          for (let y = 1; y <= N; y++) {
            let p = y * W + 1;
            const q = oo + p, s = ii + p + sh;
            for (let x = 0; x < N; x++) out[q + x] += k * inp[s + x];
          }
        }
      }
      for (let y = 1; y <= N; y++) for (let x = 1; x <= N; x++) {
        const p = oo + y * W + x;
        let v = out[p] + (res ? res[p] : 0);
        out[p] = relu && v < 0 ? 0 : v;
      }
    }
  }

  // the liberties of each stone's group (capped at 3); board: 361 of 1 (black), -1 (white), 0
  function libs(board) {
    const out = new Int8Array(NN), seen = new Uint8Array(NN);
    for (let i = 0; i < NN; i++) {
      if (!board[i] || seen[i]) continue;
      const col = board[i], grp = [i], lib = new Set(); seen[i] = 1;
      for (let k = 0; k < grp.length; k++) {
        const j = grp[k], r = (j / N) | 0, c = j % N;
        for (const n of [r > 0 ? j - N : -1, r < N - 1 ? j + N : -1, c > 0 ? j - 1 : -1, c < N - 1 ? j + 1 : -1]) {
          if (n < 0) continue;
          if (board[n] === 0) lib.add(n); else if (board[n] === col && !seen[n]) { seen[n] = 1; grp.push(n); }
        }
      }
      const l = Math.min(3, lib.size);
      for (const j of grp) out[j] = l;
    }
    return out;
  }

  // a position -> padded input planes. black: true if Black is to move; ko: a point or -1; last: the last moves,
  // newest first (points, or -1 / 361 for none / a pass)
  function features({ board, black, ko = -1, last = [], komi = 7.5 }) {
    const x = new Float32Array(P * W * W), L = libs(board), side = black ? 1 : -1;
    const at = (pl, i) => pl * W * W + ((i / N | 0) + 1) * W + (i % N) + 1;
    for (let i = 0; i < NN; i++) {
      const v = board[i] * side;
      if (v > 0) x[at(L[i] - 1, i)] = 1; else if (v < 0) x[at(2 + L[i], i)] = 1; else x[at(6, i)] = 1;
      x[at(12, i)] = 1; if (black) x[at(13, i)] = 1;
      x[at(14, i)] = (black ? -komi : komi) / 15;
    }
    if (ko >= 0) x[at(7, ko)] = 1;
    for (let j = 0; j < 4; j++) if (last[j] != null && last[j] >= 0 && last[j] < NN) x[at(8 + j, last[j])] = 1;
    return x;
  }

  function forward(net, x) {
    const { t, ch } = net;
    let a = new Float32Array(ch * W * W), b2 = new Float32Array(ch * W * W), c = new Float32Array(ch * W * W);
    conv3(x, P, t["stem.w"], t["stem.b"], ch, a, true);
    for (let i = 0; i < net.blocks; i++) {
      conv3(a, ch, t[`b${i}.c1.w`], t[`b${i}.c1.b`], ch, b2, true);
      conv3(b2, ch, t[`b${i}.c2.w`], t[`b${i}.c2.b`], ch, c, true, a);
      [a, c] = [c, a];
    }
    // heads: 1x1 convolutions, then the fully connected layers
    const head = (w, bias, n) => {
      const o = new Float32Array(n * NN);
      for (let k = 0; k < n; k++) for (let i = 0; i < NN; i++) {
        const p = ((i / N | 0) + 1) * W + (i % N) + 1;
        let s = bias[k];
        for (let q = 0; q < ch; q++) s += w[k * ch + q] * a[q * W * W + p];
        o[k * NN + i] = s > 0 ? s : 0;
      }
      return o;
    };
    const fc = (w, bias, inp, nout, relu) => {
      const o = new Float32Array(nout), nin = inp.length;
      for (let k = 0; k < nout; k++) { let s = bias[k]; for (let i = 0; i < nin; i++) s += w[k * nin + i] * inp[i]; o[k] = relu && s < 0 ? 0 : s; }
      return o;
    };
    const logits = fc(t["pfc.w"], t["pfc.b"], head(t["pconv.w"], t["pconv.b"], 2), NN + 1, false);
    const v1 = fc(t["vfc1.w"], t["vfc1.b"], head(t["vconv.w"], t["vconv.b"], 1), 64, true);
    const value = Math.tanh(fc(t["vfc2.w"], t["vfc2.b"], v1, 1, false)[0]);
    let m = -Infinity; for (const v of logits) if (v > m) m = v;
    let z = 0; const policy = new Float32Array(NN + 1);
    for (let i = 0; i <= NN; i++) { policy[i] = Math.exp(logits[i] - m); z += policy[i]; }
    for (let i = 0; i <= NN; i++) policy[i] /= z;
    return { policy, value };
  }

  return { load, features, forward, libs };
})();
if (typeof module !== "undefined") module.exports = OwnNet;
