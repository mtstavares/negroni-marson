# Validação da entrega

Atualização da troca de versão na caixa presente: o cenário é uma imagem fixa; a garrafa do Defumado é uma camada mascarada, agora alinhada por uma transformação afim que ajusta tampa e cantos da base à posição do Clássico. Uma prévia técnica rasterizada da composição SVG/CSS foi inspecionada para corrigir tamanho e inclinação. A opacidade da camada varia por 1,4 segundo e o modo de movimento reduzido remove a transição. Os checks verificam que `src` e `srcset` da base permanecem constantes, a última seleção prevalece durante carregamento lento e uma falha de decodificação mantém a imagem base e informa a indisponibilidade. A inspeção técnica das camadas não equivale a uma validação da animação em navegador.

Atualização do rótulo no mobile: cinco marcadores selecionam o detalhe, atualizam o cartão com o texto original e acionam zoom localizado. O teste executa os listeners reais em DOM simulado e verifica seleção, conteúdo, anúncio acessível, foco, navegação por setas, retorno à visão geral, ausência de reprodução automática no mobile e respeito a movimento reduzido. O host do navegador foi consultado novamente e continua indisponível; não houve inspeção visual real da nova interação no navegador.

Atualização após a inclusão dos materiais do Instagram: os checks passaram novamente com **nove links de pedido**, os novos recursos locais e o módulo `label-story.js`. O controlador da animação foi verificado com temporizador controlado: avanço, retorno do último detalhe ao primeiro, seleção manual, pausa/retomada, seção fora da tela, aba oculta e movimento reduzido. Esses testes verificam a lógica; a inspeção visual em navegador permanece com a limitação descrita abaixo. As novas imagens foram decodificadas com Pillow e os recursos servidos por HTTP local.

Executada em 09/11/2026, no Windows com Node.js 24.18.0. Nenhuma compra, envio de mensagem ou publicação externa foi realizado.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm.cmd run build` | Passou; saída estática em `dist/` |
| `npm.cmd run check` | Passou; build, idioma, H1 único, IDs, âncoras, arquivos, descrições e dimensões de imagens, metadados, links e interação da caixa |
| `node --check` | JavaScript de página e servidor sem erro de sintaxe |
| Servidor HTTP local | Página, CSS, JS, logo, produtos, caixas e compartilhamento retornaram 200, com Content-Type correto |
| Imagens | Todas locais, com alternativas WebP e `srcset`; originais oficiais inspecionados visualmente; proporções conferidas com Pillow |
| CTAs | Nove links de pedido no HTML, todos gerados a partir do canal central; mensagens com nome e versão; `target` com `noopener noreferrer` |
| Seleção do presente | Handler real de `app.js` executado em contexto DOM simulado: Defumado → Clássico alterna apenas a camada mascarada da garrafa, preserva os arquivos da base e atualiza descrição, texto e destino do botão. Inclui seleções rápidas e falha de carregamento. É uma verificação de lógica, não um teste de navegador |
| Teclado: estrutura | Links nativos, botões de opção nativos, FAQ `details/summary`, link de salto e estilos de foco. Inspeção do código; sequência de Tab não exercitada no navegador |
| Movimento | Redução de movimento prevista por CSS |
| Responsividade: código | Fluxos previstos para desktop, tablet e celular; produtos empilhados abaixo de 760 px; faixa de pedido fixa no celular e rodapé com espaço para ela; títulos menores abaixo de 420 px |

Contraste calculado pela luminância relativa WCAG:

| Combinação | Razão |
| --- | --- |
| Marfim/preto, texto principal | 17,49:1 |
| Cinza quente/preto, texto secundário | 9,09:1 |
| Preto/dourado, botão principal | 11,15:1 |
| Cinza castanho/creme, corpo da seção de presentes | 6,52:1 |
| Bronze/creme, destaques | 5,86:1 |
| Texto secundário/fundo de pedidos | 8,92:1 |

Essas combinações passam 4,5:1 para texto normal. A verificação não equivale a uma auditoria integral de acessibilidade: pequenos textos gráficos das artes e todos os possíveis estados visuais não foram auditados automaticamente.

## Peso e desempenho

- Hero WebP de 800 px: **70.006 bytes**; variante de 480 px: 32.526 bytes.
- Defumado: 38.862 bytes em 480 px e 83.268 bytes em 800 px.
- Caixas: aproximadamente 88–92 KB nas variantes de 640 px; 175–177 KB em 1000 px.
- Imagem principal com prioridade alta e preload responsivo. Demais imagens com lazy loading e decodificação assíncrona.
- Fontes do sistema; nenhum framework, biblioteca, analytics, cookie ou chamada de API na página.
- PNGs originais e documentação ficam fora de `dist/`.

Não foi executado Lighthouse nem medição de Core Web Vitals em dispositivo real; não são atribuídas notas de desempenho fictícias.

## Limite concreto da validação visual

O host de acesso a navegador estava indisponível. A tentativa de acesso nativo primeiro encontrou janela minimizada e, na recuperação, a ferramenta encerrou o controle por não conseguir identificar a URL atual do Chrome com confiança. O controle foi interrompido e não foram usados meios alternativos de automação do navegador.

Assim, **não houve renderização observada da landing page em desktop ou mobile**. O comportamento responsivo foi revisado no código e os recursos foram servidos com sucesso, mas não é correto declarar a inspeção visual completa. As artes oficiais foram visualizadas por ferramenta de leitura de imagem, separadamente da página.

## Revisão visual ainda necessária antes de publicar

Com `npm.cmd run dev`, abra http://127.0.0.1:4173 e verifique:

1. Em desktop de 1440 px e tablet de 768 px: títulos sem sobreposição, garrafas completas e cards alinhados.
2. Em 320, 375 e 390 px: ausência de rolagem horizontal, CTA visível na abertura, botões fáceis de tocar, barra inferior sem esconder conteúdo, rótulos legíveis dentro do espaço disponível.
3. Tecla Tab e Shift+Tab: link de salto, navegação, CTAs, seleção da caixa, FAQ e rodapé com foco visível. Use setas nos botões de opção e Enter/Espaço no FAQ.
4. Selecione Defumado e depois Clássico na caixa: somente a garrafa deve se alterar, com fade suave e mesmo eixo de inclinação; cenário, texto da arte e caixa permanecem imóveis. Confira também mensagem e link de pedido.
5. No mobile, toque nos cinco marcadores do rótulo: cada um deve ampliar o detalhe correspondente e atualizar o cartão abaixo. Use “Ver o rótulo sem zoom” para restaurar a visão geral. A navegação por Tab e setas também deve funcionar, sem reprodução automática.
5. Abra um botão de cada produto e confira destinatário e mensagem no WhatsApp. Não é necessário enviar mensagem para verificar.
6. Recarregue em rede móvel: imagens locais devem carregar, com a principal antes das imagens inferiores.
7. Após configurar `siteUrl` e publicar, valide prévia de compartilhamento no domínio real; os metadados locais usam caminhos relativos enquanto não há domínio.

## Pendências de publicação

Domínio definitivo, inspeção visual real e confirmação da marca sobre informações comerciais e fidelidade física das artes. O relatório de análise lista os materiais necessários para concluir a evolução do perfil.
