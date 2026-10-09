// Geometria procedural determinística: árvore de mostarda, raízes, rede do Reino.
// Cada segmento sabe a que distância do começo ele nasce: o crescimento é uma frente que viaja pela forma.
import {Pt, dist, rnd} from './math';

export type Seg = {p0: Pt; c: Pt; p1: Pt; w: number; d0: number; d1: number; depth: number; ang: number; tip: boolean; id: number};
export type Leaf = {p: Pt; ang: number; size: number; at: number; dark: boolean; id: number};
export type Tree = {segs: Seg[]; leaves: Leaf[]; tips: Pt[]; tipAt: number[]; maxD: number};

export const genTree = (seed = 3): Tree => {
  const segs: Seg[] = [], leaves: Leaf[] = [];
  let id = 0, lid = 0;
  const grow = (p: Pt, ang: number, len: number, w: number, depth: number, d: number) => {
    const a = (ang * Math.PI) / 180;
    const p1: Pt = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
    const bend = (rnd(id, seed) - 0.5) * 0.35 * len;
    const c: Pt = [(p[0] + p1[0]) / 2 - Math.sin(a) * bend, (p[1] + p1[1]) / 2 + Math.cos(a) * bend];
    const L = dist(p, p1);
    const me = id++;
    const tip = depth >= 6;
    segs.push({p0: p, c, p1, w, d0: d, d1: d + L, depth, ang, tip, id: me});
    if (depth >= 2) {
      const n = depth >= 4 ? 3 : 2;
      for (let k = 0; k < n; k++) {
        const u = 0.3 + (k / n) * 0.65, side = (k + me) % 2 ? 1 : -1;
        const q: Pt = [(1 - u) ** 2 * p[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) ** 2 * p[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
        leaves.push({p: q, ang: ang + side * (45 + rnd(lid, seed + 7) * 30), size: 22 + rnd(lid, seed + 8) * 22 - depth * 0.6, at: d + L * u, dark: rnd(lid, seed + 9) < 0.35, id: lid++});
      }
    }
    if (tip) return;
    const n = depth === 0 ? 3 : rnd(me, seed + 1) < 0.3 ? 3 : 2;
    const spread = depth === 0 ? 34 : 30 - depth * 1.5;
    for (let k = 0; k < n; k++) {
      let na = ang + spread * (k - (n - 1) / 2) * (n === 3 ? 1 : 1.25) + (rnd(me * 3 + k, seed + 2) - 0.5) * 16;
      na = Math.max(-172, Math.min(-8, na));
      grow(p1, na, len * (0.74 + rnd(me * 5 + k, seed + 3) * 0.1), w * 0.66, depth + 1, d + L);
    }
  };
  grow([0, 0], -90, 430, 34, 0, 0);
  const tipSegs = segs.filter((s) => s.tip);
  const maxD = Math.max(...segs.map((s) => s.d1));
  return {segs, leaves, tips: tipSegs.map((s) => s.p1), tipAt: tipSegs.map((s) => s.d1), maxD};
};

export type Root = {pts: Pt[]; d0: number; w: number; depth: number; id: number; special?: boolean};
export const genRoots = (seed = 5): {roots: Root[]; maxD: number; special: Root} => {
  const roots: Root[] = [];
  let id = 0;
  const walk = (p: Pt, ang: number, len: number, w: number, depth: number, d0: number, special = false): Root => {
    const pts: Pt[] = [p];
    const n = Math.max(6, Math.round(len / 16));
    let a = (ang * Math.PI) / 180, q = p;
    const me = id++;
    for (let i = 1; i <= n; i++) {
      a += (rnd(me * 31 + i, seed) - 0.5) * 0.32 + (special ? (0 - a) * 0.05 : (Math.PI / 2 - a) * 0.04);
      q = [q[0] + Math.cos(a) * (len / n), q[1] + Math.sin(a) * (len / n)];
      pts.push(q);
    }
    const r: Root = {pts, d0, w, depth, id: me, special};
    roots.push(r);
    if (depth < 3 && !special) {
      const kids = depth === 0 ? 7 : 3;
      for (let k = 0; k < kids; k++) {
        const u = 0.18 + (k / kids) * 0.72 + rnd(me + k, seed + 2) * 0.06, i = Math.floor(u * (pts.length - 1));
        const side = k % 2 ? 1 : -1;
        walk(pts[i], 90 + side * (50 + rnd(me * 7 + k, seed + 3) * 30), len * (0.42 + rnd(k + me, seed + 4) * 0.2), w * 0.55, depth + 1, d0 + u * len);
      }
    }
    return r;
  };
  walk([0, 110], 90, 820, 5.5, 0, 0);
  const main = roots[0];
  const special = walk(main.pts[Math.floor(main.pts.length * 0.33)], 20, 470, 3.6, 1, 0.33 * 820, true);
  const maxD = Math.max(...roots.map((r) => r.d0 + (r.pts.length - 1) * 16));
  return {roots, maxD, special};
};

export type Net = {nodes: {p: Pt; parent: number; r: number; ring: number}[]};
export const genNetwork = (seed = 11): Net => {
  const nodes: Net['nodes'] = [{p: [0, -700], parent: -1, r: 0, ring: 0}];
  let prev = [0];
  for (let k = 1; k <= 12; k++) {
    const R = 1500 * 1.42 ** (k - 1), n = Math.min(110, Math.round(7 * 1.55 ** k));
    const cur: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = ((i + rnd(i + k * 100, seed) * 0.8) / n) * Math.PI * 2, rr = R * (0.86 + rnd(i * 3 + k, seed + 1) * 0.28);
      const p: Pt = [Math.cos(a) * rr, -700 + Math.sin(a) * rr * 0.92];
      let best = prev[0], bd = 1e18;
      for (const j of prev) { const dd = dist(nodes[j].p, p); if (dd < bd) { bd = dd; best = j; } }
      nodes.push({p, parent: best, r: rr, ring: k});
      cur.push(nodes.length - 1);
    }
    prev = cur;
  }
  return {nodes};
};
