/* Heads-up postflop solver for the poker trainer (poker/).
 *
 * Discounted CFR (alpha 1.5, beta 0, gamma 2), vector form: every pass walks the betting tree once per traverser
 * with a reach vector over the opponent's whole range, so a showdown costs O(n log n) instead of O(n^2).
 * The flop is fixed; the turn and river are drawn from a sampled set of cards (T turns, R rivers per turn),
 * which keeps the tree small enough to solve in about a minute and to ship to a browser.
 *
 * Input: a text config (see build.py), output: one binary file per flop that poker/app.js reads:
 *   the betting tree, then, for a handful of exported combos per player, the GTO frequencies and the
 *   EV loss (fraction of the pot) of every action at every decision node of that player.
 *
 * Build: gcc -O3 -march=native -fopenmp -o solver solver.c -lm
 */
#include <math.h>
#include <omp.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXA 6
#define MAXT 16
#define MAXR 12
#define EPS_REACH 1e-3f

enum { DEC = 0, CHANCE = 1, FOLD = 2, SHOW = 3 };
enum { A_FOLD = 0, A_CHECK, A_CALL, A_BET, A_RAISE, A_ALLIN };

typedef struct {
  uint8_t type, player, nA, street;
  int board;           /* board state id */
  float c;             /* DEC/FOLD/SHOW: total postflop chips per player before this street (equal) */
  float cs[2];         /* chips put in on this street */
  uint8_t kind[MAXA];
  float put[MAXA];
  int child[MAXA];
  int nC, *cchild, *cboard; uint8_t *ccard;
  int folder;          /* FOLD */
  float *regret, *ssum;
  int dIdx;            /* index among this player's decision nodes */
} Node;

/* ---------------- config ---------------- */
static float P0, STACK;
static int flop[3], T, R, turnCard[MAXT], riverCard[MAXT][MAXR];
static float sizes[3][4]; static int nSizes[3];
static float raiseMult = 3.0f, allinSpr = 1.5f, allinThresh = 0.8f;
static int N[2]; static int *hc1[2], *hc2[2]; static float *hw[2];
static int nExp[2], *expIdx[2];
static int maxIters = 1000, threads = 4; static float target = 0.003f;
static char outPath[512];

/* ---------------- boards ---------------- */
static int nBoards;
static int boardCards[1 + MAXT + MAXT * MAXR][5], boardLen[1 + MAXT + MAXT * MAXR];
static float *alive[2][1 + MAXT + MAXT * MAXR];
static int *rankv[2][1 + MAXT + MAXT * MAXR], *order[2][1 + MAXT + MAXT * MAXR];
static int *same[2]; /* combo index in the other player's list with the same two cards, or -1 */
/* chance renormalization: a combo that blocks b of the n sampled cards sees each of the others with weight 1/(n-b),
   not 1/n; fac = n/(n-b) is applied to both players' reach at the chance node (set 0 = turns, 1+t = rivers after turn t) */
static float *fac[2][1 + MAXT];

/* ---------------- tree ---------------- */
static Node *nodes; static int nNodes, capNodes, nDec[2];

static int newNode(void) {
  if (nNodes == capNodes) { capNodes = capNodes ? capNodes * 2 : 4096; nodes = realloc(nodes, capNodes * sizeof(Node)); }
  memset(&nodes[nNodes], 0, sizeof(Node));
  return nNodes++;
}

