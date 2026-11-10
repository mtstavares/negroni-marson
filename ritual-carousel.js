// One original artwork, four manual steps. Text remains in HTML for the
// no-JavaScript fallback and is shared by the overlay and instruction panel.
export function mountRitualCarousel(section, {view = globalThis.window} = {}) {
  const slides = [...section.querySelectorAll('[data-ritual-slide]')];
  const tabs = [...section.querySelectorAll('[data-ritual-step]')];
  if (!slides.length || slides.length !== tabs.length) return;
  const visual = section.querySelector('[data-ritual-visual]');
  const overlay = section.querySelector('.ritual-overlay');
  const caption = section.querySelector('[data-ritual-caption]');
  const kicker = section.querySelector('[data-ritual-kicker]');
  const count = section.querySelector('[data-ritual-count]');
  const steps = section.querySelector('.ritual-steps');
  const previous = section.querySelector('[data-ritual-prev]');
  const next = section.querySelector('[data-ritual-next]');
  const highlights = [...section.querySelectorAll('[data-ritual-highlight]')];
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  let current = -1;
  let gesture;
  let animations = [];
  function listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    cleanups.push(() => target.removeEventListener(event, handler, options));
  }
  function cancelAnimations() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function select(index, {announce = true, focus = false, direction = 1} = {}) {
    if (!Number.isInteger(index)) return;
    index = (index % slides.length + slides.length) % slides.length;
    if (index === current) {
      if (focus) tabs[index].focus({preventScroll: true});
      return;
    }
    cancelAnimations();
    current = index;
    const slide = slides[index];
    steps.setAttribute('aria-live', announce ? 'polite' : 'off');
    steps.setAttribute('aria-busy', 'true');
    slides.forEach((item, position) => { item.hidden = position !== index; });
    tabs.forEach((tab, position) => tab.setAttribute('aria-pressed', String(position === index)));
    highlights.forEach((part, position) => part.classList.toggle('is-active', position === index));
    section.dataset.ritualStep = String(index);
    visual.dataset.focus = slide.dataset.focus;
    caption.textContent = slide.dataset.caption;
    kicker.textContent = `${String(index + 1).padStart(2, '0')} / ${slide.dataset.name}`;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    section.style.setProperty('--ritual-progress', String((index + 1) / slides.length));
    const last = index === slides.length - 1;
    next.setAttribute('aria-label', last ? 'Recomeçar o ritual' : 'Ver próxima etapa');
    next.textContent = last ? 'Recomeçar ↺' : 'Próxima →';
    steps.setAttribute('aria-busy', 'false');
    if (announce) {
      if (!motion.matches) {
        for (const target of [slide, overlay]) {
          if (target.animate) animations.push(target.animate(
            [{opacity: .35, transform: `translateX(${direction * 12}px)`}, {opacity: 1, transform: 'translateX(0)'}],
            {duration: 500, easing: 'cubic-bezier(.2,.7,.3,1)'}
          ));
        }
      }
    }
    if (focus) tabs[index].focus({preventScroll: true});
  }
  tabs.forEach((tab, index) => {
    listen(tab, 'click', () => select(index, {direction: index >= current ? 1 : -1}));
    listen(tab, 'keydown', event => {
      const target = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: slides.length - 1}[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(target, {focus: true, direction: event.key === 'ArrowLeft' ? -1 : 1});
    });
  });
  listen(previous, 'click', () => select(current - 1, {direction: -1}));
  listen(next, 'click', () => select(current + 1));
  listen(section, 'pointerdown', event => {
    gesture = undefined;
    if (event.isPrimary === false || !['touch', 'pen'].includes(event.pointerType) || event.target.closest('a,button')) return;
    gesture = {id: event.pointerId, x: event.clientX, y: event.clientY};
  }, {passive: true});
  listen(section, 'pointerup', event => {
    const start = gesture;
    gesture = undefined;
    if (!start || start.id !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) >= 44 && Math.abs(x) > Math.abs(y) * 1.4) select(current + (x < 0 ? 1 : -1), {direction: x < 0 ? 1 : -1});
  }, {passive: true});
  listen(section, 'pointercancel', () => { gesture = undefined; });
  listen(motion, 'change', event => { if (event.matches) cancelAnimations(); });
  section.setAttribute('aria-roledescription', 'carrossel');
  section.classList.add('is-enhanced');
  const controls = [...section.querySelectorAll('.ritual-tabs,.ritual-controls,.ritual-swipe-hint,.ritual-overlay')];
  controls.forEach(control => { control.hidden = false; });
  select(0, {announce: false});
  return {select, get index() { return current; }, destroy() {
    cleanups.forEach(cleanup => cleanup());
    cancelAnimations();
    steps.setAttribute('aria-live', 'off');
    slides.forEach(slide => { slide.hidden = false; });
    controls.forEach(control => { control.hidden = true; });
    section.classList.remove('is-enhanced');
    delete visual.dataset.focus;
    delete section.dataset.ritualStep;
    section.removeAttribute('aria-roledescription');
  }};
}

if (typeof document !== 'undefined') {
  const section = document.querySelector('[data-ritual]');
  if (section) mountRitualCarousel(section);
}
