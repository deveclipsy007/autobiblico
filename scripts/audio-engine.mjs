// Motor de áudio compartilhado dos filmes Operon: instrumentos, efeitos, reverb/delay, sidechain e mixagem.
// Cada filme escreve só o arranjo e os efeitos a partir do próprio timing.ts.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

export const CHORDS = {
  Csus: {root: 36, pad: [48, 55, 62, 65]},
  F: {root: 41, pad: [57, 60, 64, 67]},
  Dm: {root: 38, pad: [53, 57, 60, 64]},
  Bb: {root: 34, pad: [50, 53, 57, 64]},
  C: {root: 36, pad: [52, 55, 57, 62]},
  Am: {root: 33, pad: [52, 55, 60, 64]},
};
export const beatsIn = (a, b, step = 0.5, off = 0) => { const out = []; for (let t = a + off; t < b - 1e-6; t += step) out.push(t); return out; };

/** end: duração do filme (s). */
export function createEngine(end) {
  const SR = 48000;
  const DUR = end + 1.5; // cauda de reverb
  const N = Math.ceil(DUR * SR);
  const bus = () => [new Float32Array(N), new Float32Array(N)];
  const music = bus(), sfx = bus(), rev = bus(), dly = bus();
  const sidechain = new Float32Array(N).fill(1);

  // ---------- utilitários ----------
  const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const noise = () => rnd() * 2 - 1;
  const pan = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];
  const polyblep = (t, dt) => {
    if (t < dt) { t /= dt; return t + t - t * t - 1; }
    if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
    return 0;
  };
  /** Filtro de variáveis de estado (TPT): low/band/high estáveis com modulação por amostra. */
  const svf = () => {
    let ic1 = 0, ic2 = 0;
    return (x, fc, q = 0.7) => {
      const g = Math.tan(Math.PI * Math.min(fc, SR * 0.45) / SR), k = 1 / q;
      const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
      const v3 = x - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3;
      ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
      return {lp: v2, bp: v1, hp: x - k * v1 - v2};
    };
  };
  const write = (b, i, l, r, send = 0, dsend = 0) => {
    if (i < 0 || i >= N) return;
    b[0][i] += l; b[1][i] += r;
    if (send) { rev[0][i] += l * send; rev[1][i] += r * send; }
    if (dsend) { dly[0][i] += l * dsend; dly[1][i] += r * dsend; }
  };

  // ---------- instrumentos ----------
  function padNote(t0, t1, midi, amp, cutoff, p = 0) {
    const s0 = Math.floor(t0 * SR), len = Math.floor((t1 - t0 + 1.6) * SR);
    const det = [-0.07, 0, 0.07], ph = det.map(() => rnd()), fl = svf(), fr2 = svf(), pans = [-0.6, 0, 0.6].map((x) => pan(Math.max(-1, Math.min(1, x + p))));
    for (let n = 0; n < len; n++) {
      const t = n / SR, hold = t1 - t0;
      const env = Math.min(1, t / 0.9) * (t < hold ? 1 : Math.max(0, 1 - (t - hold) / 1.6));
      if (env <= 0 && t > hold) break;
      let l = 0, r = 0;
      det.forEach((d, i) => {
        const fr = mtof(midi + d) * (1 + Math.sin(t * 0.3 + i) * 0.0015), dt = fr / SR;
        ph[i] = (ph[i] + dt) % 1;
        const v = 2 * ph[i] - 1 - polyblep(ph[i], dt);
        l += v * pans[i][0]; r += v * pans[i][1];
      });
      const c = typeof cutoff === 'function' ? cutoff(t0 + t) : cutoff;
      const yl = fl(l, c, 0.6).lp, yr = fr2(r, c, 0.6).lp;
      const i = s0 + n, g = amp * env * (sidechain[i] ?? 1) * 0.9;
      write(music, i, yl * g, yr * g, 0.45);
    }
  }
  function bassNote(t0, dur, midi, amp) {
    const s0 = Math.floor(t0 * SR), len = Math.floor((dur + 0.08) * SR); let ph = 0;
    for (let n = 0; n < len; n++) {
      const t = n / SR, env = Math.min(1, t / 0.006) * Math.exp(-t / (dur * 0.9)) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.08));
      ph += mtof(midi) / SR;
      const v = Math.tanh(Math.sin(2 * Math.PI * ph) * 1.6) * 0.8;
      const i = s0 + n; write(music, i, v * amp * env * sidechain[i], v * amp * env * sidechain[i]);
    }
  }
  function kick(t0, amp = 0.9) {
    const s0 = Math.floor(t0 * SR), len = Math.floor(0.45 * SR); let ph = 0;
    for (let n = 0; n < len; n++) {
      const t = n / SR, f = 46 + 90 * Math.exp(-t / 0.035);
      ph += f / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.16) + noise() * Math.exp(-t / 0.002) * 0.25;
      write(music, s0 + n, v * amp, v * amp);
    }
    // sidechain: pad e baixo respiram com o bumbo
    for (let n = 0; n < 0.3 * SR; n++) { const i = s0 + n; if (i < N) sidechain[i] = Math.min(sidechain[i], 1 - 0.45 * Math.exp(-n / SR / 0.09)); }
  }
  function clap(t0, amp = 0.3) {
    const s0 = Math.floor(t0 * SR), f = svf();
    for (let n = 0; n < 0.3 * SR; n++) {
      const t = n / SR;
      const burst = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) / 0.006) : 0), 0) * 0.5 + Math.exp(-t / 0.12) * 0.5;
      const v = f(noise(), 1300, 0.9).bp * burst;
      write(music, s0 + n, v * amp, v * amp, 0.35);
    }
  }
  function hat(t0, amp = 0.08, decay = 0.035, p = 0.25) {
    const s0 = Math.floor(t0 * SR), f = svf(), [gl, gr] = pan(p);
    for (let n = 0; n < decay * 6 * SR; n++) {
      const v = f(noise(), 8500, 0.7).hp * Math.exp(-n / SR / decay);
      write(music, s0 + n, v * amp * gl, v * amp * gr, 0.08);
    }
  }
  function pluck(t0, midi, amp, p = 0, bright = 3200) {
    const s0 = Math.floor(t0 * SR), f = svf(), [gl, gr] = pan(p); let ph = rnd(), ph2 = 0;
    for (let n = 0; n < 0.6 * SR; n++) {
      const t = n / SR, fr = mtof(midi), dt = fr / SR;
      ph = (ph + dt) % 1; ph2 += fr * 2 / SR;
      const v = (2 * ph - 1 - polyblep(ph, dt)) * 0.6 + Math.sin(2 * Math.PI * ph2) * 0.3;
      const y = f(v, 400 + bright * Math.exp(-t / 0.08), 0.8).lp * Math.exp(-t / 0.22) * Math.min(1, t / 0.003);
      write(music, s0 + n, y * amp * gl, y * amp * gr, 0.3, 0.35);
    }
  }

  // ---------- efeitos (afinados na tonalidade quando têm altura) ----------
  function whoosh(t0, dur, amp = 0.35, up = true, p0 = -0.7, p1 = 0.7) {
    const s0 = Math.floor(t0 * SR), len = Math.floor(dur * SR), f = svf();
    for (let n = 0; n < len; n++) {
      const x = n / len, env = Math.sin(Math.PI * Math.pow(x, 0.75)) ** 2;
      const fc = up ? 250 * Math.pow(18, x) : 4500 * Math.pow(1 / 18, x);
      const v = f(noise(), fc, 1.4).bp * env;
      const [gl, gr] = pan(p0 + (p1 - p0) * x);
      write(sfx, s0 + n, v * amp * gl, v * amp * gr, 0.25);
    }
  }
  function pop(t0, midi, amp = 0.25, p = 0) {
    const s0 = Math.floor(t0 * SR), [gl, gr] = pan(p); let ph = 0;
    for (let n = 0; n < 0.25 * SR; n++) {
      const t = n / SR, f = mtof(midi) * (1 + 0.5 * Math.exp(-t / 0.012));
      ph += f / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.06) + noise() * Math.exp(-t / 0.0015) * 0.15;
      write(sfx, s0 + n, v * amp * gl, v * amp * gr, 0.2);
    }
  }
  function tick(t0, amp = 0.12, freq = 2400, p = 0) {
    const s0 = Math.floor(t0 * SR), [gl, gr] = pan(p);
    for (let n = 0; n < 0.03 * SR; n++) {
      const t = n / SR, v = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t / 0.006) + noise() * Math.exp(-t / 0.001) * 0.3;
      write(sfx, s0 + n, v * amp * gl, v * amp * gr, 0.1);
    }
  }
  function key(t0, amp = 0.05) {
    const s0 = Math.floor(t0 * SR), f = svf(), fc = 2800 + rnd() * 1800;
    for (let n = 0; n < 0.02 * SR; n++) {
      const v = f(noise(), fc, 1.2).bp * Math.exp(-n / SR / 0.004);
      write(sfx, s0 + n, v * amp, v * amp * 0.9, 0.04);
    }
  }
  function bell(t0, midi, amp = 0.18, p = 0, decay = 0.9) {
    const s0 = Math.floor(t0 * SR), [gl, gr] = pan(p), parts = [[1, 1], [2.76, 0.35], [5.4, 0.12]];
    for (let n = 0; n < decay * 4 * SR; n++) {
      const t = n / SR;
      const v = parts.reduce((a, [m, g]) => a + Math.sin(2 * Math.PI * mtof(midi) * m * t) * g * Math.exp(-t * m / decay), 0) * Math.min(1, t / 0.002);
      write(sfx, s0 + n, v * amp * gl, v * amp * gr, 0.35, 0.2);
    }
  }
  function stamp(t0, amp = 0.45) {
    const s0 = Math.floor(t0 * SR); let ph = 0;
    for (let n = 0; n < 0.4 * SR; n++) {
      const t = n / SR; ph += (55 + 60 * Math.exp(-t / 0.03)) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.09) * 0.8 + noise() * Math.exp(-t / 0.004) * 0.35;
      write(sfx, s0 + n, v * amp, v * amp, 0.2);
    }
    [65, 69, 72].forEach((m, i) => pop(t0 + 0.01 + i * 0.012, m + 12, 0.07, -0.3 + i * 0.3));
  }
  function riser(t0, t1, amp = 0.25) {
    const s0 = Math.floor(t0 * SR), len = Math.floor((t1 - t0) * SR), f = svf(); let ph = 0;
    for (let n = 0; n < len; n++) {
      const x = n / len, env = x ** 2.2;
      ph += (180 * Math.pow(6, x)) / SR;
      const v = f(noise(), 300 * Math.pow(25, x), 2).bp * 0.8 + Math.sin(2 * Math.PI * ph) * 0.15;
      write(sfx, s0 + n, v * amp * env, v * amp * env, 0.35);
    }
  }
  function impact(t0, amp = 0.9) {
    const s0 = Math.floor(t0 * SR), f = svf(); let ph = 0;
    for (let n = 0; n < 2.4 * SR; n++) {
      const t = n / SR; ph += (32 + 40 * Math.exp(-t / 0.08)) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.7) + f(noise(), 900, 0.7).lp * Math.exp(-t / 0.05) * 0.6;
      write(sfx, s0 + n, v * amp, v * amp, 0.4);
    }
  }
  function shimmer(t0, dur, amp = 0.06, dens = 18) {
    const notes = [77, 79, 81, 84, 86, 88, 89, 91, 93, 96];
    for (let i = 0; i < dur * dens; i++) bell(t0 + rnd() * dur, notes[Math.floor(rnd() * notes.length)], amp * (0.4 + rnd() * 0.6), rnd() * 2 - 1, 0.35);
  }


  function reverb([inL, inR], wet) {
    const scale = SR / 44100, combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225];
    const out = bus();
    [inL, inR].forEach((inp, ch) => {
      const cs = combs.map((c) => ({b: new Float32Array(Math.floor((c + ch * 23) * scale)), i: 0, f: 0}));
      const as = aps.map((a) => ({b: new Float32Array(Math.floor((a + ch * 23) * scale)), i: 0}));
      for (let n = 0; n < N; n++) {
        const x = inp[n] * 0.015; let y = 0;
        for (const c of cs) { const o = c.b[c.i]; c.f = o * 0.8 + c.f * 0.2; c.b[c.i] = x + c.f * 0.86; c.i = (c.i + 1) % c.b.length; y += o; }
        for (const a of as) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.b.length; y = v; }
        out[ch][n] = y * wet;
      }
    });
    return out;
  }
  function delay([inL, inR], time, fb, wet) {
    const d = Math.floor(time * SR), out = bus(), f = [svf(), svf()];
    for (let ch = 0; ch < 2; ch++) for (let n = 0; n < N; n++) {
      const src = n - d >= 0 ? out[1 - ch][n - d] : 0; // ping-pong
      out[ch][n] = f[ch](inL[n] * (ch ? 0 : 1) + inR[n] * (ch ? 1 : 0) + src * fb, 3500).lp;
    }
    for (let ch = 0; ch < 2; ch++) for (let n = 0; n < N; n++) out[ch][n] *= wet;
    return out;
  }
  function readWav(p) {
    const b = readFileSync(p); let o = 12, fmt, data;
    while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') fmt = o + 8; if (id === 'data') { data = [o + 8, sz]; break; } o += 8 + sz; }
    const chs = b.readUInt16LE(fmt + 2), rate = b.readUInt32LE(fmt + 4), bits = b.readUInt16LE(fmt + 14);
    const n = data[1] / (bits / 8) / chs, out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = bits === 16 ? b.readInt16LE(data[0] + i * chs * 2) / 32768 : b.readFloatLE(data[0] + i * chs * 4);
    return {rate, samples: out};
  }
  function wav(path, [L, R]) {
    const b = Buffer.alloc(44 + N * 4);
    b.write('RIFF', 0); b.writeUInt32LE(36 + N * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
    b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 4, 40);
    for (let n = 0; n < N; n++) for (let c = 0; c < 2; c++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, [L, R][c][n])) * 32767), 44 + n * 4 + c * 2);
    writeFileSync(path, b);
  }

  /** Respiro reverso: ruído filtrado que cresce e corta exatamente em tEnd (antecipa a transição). */
  function swell(tEnd, dur = 0.7, amp = 0.16) {
    const s0 = Math.floor((tEnd - dur) * SR), len = Math.floor(dur * SR), f = svf();
    for (let n = 0; n < len; n++) {
      const x = n / len, env = x ** 3;
      const v = f(noise(), 600 + 5000 * x * x, 0.8).lp * env;
      write(sfx, s0 + n, v * amp, v * amp * 0.9, 0.3);
    }
  }
  /** Sub-grave de resolução: peso físico num momento-chave, sem ataque percussivo. */
  function sub(t0, midi = 29, amp = 0.35, dur = 1.6) {
    const s0 = Math.floor(t0 * SR); let ph = 0;
    for (let n = 0; n < dur * SR; n++) {
      const t = n / SR; ph += mtof(midi) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.min(1, t / 0.08) * Math.exp(-t / (dur * 0.45));
      write(music, s0 + n, v * amp, v * amp);
    }
  }
  /** Mensagem enviada: sopro curto ascendente + clique agudo. */
  function send(t0, amp = 0.12) { whoosh(t0 - 0.06, 0.16, amp, true, 0, 0.3); pop(t0 + 0.02, 88, amp * 0.8, 0.2); }
  /** Mensagem recebida: duas notas suaves. */
  function receive(t0, amp = 0.1) { bell(t0, 81, amp, -0.2, 0.6); bell(t0 + 0.07, 88, amp * 0.7, -0.2, 0.6); }


  /** Caneta no papel: ruído granulado que segue a velocidade do traço (sem som cartunesco). */
  function pen(t0, dur, amp = 0.6) {
    const s0 = Math.floor(t0 * SR), len = Math.floor(dur * SR), f = svf(), f2 = svf();
    let grain = 0;
    for (let n = 0; n < len; n++) {
      const x = n / len;
      const speed = Math.sin(Math.PI * Math.min(1, x * 1.15)) ** 0.6; // começa, sustenta, freia
      if (rnd() < 0.004) grain = 1; grain *= 0.993; // fibras do papel
      const v = (f(noise(), 1500, 0.7).bp * 0.8 + f2(noise(), 3200, 0.6).bp * 0.2) * (0.55 + 0.45 * Math.sin(n / SR * 2 * Math.PI * 7 + rnd() * 0.3)) * (1 + grain * 1.5);
      write(sfx, s0 + n, v * amp * speed * 0.045, v * amp * speed * 0.04, 0.02);
    }
  }
  /** Borracha: atrito grave e áspero, em vaivém. */
  function eraser(t0, dur, amp = 0.5) {
    const s0 = Math.floor(t0 * SR), len = Math.floor(dur * SR), f = svf();
    for (let n = 0; n < len; n++) {
      const t = n / SR, stroke = Math.abs(Math.sin(t * Math.PI * 6));
      const v = f(noise(), 900, 0.6).bp * stroke * Math.sin(Math.PI * n / len);
      write(sfx, s0 + n, v * amp * 0.2, v * amp * 0.2, 0.02);
    }
  }
  /** Folha: sopro largo e suave nos grandes movimentos de câmera. */
  function paper(t0, dur = 0.8, amp = 0.2) { whoosh(t0, dur, amp, true, -0.3, 0.3); }
  /** Quebra da invenção: estalo seco + pequenos fragmentos. */
  function crunch(t0, amp = 0.5) {
    const s0 = Math.floor(t0 * SR), f = svf();
    for (let n = 0; n < 0.25 * SR; n++) { const t = n / SR; const v = f(noise(), 2400, 0.8).bp * Math.exp(-t / 0.04); write(sfx, s0 + n, v * amp, v * amp * 0.9, 0.2); }
    for (let i = 0; i < 9; i++) tick(t0 + 0.04 + rnd() * 0.35, 0.05 + rnd() * 0.05, 1500 + rnd() * 3000, rnd() * 2 - 1);
  }

  /** Mixa stems, locução opcional (com ducking) e grava music/sfx/mix-raw/mix-vo-raw em outDir. */
  function render(outDir, voPlacements = [], {duckDepth = 0.5} = {}) {
    const R = reverb(rev, 1.0), D = delay(dly, 0.375, 0.38, 0.5);
    const vo = new Float32Array(N);
    let hasVo = false;
    for (const {path, at} of voPlacements) {
      if (!existsSync(path)) continue;
      hasVo = true;
      const {rate, samples} = readWav(path), s0 = Math.floor(at * SR);
      for (let i = 0; i < samples.length * SR / rate; i++) { const j = s0 + i; if (j < N) vo[j] += samples[Math.floor(i * rate / SR)] * 0.9; }
    }
    const duck = new Float32Array(N); { let e = 0; for (let n = 0; n < N; n++) { const x = Math.abs(vo[n]); e = x > e ? e + (x - e) * 0.004 : e * 0.99993; duck[n] = 1 - Math.min(duckDepth, e * 2.2 * (duckDepth / 0.5)); } }
    mkdirSync(outDir, {recursive: true});
    const fadeOut = (n) => { const t = n / SR, e = end + 1.2; return t < end - 1 ? 1 : Math.max(0, (e - t) / (e - end + 1)); };
    const stem = (fn) => { const o = bus(); for (let n = 0; n < N; n++) { const g = fadeOut(n); for (let c = 0; c < 2; c++) o[c][n] = fn(n, c) * g; } return o; };
    const mus = stem((n, c) => music[c][n] + R[c][n] * 0.6 + D[c][n]);
    const fx = stem((n, c) => sfx[c][n] + R[c][n] * 0.4);
    wav(join(outDir, 'music.wav'), mus);
    wav(join(outDir, 'sfx.wav'), fx);
    const soft = (x) => Math.tanh(x * 1.1) / 1.1;
    wav(join(outDir, 'mix-raw.wav'), stem((n, c) => soft(mus[c][n] * 0.85 + fx[c][n] * 0.9)));
    if (hasVo) wav(join(outDir, 'mix-vo-raw.wav'), stem((n, c) => soft(mus[c][n] * 0.85 * duck[n] + fx[c][n] * 0.8 + vo[n])));
    return {hasVo};
  }

  /** Canto de pássaro discreto: dois glissandos senoidais curtos. */
  function chirp(t0, amp = 0.05, p = 0, f0 = 3200, f1 = 4600) {
    const [gl, gr] = pan(p);
    [0, 0.09].forEach((o, k) => {
      const s0 = Math.floor((t0 + o) * SR); let ph = 0;
      for (let n = 0; n < 0.07 * SR; n++) {
        const x = n / (0.07 * SR), f = (k ? f1 : f0) + (k ? -900 : 1100) * x;
        ph += f / SR;
        const v = Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * x) ** 2;
        write(sfx, s0 + n, v * amp * gl, v * amp * gr, 0.3);
      }
    });
  }
  /** Semente tocando a terra: baque grave e curto + grãos de terra. */
  function thud(t0, amp = 0.3) {
    const s0 = Math.floor(t0 * SR), f = svf(); let ph = 0;
    for (let n = 0; n < 0.35 * SR; n++) {
      const t = n / SR; ph += (70 + 50 * Math.exp(-t / 0.02)) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.07) + f(noise(), 1200, 0.7).lp * Math.exp(-t / 0.03) * 0.5;
      write(sfx, s0 + n, v * amp, v * amp, 0.15);
    }
    for (let i = 0; i < 7; i++) tick(t0 + 0.02 + rnd() * 0.18, 0.02 + rnd() * 0.02, 900 + rnd() * 1500, rnd() * 1.2 - 0.6);
  }
  /** Brasa crepitando: estalos curtos e filtrados, densidade e brilho decrescentes (fogo elegante, não fogueira). */
  function crackle(t0, dur, amp = 0.05, dens = 40) {
    for (let i = 0; i < dur * dens; i++) {
      const tt = t0 + rnd() * dur, k = 1 - (tt - t0) / dur;
      const s0 = Math.floor(tt * SR), f = svf(), fc = 1800 + rnd() * 4200, [gl, gr] = pan(rnd() * 1.2 - 0.6);
      for (let n = 0; n < 0.012 * SR; n++) { const v = f(noise(), fc, 1.4).bp * Math.exp(-n / SR / 0.0018); write(sfx, s0 + n, v * amp * k * gl, v * amp * k * gr, 0.12); }
    }
    whoosh(t0, dur, amp * 0.25, true, -0.2, 0.2);
  }
  return {crackle, chirp, thud, SR, N, sidechain, rnd, mtof, padNote, bassNote, kick, clap, hat, pluck, whoosh, pop, tick, key, bell, stamp, riser, impact, shimmer, swell, sub, send, receive, pen, eraser, paper, crunch, render};
}
