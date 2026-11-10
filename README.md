# Negroni Marson

Landing page responsiva em português, com imagens do catálogo oficial e pedidos pelo WhatsApp da marca. Implementação estática em HTML, CSS e JavaScript, sem dependências de execução ou instalação de pacotes. Requer Node.js 22 ou superior.

## Rodar

Na pasta `negroni-marson`, execute:

```powershell
npm.cmd run dev
```

Abra **http://127.0.0.1:4173**. As alterações nos arquivos fonte geram um novo build; recarregue o navegador. No Windows, `npm.cmd` funciona também quando a política do PowerShell bloqueia `npm.ps1`. Em outros sistemas, use `npm` normalmente.

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd run preview
```

O build gera `dist/`. A prévia usa a mesma porta 4173: encerre o servidor anterior com Ctrl+C antes de iniciar outro. Para mudar a porta: `$env:PORT=4174` antes do comando.

## Atualizar o canal de pedidos

Edite somente **`site.config.json`**:

- `orderBaseUrl`: destino central de todos os botões. Hoje é o WhatsApp confirmado no Linktree oficial: `https://wa.me/5519999060077`.
- `orderMessages`: mensagens de cada versão e caixa. O build adiciona `text` quando o destino é `wa.me` ou `api.whatsapp.com`.
- `whatsappDisplay`: número legível apresentado na abertura, na seção de pedidos e no rodapé. Hoje: **+55 (19) 99906-0077**, confirmado no Linktree da marca.
- `instagramUrl`, `catalogUrl` e `facebookUrl`: links institucionais confirmados no Linktree oficial.
- `siteUrl`: endereço HTTPS da landing page, sem barra final. Configurado como `https://www.negronimarson.com.br`. Gera canonical, `og:url` e imagem de compartilhamento com URL absoluta. O acesso público depende da propagação do DNS e da emissão do certificado pelo Pages.

Execute novamente `npm.cmd run build`. O comando atualiza `dist/` e o **`index.html` da raiz**, que já fica pronto para o GitHub Pages, com todos os links resolvidos. Não edite esses HTMLs gerados diretamente: edite `src/index.template.html`. Os links abrem uma conversa com mensagem preenchida; o visitante envia a mensagem. A página não transmite pedidos automaticamente.

## Arquivos

| Arquivo | Uso |
| --- | --- |
| `src/index.template.html` | Fonte do conteúdo e estrutura; marcadores são resolvidos no build |
| `index.html` | HTML final gerado e versionado, pronto para servir pela raiz do GitHub Pages |
| `styles.css` | Identidade visual, espaçamentos e versões responsivas |
| `app.js` | Seleção da caixa presente, imagem e mensagem do pedido |
| `label-story.js` | Animação dos cinco elementos do rótulo, pausa e preferências de movimento |
| `ritual-carousel.js` | Carrossel manual do ritual: etapas, gestos, teclado e destaques na arte |
| `collection-carousel.js` | Coleção com rolagem contínua para os dois lados no mobile |
| `site.config.json` | Canal de pedidos e URLs oficiais |
| `assets/` | Imagens AVIF/WebP responsivas, favicon e imagem de compartilhamento |
| `scripts/` | Build, servidor local, verificação e otimização de imagens |
| `docs/ANALISE-DA-MARCA.md` | Fontes, fatos, interpretações e limites da linha do tempo |
| `docs/GUIA-VISUAL.md` | Identidade visual aplicada |
| `docs/CONTEUDOS-DO-INSTAGRAM.md` | Novas capturas, histórico parcial e conteúdo incorporado |
| `docs/VALIDACAO.md` | O que foi verificado e o que ainda exige navegador |
| `docs/REVISAO-GERAL.md` | Revisão de usabilidade, resolução, pesos e limitações das medições |
| `docs/IMAGENS-OFICIAIS.md` | Comparação dos novos materiais oficiais e substituições aplicadas |
| `docs/imagens-responsivas.json` | Manifesto das resoluções e tamanhos das imagens preparadas |
| `docs/referencias/` | Artes originais oficiais e registro das fontes |

## Atualizar imagens e conteúdo

As imagens usadas são **artes oficiais fornecidas pela marca**, sem confirmação de que sejam fotografias do produto físico. Os novos originais das garrafas e de “Por trás do rótulo” estão em `assets/`, com os nomes recebidos pelo WhatsApp; os materiais anteriores e as caixas estão em `docs/referencias/`. Veja a seleção em `docs/IMAGENS-OFICIAIS.md`. Mantenha as descrições alternativas corretas ao atualizar o material.

