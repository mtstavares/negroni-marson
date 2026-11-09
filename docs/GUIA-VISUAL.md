# Guia visual aplicado

Atualização com materiais do Instagram: a identidade regional de Amparo passou a orientar a seção “Por trás do rótulo”. O enquadramento da garrafa vem da própria imagem `WhatsApp Image 2026-11-09 at 14.14.28 (1).jpeg`. No mobile, cinco marcadores ao redor da arte acionam um zoom de 1,28× no detalhe escolhido e um cartão explicativo abaixo, com opção de restaurar a visão geral. Não há reprodução automática no mobile. No desktop, as referências são destacadas por contornos e anéis em movimento, com controle de pausa. Ambas as versões respeitam movimento reduzido. A seção usa o creme e o bronze já previstos neste guia. Artes de serviço e de encontros ampliam a presença dos tons de pôr do sol sem alterar a paleta dos componentes.

## Direção e posicionamento

**Marson: tradição italiana com alma brasileira, em um negroni para apreciar sem pressa.** A marca ocupa uma apresentação de coquetelaria autoral e presenteável. Esta é uma proposta de posicionamento baseada nas artes oficiais; não presume preço elevado, premiações, origem italiana de fabricação ou liderança de mercado.

A frase de abertura criada para a página é **“Um clássico. O seu momento.”** O tom é sereno, direto e convidativo. Textos de apresentação evocam ocasião e personalidade; informações de produto e compra usam linguagem concreta. Evitar superlativos sem evidência, urgência artificial, promessas de entrega e adjetivos como “o melhor”.

## Elementos preservados e tradução digital

| Origem oficial | Aplicação |
| --- | --- |
| Emblema circular preto/dourado | Imagem original no cabeçalho, com versão otimizada; original preservado |
| MARSON serifado em caixa alta | Referência para títulos e assinatura tipográfica do rodapé; não apresentada como novo logotipo oficial |
| Molduras e filetes dourados | Bordas discretas, linhas de seção, botões e detalhes de numeração |
| Preto dos rótulos e fundos | Fundo principal, coleção e fotografias/artes integradas |
| Rubi/âmbar do líquido e laranja das ilustrações | Cor vinda das próprias imagens, com iluminação ambiente discreta |
| Caixa em tons quentes | Fundo creme e tipografia escura para a seção de presentes |
| Mensagem de tradição italiana e alma brasileira | Proposta do hero, faixa de assinatura e rodapé |

O favicon com “M” é uma adaptação funcional de navegação, sem substituir a assinatura oficial. Não foi criada uma embalagem fictícia nem alterado o rótulo nas imagens.

## Paleta

| Cor | HEX | Função |
| --- | --- | --- |
| Preto quente | `#0B0B09` | Fundo principal, texto em botão dourado, botão da seção creme |
| Grafite | `#151512` | Superfícies de produto e profundidade discreta |
| Oliva escuro | `#181811` | Fundo da área de pedidos |
| Dourado suave | `#E2BE7B` | CTAs principais, palavras em itálico, links e pequenos títulos |
| Marfim | `#F6F1E6` | Texto principal sobre fundo escuro |
| Creme | `#F2ECDF` | Fundo da seção de presentes |
| Cinza quente | `#B4B0A5` | Texto secundário sobre preto |
| Bronze | `#76532C` | Itálicos e foco sobre creme |
| Cinza castanho | `#575348` | Corpo de texto sobre creme |

Preto/dourado e marfim/preto foram mantidos com contraste forte. Bronze substitui dourado em texto sobre creme para preservar legibilidade. Bordas decorativas têm contraste discreto e não são usadas como única indicação de foco ou estado. A seleção da caixa usa borda mais forte, preenchimento e sinal de confirmação.

## Tipografia

- **Títulos e editorial:** Georgia, com fallback Times New Roman/serif. Roman para títulos e itálico para as expressões de destaque. Uma interpretação compatível com o caráter serifado do rótulo, sem afirmar que seja a fonte original da marca.
- **Corpo, navegação e botões:** Arial, com fallback Helvetica/sans-serif. Objetividade nas informações de compra.
- **Tamanhos:** H1 fluido, aproximadamente 40–84 px; H2 36–64 px; corpo 12–16 px conforme o contexto; textos auxiliares menores e com contraste adequado. Evitar reduzir o texto principal para acomodar conteúdo novo.
- **Carregamento:** fontes do sistema, sem download, rastreamento externo, licença adicional ou troca visual de fontes.

## Imagens e fotografia futura

As artes atuais vêm do Linktree oficial e das capturas fornecidas pelo solicitante. A garrafa do Clássico abre a página; as versões são apresentadas lado a lado em desktop e em sequência no celular. Na seleção da caixa, o cenário completo do Clássico permanece fixo e somente a garrafa alterna, por sobreposição mascarada do Defumado, com fade de 1,4 segundo e alinhamento pela tampa e pelos cantos da base. Caixa, fundo e tipografia da arte não são animados. Não há imagens de banco nem imagens de produto inventadas.

Para substituir as artes por fotografias reais, produzir: garrafa frontal completa com rótulo legível; detalhe de tampa e acabamento; Clássico e Defumado no mesmo enquadramento; caixa aberta e fechada com cada versão; cena de serviço em copo baixo com gelo. Fundo escuro, luz lateral quente e reflexos controlados. Manter tons reais do líquido e não simular acessórios incluídos no pedido. Preferir imagens de presente sem elementos sazonais para uso contínuo.

## Componentes e ritmo

- **Hero:** texto à esquerda e garrafa à direita no desktop; fluxo vertical no celular, com CTA no conteúdo e uma barra fixa inferior. Sem vídeo ou animação obrigatória.
- **Botão principal:** dourado sólido, texto escuro, altura mínima de 44 px, seta de destino externo, foco visível. Todos os pedidos usam a configuração central.
- **Produtos:** duas apresentações de mesmo peso, numeração discreta, foto sobre fundo escuro, volume/graduação, descrição e link da versão.
- **Presentes:** seção creme, botões de opção nativos com legenda, estado selecionado e anúncio da alteração para leitores de tela.
- **FAQ:** elementos nativos `details/summary`, operáveis com teclado e sem JavaScript.
- **Espaçamento:** margens de 56 px no desktop amplo e 20–25 px no celular; seções com 64–112 px de respiro. Layout limitado a 1280 px para leitura confortável.
- **Movimento:** somente transições curtas; `prefers-reduced-motion` elimina transições e rolagem suave.

## Arquivos de aplicação

Tokens e componentes em `styles.css`; conteúdo em `index.html`; seleção de presente em `app.js`. Para mudar a identidade, ajuste primeiro os tokens de `:root` e revalide contraste. A assinatura e as artes oficiais ficam em `assets/`; os PNGs originais, em `docs/referencias/`.
