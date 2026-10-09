# VER PARA CRER · Personagens (identidade padrão)

Rig: `src/brand/characters/Persona.tsx` · Folha: composição `VPC-Personagens` (ver `personagens.png`).

## DNA visual
- **Proporção:** ~6,5 cabeças. Elegante, nunca infantil.
- **Formas:** geométricas e suaves, cores chapadas, **sem contorno preto**; um tom mais escuro no lado oposto à luz.
- **Rosto mínimo em 3/4 (olhando para a direita):** nariz em cunha, um olho em ponto, sobrancelha em traço. Emoção pelo olho (aberto · olhando para baixo · fechado), pela inclinação da cabeça e pelo tronco.
- **Assinatura:** um **fio de luz de brasa** (dourado) na borda iluminada da cabeça e do tronco, e um pesponto dourado na gola. É o que liga as pessoas ao fogo da logo.
- **Membros de trás** um tom mais escuros (profundidade sem sombra pesada).
- **Paleta de roupas:** `deep` (azul profundo), `sage`, `cream`, `ember` (terracota). Calça grafite. Peles: 4 tons (`SKIN.a–d`).
- **Cabelos:** `short`, `bun`, `curly`, `long`, sempre grafite.

## Elenco
| Nome | Pele | Roupa | Cabelo | Papel |
|---|---|---|---|---|
| O Semeador | b | deep | short | quem planta, quem oferece |
| Alguém | c | sage | curly | quem atravessa um começo difícil |
| A Guardiã | a | cream | bun | reservado para próximos episódios |
| O Viajante | d | ember | long | reservado para próximos episódios |

## Como animar
- Toda pose é um conjunto de ângulos (`POSES`): `stand`, `lookUp`, `lookSide`, `offer`, `sitHug`, `sitReceive`, `sitHope`.
- **Atuação = interpolação de poses** com `mixPose(a, b, u)` e curvas EIO, nunca troca de desenho.
- `groundY(pose)` apoia os pés no chão; `palmOf(pose, …)` dá a posição da palma para colocar objetos na mão.
- Respiração e piscar já vêm do rig (função de `t`).

# Linguagem de fogo (`src/brand/fire.tsx`)
Vem da logo. **Acento, nunca fundo.** Clean e sofisticado.
- `BurnText`: palavra que queima para dentro (ou para fora) com borda incandescente e brasas. Modo `char` (carvão com faíscas, sobre creme) e `lit` (incandescente, sobre escuro). Use em 3–5 palavras por episódio.
- `Embers`: brasas subindo (momentos de vida, revelação).
- `ChromaRing`: borda de íris e ondas de luz em laranja/azul (os rastros cromáticos da logo).
- `ChromaTrail`: rastro de objetos rápidos (semente caindo, luz que viaja).
- Pontas de linhas que "desenham" (sublinhado, raízes, diagrama) terminam numa **ponta de brasa**.
- Cores: `EMBER.core #E8742A`, `EMBER.hot #FFB36B`, `EMBER.blue #79AEE0`.

# Marca: a esfera dourada (`src/brand/BrandSphere.tsx`)
- **Não há logo escrita nos filmes.** A marca é a esfera dourada (`public/img/sphere.png`, fundo recortado da arte original).
- **Aparições sutis:** ao lado do cabeçalho bíblico, no ponto de origem dos mapas, em cartões/selos. Pequena, girando devagar.
- **Assinatura final:** escuro → a luz do objeto-herói fica sozinha → "tum": a esfera entra com mola, gira desacelerando até assentar, um brilho a percorre, poeira dourada orbita, brilho elíptico no chão. Sem texto.
- A luz sobre a esfera é fixa (realce em cima à esquerda, sombra embaixo à direita) enquanto ela gira: é o que dá a sensação 3D.

# Tipografia (v3)
- **Display e versículos:** Cormorant Garamond (600 em caixa alta com tracking 0,05em; itálico 500 para palavras emotivas).
- **Micro-rótulos:** Manrope/DM Sans em caixa alta com tracking largo, em ouro.
- **Ouro em gradiente** (`GOLD.deep` sobre creme, `GOLD.light` sobre escuro) nas palavras-chave, nunca em tudo.
- **Fio dourado com losango** (`GoldRule`) acompanhando frases e palavras importantes.
