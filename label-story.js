// Playback is isolated from the DOM so pause, visibility and motion preferences
// can be checked without depending on a particular browser automation tool.
export function createStoryPlayback({length, onSelect, onPlaybackChange, setTimer = setTimeout, clearTimer = clearTimeout, duration = 6000}) {
  let index = 0;
  let inView = false;
  let hidden = false;
  let reducedMotion = false;
  let userPaused = false;
  let touchMode = false;
  let destroyed = false;
  let timer;

  function sync() {
    clearTimer(timer);
    const playing = !destroyed && inView && !hidden && !reducedMotion && !userPaused && !touchMode;
    onPlaybackChange(playing, {userPaused, reducedMotion, touchMode});
    if (playing) timer = setTimer(() => select((index + 1) % length), duration);
  }

  function select(next, manual = false) {
    if (!Number.isInteger(next) || next < 0 || next >= length || destroyed) return;
    index = next;
    if (manual) userPaused = true;
    onSelect(index, manual);
    sync();
  }

  onSelect(index, false);
  sync();
  return {
    select,
    setInView(value) { inView = value; sync(); },
    setHidden(value) { hidden = value; sync(); },
    setReducedMotion(value) { reducedMotion = value; sync(); },
    setTouchMode(value) { touchMode = value; sync(); },
    togglePaused() { userPaused = !userPaused; sync(); },
    destroy() { destroyed = true; sync(); }
  };
}

export function mountLabelExplorer(section, {view = globalThis.window, page = globalThis.document, setTimer, clearTimer} = {}) {
    const buttons = [...section.querySelectorAll('[data-label-step]')];
    const hotspots = [...section.querySelectorAll('[data-label-hotspot]')];
    const parts = [...section.querySelectorAll('[data-label-part]')];
    const toggle = section.querySelector('#label-motion-toggle');
    const caption = section.querySelector('#label-caption');
    const announcement = section.querySelector('#label-announcement');
    const card = section.querySelector('#label-detail-card');
    const cardTitle = section.querySelector('#label-card-title');
    const cardDescription = section.querySelector('#label-card-description');
    const cardCount = section.querySelector('#label-card-count');
    const reset = section.querySelector('#label-reset');
    const mobile = view.matchMedia('(max-width: 760px)');
    const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
    const details = buttons.map(button => ({
      title: button.querySelector('strong').textContent,
      description: button.querySelector('strong + span').textContent
    }));
    const initialCard = {title: cardTitle.textContent, description: cardDescription.textContent, count: cardCount.textContent};
    // Percent coordinates in the original, uncropped 360 × 710 label canvas.
    const focalPoints = [[31.94,51.97],[63.06,51.83],[75,50.70],[45.83,64.79],[51.39,79.58]];
    let explored = false;
    let selected = 0;
    let cardAnimation;
    const cleanups = [];
    function listen(target, event, callback) {
      target.addEventListener(event, callback);
      cleanups.push(() => target.removeEventListener(event, callback));
    }
    const captions = [
      'As montanhas · A paisagem que inspira a Marson.',
      'O pôr do sol · Um convite para desacelerar.',
      'O Cristo · Um símbolo da nossa Amparo.',
      'O negroni · Equilíbrio, sabor e bons momentos.',
      'A assinatura · A criação de Leandro Marson.'
    ];
    function paint(index, manual) {
        selected = index;
        if (manual) explored = true;
        section.dataset.exploring = String(explored);
        buttons.forEach((button, current) => {
          button.classList.toggle('is-active', current === index);
          button.setAttribute('aria-pressed', String(current === index));
        });
        hotspots.forEach((button, current) => {
          const active = current === index && explored;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        parts.forEach((part, current) => part.classList.toggle('is-active', current === index && (explored || !mobile.matches)));
        caption.textContent = captions[index];
        section.style.setProperty('--label-focus-x', `${focalPoints[index][0]}%`);
        section.style.setProperty('--label-focus-y', `${focalPoints[index][1]}%`);
        reset.hidden = !explored;
        cardTitle.textContent = explored ? details[index].title : initialCard.title;
        cardDescription.textContent = explored ? details[index].description : initialCard.description;
        cardCount.textContent = explored ? `${String(index + 1).padStart(2,'0')} / 05 · Por trás do rótulo` : initialCard.count;
        if (manual && mobile.matches && !motion.matches && card.animate) {
          cardAnimation?.cancel();
          cardAnimation = card.animate([{opacity:.5, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:420, easing:'cubic-bezier(.2,.7,.3,1)'});
        }
        // Automatic changes do not interrupt screen-reader users.
        if (manual) announcement.textContent = `${details[index].title}. ${details[index].description}`;
    }
    const playback = createStoryPlayback({
      length: buttons.length,
      ...(setTimer ? {setTimer} : {}),
      ...(clearTimer ? {clearTimer} : {}),
      onSelect: paint,
      onPlaybackChange(playing, {reducedMotion, touchMode}) {
        section.dataset.playing = String(playing);
        toggle.hidden = reducedMotion || touchMode;
        toggle.textContent = playing ? 'Pausar animação Ⅱ' : 'Reproduzir animação ▷';
      }
    });

    [...buttons, ...hotspots].forEach(button => {
      const index = Number(button.dataset.labelStep ?? button.dataset.labelHotspot);
      listen(button, 'click', () => playback.select(index, true));
    });
    hotspots.forEach((button, index) => listen(button, 'keydown', event => {
      const next = {ArrowRight:(index + 1) % hotspots.length, ArrowDown:(index + 1) % hotspots.length, ArrowLeft:(index + hotspots.length - 1) % hotspots.length, ArrowUp:(index + hotspots.length - 1) % hotspots.length, Home:0, End:hotspots.length - 1}[event.key];
      if (next === undefined) return;
      event.preventDefault();
      hotspots[next].focus({preventScroll:true});
      playback.select(next, true);
    }));
    listen(reset, 'click', () => {
      explored = false;
      cardAnimation?.cancel();
      paint(selected, false);
      announcement.textContent = 'Visão geral do rótulo. Escolha outro detalhe para explorar.';
      hotspots[selected].focus({preventScroll:true});
    });
    listen(toggle, 'click', () => playback.togglePaused());
    playback.setReducedMotion(motion.matches);
    playback.setTouchMode(mobile.matches);
    listen(motion, 'change', event => {
      if (event.matches) cardAnimation?.cancel();
      playback.setReducedMotion(event.matches);
    });
    listen(mobile, 'change', event => {
      playback.setTouchMode(event.matches);
      paint(selected, false);
    });
    playback.setHidden(page.hidden);
    listen(page, 'visibilitychange', () => playback.setHidden(page.hidden));
    let observer;
    if ('IntersectionObserver' in view) {
      observer = new view.IntersectionObserver(([entry]) => playback.setInView(entry.isIntersecting), {threshold: 0.12});
      observer.observe(section);
    } else playback.setInView(true);
    section.classList.add('is-enhanced');
    return {playback, destroy() {
      playback.destroy();
      cardAnimation?.cancel();
      observer?.disconnect();
      cleanups.forEach(cleanup => cleanup());
    }};
}

if (typeof document !== 'undefined') {
  const section = document.querySelector('#rotulo');
  if (section) mountLabelExplorer(section);
}