/* ---------------- hand evaluation (7 cards) ---------------- */
static int eval7(const int *cards, int n) {
  int rc[13] = {0}, sc[4] = {0}, smask[4] = {0}, rmask = 0;
  for (int i = 0; i < n; i++) { int r = cards[i] >> 2, s = cards[i] & 3; rc[r]++; sc[s]++; smask[s] |= 1 << r; rmask |= 1 << r; }
  #define STRAIGHT(m, out) do { out = -1; for (int hi = 12; hi >= 4; hi--) { int need = 0x1F << (hi - 4); if (((m) & need) == need) { out = hi; break; } } \
    if (out < 0 && ((m) & 0x100F) == 0x100F) out = 3; } while (0)
  for (int s = 0; s < 4; s++) if (sc[s] >= 5) {
    int st; STRAIGHT(smask[s], st);
    if (st >= 0) return (8 << 20) | st;
    int v = 0, k = 0; for (int r = 12; r >= 0 && k < 5; r--) if (smask[s] >> r & 1) { v = v << 4 | r; k++; }
    return (5 << 20) | v;
  }
  int quad = -1, trips[2] = {-1, -1}, nt = 0, pairs[3] = {-1, -1, -1}, np = 0;
  for (int r = 12; r >= 0; r--) {
    if (rc[r] == 4) quad = r; else if (rc[r] == 3) { if (nt < 2) trips[nt++] = r; } else if (rc[r] == 2) { if (np < 3) pairs[np++] = r; }
  }
  if (quad >= 0) { int k = -1; for (int r = 12; r >= 0; r--) if (rc[r] && r != quad) { k = r; break; } return (7 << 20) | quad << 4 | k; }
  if (nt >= 1 && (nt >= 2 || np >= 1)) { int p = nt >= 2 ? trips[1] : pairs[0]; if (nt >= 2 && np >= 1 && pairs[0] > p) p = pairs[0]; return (6 << 20) | trips[0] << 4 | p; }
  { int st; STRAIGHT(rmask, st); if (st >= 0) return (4 << 20) | st; }
  if (nt == 1) { int v = trips[0], k = 0; for (int r = 12; r >= 0 && k < 2; r--) if (rc[r] && r != trips[0]) { v = v << 4 | r; k++; } return (3 << 20) | v; }
  if (np >= 2) { int k = -1; for (int r = 12; r >= 0; r--) if (rc[r] && r != pairs[0] && r != pairs[1]) { k = r; break; } return (2 << 20) | pairs[0] << 8 | pairs[1] << 4 | k; }
  if (np == 1) { int v = pairs[0], k = 0; for (int r = 12; r >= 0 && k < 3; r--) if (rc[r] && r != pairs[0]) { v = v << 4 | r; k++; } return (1 << 20) | v; }
  int v = 0, k = 0; for (int r = 12; r >= 0 && k < 5; r--) if (rc[r]) { v = v << 4 | r; k++; }
  return v;
}

/* ---------------- tree building ---------------- */
static int buildStreet(int street, float c, int board);

static int termShowOrRunout(int street, float c, int board, int allin) {
  /* the street is over with equal chips: next street, or showdown */
  if (street == 2) { int id = newNode(); nodes[id].type = SHOW; nodes[id].c = c; nodes[id].board = board; nodes[id].street = 2; return id; }
  int id = newNode(); nodes[id].type = CHANCE; nodes[id].street = street; nodes[id].c = c; nodes[id].board = board;
  int nc = street == 0 ? T : R;
  nodes[id].nC = nc; nodes[id].cchild = malloc(nc * sizeof(int)); nodes[id].cboard = malloc(nc * sizeof(int)); nodes[id].ccard = malloc(nc);
  int t = street == 0 ? -1 : board - 1;
  for (int k = 0; k < nc; k++) {
    int nb = street == 0 ? 1 + k : 1 + T + t * R + k;
    int card = street == 0 ? turnCard[k] : riverCard[t][k];
    int ch = allin ? termShowOrRunout(street + 1, c, nb, 1) : buildStreet(street + 1, c, nb);
    nodes[id].cchild[k] = ch; nodes[id].cboard[k] = nb; nodes[id].ccard[k] = card;
  }
  return id;
}

/* p to act; cs = chips in this street; nb = bets/raises so far this street */
static int buildDec(int street, float c, int board, int p, float cs0, float cs1, int nb, int checked) {
  int id = newNode();
  Node *n = &nodes[id];
  n->type = DEC; n->player = p; n->street = street; n->c = c; n->board = board; n->cs[0] = cs0; n->cs[1] = cs1;
  float cs[2] = {cs0, cs1};
  float mine = cs[p], theirs = cs[1 - p];
  float rem = STACK - c - mine;               /* what p has behind */
  float pot = P0 + 2 * c + cs0 + cs1;
  uint8_t kind[MAXA]; float put[MAXA]; int na = 0;
  if (mine == theirs) {
    kind[na] = A_CHECK; put[na] = 0; na++;
    int haveAllin = 0;
    for (int i = 0; i < nSizes[street]; i++) {
      float amt = sizes[street][i] * pot;
      if (amt >= rem * allinThresh) { if (!haveAllin) { kind[na] = A_ALLIN; put[na] = rem; na++; haveAllin = 1; } }
      else { kind[na] = A_BET; put[na] = roundf(amt * 100) / 100; na++; }
    }
    if (!haveAllin && rem <= allinSpr * pot) { kind[na] = A_ALLIN; put[na] = rem; na++; }
  } else {
    float toCall = theirs - mine;
    kind[na] = A_FOLD; put[na] = 0; na++;
    if (toCall >= rem) { kind[na] = A_CALL; put[na] = rem; na++; }
    else {
      kind[na] = A_CALL; put[na] = toCall; na++;
      float oppRem = STACK - c - theirs;
      if (oppRem > 0) {
        if (nb < 2) {
          float to = theirs + (raiseMult - 1) * (theirs - mine);
          float add = to - mine;
          if (add >= rem * allinThresh) { kind[na] = A_ALLIN; put[na] = rem; na++; }
          else { kind[na] = A_RAISE; put[na] = roundf(add * 100) / 100; na++; }
        } else { kind[na] = A_ALLIN; put[na] = rem; na++; }
      }
    }
  }
  n->nA = na;
  memcpy(n->kind, kind, na); memcpy(n->put, put, na * sizeof(float));
  int dIdx = nDec[p]++;
  for (int a = 0; a < na; a++) {
    int ch;
    float ncs[2] = {cs0, cs1}; ncs[p] += put[a];
    if (kind[a] == A_FOLD) {
      ch = newNode(); nodes[ch].type = FOLD; nodes[ch].folder = p; nodes[ch].c = c; nodes[ch].cs[0] = cs0; nodes[ch].cs[1] = cs1; nodes[ch].board = board; nodes[ch].street = street;
    } else if (kind[a] == A_CHECK) {
      if (p == 0) ch = buildDec(street, c, board, 1, ncs[0], ncs[1], nb, 1);
      else ch = termShowOrRunout(street, c, board, 0);
    } else if (kind[a] == A_CALL) {
      float nc = c + ncs[p];
      int allin = (STACK - nc) <= 1e-6f;
      ch = termShowOrRunout(street, nc, board, allin);
    } else {
      ch = buildDec(street, c, board, 1 - p, ncs[0], ncs[1], nb + 1, checked);
    }
    nodes[id].child[a] = ch;
  }
  nodes[id].dIdx = dIdx;
  return id;
}

