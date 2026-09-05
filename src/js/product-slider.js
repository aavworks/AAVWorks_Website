/**
 * Interactive 3D Perspective Coverflow Product Slider
 * Matching reference layout media_1788553583491.png
 */

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.catalog-slider-stage');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.catalog-card'));
  const prevBtn = document.getElementById('catalogPrevBtn');
  const nextBtn = document.getElementById('catalogNextBtn');
  const progressDashes = Array.from(document.querySelectorAll('.catalog-progress-dash'));
  const counterElem = document.getElementById('catalogCounter');

  if (!cards.length) return;

  let currentIndex = 0;
  const total = cards.length;
  let autoplayTimer = null;

  function updateSlider() {
    cards.forEach((card, i) => {
      // Calculate signed circular offset from active card
      let offset = i - currentIndex;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      card.classList.remove('is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next', 'is-hidden');

      // Base transformations
      let translateX = 0;
      let translateZ = 0;
      let rotateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 1;

      if (offset === 0) {
        card.classList.add('is-active');
        translateX = 0;
        translateZ = 60;
        rotateY = 0;
        scale = 1.04;
        opacity = 1;
        zIndex = 10;
      } else if (offset === 1) {
        card.classList.add('is-next');
        translateX = 185;
        translateZ = 0;
        rotateY = -15;
        scale = 0.94;
        opacity = 0.92;
        zIndex = 6;
      } else if (offset === -1) {
        card.classList.add('is-prev');
        translateX = -185;
        translateZ = 0;
        rotateY = 15;
        scale = 0.94;
        opacity = 0.92;
        zIndex = 6;
      } else if (offset === 2) {
        card.classList.add('is-far-next');
        translateX = 350;
        translateZ = -60;
        rotateY = -24;
        scale = 0.88;
        opacity = 0.80;
        zIndex = 4;
      } else if (offset === -2) {
        card.classList.add('is-far-prev');
        translateX = -350;
        translateZ = -60;
        rotateY = 24;
        scale = 0.88;
        opacity = 0.80;
        zIndex = 4;
      } else {
        card.classList.add('is-hidden');
        opacity = 0;
        zIndex = 0;
      }

      card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });

    // Update progress indicator dashes
    progressDashes.forEach((dash, i) => {
      if (i === currentIndex) {
        dash.classList.add('active');
      } else {
        dash.classList.remove('active');
      }
    });

    // Update counter "01 / 05"
    if (counterElem) {
      const displayNum = String(currentIndex + 1).padStart(2, '0');
      const totalNum = String(total).padStart(2, '0');
      counterElem.textContent = `${displayNum} / ${totalNum}`;
    }
  }

  function goTo(index) {
    currentIndex = (index + total) % total;
    updateSlider();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  // Button Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      next();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prev();
      resetAutoplay();
    });
  }

  // Card Click Listeners (clicking adjacent card brings it to center)
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      // If clicking inside a direct link, allow standard navigation
      if (e.target.closest('a')) return;
      if (i !== currentIndex) {
        e.preventDefault();
        goTo(i);
        resetAutoplay();
      }
    });
  });

  // Progress Dash Click Listeners
  progressDashes.forEach((dash, i) => {
    dash.addEventListener('click', () => {
      goTo(i);
      resetAutoplay();
    });
  });

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) next();
      else prev();
      resetAutoplay();
    }
  }, { passive: true });

  // Autoplay functionality
  function startAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      next();
    }, 6000);
  }

  function resetAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    startAutoplay();
  }

  stage.addEventListener('mouseenter', () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  });

  stage.addEventListener('mouseleave', () => {
    startAutoplay();
  });

  // Initial render
  updateSlider();
  startAutoplay();
});
