/**
 * AAV Works - Latest News 3D Perspective Carousel Controller
 * Seamlessly manages 3D card rotation, slot positioning, dash indicators, and swipe gesture.
 */

export function initNewsCarousel() {
  const section = document.getElementById('news');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.news-3d-card'));
  const prevBtn = section.querySelector('#newsPrevBtn');
  const nextBtn = section.querySelector('#newsNextBtn');
  const dashes = Array.from(section.querySelectorAll('.news-dash-item'));

  if (cards.length < 3) return;

  let activeIndex = 1; // Center card (index 1) active by default

  function updateSlots(centerIdx) {
    activeIndex = (centerIdx + cards.length) % cards.length;
    const leftIdx = (activeIndex - 1 + cards.length) % cards.length;
    const rightIdx = (activeIndex + 1) % cards.length;

    cards.forEach((card, idx) => {
      card.classList.remove('card-slot-left', 'card-slot-center', 'card-slot-right', 'card-slot-hidden');
      if (idx === activeIndex) {
        card.classList.add('card-slot-center');
      } else if (idx === leftIdx) {
        card.classList.add('card-slot-left');
      } else if (idx === rightIdx) {
        card.classList.add('card-slot-right');
      } else {
        card.classList.add('card-slot-hidden');
      }
    });

    dashes.forEach((dash, idx) => {
      dash.classList.toggle('active', idx === activeIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlots(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlots(activeIndex + 1);
    });
  }

  dashes.forEach((dash, idx) => {
    dash.addEventListener('click', () => updateSlots(idx));
  });

  // Clicking flanking cards directly centers them
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (idx !== activeIndex) {
        if (!e.target.closest('a')) {
          e.preventDefault();
          updateSlots(idx);
        }
      }
    });
  });

  // Touch / Swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  const stage = section.querySelector('.news-carousel-stage');

  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 40;
    if (touchEndX < touchStartX - swipeThreshold) {
      updateSlots(activeIndex + 1); // Swipe left -> next
    } else if (touchEndX > touchStartX + swipeThreshold) {
      updateSlots(activeIndex - 1); // Swipe right -> prev
    }
  }

  // Keyboard navigation when section is in viewport
  window.addEventListener('keydown', (e) => {
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight') {
      updateSlots(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      updateSlots(activeIndex - 1);
    }
  });

  // Initialize slots
  updateSlots(1);
}

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsCarousel);
} else {
  initNewsCarousel();
}
