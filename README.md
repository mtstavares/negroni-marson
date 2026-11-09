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
- `siteUrl`: endereço HTTPS da landing page, sem barra final. Configurado como `https://mtstavares.github.io/negroni-marson`, cuja página pública foi consultada. Gera canonical, `og:url` e imagem de compartilhamento com URL absoluta.

Execute novamente `npm.cmd run build`. O comando atualiza `dist/` e o **`index.html` da raiz**, que já fica pronto para o GitHub Pages, com todos os links resolvidos. Não edite esses HTMLs gerados diretamente: edite `src/index.template.html`. Os links abrem uma conversa com mensagem preenchida; o visitante envia a mensagem. A página não transmite pedidos automaticamente.

## Arquivos

| Arquivo | Uso |
| --- | --- |
| `src/index.template.html` | Fonte do conteúdo e estrutura; marcadores são resolvidos no build |
| `index.html` | HTML final gerado e versionado, pronto para servir pela raiz do GitHub Pages |
| `styles.css` | Identidade visual, espaçamentos e versões responsivas |
| `app.js` | Seleção da caixa presente, imagem e mensagem do pedido |
| `label-story.js` | Animação dos cinco elementos do rótulo, pausa e preferências de movimento |
| `site.config.json` | Canal de pedidos e URLs oficiais |
| `assets/` | Imagens WebP locais, favicon e imagem de compartilhamento |
| `scripts/` | Build, servidor local, verificação e otimização de imagens |
| `docs/ANALISE-DA-MARCA.md` | Fontes, fatos, interpretações e limites da linha do tempo |
| `docs/GUIA-VISUAL.md` | Identidade visual aplicada |
| `docs/CONTEUDOS-DO-INSTAGRAM.md` | Novas capturas, histórico parcial e conteúdo incorporado |
| `docs/VALIDACAO.md` | O que foi verificado e o que ainda exige navegador |
| `docs/referencias/` | Artes originais oficiais e registro das fontes |

## Atualizar imagens e conteúdo

As imagens usadas são **artes oficiais do catálogo**, sem confirmação de que sejam fotografias do produto físico. Os originais foram preservados em `docs/referencias/`. Use fotos próprias/autorizadas quando a marca fornecer o material, mantendo as descrições alternativas corretas.

Para trocar uma imagem, substitua suas versões em `assets/`, mantenha a proporção e atualize `src`, `srcset`, `width`, `height` e `alt` em `src/index.template.html`. A imagem principal deve continuar leve; a atual tem 70 KB. `scripts/optimize-images.py` documenta o processamento original com Pillow, mas não é necessário para rodar ou publicar o site e usa fontes do Windows para compor o compartilhamento.

Na caixa presente, cenário, tampa, vidro e base da garrafa são fixos e idênticos nas duas seleções. O rótulo do Defumado é projetado na mesma superfície do Clássico por uma matriz de perspectiva recalculada conforme a largura da imagem. O arquivo `assets/mascara-garrafa-presente.svg` limita a alteração à superfície do rótulo; `.gift-bottle-layer` controla o fade de **0,9 segundo**. O `app.js` alterna a camada e a mensagem de pedido. Ao substituir as artes, recalibre `giftLabelProjection` e a máscara. A preferência por movimento reduzido remove o fade.

No mobile (até 760 px), “Por trás do rótulo” funciona por toque: cinco marcadores de 44 px selecionam um detalhe, dão zoom na arte e atualizam o cartão explicativo abaixo. O botão “Ver o rótulo sem zoom” restaura a visão geral. Não há reprodução automática nessa versão. Os textos do cartão vêm da lista do próprio HTML, evitando manter duas cópias. No desktop, a exploração pela lista e a reprodução com pausa continuam disponíveis. Sem JavaScript, a lista completa permanece legível no celular.

As capturas do Instagram adicionadas pelo solicitante permanecem em `assets/`. Execute `python scripts/prepare-instagram-assets.py` com Pillow instalado para regenerar as versões WebP utilizadas. A seção do rótulo e as artes editoriais usam enquadramentos em CSS, definidos em `.label-window` e `.post-frame`; se a composição da captura mudar, esses enquadramentos e os pontos do SVG precisam ser ajustados. O build copia as versões otimizadas e exclui os originais com prefixo `WhatsApp Image `.

Preços, frete, prazos, estoque, formas de pagamento e depoimentos só devem entrar após confirmação. As informações técnicas atuais foram lidas nos rótulos das artes oficiais, conforme o relatório de análise.

## Publicar

Para **GitHub Pages publicando a raiz da branch**: execute `npm.cmd run check` e `npm.cmd run build`, depois envie as alterações ao GitHub, incluindo `index.html`, `.nojekyll`, `assets/`, os scripts da página e os demais arquivos fonte modificados. O `index.html` da raiz contém HTML estático completo, sem marcadores visíveis, e funciona com a configuração de publicação já utilizada. O build inclui uma versão nos URLs de CSS e JavaScript para evitar que visitantes continuem usando arquivos antigos em cache. Não selecione `src/` como pasta de publicação.

Para outra hospedagem estática ou um workflow que publique artefatos: use somente o conteúdo de `dist/`. Não há backend nem banco de dados. Esta atualização foi preparada localmente; as alterações ainda precisam ser enviadas ao repositório para atualizar o site público.

Antes da publicação, conclua a inspeção visual real em desktop e celular descrita em `docs/VALIDACAO.md`. O controle de navegador disponível nesta sessão foi interrompido pela ferramenta.
