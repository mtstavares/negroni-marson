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
- `instagramUrl` e `catalogUrl`: links institucionais.
- `siteUrl`: endereço HTTPS definitivo da landing page, sem barra final. Deixado vazio porque nenhum domínio foi informado. Preencha antes de publicar para gerar canonical, `og:url` e imagens de compartilhamento com URL absoluta.

Execute novamente `npm.cmd run build`. Não edite `dist/` diretamente. Os links abrem uma conversa com mensagem preenchida; o visitante envia a mensagem. A página não transmite pedidos automaticamente.

## Arquivos

| Arquivo | Uso |
| --- | --- |
| `index.html` | Conteúdo e estrutura; os marcadores `{{...}}` são resolvidos no build |
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

Para trocar uma imagem, substitua suas versões em `assets/`, mantenha a proporção e atualize `src`, `srcset`, `width`, `height` e `alt` no HTML. A imagem principal deve continuar leve; a atual tem 70 KB. `scripts/optimize-images.py` documenta o processamento original com Pillow, mas não é necessário para rodar ou publicar o site e usa fontes do Windows para compor o compartilhamento.

Na caixa presente, a arte do Clássico é o cenário fixo. A versão Defumado aparece em uma camada sobreposta, limitada à garrafa pelo arquivo `assets/mascara-garrafa-presente.svg`, com fade de 1,4 segundo. A camada possui ajuste de inclinação, largura, altura e posição em `.gift-bottle-overlay`, calibrado pela tampa e pelos dois cantos da base do Clássico. O `app.js` alterna a visibilidade dessa camada e a mensagem de pedido; nunca troca o arquivo do cenário. Ao substituir essas artes, confira a máscara e o alinhamento antes de publicar. A preferência por movimento reduzido remove o fade.

No mobile (até 760 px), “Por trás do rótulo” funciona por toque: cinco marcadores de 44 px selecionam um detalhe, dão zoom na arte e atualizam o cartão explicativo abaixo. O botão “Ver o rótulo sem zoom” restaura a visão geral. Não há reprodução automática nessa versão. Os textos do cartão vêm da lista do próprio HTML, evitando manter duas cópias. No desktop, a exploração pela lista e a reprodução com pausa continuam disponíveis. Sem JavaScript, a lista completa permanece legível no celular.

As capturas do Instagram adicionadas pelo solicitante permanecem em `assets/`. Execute `python scripts/prepare-instagram-assets.py` com Pillow instalado para regenerar as versões WebP utilizadas. A seção do rótulo e as artes editoriais usam enquadramentos em CSS, definidos em `.label-window` e `.post-frame`; se a composição da captura mudar, esses enquadramentos e os pontos do SVG precisam ser ajustados. O build copia as versões otimizadas e exclui os originais com prefixo `WhatsApp Image `.

Preços, frete, prazos, estoque, formas de pagamento e depoimentos só devem entrar após confirmação. As informações técnicas atuais foram lidas nos rótulos das artes oficiais, conforme o relatório de análise.

## Publicar

Preencha `siteUrl`, rode o check e o build e envie **somente o conteúdo de `dist/`** para uma hospedagem estática com HTTPS. Não há serviço de backend nem banco de dados. Não foi feita publicação externa: a entrega foi implementada nesta pasta, conforme solicitado.

Antes da publicação, conclua a inspeção visual real em desktop e celular descrita em `docs/VALIDACAO.md`. O controle de navegador disponível nesta sessão foi interrompido pela ferramenta.
