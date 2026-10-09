// WorldScene — UM mundo contínuo (céu creme sobre a terra em corte). A câmera atravessa tudo:
// macro da semente → dedo → queda → subsolo → raízes/diagrama → broto → árvore → mapa do Reino →
// (reflexão humana) → árvore com pessoas → compartilhamento → a luz que vira marca.
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {D, EIN, EIO, EO, ESM, Pt, cbez, clamp, dist, lerp, rnd, win} from '../lib/math';
import {Easing} from 'remotion';
const PULL = Easing.bezier(0.45, 0, 0.12, 1);
import {Fmt, fit, pick, useFmt} from '../lib/format';
import {A, BRAND, S} from '../story';
import {Cam, CamKey, WorldLayer, camAt, depthScale, drift, project} from './CinematicCamera';
import {OrbitBokeh, ScaleMarker, SEED_R, SeedSphere} from './SeedMacroScene';
import {FingerScaleReveal, contactWorld, handPose} from './FingerScaleReveal';
import {SoilCrossSection, SoilForeground} from './SoilCrossSection';
import {ProceduralRootGrowth, rootFront} from './ProceduralRootGrowth';
import {DiagramLabels, DiagramTrace, diagramGeo} from './SemanticDiagram';
import {PlantGrowthSequence, sproutAt} from './PlantGrowthSequence';
import {TREE} from './BranchExpansion';
import {Bird, Flight} from './BirdLandingAnimation';
import {KingdomExpansionMap, NightField} from './KingdomExpansionMap';
import {CAST, POSES, Persona, groundY, mixPose, palmOf} from '../../../brand/characters/Persona';
import {ShareCard} from './ShareCard';
import {ChromaTrail, Embers} from '../../../brand/fire';

// ---------- tempos ----------
export const W_T = {
  enter: A.pequeno + 0.2, tilt: A.coloca - 0.22, release: A.coloca + 0.1, land: A.terra + 0.06, exit: A.coloca + 0.25,
  rootStart: A.desenvolver - 0.2,
  diagA: A.depois - 0.05, diagOut: A.parecia - 0.4, diagTimes: [A.depois + 0.5, A.broto + 0.05, A.ate + 0.15],
  grow: A.cresce - 0.12,
  night: A.jesus2 + 0.6,
  messageIn: S.message + 0.3,
};
/** Instante em que o mundo volta (chicote vindo da cena da pessoa). */
export const MSG = W_T.messageIn - 0.1;
export const P1: Pt = [330, 0], P2: Pt = [1650, 0];
export const PS = 0.95;
/** Atuação de "Alguém": encolhido → abre as mãos → levanta a cabeça. */
export const p2Pose = (t: number) => mixPose(mixPose(POSES.sitHug, POSES.sitReceive, EIO(D(t, A.compartilhe + 0.3, 1.3))), POSES.sitHope, EIO(D(t, A.pessoa + 0.25, 1.6)));
export const p1Pose = (t: number) => mixPose(mixPose(POSES.lookUp, POSES.stand, EIO(D(t, A.vezes + 1.2, 1.4))), POSES.lookSide, EIO(D(t, A.compartilhe - 0.6, 1.1)));
export const p2Root = (t: number): Pt => [P2[0], groundY(p2Pose(t)) * PS];
export const p2Palm = (t: number): Pt => { const r = p2Root(t); return palmOf(p2Pose(t), r[0], r[1], PS); };
export const P2H: Pt = (() => { const pz = POSES.sitHope; return palmOf(pz, P2[0], groundY(pz) * PS, PS); })();

// ---------- semente: posição física ----------
export const seedWorld = (t: number) => {
  const pose = handPose(t, W_T.enter, W_T.tilt, W_T.exit);
  if (t < W_T.tilt) return {p: [0, -900] as Pt, stretch: 1};
  if (t < W_T.release) return {p: contactWorld(pose), stretch: 1};
  const r = contactWorld(handPose(W_T.release, W_T.enter, W_T.tilt, W_T.exit));
  const T = W_T.land - W_T.release, g = (2 * -r[1]) / (T * T);
  if (t < W_T.land) {
    const dt = t - W_T.release;
    return {p: [lerp(r[0], 0, dt / T), r[1] + 0.5 * g * dt * dt] as Pt, stretch: 1 + Math.min(1.6, (g * dt) / 2600)};
  }
  return {p: [0, 110 * EO(D(t, W_T.land, 0.55))] as Pt, stretch: 1};
};