static int buildStreet(int street, float c, int board) { return buildDec(street, c, board, 0, 0, 0, 0, 0); }

static int facSet(Node *n) { return n->street == 0 ? 0 : n->board; }  /* turn board id 1+t == river set 1+t */

/* ---------------- terminal values ---------------- */
/* per-card sums of the opponent's reach */
static void cardSums(int o, const float *r, float *cs, float *tot) {
  memset(cs, 0, 52 * sizeof(float)); double t = 0;
  for (int i = 0; i < N[o]; i++) { float x = r[i]; if (x != 0) { cs[hc1[o][i]] += x; cs[hc2[o][i]] += x; t += x; } }
  *tot = (float)t;
}

static void compat(int p, const float *ropp, float *out) {
  int o = 1 - p; float cs[52], tot; cardSums(o, ropp, cs, &tot);
  for (int h = 0; h < N[p]; h++) {
    float v = tot - cs[hc1[p][h]] - cs[hc2[p][h]];
    if (same[p][h] >= 0) v += ropp[same[p][h]];
    out[h] = v;
  }
}

static void showdown(int p, int b, float c, const float *ropp, float *out) {
  int o = 1 - p;
  const int *rp = rankv[p][b], *ro = rankv[o][b], *op = order[p][b], *oo = order[o][b];
  float cs[52]; double tot;
  float *win = malloc(N[p] * sizeof(float)), *lose = malloc(N[p] * sizeof(float)), *cmp = malloc(N[p] * sizeof(float));
  compat(p, ropp, cmp);
  /* ascending: opponent hands strictly weaker */
  memset(cs, 0, sizeof cs); tot = 0;
  int j = 0;
  for (int k = 0; k < N[p]; k++) {
    int h = op[k];
    while (j < N[o] && ro[oo[j]] < rp[h]) { int x = oo[j]; float r = ropp[x]; if (r != 0) { cs[hc1[o][x]] += r; cs[hc2[o][x]] += r; tot += r; } j++; }
    win[h] = (float)(tot - cs[hc1[p][h]] - cs[hc2[p][h]]);
  }
  memset(cs, 0, sizeof cs); tot = 0; j = N[o] - 1;
  for (int k = N[p] - 1; k >= 0; k--) {
    int h = op[k];
    while (j >= 0 && ro[oo[j]] > rp[h]) { int x = oo[j]; float r = ropp[x]; if (r != 0) { cs[hc1[o][x]] += r; cs[hc2[o][x]] += r; tot += r; } j--; }
    lose[h] = (float)(tot - cs[hc1[p][h]] - cs[hc2[p][h]]);
  }
  float wv = P0 + c, lv = -c, tv = P0 * 0.5f;
  for (int h = 0; h < N[p]; h++) {
    float tie = cmp[h] - win[h] - lose[h];
    out[h] = (win[h] * wv + lose[h] * lv + tie * tv) * alive[p][b][h];
  }
  free(win); free(lose); free(cmp);
}

static void foldValue(int p, Node *n, const float *ropp, float *out) {
  float cf = n->c + n->cs[n->folder];
  float pay = (p == n->folder) ? -cf : (P0 + cf);
  compat(p, ropp, out);
  for (int h = 0; h < N[p]; h++) out[h] *= pay * alive[p][n->board][h];
}

