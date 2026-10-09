// VER PARA CRER · EP01 — trilha e desenho de som sintetizados, lidos das MESMAS âncoras de palavra do filme.
// Arco: papel e silêncio → semente (delicado) → subsolo (grave, profundidade) → raízes (pulso que nasce) →
// crescimento (camadas) → abrigo (abre, admiração) → Reino (noite, brilho) → reflexão (voz na frente) →
// compartilhar (calor) → marca (impacto suave, resolve em Dó).
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CHORDS as CH, beatsIn, createEngine} from './audio-engine.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {A, S, END, PRE} = await import(join(root, 'src/films/vpc-001/story.ts'));
const X = createEngine(END);
const pad = (a, b, c, amp = 0.022, cut = 1400) => CH[c].pad.forEach((m, i) => X.padNote(a, b, m, amp, typeof cut === 'function' ? cut : () => cut, (i - 1.5) * 0.3));
const arp = (a, b, c, step = 0.5, amp = 0.014, oct = 12) => beatsIn(a, b, step).forEach((t, k) => X.pluck(t, CH[c].pad[[0, 2, 1, 3][k % 4]] + oct, amp * (k % 4 === 0 ? 1.15 : 0.85), k % 2 ? 0.3 : -0.3, 2400));
const bass = (a, b, c, amp = 0.03) => beatsIn(a, b, 2).forEach((t) => X.bassNote(t, 1.8, CH[c].root, amp));
const pulse = (a, b, amp = 0.07, step = 1) => beatsIn(a, b, step).forEach((t) => X.kick(t, amp));

const HAND = A.mostrando - 0.25;
// ---------- música ----------
pad(0.3, A.parece, 'Csus', 0.016, 700);
pad(A.parece, HAND + 0.6, 'Csus', 0.02, 1100);
pad(HAND + 0.6, A.coloca, 'F', 0.02, 1300); arp(A.um, A.coloca, 'F', 0.5, 0.009, 24);
pad(A.coloca, A.mas2, 'Am', 0.018, 900);
pad(A.mas2, A.desenvolver, 'Dm', 0.02, (t) => 600 + 500 * Math.min(1, Math.max(0, (t - A.mas2) / 4)));
X.sub(A.mas2 + 0.2, 26, 0.12, 3.0);
pad(A.desenvolver, A.depois, 'Am', 0.022, 1300); arp(A.desenvolver + 0.2, A.depois, 'Am', 0.5, 0.012, 12); bass(A.raiz - 0.3, A.depois, 'Am', 0.026);
pad(A.depois, A.cresce, 'F', 0.022, 1500); arp(A.depois, A.cresce, 'F', 0.25, 0.011, 12); bass(A.depois, A.cresce, 'F', 0.028); pulse(A.depois + 0.3, A.insignificante - 0.2, 0.05);
pad(A.cresce, A.percebe, 'C', 0.028, 2200); arp(A.cresce, A.percebe, 'C', 0.25, 0.014, 24); bass(A.cresce, A.percebe, 'C', 0.034); pulse(A.cresce, A.percebe - 0.3, 0.08, 0.5);
pad(A.percebe, A.jesus2 + 0.4, 'F', 0.026, 1800);
pad(A.jesus2 + 0.4, A.algo, 'Bb', 0.024, 1600); arp(A.reino2 - 0.2, A.algo, 'Bb', 0.5, 0.011, 24);
pad(A.algo, A.mas3, 'Dm', 0.018, 900);
pad(A.mas3, A.comeco, 'F', 0.028, 2400); arp(A.mas3, A.comeco, 'F', 0.25, 0.014, 24); bass(A.mas3, A.comeco, 'Bb', 0.036); pulse(A.mas3 + 0.4, A.comeco - 0.2, 0.09, 0.5);
pad(A.comeco, S.human + 1, 'C', 0.022, 1300);
pad(S.human + 1, A.oracao - 0.4, 'Am', 0.02, 1200); arp(A.convida, A.nem - 0.3, 'Am', 1, 0.01, 12);
pad(A.oracao - 0.4, A.nem - 0.3, 'F', 0.022, 1500);
pad(A.nem - 0.3, A.alguem2 - 0.4, 'C', 0.018, 1000);
pad(A.alguem2 - 0.4, A.compartilhe, 'Am', 0.02, 1100); arp(A.alguem2, A.compartilhe, 'Am', 1, 0.009, 12);
pad(A.compartilhe, A.esperanca, 'F', 0.024, 1800); arp(A.compartilhe, A.esperanca, 'F', 0.5, 0.011, 24); bass(A.pessoa, A.esperanca, 'F', 0.026);
pad(A.esperanca, A.ver, 'Csus', 0.022, 1400);
pad(A.ver, END + 0.3, 'C', 0.03, 2000); arp(A.crer + 0.3, END - 1.2, 'C', 0.5, 0.01, 24); bass(A.ver, END - 1, 'C', 0.03);

