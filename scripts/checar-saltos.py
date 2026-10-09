#!/usr/bin/env python3
"""Detector de saltos (quadros que "pulam"): conteúdo que some seco, pose de câmera desencadeada, polígono que pisca.
Uso: python3 checar-saltos.py video.mp4 [limiar=2.5]
Saída: tempos com pico ISOLADO (maior que 2,2× a média dos vizinhos). Transições planejadas aparecem como rampa, não como pico."""
import re, subprocess, sys
video = sys.argv[1]; lim = float(sys.argv[2]) if len(sys.argv) > 2 else 2.5
log = '/tmp/claude-0/-home-user-autobiblico/deb394a3-c013-5928-aac9-f186f732c29d/scratchpad/_yavg.txt'
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', video, '-an', '-vf',
                f'scale=480:-1,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file={log}', '-f', 'null', '-'], check=True)
v, t = [], None
for l in open(log):
    m = re.search(r'pts_time:([\d.]+)', l)
    if m: t = float(m.group(1))
    m = re.search(r'YAVG=([\d.]+)', l)
    if m: v.append((t, float(m.group(1))))
iso = [(round(v[i][0], 2), round(v[i][1], 1)) for i in range(3, len(v) - 3)
       if v[i][1] > lim and v[i][1] > 2.2 * max(sum(v[j][1] for j in (i - 3, i - 2, i + 2, i + 3)) / 4, 0.3)]
print(f'{len(v)} quadros · picos isolados: {iso if iso else "nenhum"}')