Para preparar imagens, execute `python scripts/prepare-images.py` com Pillow e suporte a AVIF. O script gera versões AVIF/WebP dos originais disponíveis, sem ampliação artificial. As novas garrafas têm 1024 × 1536 px. A caixa usa `assets/presente-novo.jpeg`, com 1254 × 1254 px, e variantes de 480, 640, 960 e 1254 px. O hero em AVIF tem cerca de 60 kB em 800 px ou 88 kB em resolução nativa. A arte completa do rótulo tem 900 × 1600 px e seu recorte interativo, 460 × 907 px. Python não é necessário para rodar ou publicar o site depois que os assets estão preparados.

Ao trocar uma imagem, preserve a proporção e atualize os `<source>`, `src`, `srcset`, `sizes`, `width`, `height` e `alt` em `src/index.template.html`. O preload do hero precisa continuar usando os mesmos candidatos e tamanhos da imagem principal. `docs/imagens-responsivas.json` registra os arquivos gerados.

Na caixa presente, cenário, tampa, vidro e base da garrafa são fixos e idênticos nas duas seleções. O rótulo do Defumado é projetado na mesma superfície do Clássico por uma matriz de perspectiva recalculada conforme a largura da imagem. A nova composição de `presente-novo.jpeg` usa a máscara `assets/mascara-presente-novo.svg` e a projeção recalibrada em `app.js`; `.gift-bottle-layer` controla o fade de **0,9 segundo**. O JavaScript solicita a imagem alternativa somente após a escolha, informa carregamento/erro e oferece uma nova tentativa. Também sincroniza uma opção restaurada pelo navegador. Ao substituir as artes, recalibre `giftLabelProjection` e a máscara. A preferência por movimento reduzido remove o fade.

No mobile (até 760 px), “Por trás do rótulo” funciona por toque: cinco marcadores de 44 px selecionam um detalhe, dão zoom na arte e atualizam o cartão explicativo abaixo. O botão “Ver o rótulo sem zoom” restaura a visão geral. Não há reprodução automática nessa versão. Os textos do cartão vêm da lista do próprio HTML, evitando manter duas cópias. No desktop, a exploração pela lista e a reprodução com pausa continuam disponíveis. Sem JavaScript, a lista completa permanece legível no celular.

As capturas do Instagram e as novas imagens oficiais adicionadas pelo solicitante permanecem em `assets/`. O script prepara somente as áreas usadas pela página, sem carregar a interface do Instagram. “Por trás do rótulo” agora usa a arte oficial, com pontos do SVG e do zoom recalibrados. Se a imagem mudar, ajuste os recortes em `scripts/prepare-images.py`, os círculos do SVG no template e os pontos do zoom em `label-story.js`. O build exclui os originais com prefixo `WhatsApp Image ` da cópia para `dist/`.

No mobile, o menu do cabeçalho dá acesso às três seções principais e funciona mesmo sem JavaScript. Com JavaScript, fecha na seleção, no clique fora e em Escape, com retorno de foco ao controle.

O “Ritual Marson” usa uma única arte original em quatro etapas: copo, gelo, laranja e apreciação. Os botões e as setas sincronizam o texto externo, a legenda sobreposta, o contador e os destaques SVG; no celular também é possível deslizar horizontalmente. Não há avanço automático. As transições têm 500–600 ms e respeitam movimento reduzido. Os textos ficam nos quatro itens de `src/index.template.html`, usados também pelo JavaScript. Sem JavaScript, a arte e as quatro instruções continuam visíveis. Os pontos do destaque são definidos no SVG e o zoom, nos seletores `data-focus` do CSS. `npm.cmd run check` verifica as interações e o fallback.

Preços, frete, prazos, estoque, formas de pagamento e depoimentos só devem entrar após confirmação. As informações técnicas atuais foram lidas nos rótulos das artes oficiais, conforme o relatório de análise.

## Coleção no mobile

No celular (até 760 px), a coleção usa rolagem horizontal nativa com encaixe dos
cards. Cópias dos dois produtos em ambas as extremidades permitem continuar nos
dois sentidos; ao finalizar o gesto, a posição retorna ao card original idêntico.
As cópias são `inert` e ocultas dos leitores de tela. Os links de pedido permanecem
nos cards originais, e a indicação abaixo informa a versão atual. Também é
possível navegar pelas setas ou pelas teclas esquerda/direita. Não há autoplay.
Ao voltar ao desktop, as cópias e os controles são removidos e os dois produtos
voltam a ficar lado a lado. Sem JavaScript, ambos continuam acessíveis no HTML.
O teste em DOM simulado cobre ciclos nos dois sentidos, foco, pedidos, toques
rápidos nos controles, larguras diferentes e movimento reduzido.

