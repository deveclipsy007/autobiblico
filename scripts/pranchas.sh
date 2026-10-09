#!/bin/bash
# Pranchas de revisão: stills em paralelo a partir de uma lista de segundos (bundle único).
# Uso: scripts/pranchas.sh <ComposicaoId> "0.8 2.5 6.5 ..." [escala=0.5] [saida=out/stills]
set -e
COMP="$1"; TIMES="$2"; SCALE="${3:-0.5}"; OUT="${4:-out/stills}"; FPS=60
mkdir -p "$OUT"; rm -f "$OUT"/s-*.jpg
if [ ! -d build ] || [ -n "$REBUNDLE" ]; then npx remotion bundle src/index.ts --out-dir=build --log=error >/dev/null; fi
for s in $TIMES; do echo "$s $(python3 -c "print(round($s*$FPS))")"; done | xargs -P 4 -n 2 sh -c "npx remotion still build $COMP $OUT/s-\$(printf %06.2f \$0).jpg --frame=\$1 --scale=$SCALE --image-format=jpeg --log=error >/dev/null 2>&1 || echo falhou \$0"
ffmpeg -hide_banner -loglevel error -y -pattern_type glob -i "$OUT/s-*.jpg" -vf "scale=360:-1,drawtext=text='%{metadata\:lavf.image2dec.source_basename}':x=6:y=6:fontsize=14:fontcolor=red,tile=6x4:padding=4:color=white" -frames:v 1 "$OUT/prancha.jpg" 2>/dev/null || ffmpeg -hide_banner -loglevel error -y -pattern_type glob -i "$OUT/s-*.jpg" -vf "scale=360:-1,tile=6x4:padding=4:color=white" -frames:v 1 "$OUT/prancha.jpg"
ls "$OUT"