/* ---------------- strategies ---------------- */
static void regretMatch(Node *n, float *sigma) {
  int np = N[n->player], na = n->nA;
  for (int h = 0; h < np; h++) {
    float s = 0;
    for (int a = 0; a < na; a++) { float r = n->regret[a * np + h]; s += r > 0 ? r : 0; }
    for (int a = 0; a < na; a++) { float r = n->regret[a * np + h]; sigma[a * np + h] = s > 0 ? (r > 0 ? r / s : 0) : 1.0f / na; }
  }
}

static void avgStrat(Node *n, float *sigma) {
  int np = N[n->player], na = n->nA;
  for (int h = 0; h < np; h++) {
    float s = 0;
    for (int a = 0; a < na; a++) s += n->ssum[a * np + h];
    for (int a = 0; a < na; a++) sigma[a * np + h] = s > 0 ? n->ssum[a * np + h] / s : 1.0f / na;
  }
}

static int allZero(const float *r, int n) { for (int i = 0; i < n; i++) if (r[i] != 0) return 0; return 1; }

/* ---------------- CFR ---------------- */
static float posDisc, negDisc, stratDisc;

static void cfr(int id, int trav, const float *rt, const float *ro, float *out) {
  Node *n = &nodes[id];
  int o = 1 - trav, nt = N[trav], no = N[o];
  if (n->type == FOLD) { foldValue(trav, n, ro, out); return; }
  if (n->type == SHOW) { showdown(trav, n->board, n->c, ro, out); return; }
  if (allZero(ro, no)) { memset(out, 0, nt * sizeof(float)); return; }
  if (n->type == CHANCE) {
    int nc = n->nC; float w = 1.0f / nc;
    float *vals = calloc((size_t)nc * nt, sizeof(float));
    #pragma omp parallel for schedule(dynamic) if (n->street == 0)
    for (int k = 0; k < nc; k++) {
      int b = n->cboard[k];
      float *rt2 = malloc(nt * sizeof(float)), *ro2 = malloc(no * sizeof(float));
      const float *ft = fac[trav][facSet(n)], *fo = fac[o][facSet(n)];
      for (int h = 0; h < nt; h++) rt2[h] = rt[h] * alive[trav][b][h] * ft[h];
      for (int h = 0; h < no; h++) ro2[h] = ro[h] * alive[o][b][h] * fo[h];
      cfr(n->cchild[k], trav, rt2, ro2, vals + (size_t)k * nt);
      free(rt2); free(ro2);
    }
    memset(out, 0, nt * sizeof(float));
    for (int k = 0; k < nc; k++) { int b = n->cboard[k]; const float *ft = fac[trav][facSet(n)]; for (int h = 0; h < nt; h++) out[h] += w * vals[(size_t)k * nt + h] * alive[trav][b][h] * ft[h]; }
    free(vals); return;
  }
  int na = n->nA, np = N[n->player];
  float *sigma = malloc((size_t)na * np * sizeof(float));
  regretMatch(n, sigma);
  float *va = malloc((size_t)na * nt * sizeof(float));
  if (n->player == trav) {
    float *r2 = malloc(nt * sizeof(float));
    for (int a = 0; a < na; a++) {
      for (int h = 0; h < nt; h++) r2[h] = rt[h] * sigma[a * nt + h];
      cfr(n->child[a], trav, r2, ro, va + a * nt);
    }
    free(r2);
    for (int h = 0; h < nt; h++) { float v = 0; for (int a = 0; a < na; a++) v += sigma[a * nt + h] * va[a * nt + h]; out[h] = v; }
    for (int a = 0; a < na; a++) for (int h = 0; h < nt; h++) {
      float *r = &n->regret[a * nt + h];
      *r = (*r > 0 ? *r * posDisc : *r * negDisc) + va[a * nt + h] - out[h];
      n->ssum[a * nt + h] = n->ssum[a * nt + h] * stratDisc + rt[h] * sigma[a * nt + h];
    }
  } else {
    float *r2 = malloc(no * sizeof(float));
    for (int a = 0; a < na; a++) {
      for (int h = 0; h < no; h++) { float s = sigma[a * no + h]; r2[h] = ro[h] * (s > EPS_REACH ? s : EPS_REACH); }
      cfr(n->child[a], trav, rt, r2, va + a * nt);
    }
    free(r2);
    for (int h = 0; h < nt; h++) { float v = 0; for (int a = 0; a < na; a++) v += va[a * nt + h]; out[h] = v; }
  }
  free(sigma); free(va);
}