// ---------- câmera ----------
export const worldKeys = (f: Fmt): CamKey[] => {
  const dg = diagramGeo(f);
  const zTree = fit(f, 1900, 2150), zK = fit(f, 3300, 3600);
  const m = pick(f, {x: 0, y: -1437, z: 0.48}, {x: -1050, y: -880, z: 0.5});
  const s = pick(f, {x: 1000, y: -870, z: 0.62}, {x: 950, y: -450, z: 0.78});
  return [
    {t: 0, x: 0, y: -900, z: 36, r: 5},
    {t: A.quase - 0.4, x: 0, y: -900, z: 40, r: 2, d: 2.3, e: ESM},
    {t: A.desaparece + 1.05, x: pick(f, 170, 300), y: pick(f, -850, -870), z: pick(f, 1.5, 1.25), r: 0, d: 1.15, e: PULL},
    {t: A.coloca - 0.05, x: pick(f, 130, 240), y: -865, z: pick(f, 1.62, 1.35), d: 1.15, e: ESM},
    {t: A.terra + 0.2, x: 0, y: pick(f, -60, -80), z: pick(f, 0.9, 0.78), d: 0.85, e: EIO},
    {t: A.acontecendo + 0.5, x: 0, y: pick(f, 140, 110), z: pick(f, 0.98, 0.84), d: 2.6, e: ESM},
    {t: A.mas2 + 1.75, x: 0, y: 110, z: pick(f, 5.2, 4.4), r: -3, d: 1.8},
    {t: A.desenvolver + 0.3, x: 0, y: 118, z: pick(f, 7.2, 6.2), r: 0, d: 1.9, e: ESM},
    {t: A.raiz + 0.75, x: 0, y: pick(f, 420, 360), z: pick(f, 1.45, 1.3), d: 1.9},
    {t: A.depois + 0.8, x: dg.cam.x, y: dg.cam.y, z: dg.z, d: 0.95},
    {t: A.parecia + 0.45, x: 0, y: -25, z: pick(f, 3.7, 3.1), d: 1.25},
    {t: A.cresce, x: 0, y: -40, z: pick(f, 4.1, 3.4), d: 1.0, e: ESM},
    {t: A.cresce + 2.1, x: 0, y: -790, z: zTree, d: 2.1},
    {t: A.jesus2, x: 0, y: -800, z: zTree * 0.94, d: 1.4, e: ESM},
    {t: A.reino2 + 0.2, x: 0, y: -650, z: zK, d: 1.7},
    {t: A.discreta + 0.15, x: 0, y: 0, z: pick(f, 2.6, 2.2), d: 1.75},
    {t: A.maior + 0.7, x: 0, y: -700, z: pick(f, 0.042, 0.05), d: 2.55},
    {t: A.anunciar + 0.55, x: 0, y: 0, z: 8, d: 1.6},
    {t: W_T.messageIn - 0.08, x: m.x - 800, y: m.y + 260, z: m.z * 1.2, d: 0.01},
    {t: W_T.messageIn + 0.6, x: m.x, y: m.y, z: m.z * 1.14, d: 0.59, e: EO},
    {t: A.vezes - 0.6, z: m.z, d: 2.9, e: ESM},
    {t: A.alguem2 - 0.1, x: m.x, y: m.y, z: m.z * 0.96, d: 4.6, e: ESM},
    {t: A.dificil + 0.1, x: s.x, y: s.y, z: s.z, d: 2.2},
    {t: A.lembrar + 0.3, x: s.x + 60, y: s.y, z: s.z * 1.08, d: 4.3, e: ESM},
    {t: A.esperanca + 0.25, x: P2H[0] - 20, y: P2H[1] - 30, z: pick(f, 2.3, 2.0), d: 3.1},
    {t: BRAND.tum - 0.05, x: P2H[0], y: P2H[1] - 6, z: 22, d: 0.8, e: EIN},
  ];
};
/** Inclinação da câmera (graus, topo se afasta): plongée no mergulho, contra-plongée na árvore, mapa rumo ao horizonte. */
export const worldPitch = (t: number) => camAt(t, [
  {t: 0, r: 0},
  {t: A.mas2 + 1.6, r: 12, d: 1.6}, {t: A.raiz, r: 0, d: 1.5},
  {t: A.abrigo, r: 11, d: 2.2}, {t: A.jesus2 + 0.8, r: 0, d: 1.4},
  {t: A.maior + 0.5, r: 42, d: 2.4}, {t: A.anunciar + 0.45, r: 0, d: 1.4},
  {t: A.esperanca + 0.2, r: 8, d: 2.6}, {t: BRAND.tum, r: 0, d: 0.7},
]).r;
export const worldCam = (t: number, f: Fmt): Cam => {
  const c = camAt(t, worldKeys(f));
  const calm = t < A.desaparece ? 0.3 : t > A.esperanca ? 0.2 : 1;
  return drift(c, t, calm);
};

