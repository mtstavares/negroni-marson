# Revisão geral da landing page

Revisão em 09/11/2026, a partir do commit local `84be54d`. As alterações manuais anteriores no hero e nos espaçamentos da seção de presentes foram mantidas. As melhorias desta revisão estão implementadas no workspace, sem novo commit ou push.

## Principais achados e correções

| Achado | Correção implementada |
| --- | --- |
| Algumas seções ficavam sem link no cabeçalho mobile | Menu nativo com os quatro destinos; fecha ao selecionar, clicar fora ou pressionar Escape, devolvendo o foco ao controle |
| Descrições de produto e FAQ usavam textos pequenos, sobretudo no celular | Corpo principal de 14–16 px, FAQ de 14 px, opções com altura mínima de 44 px e menu com links de 48 px |
| Especificações do hero precisavam continuar centralizadas com textos mais legíveis | Três colunas responsivas, centralizadas, com quebra natural de texto em telas estreitas |
| Capturas do Instagram carregavam interface e legendas que ficavam fora do enquadramento | Arquivos próprios contendo somente a área da arte utilizada na página, preservando os pixels visíveis |
| Resolução máxima de produto e caixa inferior à dos originais disponíveis | Garrafas em até 1024 px de largura e caixas em até 1216 px, sem ampliar além dos originais |
| Tamanho declarado em `sizes` superestimava a área real das garrafas | Seleção responsiva ajustada às dimensões do layout; preload do hero usa os mesmos candidatos e tamanhos da imagem |
| A imagem alternativa da caixa podia ser baixada antes da escolha | AVIF e fallback WebP do Defumado são habilitados somente quando selecionado |
| Falha de imagem não tinha recuperação direta | Mensagem de carregamento, indicação de ocupado e botão para tentar novamente, preservando a cena fixa e o canal de pedido |
| A restauração de formulário pelo navegador podia marcar uma opção diferente da cena exibida | Sincronização da escolha no carregamento e no evento `pageshow` |
| Favicon ICO incorporava seis resoluções e ocupava mais de 100 kB | ICO com 16/32/48 px, mantendo PNG de 32 px e ícone de toque de 180 px |
| Hashes de CSS/JS podiam mudar apenas por quebras de linha entre sistemas | Hash calculado com normalização de LF, sem alterar o conteúdo servido |

## Medições de arquivos

Comparação dos arquivos reais, em kB decimais. São tamanhos de recursos e resoluções, não notas de Lighthouse ou medidas de Core Web Vitals.

| Recurso | Antes | Depois | Resultado |
| --- | --- | --- | --- |
| Imagem do hero em 800 px | WebP: 70,0 kB | AVIF: 56,0 kB | Aproximadamente 20% menos bytes na mesma largura |
| Maior imagem disponível da garrafa Clássico | 800 × 1159 px | 1024 × 1484 px; AVIF: 81,3 kB | +28% na largura e aproximadamente +64% nos pixels disponíveis |
| Maior imagem disponível da caixa Clássico | 1000 × 1000 px; WebP: 174,7 kB | 1216 × 1216 px; AVIF: 176,8 kB | Aproximadamente +48% de pixels com tamanho de arquivo semelhante |
| Quatro artes editoriais, usando as maiores variantes declaradas | WebP, capturas completas: 554,6 kB | AVIF, áreas utilizadas: 211,2 kB | **61,9% menos bytes** no conjunto |
| Favicon ICO | 103,5 kB | 7,3 kB | Aproximadamente 93% menos bytes |

Cada `<picture>` oferece AVIF e fallback WebP. O navegador seleciona um formato e uma variante, conforme suporte, tamanho de exibição e densidade da tela; não precisa baixar todas as versões. O fallback WebP tem qualidade maior que o anterior e pode ser mais pesado em alguns tamanhos.

O documento continua sem bibliotecas de interface, fontes remotas, analytics, cookies ou chamadas de backend. A imagem principal tem preload responsivo e prioridade alta; imagens inferiores têm carregamento adiado. A versão Defumado da caixa aguarda a interação do visitante.

## Limites da resolução

As garrafas e caixas utilizam os PNGs originais preservados em `docs/referencias/`. A ampliação solicitada foi feita disponibilizando a resolução nativa que ainda não era oferecida ao navegador.

As artes editoriais vieram de capturas do Instagram. A área original disponível de algumas delas tem apenas 540 px de largura, e o detalhe da garrafa no post do rótulo tem 360 px no recorte utilizado. Foram preservadas essas dimensões, com compressão e enquadramento mais eficientes. Criar arquivos maiores dessas capturas não acrescentaria detalhes reais. Para aumentar também a nitidez dessas artes em telas de alta densidade, a marca precisa fornecer os arquivos originais em resolução superior.

## Validação executada

- `npm.cmd run check` passou, incluindo links, metadados, imagens, contraste, projeção do rótulo, seleção de presente, carregamento adiado, seleção rápida, erro/repetição e restauração da opção marcada.
- Os listeners reais do menu foram exercitados em DOM simulado: seleção de link, clique interno/externo, Escape e retorno de foco.
- A exploração do rótulo continua verificada em DOM simulado, com ausência de autoplay no mobile, marcadores, zoom, cartão, reset e preferência de movimento reduzido.
- O servidor local retornou HTTP 200 para o HTML e 57 recursos referenciados; as variantes AVIF usam `Content-Type: image/avif`.
- Foram decodificados 58 arquivos WebP, AVIF e ICO com Pillow. As novas imagens de produto e os recortes editoriais também foram inspecionados como arquivos de imagem.
- A inspeção de código manteve destinos oficiais, descrições alternativas, dimensões reservadas, foco visível, áreas de toque e espaço para a barra inferior de pedidos.

## O que não pôde ser medido

O host de navegador do ambiente continua indisponível. Não foi possível observar a renderização final em desktop/mobile ou executar uma auditoria local com Lighthouse.

A API pública do PageSpeed Insights foi consultada para as estratégias mobile e desktop e respondeu **HTTP 429** nas duas tentativas. Não foi atribuída nota de desempenho, acessibilidade ou SEO, nem afirmado um valor de LCP, CLS ou INP sem medição. As reduções acima são medidas nos arquivos e não equivalem à mesma redução percentual no tempo de carregamento.

Antes da publicação, conferir a nova navegação e as imagens em um navegador real em 320/375/390 px, tablet e desktop. Após publicar, repetir a auditoria do PageSpeed e conferir as imagens escolhidas na aba Network, sem comparar a versão antiga publicada com a nova versão local como se fossem a mesma entrega.

## Manutenção

Use `python scripts/prepare-images.py` com Pillow e suporte a AVIF para regenerar as imagens. A etapa é opcional para rodar o site: os arquivos preparados ficam em `assets/` e o build de produção exige somente Node.js. `docs/imagens-responsivas.json` registra resoluções e tamanhos das variantes.

Edite conteúdo em `src/index.template.html` e estilos em `styles.css`. `npm.cmd run build` atualiza a raiz e `dist/`. As imagens e o código desta revisão ainda precisam ser incluídos no próximo commit para chegar ao GitHub Pages.
