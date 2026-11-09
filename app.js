const giftImage = document.querySelector('#gift-image');
const giftScene = document.querySelector('#gift-scene');
const giftBottleOverlay = document.querySelector('#gift-bottle-overlay');
const giftOrder = document.querySelector('#gift-order');
const giftStatus = document.querySelector('#gift-status');
let giftSelection = 0;

document.querySelectorAll('input[name="gift"]').forEach((input) => {
  input.addEventListener('change', async () => {
    const selection = ++giftSelection;
    const version = input.value;
    const title = version === 'defumado' ? 'Defumado' : 'Clássico';
    giftOrder.href = giftOrder.dataset[version];
    giftOrder.replaceChildren(document.createTextNode(`Pedir caixa com ${title} `));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    giftOrder.append(arrow);
    giftStatus.textContent = `Caixa Presente + Negroni ${title}`;

    // Decode before fading in, avoiding an empty frame on the first selection.
    // A later selection always wins if the visitor changes options quickly.
    if (version === 'defumado') {
      try {
        await giftBottleOverlay.decode();
      } catch {
        if (selection === giftSelection) giftStatus.textContent = `Caixa Presente + Negroni ${title}. A imagem não pôde ser carregada.`;
        return;
      }
    }
    if (selection !== giftSelection) return;
    giftScene.dataset.version = version;
    giftImage.alt = `Caixa presente Marson aberta e fechada, com uma garrafa do ${title} e cenário com luzes quentes`;
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
