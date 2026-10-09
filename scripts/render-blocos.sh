#!/bin/bash
# Render em blocos retomáveis (sobrevive a reinícios): pula blocos já prontos, depois concatena e mixa o áudio.
# Uso: scripts/render-blocos.sh <Composicao> <saida.mp4> [quadros_por_bloco=600] [total_de_quadros]
set -e
COMP="$1"; OUT="$2"; N="${3:-600}"; DIR="out/blocos/$COMP"; mkdir -p "$DIR"
[ -d build ] || npx remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
TOTAL="${4:-$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 out/vpc-001/ver-para-crer-ep01-v3-Vertical.mp4)}"
echo "total $TOTAL"
: > "$DIR/lista.txt"
for ((a=0; a<TOTAL; a+=N)); do
  b=$((a+N-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  F="$DIR/b-$(printf %05d $a).mp4"
  if [ ! -s "$F.ok" ]; then
    npx remotion render build "$COMP" "$F" --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --log=error && echo ok > "$F.ok"
    echo "bloco $a-$b"
  fi
  echo "file '$(basename $F)'" >> "$DIR/lista.txt"
done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$DIR/lista.txt" -c copy "$DIR/video.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$DIR/video.mp4" -i public/audio/vpc-001/mix-master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest "$OUT"
echo "pronto $OUT"
