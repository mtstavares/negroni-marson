const giftImage = document.querySelector('#gift-image');
const giftScene = document.querySelector('#gift-scene');
const giftBottleOverlay = document.querySelector('#gift-bottle-overlay');
const giftAvifSource = document.querySelector('#gift-bottle-avif');
const giftOrder = document.querySelector('#gift-order');
const giftStatus = document.querySelector('#gift-status');
const giftRetry = document.querySelector('#gift-image-retry');
let giftSelection = 0;
let giftSelectedVersion = giftScene.dataset.version || 'classico';

// Project the Defumado print onto the exact face of the fixed Clássico bottle.
// Four label corners were matched in the two official 1000 × 1000 artworks.
// Coordinates are normalized; the CSS perspective is recalculated on resize.
const giftLabelProjection = [
  1.3411883216784661, .5056690761664169, -.22667934741333864,
  .13046349877160582, 1.594066711096922, -.2639032395155753,
  .07147809158092701, .6278718792657165, 1
];
function registerGiftPerspective(width = giftScene.clientWidth) {
  if (!width) return;
  const [a,b,c,d,e,f,g,h,i] = giftLabelProjection;
  const matrix = [a,d,0,g/width,b,e,0,h/width,0,0,1,0,c*width,f*width,0,i];
  giftBottleOverlay.style.transform = `matrix3d(${matrix.join(',')})`;
}
registerGiftPerspective();
if (typeof ResizeObserver === 'function') {
  new ResizeObserver(([entry]) => registerGiftPerspective(entry.contentRect.width)).observe(giftScene);
} else if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => registerGiftPerspective());
}

async function selectGift(version) {
    giftSelectedVersion = version;
    const selection = ++giftSelection;
    const title = version === 'defumado' ? 'Defumado' : 'Clássico';
    if (giftRetry) giftRetry.hidden = true;
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
      giftScene.setAttribute('aria-busy','true');
      // The second artwork is fetched only when the visitor chooses Defumado.
      // The static Clássico scene remains visible during download and decode.
      if (!giftBottleOverlay.src) {
        if (giftAvifSource) giftAvifSource.media = 'all';
        giftBottleOverlay.srcset = giftBottleOverlay.dataset.srcset;
        giftBottleOverlay.src = giftBottleOverlay.dataset.src;
        giftStatus.textContent = 'Carregando a imagem do Negroni Defumado…';
      }
      try {
        await giftBottleOverlay.decode();
      } catch {
        if (selection === giftSelection) {
          giftStatus.textContent = `Caixa Presente + Negroni ${title}. A imagem não pôde ser carregada.`;
          if (giftRetry) giftRetry.hidden = false;
        }
        return;
      } finally {
        if (selection === giftSelection) giftScene.setAttribute('aria-busy','false');
      }
    }
    if (selection !== giftSelection) return;
    giftScene.setAttribute('aria-busy','false');
    giftScene.dataset.version = version;
    giftImage.alt = `Caixa presente Negroni Marson aberta e fechada, com uma garrafa do ${title} e cenário com luzes quentes`;
    giftStatus.textContent = `Caixa Presente + Negroni ${title}`;
}
document.querySelectorAll('input[name="gift"]').forEach((input) => {
  input.addEventListener('change', () => selectGift(input.value));
});
async function syncGiftSelection() {
  const checked = document.querySelector('input[name="gift"]:checked');
  if (checked && checked.value !== giftSelectedVersion) await selectGift(checked.value);
}
syncGiftSelection();
if (typeof window !== 'undefined') window.addEventListener('pageshow', syncGiftSelection);
if (giftRetry) giftRetry.addEventListener('click', () => {
  giftBottleOverlay.removeAttribute('src');
  giftBottleOverlay.removeAttribute('srcset');
  if (giftAvifSource) giftAvifSource.media = 'not all';
  return selectGift('defumado');
});

const mobileNavigation = document.querySelector('#mobile-navigation');
if (mobileNavigation) {
  const summary = mobileNavigation.querySelector('summary');
  mobileNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileNavigation.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNavigation.open) {
      event.preventDefault();
      mobileNavigation.open = false;
      summary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (mobileNavigation.open && !mobileNavigation.contains(event.target)) mobileNavigation.open = false;
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
