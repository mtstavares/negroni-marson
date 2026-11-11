// Native touch scrolling with copies on both sides. After scrolling settles,
// return to the identical original card so the visitor never reaches an end.
export function mountCollectionCarousel(section, {view = globalThis.window} = {}) {
  const track = section.querySelector('.product-grid');
  const cards = [...track.querySelectorAll('.product-card')];
  const controls = section.querySelector('.collection-controls');
  const status = section.querySelector('[data-collection-status]');
  const previous = section.querySelector('[data-collection-prev]');
  const next = section.querySelector('[data-collection-next]');
  if (cards.length < 2 || !controls) return;
  const mobile = view.matchMedia('(max-width: 760px)');
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const names = cards.map(card => card.querySelector('h3').textContent.trim());
  const cleanups = [];
  let copies = [], enabled = false, current = 0, touching = false;
  let timer, resizeFrame, pending = null;
  const wrap = index => (index % cards.length + cards.length) % cards.length;
  const position = card => card.offsetLeft - track.firstElementChild.offsetLeft;
  function listen(target, event, listener, options) {
    target.addEventListener(event, listener, options);
    cleanups.push(() => target.removeEventListener(event, listener, options));
  }
  function clearTimer() { view.clearTimeout(timer); }
  function activeCard(index, announce = true) {
    const focused = track.ownerDocument.activeElement;
    const keepFocus = cards.some((card, i) => i !== index && card.contains(focused));
    cards.forEach((card, i) => {
      card.inert = i !== index;
      card.setAttribute('aria-hidden', String(i !== index));
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${names[i]}, ${i + 1} de ${cards.length}`);
    });
    const label = `${names[index]} · ${index + 1} de ${cards.length}`;
    if ((announce || !status.textContent) && status.textContent !== label) status.textContent = label;
    if (keepFocus) cards[index].querySelector('a').focus({preventScroll: true});
    current = index;
  }
  function jump(index) {
    track.scrollTo({left: position(cards[index]), behavior: 'instant'});
  }
  function closestIndex() {
    const slides = [...track.children];
    let nearest = 0;
    slides.forEach((card, i) => {
      if (Math.abs(position(card) - track.scrollLeft) < Math.abs(position(slides[nearest]) - track.scrollLeft)) nearest = i;
    });
    return nearest;
  }
  function settle() {
    clearTimer();
    if (!enabled || touching) return;
    const index = wrap(closestIndex());
    pending = null;
    activeCard(index);
    // Copies and originals have identical dimensions. The instantaneous reset
    // is invisible, and only original cards can receive focus or order clicks.
    if (Math.abs(track.scrollLeft - position(cards[index])) > 1) jump(index);
  }
  function navigate(direction) {
    if (!enabled) return;
    clearTimer();
    // Finish an earlier click before navigating again; rapid taps keep order.
    if (pending !== null) { jump(pending); activeCard(pending); pending = null; }
    else settle();
    const target = cards.length + current + direction;
    pending = wrap(current + direction);
    track.scrollTo({left: position(track.children[target]), behavior: motion.matches ? 'instant' : 'smooth'});
    if (motion.matches) settle();
  }
  function enable() {
    if (enabled) return;
    enabled = true;
    const clone = card => {
      const copy = card.cloneNode(true);
      copy.inert = true;
      copy.setAttribute('aria-hidden', 'true');
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      copy.querySelectorAll('img').forEach(image => { image.draggable = false; });
      return copy;
    };
    const before = cards.map(clone), after = cards.map(clone);
    copies = [...before, ...after];
    track.prepend(...before);
    track.append(...after);
    section.classList.add('is-carousel');
    controls.hidden = false;
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-roledescription', 'carrossel');
    track.setAttribute('aria-label', 'Versões do Negroni Marson');
    activeCard(current, false);
    jump(current);
  }
  function disable() {
    if (!enabled) return;
    enabled = false; touching = false; pending = null;
    clearTimer();
    view.cancelAnimationFrame(resizeFrame);
    copies.forEach(copy => copy.remove()); copies = [];
    section.classList.remove('is-carousel');
    controls.hidden = true;
    ['tabindex','role','aria-roledescription','aria-label'].forEach(name => track.removeAttribute(name));
    cards.forEach(card => {
      card.inert = false;
      ['aria-hidden','role','aria-roledescription','aria-label'].forEach(name => card.removeAttribute(name));
    });
    track.scrollTo({left: 0, behavior: 'instant'});
  }
  listen(previous, 'click', () => navigate(-1));
  listen(next, 'click', () => navigate(1));
  listen(track, 'scroll', () => {
    if (!enabled) return;
    clearTimer();
    timer = view.setTimeout(settle, 160);
  }, {passive: true});
  listen(track, 'scrollend', settle);
  listen(track, 'pointerdown', event => {
    if (!enabled || event.isPrimary === false) return;
    touching = true; pending = null; clearTimer();
  }, {passive: true});
  const release = () => {
    if (!touching) return;
    touching = false;
    clearTimer(); timer = view.setTimeout(settle, 160);
  };
  listen(view, 'pointerup', release, {passive: true});
  listen(view, 'pointercancel', release, {passive: true});
  listen(track, 'keydown', event => {
    if (!enabled || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    navigate(event.key === 'ArrowRight' ? 1 : -1);
  });
  listen(mobile, 'change', () => mobile.matches ? enable() : disable());
  listen(motion, 'change', () => { if (enabled && motion.matches) settle(); });
  listen(view, 'resize', () => {
    if (!enabled) return;
    view.cancelAnimationFrame(resizeFrame);
    resizeFrame = view.requestAnimationFrame(() => { if (enabled) { pending = null; jump(current); } });
  });
  if (mobile.matches) enable();
  return {navigate, settle, get index() { return current; }, get enabled() { return enabled; }, destroy() {
    disable(); cleanups.forEach(cleanup => cleanup());
  }};
}

if (typeof document !== 'undefined') {
  const section = document.querySelector('#negronis');
  if (section) mountCollectionCarousel(section);
}
