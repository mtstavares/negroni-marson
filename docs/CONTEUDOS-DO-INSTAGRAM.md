# Conteúdos do Instagram fornecidos pela marca

Atualização de 09/11/2026. O solicitante adicionou oito imagens em `assets/` e confirmou que são conteúdos do Instagram da Marson. Foram examinadas as oito imagens, incluindo arte, legenda e datas visíveis. Os arquivos originais permanecem no local informado.

## Histórico parcial recuperado

As capturas mostram dia e mês, **sem ano explícito nas datas da interface**. “Safra 2026” aparece em algumas artes, mas não substitui a data da publicação. Por isso, a tabela mantém o formato dia/mês. Nenhuma captura fornece o permalink individual; não foram inventados links de posts. O [perfil oficial](https://www.instagram.com/negronimarson/) identifica a origem, mas não é apresentado como link de uma publicação específica.

| Data visível | Arquivo em `assets/` | Conteúdo observado |
| --- | --- | --- |
| 09/09 | `WhatsApp Image 2026-11-09 at 14.14.28.jpeg` | Garrafa e copo ao pôr do sol, localização Amparo-SP, produção artesanal e convite “Abra. Sirva. Aprecie.” na legenda |
| 09/09 | `WhatsApp Image 2026-11-09 at 14.14.27 (2).jpeg` | Brinde entre pessoas; comunicação voltada a encontros e companhia |
| 17/09 | `WhatsApp Image 2026-11-09 at 14.14.26.jpeg` | “Por trás do rótulo”: montanhas de Amparo, pôr do sol, Cristo, coquetel e assinatura; legenda explica a origem regional |
| 20/09 | `WhatsApp Image 2026-11-09 at 14.14.27 (1).jpeg` | Como servir: copo Old Fashioned, gelo grande, laranja e apreciação sem pressa |
| 24/09 | `WhatsApp Image 2026-11-09 at 14.14.27.jpeg` | Cesta em colaboração com Pri Guedes; captura mostra texto de parceria, itens e oferta naquela publicação |
| 22/10 | `WhatsApp Image 2026-11-09 at 14.14.26 (2).jpeg` | Apresentação conjunta de Clássico e Defumado; legenda associa o Defumado à lenha de laranjeira |
| 23/10 | `WhatsApp Image 2026-11-09 at 14.14.26 (1).jpeg` | Caixa presente; legenda apresenta uma nova embalagem e confirma o telefone (19) 99906-0077 |
| Sem data própria visível | `WhatsApp Image 2026-11-09 at 14.14.28 (1).jpeg` | Versão ampliada da arte “Por trás do rótulo”, correspondente ao conteúdo mostrado na captura de 17/09; material solicitado para a animação |

Esse registro complementa a captura do Linktree feita anteriormente. O período agora observado nas publicações fornecidas vai de **09/09 a 23/10, sem ano confirmado pela interface**. Ainda não cobre os 14 posts indicados nos metadados do perfil, nem inclui todos os Reels ou destaques.

## Evolução observável e interpretação

**Observação:** os conteúdos de setembro alternam produto, encontros, origem e serviço. Em outubro, as capturas disponíveis enfatizam as duas versões e a caixa presente. A legenda de 23/10 chama a caixa de nova embalagem.

**Interpretação:** dentro desta amostra, a comunicação se amplia de uma experiência de consumo e pertencimento para a diferenciação da coleção e a intenção de presentear. Isso orientou uma página com história, serviço, encontros e produtos, em vez de repetir apenas o catálogo.

**Observação:** há diferenças na representação da garrafa e da tampa entre artes; algumas mostram tampa escura e outras acabamento em tom de madeira. A paisagem, o pôr do sol, o preto, o rubi e o dourado persistem.

**Limite:** as imagens de alguns posts estão marcadas como “Conteúdo de IA”. Mudanças nas representações não comprovam alterações físicas da embalagem. A página identifica as imagens como artes da marca nos textos alternativos e nesta documentação, sem tratá-las como documentação fotográfica do produto físico.

A cesta colaborativa não foi acrescentada como oferta vigente: a publicação confirma uma ação naquele momento, mas não sua disponibilidade atual ou inclusão no catálogo oficial. Os produtos de pedido continuam sendo os verificados no Linktree.

## Aplicação na landing page

1. **Por trás do rótulo:** explora os cinco significados da imagem `14.14.28 (1)`. A garrafa é enquadrada por CSS a partir da própria arte. No mobile, cinco marcadores tocáveis de 44 px destacam montanhas, sol, Cristo, coquetel e assinatura, com zoom localizado, cartão explicativo e botão para voltar à visão geral. Os mesmos textos vêm da lista original do HTML; sem JavaScript, a lista completa permanece visível.
2. **Reprodução acessível:** no desktop, alternância a cada seis segundos, botão de pausa/retomada e pausa ao selecionar um detalhe, sair da área visível ou ocultar a aba. No mobile, somente exploração manual. A preferência `prefers-reduced-motion` remove as transições e o movimento do cartão; a exploração permanece disponível. Marcadores têm rótulos acessíveis, indicação de seleção, navegação por teclado e anúncio do texto escolhido. Mudanças automáticas não disparam anúncios contínuos no leitor de tela.
3. **Ritual de servir:** orientações do post de 20/09, com arte de apoio. Não foram acrescentados rendimento ou dosagem não confirmados.
4. **Bons encontros:** duas artes reforçam companhia e paisagem regional, com um novo CTA para o canal central de pedidos.

## Preparação dos arquivos

`scripts/prepare-instagram-assets.py` converte as imagens utilizadas para WebP, sem retocar as artes. As interfaces das capturas são enquadradas fora da área visível por CSS. A imagem ampliada do rótulo também pode ser aberta integralmente pelo visitante.

O build exclui os arquivos `WhatsApp Image ...` da cópia de `assets/` para `dist/`; os originais permanecem no workspace. As novas imagens são carregadas apenas conforme se aproximam da área visível. Não há biblioteca de animação, vídeo ou serviço externo.