## Review do especialista

A seção após a coleção apresenta o vídeo fornecido de Murilo Fazolin. Em desktop,
o player vertical fica ao lado do resumo; até 760 px, a ordem é título, vídeo e
texto. O player nativo tem controles, tela cheia e legendas em português,
sem autoplay e com `preload="none"`: o MP4 é solicitado ao iniciar a reprodução.

- `assets/review-murilo-fazolin.mp4`: versão H.264/AAC, 480 × 854 px, cerca de 19 MB.
- `assets/review-murilo-fazolin-capa.webp`: quadro do próprio vídeo, sem recorte.
- `assets/review-murilo-fazolin.pt-BR.vtt`: legendas editáveis com marcação temporal.
- `scripts/prepare-review.py`: refaz MP4 e capa com FFmpeg (ou imageio-ffmpeg) e Pillow;
  essas ferramentas são opcionais e não são necessárias para rodar ou publicar.

O original `assets/WhatsApp Video 2026-11-09 at 22.47.09.mp4` foi preservado e não é
copiado para `dist/`. A versão otimizada mantém toda a duração (4min42s) e a
resolução original, com metadados no início do arquivo para reprodução progressiva.
O servidor local suporta `video/mp4`, `text/vtt` e requisições de intervalos para
avançar/voltar. A checagem exercita esses intervalos por HTTP e valida as legendas.

O resumo combina a apresentação fornecida pela marca com a transcrição local do
vídeo. O elogio aos três melhores é atribuído à opinião de Murilo; não representa
ranking ou premiação. As legendas partiram de reconhecimento de voz local, com
correções de nomes e pontuação. Um trecho pouco claro em 1min14s está sinalizado;
recomenda-se revisão humana das falas antes da publicação em produção.

## Publicar

### Fluxo com aprovação

- **`teste`**: desenvolvimento, testes locais e envio das melhorias ao GitHub. Commits nessa branch não alteram o site oficial.
- **`main`**: produção. O Pages continua configurado para servir sua raiz.

Trabalhe na branch `teste` (`git switch teste`), rode a prévia com `npm.cmd run dev` e confira desktop e celular. Antes de entregar uma versão, execute `npm.cmd run check` e `npm.cmd run build`, revise o diff e faça commit/push para `teste`, incluindo o HTML regenerado quando mudar.

Para publicar, abra um Pull Request de `teste` para `main`, descreva as alterações e a validação e aguarde aprovação explícita do usuário para aquela versão. Só então faça o merge. O Pages publica automaticamente após a integração em `main`; confira o resultado em Actions. Não habilite merge automático. Depois, sincronize `teste` com `main` para o próximo ciclo.

A proteção da `main` exige Pull Request inclusive para administradores, bloqueia force push e exclusão e exige resolver conversas. Não há exigência de um revisor de outra conta: a aprovação de produção é feita pelo usuário no chat. Os testes são executados localmente; esta configuração não adiciona um workflow de testes automáticos. As instruções para os agentes estão em [AGENTS.md](AGENTS.md).

Para configurar ou conferir **www.negronimarson.com.br** no GitHub Pages, siga [o roteiro de domínio próprio](docs/DOMINIO-PROPRIO.md). O arquivo `CNAME` e `siteUrl` já usam esse endereço. O build preserva em `dist/` o arquivo `CNAME` da raiz, quando existir.

Para **GitHub Pages publicando a raiz da branch**: execute `npm.cmd run check` e `npm.cmd run build`, depois envie as alterações ao GitHub, incluindo `index.html`, `.nojekyll`, `assets/`, os scripts da página e os demais arquivos fonte modificados. O `index.html` da raiz contém HTML estático completo, sem marcadores visíveis, e funciona com a configuração de publicação já utilizada. O build inclui uma versão nos URLs de CSS e JavaScript para evitar que visitantes continuem usando arquivos antigos em cache. Não selecione `src/` como pasta de publicação.

Para outra hospedagem estática ou um workflow que publique artefatos: use somente o conteúdo de `dist/`. Não há backend nem banco de dados. Após cada atualização, envie as alterações ao repositório para atualizar o site público.

Antes da publicação, conclua a inspeção visual real em desktop e celular descrita em `docs/VALIDACAO.md`. O controle de navegador disponível nesta sessão foi interrompido pela ferramenta.