/* best response value for trav against the opponent's average strategy */
static void br(int id, int trav, const float *ro, float *out, int mode) {
  Node *n = &nodes[id];
  int o = 1 - trav, nt = N[trav], no = N[o];
  if (n->type == FOLD) { foldValue(trav, n, ro, out); return; }
  if (n->type == SHOW) { showdown(trav, n->board, n->c, ro, out); return; }
  if (allZero(ro, no)) { memset(out, 0, nt * sizeof(float)); return; }
  if (n->type == CHANCE) {
    int nc = n->nC; float w = 1.0f / nc;
    float *vals = calloc((size_t)nc * nt, sizeof(float));
    #pragma omp parallel for schedule(dynamic) if (n->street == 0)
    for (int k = 0; k < nc; k++) {
      int b = n->cboard[k]; float *ro2 = malloc(no * sizeof(float)); const float *fo = fac[o][facSet(n)];
      for (int h = 0; h < no; h++) ro2[h] = ro[h] * alive[o][b][h] * fo[h];
      br(n->cchild[k], trav, ro2, vals + (size_t)k * nt, mode); free(ro2);
    }
    memset(out, 0, nt * sizeof(float));
    for (int k = 0; k < nc; k++) { int b = n->cboard[k]; const float *ft = fac[trav][facSet(n)]; for (int h = 0; h < nt; h++) out[h] += w * vals[(size_t)k * nt + h] * alive[trav][b][h] * ft[h]; }
    free(vals); return;
  }
  int na = n->nA;
  float *va = malloc((size_t)na * nt * sizeof(float));
  if (n->player == trav) {
    for (int a = 0; a < na; a++) br(n->child[a], trav, ro, va + a * nt, mode);
    if (mode == 0) for (int h = 0; h < nt; h++) { float m = va[h]; for (int a = 1; a < na; a++) if (va[a * nt + h] > m) m = va[a * nt + h]; out[h] = m; }
    else {
      float *sg = malloc((size_t)na * nt * sizeof(float)); avgStrat(n, sg);
      for (int h = 0; h < nt; h++) { float v = 0; for (int a = 0; a < na; a++) v += sg[a * nt + h] * va[a * nt + h]; out[h] = v; }
      free(sg);
    }
  } else {
    float *sigma = malloc((size_t)na * no * sizeof(float)); avgStrat(n, sigma);
    float *r2 = malloc(no * sizeof(float));
    for (int a = 0; a < na; a++) { for (int h = 0; h < no; h++) r2[h] = ro[h] * sigma[a * no + h]; br(n->child[a], trav, r2, va + a * nt, mode); }
    for (int h = 0; h < nt; h++) { float v = 0; for (int a = 0; a < na; a++) v += va[a * nt + h]; out[h] = v; }
    free(sigma); free(r2);
  }
  free(va);
}

static double rootNorm(void) {
  float *cmp = malloc(N[0] * sizeof(float)); compat(0, hw[1], cmp);
  double s = 0; for (int h = 0; h < N[0]; h++) s += hw[0][h] * cmp[h];
  free(cmp); return s;
}

static double gameSum = -1; /* V0 + V1 for any strategy pair (the pot, less the little mass lost to card removal) */
static double rootValue(int p, int mode) {
  float *v = malloc(N[p] * sizeof(float)); br(0, p, hw[1 - p], v, mode);
  double s = 0; for (int h = 0; h < N[p]; h++) s += hw[p][h] * v[h];
  free(v); return s / rootNorm();
}
static double exploitability(void) {
  if (gameSum < 0) gameSum = rootValue(0, 1) + rootValue(1, 1);
  return (rootValue(0, 0) + rootValue(1, 0) - gameSum) / 2 / P0; /* fraction of the starting pot */
}

/* ---------------- EV extraction ---------------- */
/* per exported combo: freq[dec][a] (u8) and loss[dec][a] (u8, 0.5% of pot units); agg[dec][a] for the node's player */
static uint8_t *expFreq[2], *expLoss[2], *aggFreq; static int *decOff[2], decTot[2], *aggOff, aggTot;
static float *expEV[2]; /* temp: EV per action per exported combo, for reporting */

