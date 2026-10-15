/**
 * AAV Works - home hero background slider.
 * The hero artwork (.hero-photo) slides sideways to the next background every few seconds.
 * Nothing else in the hero changes: no arrows, dots or new elements.
 */
const SLIDES = [
  '/assets/images/hero_train_bg.png',
  '/assets/images/hero/hero-2.png',
  '/assets/images/hero/hero-3.png',
  '/assets/images/hero/hero-4.png',
  '/assets/images/hero/hero-5.png',
];
const INTERVAL_MS = 6000;
const SLIDE_MS = 1100;

function initHeroSlider() {
  const first = document.querySelector('.hero-visual .hero-photo');
  if (!first || SLIDES.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const visual = first.parentElement;
  const layers = [first];
  SLIDES.slice(1).forEach((src) => {
    const layer = first.cloneNode(false);
    layer.style.backgroundImage = `url("${src}")`;
    layer.classList.add('hero-slide');
    visual.appendChild(layer);
    layers.push(layer);
    const img = new Image();
    img.src = src; // preload so a slide never arrives blank
  });
  first.classList.add('hero-slide', 'is-active');
  layers.slice(1).forEach((l) => l.classList.add('is-next'));

  let current = 0;
  let busy = false;

  function go() {
    if (busy || document.hidden) return;
    busy = true;
    const out = layers[current];
    current = (current + 1) % layers.length;
    const incoming = layers[current];

    // incoming waits off to the right with no transition, then both slide left together
    incoming.classList.remove('is-prev', 'is-active');
    incoming.classList.add('is-next', 'no-anim');
    void incoming.offsetWidth;
    incoming.classList.remove('no-anim', 'is-next');
    incoming.classList.add('is-active');
    out.classList.remove('is-active');
    out.classList.add('is-prev');

    setTimeout(() => {
      out.classList.add('no-anim');
      out.classList.remove('is-prev');
      out.classList.add('is-next');
      void out.offsetWidth;
      out.classList.remove('no-anim');
      busy = false;
    }, SLIDE_MS + 60);
  }

  setInterval(go, INTERVAL_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSlider);
} else {
  initHeroSlider();
}