// ---------- desenho de som ----------
// abertura: papel, luz, tinta
X.paper(0.0, 1.4, 0.06); X.pen(0.3, 0.9, 0.35); X.swell(0.3, 0.3, 0.02);
X.pen(A.reino - 0.3, A.mostarda - A.reino + 0.6, 0.28);
X.pen(A.grao - 0.05, 0.7, 0.9); X.bell(A.grao + 0.05, 79, 0.022, 0.2, 1.4);
X.pen(A.mostarda + 0.45, 1.4, 0.18);
X.bell(A.mateus, 76, 0.026, -0.2, 2.0); X.shimmer(A.mateus, 0.8, 0.012, 14); X.bell(A.treze, 83, 0.02, 0.2, 1.6);
X.whoosh(A.parece + 0.2, 2.2, 0.025, true, -0.2, 0.2);
// a palavra vira ponto, o ponto se descola, a página cai
X.swell(A.olha + 0.55, 0.6, 0.04); X.pop(A.olha + 0.55, 69, 0.05, 0);
X.whoosh(HAND - 0.05, 1.1, 0.05, true, 0, 0); X.paper(HAND + 0.1, 1.2, 0.06); X.sub(HAND + 0.6, 29, 0.08, 1.4);
X.bell(HAND + 0.95, 84, 0.03, 0, 2.6); X.shimmer(HAND + 0.9, 1.2, 0.014, 18);
// semente
[0, 0.12, 0.24].forEach((d, i) => X.tick(A.grao2 + d, 0.025, 3000 + i * 300, 0.5));
[A.quase, A.quase + 0.17, A.quase + 0.34].forEach((t, i) => X.pop(t, [81, 76, 72][i], 0.03, 0));
X.whoosh(A.desaparece - 0.05, 1.0, 0.05, false, 0, 0); X.sub(A.desaparece + 0.1, 33, 0.06, 1.2);
// a mão inclina, a semente cai e toca a terra
X.tick(A.coloca - 0.2, 0.02, 1800, 0.3); X.whoosh(A.coloca + 0.1, 0.5, 0.05, false, 0, 0); X.thud(A.terra + 0.06, 0.22);
X.bell(A.tempo - 0.3, 76, 0.016, -0.5, 1.2); X.bell(A.tempo + 1.1, 76, 0.014, 0.5, 1.2);
// subsolo
X.whoosh(A.mas2 - 0.05, 1.8, 0.05, false, 0, 0);
X.swell(A.vida, 0.9, 0.05); X.bell(A.vida + 0.02, 72, 0.035, 0, 3.0); X.bell(A.vida + 0.1, 79, 0.03, 0, 3.0); X.shimmer(A.vida, 1.2, 0.014, 18); X.crunch(A.vida + 0.05, 0.05);
X.riser(A.desenvolver - 0.6, A.raiz, 0.018); X.pop(A.raiz, 64, 0.04, 0); X.sub(A.raiz, 28, 0.08, 1.6);
for (let i = 0; i < 8; i++) X.pop(A.raiz + 0.4 + i * 0.13, [76, 79, 81, 84, 76, 79, 83, 86][i], 0.016, (i % 3 - 1) * 0.5);
// diagrama
X.whoosh(A.depois - 0.05, 0.9, 0.03, true, -0.4, 0.4);
[A.depois + 0.5, A.broto + 0.05, A.ate + 0.15].forEach((t, i) => { X.pop(t, [76, 79, 84][i], 0.04, -0.3 + i * 0.3); X.tick(t + 0.04, 0.018, 3200, 0); });
X.whoosh(A.parecia - 0.4, 0.9, 0.03, false, 0.4, -0.4);
X.pop(A.insignificante, 91, 0.02, 0.3);
// cresce · abrigo · pássaros
X.riser(A.insignificante - 0.2, A.cresce + 0.05, 0.035); X.impact(A.cresce + 0.05, 0.1); X.sub(A.cresce + 0.05, 24, 0.1, 2.0);
X.whoosh(A.cresce, 2.2, 0.05, true, 0, 0); X.shimmer(A.cresce + 0.6, 1.6, 0.012, 26);
X.bell(A.abrigo, 79, 0.035, -0.3, 3); X.bell(A.abrigo + 0.12, 84, 0.03, 0.3, 3); X.bell(A.abrigo + 0.24, 88, 0.025, 0, 3); X.shimmer(A.abrigo, 1.6, 0.016, 22);
[A.torna, A.abrigo + 0.3, A.passaros - 0.1, A.passaros + 0.25, A.passaros + 0.8, A.percebe + 0.5, A.percebe + 1.0].forEach((t, i) => X.chirp(t, 0.022, (i % 2 ? 0.5 : -0.5), 3000 + (i % 3) * 300, 4300 + (i % 2) * 400));
// Reino
X.swell(A.jesus2 + 0.6, 1.0, 0.04); X.whoosh(A.jesus2 + 0.5, 1.8, 0.04, true, 0, 0); X.sub(A.jesus2 + 0.7, 26, 0.08, 2.0);
X.shimmer(A.reino2 - 0.4, 2.2, 0.02, 30); X.bell(A.reino2, 72, 0.03, 0, 3.2); X.bell(A.ceus2, 79, 0.03, 0, 3.2);
X.whoosh(A.algo, 1.8, 0.04, false, 0, 0); for (let i = 0; i < 3; i++) X.bell(A.algo + 0.6 + i * 0.7, 84, 0.012, 0, 1.2);
X.riser(A.mas3 - 0.9, A.alcance + 0.35, 0.05); X.impact(A.alcance + 0.35, 0.14); X.sub(A.alcance + 0.35, 24, 0.14, 2.4);
X.whoosh(A.alcance + 0.3, 2.4, 0.07, true, 0, 0); X.shimmer(A.alcance + 0.4, 2.6, 0.022, 40);
X.impact(A.maior, 0.08); X.bell(A.maior, 84, 0.03, 0, 2.6);
X.swell(A.anunciar + 0.3, 1.4, 0.05); X.whoosh(A.comeco + 0.1, 1.6, 0.05, false, 0, 0); X.bell(A.anunciar + 0.35, 79, 0.03, 0, 3.2);
// pessoa · três pequenos começos
X.bell(S.human + 0.1, 72, 0.025, 0, 3.0);
[A.oracao - 0.3, A.gesto - 0.25, A.decisao - 0.15].forEach((t, i) => { X.send(t, 0.025); X.bell(t + 0.35, [76, 79, 84][i], 0.03, -0.4 + i * 0.4, 2.2); X.pen(t + 0.3, 0.7, 0.25); });
X.whoosh(A.decisao + 0.6, 0.9, 0.02, true, 0.2, 0.6);
X.whoosh(A.nem - 0.4, 1.4, 0.03, true, -0.3, 0.3);
X.shimmer(A.vezes - 0.35, 1.2, 0.012, 20); X.whoosh(A.vezes - 0.35, 1.2, 0.025, true, -0.3, 0.3);
// compartilhar
X.tick(A.compartilhe + 0.2, 0.04, 2200, 0); X.send(A.compartilhe + 0.55, 0.04);
X.whoosh(A.compartilhe + 0.75, A.pessoa - A.compartilhe - 0.7, 0.03, true, -0.5, 0.5);
X.receive(A.pessoa - 0.05, 0.035); X.shimmer(A.pessoa, 1.2, 0.012, 16);
X.bell(A.esperanca, 79, 0.03, 0, 3); X.bell(A.esperanca + 0.12, 84, 0.028, 0, 3); X.shimmer(A.esperanca, 1.2, 0.016, 22);
// marca
X.whoosh(A.esperanca + 0.4, A.ver - A.esperanca - 0.4, 0.04, false, 0, 0); X.swell(A.ver, 0.6, 0.06);
X.impact(A.ver, 0.16); X.sub(A.ver, 24, 0.16, 2.6); X.bell(A.ver + 0.02, 72, 0.04, -0.3, 4); X.bell(A.ver + 0.08, 79, 0.035, 0.3, 4); X.bell(A.ver + 0.14, 84, 0.03, 0, 4);
X.shimmer(A.ver, 2.6, 0.022, 34); X.crunch(A.ver + 0.1, 0.04);
X.pen(A.para - 0.05, 0.9, 0.5);
X.bell(A.crer + 1.4, 88, 0.018, 0, 3.0);

X.render(join(root, 'public/audio/vpc-001'), [{path: join(root, 'public/audio/vpc-001/vo/voz.wav'), at: PRE}], {duckDepth: 0.55});
console.log('ok', END.toFixed(2));
