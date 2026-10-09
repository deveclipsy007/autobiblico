#!/bin/bash
# Master em duas passagens: −14 LUFS integrado, −1 dBTP. Uso: masterizar-audio.sh entrada.wav saida.wav
# Atenção zsh: use ${II} (com chaves). "$II:l" vira modificador de minúscula e quebra o filtro.
set -e
IN="$1"; OUT="$2"
J=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
II=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -hide_banner -loglevel error -y -i "$IN" -af "loudnorm=I=-14:TP=-1:LRA=11:${II}:linear=true,aresample=48000" -ar 48000 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
