# Novas imagens oficiais — 09/11/2026

Os quatro arquivos foram enviados pelo solicitante em `assets/` como materiais oficiais. Foram inspecionados visualmente e comparados às artes usadas na landing page. Isso confirma a origem informada; não permite classificar as imagens como fotografias do produto físico.

| Original em assets/ | Dimensões | Avaliação e uso |
| --- | --- | --- |
| `WhatsApp Image 2026-11-09 at 17.05.47.jpeg` | 1024 × 1536 px | Clássico com rótulo mais detalhado. Aplicado no hero e no card Clássico. |
| `WhatsApp Image 2026-11-09 at 17.05.48.jpeg` | 1024 × 1536 px | Defumado com proporção, fundo e enquadramento compatíveis com o novo Clássico. Aplicado no card Defumado. |
| `WhatsApp Image 2026-11-09 at 17.09.16.jpeg` | 900 × 1600 px | Arte “Por trás do rótulo” sem interface do Instagram. Aplicada no recorte interativo e no link para a arte completa. |
| `WhatsApp Image 2026-11-09 at 17.05.48 (1).jpeg` | 1216 × 1293 px | Arte da caixa com Defumado. Preservada como referência: o enquadramento e a inclinação são diferentes da montagem atual e não há novo par Clássico correspondente. |

## Critérios aplicados

- As duas garrafas têm a mesma proporção e largura nativa. Foram mantidos fundo, brilho, rótulos e cores dos originais, com versões de 320, 480, 800 e 1024 px de largura em AVIF/WebP.
- Os nomes `classico-oficial-*` e `defumado-oficial-*` distinguem as novas artes das antigas e evitam reutilizar o cache dos arquivos anteriores. O preload do hero usa o mesmo srcset da imagem.
- O detalhe do rótulo foi recortado em `(220, 405, 680, 1312)` no original, resultando em 460 × 907 px, com variantes de 360 e 460 px. O recorte anterior tinha 360 × 710 px. A largura nativa disponível aumentou cerca de 28%, sem ampliação artificial.
- O canvas SVG mantém suas coordenadas normalizadas de 360 × 710, com diferença de proporção do novo recorte inferior a 0,03%. Círculos, linhas e focos do zoom foram recalibrados para as posições da arte atual.
- O enquadramento CSS oculta fragmentos de legendas fora do gargalo. Os cinco pontos por toque, o reset, os controles do desktop e a preferência por movimento reduzido continuam funcionando.
- O link “Ver a arte original completa” agora abre a nova arte inteira, em 900 × 1600 px, sem os controles do Instagram.
- A caixa interativa mantém o cenário fixo, a perspectiva calibrada e o fade de 0,9 segundo já solicitados. Trocar somente uma das artes da caixa causaria inconsistência na seleção. Para uma substituição completa, é necessário um par de imagens com o mesmo cenário ou recalibrar e recortar a nova montagem.
- As artes de servir, encontros, origem e compartilhamento social continuam como antes; os novos arquivos não incluem substituições diretas para todas essas composições.

## Peso e manutenção

O Clássico usa 59.962 bytes em AVIF de 800 px e 88.243 bytes em resolução nativa. O Defumado nativo usa 91.362 bytes. A imagem principal continua dentro do orçamento verificado de 110 kB. As imagens abaixo da abertura mantêm carregamento tardio.

O script `scripts/prepare-images.py` reproduz as variantes a partir dos originais e atualiza `docs/imagens-responsivas.json`. Os originais não foram sobrescritos. O build envia as variantes otimizadas, excluindo arquivos com prefixo `WhatsApp Image ` de `dist/`.

## Validação realizada

- `npm.cmd run check` e `npm.cmd run build` concluídos com sucesso. A verificação inclui os pedidos, a seleção da caixa, o comportamento por toque, movimento reduzido, contraste e metadados.
- As 24 novas variantes AVIF/WebP foram abertas e verificadas com Pillow, com dimensões conferidas contra o manifesto e sem ampliação dos originais.
- Os 60 recursos locais referenciados pelo HTML e pelos conjuntos responsivos responderam HTTP 200 no servidor de prévia. Os arquivos AVIF foram servidos com `image/avif`.
- `git diff --check` sem erros. A alteração de texto feita anteriormente pelo solicitante no GitHub foi mantida.
- A conferência visual real em desktop e mobile permanece pendente: o controle de navegador informou que o host de acesso está indisponível. As artes originais e o novo recorte foram inspecionados diretamente como imagens; isso não substitui a inspeção do layout no navegador.
- A publicação usa a raiz da branch `main`, incluindo o HTML regenerado, as variantes otimizadas e os arquivos fonte. Os originais permanecem disponíveis para reproduzir a preparação.