static void evPass(int id, int p, const float *rp, const float *ro, double chanceW, float *out) {
  Node *n = &nodes[id];
  int o = 1 - p, np = N[p], no = N[o];
  if (n->type == FOLD) { foldValue(p, n, ro, out); return; }
  if (n->type == SHOW) { showdown(p, n->board, n->c, ro, out); return; }
  if (n->type == CHANCE) {
    int nc = n->nC; float w = 1.0f / nc;
    float *vals = calloc((size_t)nc * np, sizeof(float));
    #pragma omp parallel for schedule(dynamic) if (n->street == 0)
    for (int k = 0; k < nc; k++) {
      int b = n->cboard[k];
      float *rp2 = malloc(np * sizeof(float)), *ro2 = malloc(no * sizeof(float));
      const float *fp = fac[p][facSet(n)], *fo = fac[o][facSet(n)];
      for (int h = 0; h < np; h++) rp2[h] = rp[h] * alive[p][b][h] * fp[h];
      for (int h = 0; h < no; h++) ro2[h] = ro[h] * alive[o][b][h] * fo[h];
      evPass(n->cchild[k], p, rp2, ro2, chanceW * w, vals + (size_t)k * np);
      free(rp2); free(ro2);
    }
    memset(out, 0, np * sizeof(float));
    for (int k = 0; k < nc; k++) { int b = n->cboard[k]; const float *fp = fac[p][facSet(n)]; for (int h = 0; h < np; h++) out[h] += w * vals[(size_t)k * np + h] * alive[p][b][h] * fp[h]; }
    free(vals); return;
  }
  int na = n->nA, nq = N[n->player];
  float *sigma = malloc((size_t)na * nq * sizeof(float)); avgStrat(n, sigma);
  float *va = malloc((size_t)na * np * sizeof(float));
  if (n->player == p) {
    float *r2 = malloc(np * sizeof(float));
    for (int a = 0; a < na; a++) { for (int h = 0; h < np; h++) r2[h] = rp[h] * sigma[a * np + h]; evPass(n->child[a], p, r2, ro, chanceW, va + a * np); }
    free(r2);
    for (int h = 0; h < np; h++) { float v = 0; for (int a = 0; a < na; a++) v += sigma[a * np + h] * va[a * np + h]; out[h] = v; }
    /* range aggregate */
    double tot = 0, fa[MAXA] = {0};
    for (int h = 0; h < np; h++) { tot += rp[h]; for (int a = 0; a < na; a++) fa[a] += rp[h] * sigma[a * np + h]; }
    for (int a = 0; a < na; a++) aggFreq[aggOff[id] + a] = (uint8_t)lrint(tot > 0 ? fa[a] / tot * 255 : 255.0 / na);
    /* exported combos */
    float *cmp = malloc(np * sizeof(float)); compat(p, ro, cmp);
    float pot = P0 + 2 * n->c + n->cs[0] + n->cs[1];
    for (int e = 0; e < nExp[p]; e++) {
      int h = expIdx[p][e];
      size_t off = (size_t)e * decTot[p] + decOff[p][n->dIdx];
      double norm = cmp[h];
      int ok = alive[p][n->board][h] && norm > 1e-12;
      double ev[MAXA], best = -1e30;
      for (int a = 0; a < na; a++) { ev[a] = ok ? va[a * np + h] / norm : 0; if (ev[a] > best) best = ev[a]; }
      for (int a = 0; a < na; a++) {
        expFreq[p][off + a] = ok ? (uint8_t)lrint(sigma[a * np + h] * 255) : 0;
        double loss = ok ? (best - ev[a]) / pot * 200 : 0;
        expLoss[p][off + a] = (uint8_t)(loss > 255 ? 255 : lrint(loss));
      }
    }
    free(cmp);
  } else {
    float *r2 = malloc(no * sizeof(float));
    for (int a = 0; a < na; a++) { for (int h = 0; h < no; h++) r2[h] = ro[h] * sigma[a * no + h]; evPass(n->child[a], p, rp, r2, chanceW, va + a * np); }
    free(r2);
    for (int h = 0; h < np; h++) { float v = 0; for (int a = 0; a < na; a++) v += va[a * np + h]; out[h] = v; }
  }
  free(sigma); free(va);
}

/* ---------------- I/O ---------------- */
static void put8(FILE *f, int v) { uint8_t b = v; fwrite(&b, 1, 1, f); }
static void put16(FILE *f, int v) { uint16_t b = v; fwrite(&b, 2, 1, f); }
static void put32(FILE *f, uint32_t v) { fwrite(&v, 4, 1, f); }
static void putf(FILE *f, float v) { fwrite(&v, 4, 1, f); }

