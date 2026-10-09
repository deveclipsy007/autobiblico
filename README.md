# VER PARA CRER · Motion Factory (Remotion)

Primeiro episódio: **"O poder de algo quase invisível"** (Mateus 13.31–32), em 9:16 e 16:9, 60 fps.
Estilo **Minimalismo Narrativo Vivo**: uma página que se transforma em mundo; cada transformação conta algo.

## Rodar
```bash
npm i
npm run studio                                   # pré-visualização (props: audio = none | voice | mix)
node --experimental-strip-types scripts/vpc-001-score.mjs   # trilha + efeitos a partir das âncoras da voz
scripts/masterizar-audio.sh public/audio/vpc-001/mix-vo-raw.wav public/audio/vpc-001/mix-master.wav
npm run render:v && npm run render:h             # vídeos finais
scripts/pranchas.sh VPC001-Vertical "1.6 6 11.4 …"   # pranchas de revisão
python3 scripts/checar-saltos.py out/vpc-001/<arquivo>.mp4
```

## Arquitetura (`src/films/vpc-001/`)
- `data.ts` — tempos por palavra da narração (faster-whisper large-v3-turbo).
- `story.ts` — `PRE`, `T()`, `sync()`, âncoras `A` e seções `S`: **timeline centralizada** derivada da voz.
- `Film.tsx` — o diretor: janelas de cena, íris, áudio.
- `lib/` — curvas e utilitários (`math`), formato (`format`: recomposição 9:16/16:9), métrica tipográfica (`measure`), geometria procedural (`plant`: árvore, raízes, rede).
- `components/` — `BiblePageScene`, `ScriptureTypeReveal`, `HandDrawnUnderline`, `ScriptureToSeedMorph`, `SeedMacroScene`, `FingerScaleReveal`, `SoilCrossSection`, `ProceduralRootGrowth`, `SemanticDiagram`, `PlantGrowthSequence`, `BranchExpansion`, `BirdLandingAnimation`, `KingdomExpansionMap`, `HumanReflectionScene`, `KineticCaption`, `CinematicCamera`, `BrandSignature` (+ `WorldScene`, `Figures`, `ShareCard`, `Finish`).

Tudo é função contínua do tempo (sem CSS animation, sem timers): determinístico em qualquer render.
Documentação do episódio em `docs/vpc-001/`; documento-mãe da marca em `docs/VER_PARA_CRER_MASTER.md`.
