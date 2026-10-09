#!/usr/bin/env python3
"""VER PARA CRER · texturas determinísticas (papel, grão, ruído de dissolução, solo) e logo em PNG."""
import numpy as np, os
from PIL import Image, ImageFilter, ImageDraw
R = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')
rng = np.random.default_rng(13)

def fbm(h, w, octaves=6, base=4, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w))
    amp = 1.0; tot = 0
    for o in range(octaves):
        n = base * 2 ** o
        g = r.random((n + 1, n + 1))
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(img, float) / 255 * amp; tot += amp; amp *= 0.55
    out /= tot
    return (out - out.min()) / (out.max() - out.min())

# papel: creme com fibras e manchas suaves (2048²)
S = 2048
base = np.array([245, 240, 231], float)
blot = fbm(S, S, 6, 3, 1)
paper = np.ones((S, S, 3)) * base
paper -= ((blot - 0.5) * 14)[..., None] * np.array([1, 1.1, 1.4])
fine = rng.normal(0, 3.2, (S, S))
paper += fine[..., None]
im = Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(im, 'RGBA')
for i in range(2600):  # fibras
    x, y = rng.random(2) * S; L = 8 + rng.random() * 46; a = rng.random() * np.pi
    pts = []
    for k in range(6):
        u = k / 5; pts.append((x + np.cos(a) * L * u + np.sin(u * 6 + i) * 2.2, y + np.sin(a) * L * u + np.cos(u * 5 + i) * 2.2))
    c = (150, 128, 100, int(12 + rng.random() * 22)) if rng.random() < 0.7 else (255, 255, 250, 40)
    d.line(pts, fill=c, width=1)
im = im.filter(ImageFilter.GaussianBlur(0.45))
im.save(os.path.join(R, 'paper.jpg'), quality=92)

# grão (512², cinza médio, para overlay)
g = rng.normal(128, 34, (512, 512)).clip(0, 255).astype(np.uint8)
Image.fromarray(g).save(os.path.join(R, 'grain.png'))

# ruído de dissolução para a logo (1254², suave + detalhe = "brasa")
n = fbm(1254, 1254, 7, 5, 7) * 0.8 + rng.random((1254, 1254)) * 0.2
n = (n - n.min()) / (n.max() - n.min())
n = 0.5 * n + 0.5 * np.linspace(0, 1, 1254)[None, :]  # fogo que se espalha da esquerda para a direita
n = (n - n.min()) / (n.max() - n.min())
Image.fromarray((n * 255).astype(np.uint8)).save(os.path.join(R, 'dissolve.png'))

# solo: pontilhado orgânico (1024², transparente)
so = np.zeros((1024, 1024, 4), np.uint8)
im = Image.fromarray(so); d = ImageDraw.Draw(im)
for i in range(9000):
    x, y = rng.random(2) * 1024; r = 0.6 + rng.random() ** 3 * 3.2
    a = int(30 + rng.random() * 90); c = (36, 39, 44, a) if rng.random() < 0.75 else (245, 240, 231, a // 2)
    d.ellipse((x - r, y - r, x + r, y + r), fill=c)
im.save(os.path.join(R, 'soil-speck.png'))

# logo em PNG (fonte: webp enviado pelo usuário)
Image.open(os.path.join(R, 'logo-src.webp')).convert('RGB').save(os.path.join(R, 'logo.png'))
print('ok')

# logo com alfa: "desmultiplica" o fundo creme claro (cada pixel = fundo + alfa·(cor − fundo))
a = np.asarray(Image.open(os.path.join(R, 'logo-src.webp')).convert('RGB')).astype(float)
bg = np.array([252.0, 250.0, 246.0])
diff = bg[None, None, :] - a
alpha = np.clip(diff.max(2) / 235.0, 0, 1) ** 0.85
alpha = np.clip((alpha - 0.025) / 0.975, 0, 1)
safe = np.maximum(alpha, 1e-3)[..., None]
col = np.clip(bg - diff / safe, 0, 255)
rgba = np.dstack([col, alpha * 255]).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(os.path.join(R, 'logo-alpha.png'))
print('logo-alpha ok')

# textura de carvão em brasa (letras queimando, no espírito do VER da logo)
H2, W2 = 512, 2048
base = fbm(H2, W2, 7, 6, 21)
spk = fbm(H2, W2, 4, 110, 22) * 0.7 + fbm(H2, W2, 3, 30, 23) * 0.3
char = np.array([30, 25, 23], float); ember = np.array([214, 92, 30], float); hot = np.array([255, 186, 110], float)
heat = np.clip((spk - 0.6) / 0.16, 0, 1) ** 1.8 * np.clip(base * 1.3, 0, 1)
img = char[None, None] * (0.85 + 0.3 * base[..., None]) * (1 - heat[..., None]) + ember[None, None] * heat[..., None]
hotm = np.clip((spk - 0.74) / 0.06, 0, 1)[..., None]
img = img * (1 - hotm) + hot[None, None] * hotm
grain2 = rng.normal(0, 7, (H2, W2))[..., None]
Image.fromarray(np.clip(img + grain2, 0, 255).astype(np.uint8)).save(os.path.join(R, 'ember-texture.jpg'), quality=93)
print('ember ok')