// ---------- pássaros (pousam em pontas reais da árvore) ----------
const tipNear = (q: Pt) => TREE.tips.reduce((b, p) => (dist(p, q) < dist(b, q) ? p : b), TREE.tips[0]);
const PERCH = [tipNear([-430, -1220]), tipNear([400, -1330]), tipNear([-120, -1480])].map((p) => [p[0], p[1] - 14] as Pt);
export const FLIGHTS: Flight[] = [
  {from: [-2300, -2300], c1: [-1500, -2100], c2: [-700, -1500], to: PERCH[0], t0: A.torna - 0.35, t1: A.passaros + 0.02, scale: 1.25},
  {from: [2400, -2000], c1: [1700, -2200], c2: [800, -1700], to: PERCH[1], t0: A.abrigo - 0.1, t1: A.passaros + 0.55, scale: 1.15},
  {from: [-1900, -900], c1: [-1300, -1900], c2: [-500, -1900], to: PERCH[2], t0: A.passaros - 0.2, t1: A.percebe + 0.45, scale: 1.05},
];

// ---------- céu e dias ----------
const Sky: React.FC<{t: number; f: Fmt}> = ({t, f}) => {
  const days = clamp(D(t, A.tempo - 0.5, 2.8)) * 2;
  const ph = days % 1, on = days > 0 && t < A.acontecendo + 0.6;
  const night = on ? 0.5 * Math.max(0, -Math.sin(ph * Math.PI * 2 - Math.PI / 2)) ** 2 * clamp(days * 3) * clamp((2 - days) * 3) : 0;
  const sx = lerp(-0.1, 1.1, ph) * f.W, sy = f.H * pick(f, 0.2, 0.18) + (1 - Math.sin(ph * Math.PI)) * f.H * 0.18;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 30%, #FBF7EF 0%, ${COLORS.cream} 55%, #ECE4D4 100%)`}} />
      {on && <>
        <div style={{position: 'absolute', inset: 0, background: COLORS.deep, opacity: night * 0.18}} />
        <div style={{position: 'absolute', left: sx - 40, top: sy - 40, width: 80, height: 80, borderRadius: 40, background: COLORS.goldLight, boxShadow: '0 0 60px rgba(217,168,111,.8)', opacity: win(t, A.tempo - 0.5, A.acontecendo + 0.2, 0.4, 0.4) * clamp(Math.sin(ph * Math.PI) * 3)}} />
      </>}
    </>
  );
};