static void writeOut(double expl, int iters) {
  FILE *f = fopen(outPath, "wb");
  if (!f) { perror(outPath); exit(1); }
  fwrite("PKR1", 1, 4, f);
  putf(f, P0); putf(f, STACK); putf(f, (float)expl); put32(f, iters);
  for (int i = 0; i < 3; i++) put8(f, flop[i]);
  put32(f, nNodes);
  for (int i = 0; i < nNodes; i++) {
    Node *n = &nodes[i]; put8(f, n->type);
    if (n->type == DEC) {
      put8(f, n->player); put8(f, n->nA);
      for (int a = 0; a < n->nA; a++) { put8(f, n->kind[a]); putf(f, n->put[a]); put32(f, n->child[a]); }
    } else if (n->type == CHANCE) {
      put8(f, n->nC);
      for (int k = 0; k < n->nC; k++) { put8(f, n->ccard[k]); put32(f, n->cchild[k]); }
    }
  }
  fwrite(aggFreq, 1, aggTot, f);
  for (int p = 0; p < 2; p++) {
    put16(f, nExp[p]);
    for (int e = 0; e < nExp[p]; e++) { int h = expIdx[p][e]; put8(f, hc1[p][h]); put8(f, hc2[p][h]); putf(f, hw[p][h]); }
    put32(f, decTot[p]);
    for (int e = 0; e < nExp[p]; e++) {
      fwrite(expFreq[p] + (size_t)e * decTot[p], 1, decTot[p], f);
      fwrite(expLoss[p] + (size_t)e * decTot[p], 1, decTot[p], f);
    }
  }
  fclose(f);
}

static void readConfig(const char *path) {
  FILE *f = fopen(path, "r"); if (!f) { perror(path); exit(1); }
  char key[64];
  while (fscanf(f, "%63s", key) == 1) {
    if (!strcmp(key, "pot")) fscanf(f, "%f", &P0);
    else if (!strcmp(key, "stack")) fscanf(f, "%f", &STACK);
    else if (!strcmp(key, "flop")) fscanf(f, "%d %d %d", &flop[0], &flop[1], &flop[2]);
    else if (!strcmp(key, "turns")) {
      fscanf(f, "%d %d", &T, &R);
      for (int t = 0; t < T; t++) { fscanf(f, "%d", &turnCard[t]); for (int r = 0; r < R; r++) fscanf(f, "%d", &riverCard[t][r]); }
    } else if (!strcmp(key, "sizes")) {
      int s, k; fscanf(f, "%d %d", &s, &k); nSizes[s] = k; for (int i = 0; i < k; i++) fscanf(f, "%f", &sizes[s][i]);
    } else if (!strcmp(key, "raise")) fscanf(f, "%f", &raiseMult);
    else if (!strcmp(key, "allin_spr")) fscanf(f, "%f", &allinSpr);
    else if (!strcmp(key, "allin_thresh")) fscanf(f, "%f", &allinThresh);
    else if (!strcmp(key, "range")) {
      int p, k; fscanf(f, "%d %d", &p, &k); N[p] = k;
      hc1[p] = malloc(k * sizeof(int)); hc2[p] = malloc(k * sizeof(int)); hw[p] = malloc(k * sizeof(float));
      for (int i = 0; i < k; i++) fscanf(f, "%d %d %f", &hc1[p][i], &hc2[p][i], &hw[p][i]);
    } else if (!strcmp(key, "export")) {
      int p, k; fscanf(f, "%d %d", &p, &k); nExp[p] = k; expIdx[p] = malloc(k * sizeof(int));
      for (int i = 0; i < k; i++) fscanf(f, "%d", &expIdx[p][i]);
    } else if (!strcmp(key, "iters")) fscanf(f, "%d", &maxIters);
    else if (!strcmp(key, "target")) fscanf(f, "%f", &target);
    else if (!strcmp(key, "threads")) fscanf(f, "%d", &threads);
    else if (!strcmp(key, "out")) fscanf(f, "%511s", outPath);
    else { fprintf(stderr, "unknown key %s\n", key); exit(1); }
  }
  fclose(f);
}

static void setupFac(void) {
  for (int p = 0; p < 2; p++) for (int set = 0; set <= T; set++) {
    int nc = set == 0 ? T : R; const int *cards = set == 0 ? turnCard : riverCard[set - 1];
    fac[p][set] = malloc(N[p] * sizeof(float));
    for (int h = 0; h < N[p]; h++) {
      int b = 0; for (int k = 0; k < nc; k++) b += (hc1[p][h] == cards[k]) + (hc2[p][h] == cards[k]);
      fac[p][set][h] = b >= nc ? 0 : (float)nc / (nc - b);
    }
  }
}

static int *sortKey; static int cmpIdx(const void *a, const void *b) { return sortKey[*(int *)a] - sortKey[*(int *)b]; }