export const WorldScene: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const cam = worldCam(t, f);
  const pitch = worldPitch(t);
  const inHuman = t > S.human + 0.85 && t < W_T.messageIn - 0.09;
  if (inHuman) return null;
  const seed = seedWorld(t);
  const pose = handPose(t, W_T.enter, W_T.tilt, W_T.exit);
  const F = rootFront(t, {start: W_T.rootStart, raiz: A.raiz});
  const sprout = sproutAt(t, {broto: A.broto, insig: A.insignificante, cresce: A.cresce});
  const g = t > MSG ? 1 : ESM(D(t, W_T.grow, 2.5));
  const nightR = t > MSG ? -1 : (t < W_T.night ? 0 : 900 + 5100 * EIO(D(t, W_T.night, 1.3))) + 40000 * EIO(D(t, A.mas3 - 0.1, 2.5));
  const treeO = t > MSG ? 1 : (1 - EIO(D(t, A.comeco - 0.1, 1.0))) * (1 - 0.85 * win(t, A.algo + 0.1, A.mas3 - 0.05, 0.9, 0.6));
  const crack = EO(D(t, A.vida, 0.7));
  const seedGlow = 0.9 * Math.sin(Math.PI * D(t, A.vida - 0.1, 0.9)) + 0.25 * win(t, A.vida, A.raiz + 1.5, 0.6, 1.2);
  const planted = EO(D(t, W_T.land + 0.2, 0.6));
  const macroO = 1 - EO(D(t, A.desaparece, 0.6));
  const kingdom = t > A.jesus2 && t < MSG;
  const dip = win(t, A.algo - 0.1, A.mas3 - 0.1, 0.6, 0.4);
  const mapO = win(t, W_T.night + 0.3, A.comeco + 0.6, 0.8, 0.9) * (1 - 0.65 * dip);
  const share = t > A.alguem2 - 0.6;
  const arcU = EIO(D(t, A.compartilhe + 0.75, A.pessoa - A.compartilhe - 0.75));
  const arc = (u: number) => cbez(palmOf(p1Pose(t), P1[0], groundY(p1Pose(t)) * PS, PS), [P1[0] + 300, -1000], [P2H[0] - 300, -900], p2Palm(A.pessoa), u);
  const sproutHope = EO(D(t, A.esperanca - 0.05, 0.8));
  const pebbleO = win(t, A.mas2 - 0.2, A.mas2 + 1.9, 0.6, 0.4);
  const showSeedUnder = t > W_T.land && t < A.cresce + 1.2;
  const sP = project(f, cam, seed.p[0], seed.p[1]);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Sky t={t} f={f} />
      {nightR > 0 && <div style={{position: 'absolute', inset: 0, background: COLORS.deep, opacity: clamp((nightR - 2500) / 2500)}} />}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 58%', transform: Math.abs(pitch) > 0.05 ? `perspective(${f.v ? 1700 : 1400}px) rotateX(${pitch.toFixed(3)}deg)` : undefined}}>
      {macroO > 0 && <OrbitBokeh t={t} rot={t * 0.55} cx={sP[0]} cy={sP[1]} o={macroO * EO(D(t, S.seed, 0.8))} />}
      <WorldLayer cam={cam}>
        {t > A.mas2 - 0.2 && <circle cx={0} cy={110} r={0.1} />}
        {nightR < 9000 && <SoilCrossSection t={t} planted={planted} />}
        {F > 0 && t < MSG && nightR < 9000 && <ProceduralRootGrowth t={t} F={F} raizAt={A.raiz} raizOut={A.depois + 0.4} />}
        {t > MSG && <ProceduralRootGrowth t={t} F={1e5} raizAt={-9} raizOut={-8} />}
        <DiagramTrace t={t} f={f} a={W_T.diagA} out={W_T.diagOut} z={cam.z} />
        {nightR > 0 && <NightField R={nightR} t={t} o={EO(D(t, W_T.night, 0.7))} />}
        <g opacity={treeO}>
          <PlantGrowthSequence t={t} g={g} sprout={sprout} nightR={nightR} flowerBoost={kingdom ? 0.6 * EO(D(t, A.reino2 - 0.4, 1.2)) : 0} />
        </g>
        {/* semente: macro, dedo, queda, plantio, fenda de luz */}
        {(t < W_T.land || showSeedUnder) && <SeedSphere id="w-seed" x={seed.p[0]} y={seed.p[1]} rot={t * (t < W_T.release ? 0.9 : 3)} crack={crack} glow={clamp(seedGlow)} stretch={seed.stretch} />}
        <FingerScaleReveal pose={pose} />
        {/* a vida acende: brasas sobem da fenda */}
        <Embers t={t} x={0} y={104} a={A.vida} b={A.vida + 1.4} n={22} spread={7} rise={22} size={0.55} seed={4} />
        {t > A.torna - 0.4 && t < S.human + 0.6 && FLIGHTS.map((fl, i) => <g key={i} opacity={1 - EIO(D(t, W_T.night + 0.4, 1.0))}><Bird t={t} fl={fl} /></g>)}
        {t > MSG && FLIGHTS.map((fl, i) => <Bird key={i} t={t - W_T.messageIn + fl.t1 + 3 + i} fl={fl} />)}
        {/* começo: a semente acesa no centro do mapa */}
        {kingdom && t > A.comeco - 0.3 && <SeedSphere id="k-seed" x={0} y={0} glow={0.8 + 0.2 * Math.sin(t * 3)} rot={t} shade={EO(D(t, A.comeco - 0.3, 0.6))} />}
        {/* pessoas */}
        {t > MSG && <Persona x={P1[0]} y={groundY(p1Pose(t)) * PS} s={PS} pose={p1Pose(t)} look={CAST.semeador} t={t} />}
        {share && (
          <g>
            <ellipse cx={P2[0] + 20} cy={-110} rx={300} ry={260} fill="url(#shade)" opacity={0.85 * win(t, A.alguem2 - 0.3, A.pessoa + 0.2, 1.0, 1.8)} />
            {Array.from({length: 14}, (_, i) => { const x = P2[0] - 180 + rnd(i, 4) * 400, ph = (t * 1.6 + rnd(i, 5)) % 1; return <path key={i} d={`M ${x} ${-420 + ph * 380} l -10 34`} stroke={COLORS.deep} strokeWidth={3} strokeLinecap="round" opacity={0.45 * win(t, A.ama - 0.2, A.pessoa, 0.8, 1.2) * Math.sin(ph * Math.PI)} />; })}
            <circle cx={P2H[0]} cy={P2H[1]} r={260} fill="url(#warm)" opacity={clamp(EO(D(t, A.pessoa - 0.15, 2.4)) + sproutHope * 0.6)} />
            <Persona x={p2Root(t)[0]} y={p2Root(t)[1]} s={PS} pose={p2Pose(t)} look={CAST.alguem} t={t} rim={0.4 + 0.6 * EO(D(t, A.pessoa, 1.5))} />
            {arcU > 0 && arcU < 1 && <path d={`M ${Array.from({length: 40}, (_, k) => arc((k / 39) * arcU).map((v) => v.toFixed(1)).join(' ')).join(' L ')}`} fill="none" stroke={COLORS.gold} strokeWidth={3 / cam.z} strokeDasharray={`${8 / cam.z} ${10 / cam.z}`} opacity={0.9} />}
            {arcU > 0 && <SeedSphere id="share-seed" x={arcU < 1 ? arc(arcU)[0] : p2Palm(t)[0]} y={(arcU < 1 ? arc(arcU)[1] : p2Palm(t)[1]) - 3} glow={arcU < 1 ? 1 : 0.6 + sproutHope * 0.6} rot={t * 2} />}
            {sproutHope > 0 && (
              <g transform={`translate(${p2Palm(t)[0]} ${p2Palm(t)[1] - 7})`}>
                <path d={`M 0 0 C -2 -8 2 -14 0 ${-22 * sproutHope}`} stroke={COLORS.sage} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 0 0 C -3 -5 -12 -8 -15 -3 C -12 2 -4 2 0 0 Z" fill={COLORS.sage} transform={`translate(0 ${-22 * sproutHope}) scale(${sproutHope})`} />
                <path d="M 0 0 C 3 -5 12 -8 15 -3 C 12 2 4 2 0 0 Z" fill={COLORS.sageDark} transform={`translate(0 ${-22 * sproutHope}) scale(${sproutHope})`} />
              </g>
            )}
            <defs>
              <radialGradient id="shade"><stop offset="0" stopColor={COLORS.deep} stopOpacity="0.5" /><stop offset="0.6" stopColor={COLORS.deep} stopOpacity="0.22" /><stop offset="1" stopColor={COLORS.deep} stopOpacity="0" /></radialGradient>
              <radialGradient id="warm"><stop offset="0" stopColor={COLORS.goldLight} stopOpacity="0.55" /><stop offset="1" stopColor={COLORS.goldLight} stopOpacity="0" /></radialGradient>
            </defs>
          </g>
        )}
      </WorldLayer>
      {pebbleO > 0 && depthScale(cam, -300) > 0 && <WorldLayer cam={cam} dz={-300} opacity={pebbleO * clamp((depthScale(cam, -300) / cam.z - 1) * 1.5)} style={{filter: 'blur(5px)'}}><SoilForeground /></WorldLayer>}
      {kingdom && <KingdomExpansionMap t={t} f={f} cam={cam} dots={EO(D(t, A.reino2 - 0.5, 1.4))} links={EO(D(t, A.ceus2, 1.4))} waveR={t < A.mas3 - 0.1 ? 0 : 1600 + 22000 * EIO(D(t, A.mas3 - 0.1, 2.8))} o={mapO} originPulse={win(t, A.algo, A.mas3 + 0.5, 0.5, 0.5)} />}
      {t > W_T.diagA && t < W_T.diagOut + 0.6 && <DiagramLabels t={t} f={f} cam={cam} times={W_T.diagTimes} out={W_T.diagOut} />}
      {t > S.seed && t < A.desaparece + 0.6 && <ScaleMarker t={t} at={A.grao2 - 0.05} out={A.desaparece - 0.1} sx={sP[0]} sy={sP[1]} rPx={SEED_R * cam.z} />}
      {share && <ShareCard t={t} f={f} cam={cam} />}
      {/* rastros cromáticos (laranja/azul, como os traços da logo) */}
      {(t > W_T.release && t < W_T.land + 0.12) || (arcU > 0 && arcU < 1.0 + 0.0) ? (
        <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}>
          {t > W_T.release && t < W_T.land + 0.12 && <ChromaTrail light w={Math.max(5, SEED_R * cam.z * 1.2)} o={0.85 * (1 - D(t, W_T.land, 0.12))} pts={Array.from({length: 12}, (_, k) => { const ts = Math.max(W_T.release, Math.min(W_T.land, t) - (11 - k) * 0.011); const c = worldCam(ts, f); const sp = seedWorld(ts).p; return project(f, c, sp[0], sp[1]).slice(0, 2) as [number, number]; })} />}
          {arcU > 0 && arcU < 1 && <ChromaTrail light o={0.8} w={Math.max(5, SEED_R * cam.z * 1.2)} pts={Array.from({length: 14}, (_, k) => { const ts = t - (13 - k) * 0.018; const u = EIO(D(ts, A.compartilhe + 0.75, A.pessoa - A.compartilhe - 0.75)); const c = worldCam(ts, f); const p = arc(Math.max(0.001, u)); return project(f, c, p[0], p[1]).slice(0, 2) as [number, number]; })} />}
        </svg>
      ) : null}
      {/* raios de luz no "Percebe?" */}
      {t > A.percebe - 0.6 && t < W_T.night + 1.2 && <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(112deg, rgba(255,236,200,0) 0px, rgba(255,236,200,.0) 90px, rgba(255,236,200,.28) 150px, rgba(255,236,200,0) 230px)', mixBlendMode: 'screen', opacity: win(t, A.percebe - 0.5, W_T.night - 0.3, 1.0, 0.8) * 0.7, WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 75%)', maskImage: 'linear-gradient(180deg, #000 0%, transparent 75%)'}} />}
      {void S}
      </div>
    </div>
  );
};