static void setupBoards(void) {
  nBoards = 1 + T + T * R;
  for (int b = 0; b < nBoards; b++) {
    int len = 3; memcpy(boardCards[b], flop, sizeof flop);
    if (b >= 1 && b <= T) { boardCards[b][3] = turnCard[b - 1]; len = 4; }
    else if (b > T) { int t = (b - 1 - T) / R, r = (b - 1 - T) % R; boardCards[b][3] = turnCard[t]; boardCards[b][4] = riverCard[t][r]; len = 5; }
    boardLen[b] = len;
    for (int p = 0; p < 2; p++) {
      alive[p][b] = malloc(N[p] * sizeof(float));
      for (int h = 0; h < N[p]; h++) {
        int ok = 1; for (int i = 0; i < len; i++) if (hc1[p][h] == boardCards[b][i] || hc2[p][h] == boardCards[b][i]) ok = 0;
        alive[p][b][h] = ok;
      }
      if (len == 5) {
        rankv[p][b] = malloc(N[p] * sizeof(int)); order[p][b] = malloc(N[p] * sizeof(int));
        for (int h = 0; h < N[p]; h++) {
          int cards[7]; memcpy(cards, boardCards[b], 5 * sizeof(int)); cards[5] = hc1[p][h]; cards[6] = hc2[p][h];
          rankv[p][b][h] = alive[p][b][h] ? eval7(cards, 7) : -1;
          order[p][b][h] = h;
        }
        sortKey = rankv[p][b]; qsort(order[p][b], N[p], sizeof(int), cmpIdx);
      }
    }
  }
  for (int p = 0; p < 2; p++) {
    same[p] = malloc(N[p] * sizeof(int));
    for (int h = 0; h < N[p]; h++) {
      same[p][h] = -1;
      for (int x = 0; x < N[1 - p]; x++) {
        int a = hc1[1 - p][x], b = hc2[1 - p][x];
        if ((a == hc1[p][h] && b == hc2[p][h]) || (a == hc2[p][h] && b == hc1[p][h])) { same[p][h] = x; break; }
      }
    }
  }
}

int main(int argc, char **argv) {
  if (argc < 2) { fprintf(stderr, "usage: solver config.txt\n"); return 1; }
  readConfig(argv[1]);
  omp_set_num_threads(threads);
  omp_set_max_active_levels(1);
  setupBoards();
  setupFac();
  buildStreet(0, 0, 0);
  /* storage */
  size_t tot = 0;
  for (int i = 0; i < nNodes; i++) if (nodes[i].type == DEC) tot += (size_t)nodes[i].nA * N[nodes[i].player];
  float *arena = calloc(tot * 2, sizeof(float));
  size_t off = 0;
  for (int i = 0; i < nNodes; i++) if (nodes[i].type == DEC) {
    size_t k = (size_t)nodes[i].nA * N[nodes[i].player];
    nodes[i].regret = arena + off; off += k; nodes[i].ssum = arena + off; off += k;
  }
  fprintf(stderr, "nodes %d  decisions %d/%d  combos %d/%d  floats %.1fM (%.0f MB)\n", nNodes, nDec[0], nDec[1], N[0], N[1], tot * 2 / 1e6, tot * 8 / 1e6);
  float *out = malloc((N[0] > N[1] ? N[0] : N[1]) * sizeof(float));
  double expl = 1; int it;
  double t0 = omp_get_wtime();
  for (it = 1; it <= maxIters; it++) {
    double ta = pow(it, 1.5);
    posDisc = (float)(ta / (ta + 1)); negDisc = 0.5f; stratDisc = (float)pow((double)(it - 1) / it, 2);
    for (int p = 0; p < 2; p++) cfr(0, p, hw[p], hw[1 - p], out);
    if (it % 25 == 0 || it == maxIters) {
      expl = exploitability();
      fprintf(stderr, "iter %d  exploitability %.3f%% pot  (%.0fs)\n", it, expl * 100, omp_get_wtime() - t0);
      if (expl < target) break;
    }
  }
  if (it > maxIters) it = maxIters;
  /* extract */
  for (int p = 0; p < 2; p++) {
    decOff[p] = malloc(nDec[p] * sizeof(int)); decTot[p] = 0;
  }
  aggOff = malloc(nNodes * sizeof(int)); aggTot = 0;
  for (int i = 0; i < nNodes; i++) if (nodes[i].type == DEC) {
    int p = nodes[i].player; decOff[p][nodes[i].dIdx] = decTot[p]; decTot[p] += nodes[i].nA; aggOff[i] = aggTot; aggTot += nodes[i].nA;
  }
  aggFreq = calloc(aggTot, 1);
  for (int p = 0; p < 2; p++) { expFreq[p] = calloc((size_t)nExp[p] * decTot[p], 1); expLoss[p] = calloc((size_t)nExp[p] * decTot[p], 1); }
  for (int p = 0; p < 2; p++) {
    float *v = malloc(N[p] * sizeof(float));
    evPass(0, p, hw[p], hw[1 - p], 1.0, v);
    free(v);
  }
  (void)expEV;
  writeOut(expl, it);
  fprintf(stderr, "wrote %s\n", outPath);
  return 0;
}
