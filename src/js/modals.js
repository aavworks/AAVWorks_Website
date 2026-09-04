/**
 * AAV Works - Modal Controllers (Video & Career Application)
 */

document.addEventListener('DOMContentLoaded', () => {
  initVideoModal();
  initCareerModal();
});

/**
 * Video Overview Modal
 */
function initVideoModal() {
  const videoModal = document.getElementById('videoModal');
  const triggerBtns = document.querySelectorAll('[data-open-video-modal]');
  const closeBtn = document.getElementById('videoCloseBtn');
  const videoEl = document.getElementById('companyVideo');

  if (!videoModal) return;

  const openVideo = () => {
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (videoEl && typeof videoEl.play === 'function') {
      videoEl.play().catch(err => console.log('Autoplay handled:', err));
    }
  };

  const closeVideo = () => {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (videoEl && typeof videoEl.pause === 'function') {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  };

  triggerBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openVideo();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeVideo);

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideo();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
      closeVideo();
    }
  });

  window.openVideoModal = openVideo;
  window.closeVideoModal = closeVideo;
}

/**
 * Career Application Modal
 */
function initCareerModal() {
  const careerModal = document.getElementById('careerModal');
  const triggerBtns = document.querySelectorAll('[data-open-career-modal]');
  const closeBtns = document.querySelectorAll('[data-close-career-modal]');
  const form = document.getElementById('careerApplyForm');

  if (!careerModal) return;

  const openModal = (roleTitle = '') => {
    careerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const roleInput = careerModal.querySelector('input[name="applied_role"]');
    if (roleInput && roleTitle) roleInput.value = roleTitle;
  };

  const closeModal = () => {
    careerModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-role') || 'General S&T Engineering Application';
      openModal(role);
    });
  });

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  careerModal.addEventListener('click', (e) => {
    if (e.target === careerModal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('input[name="candidate_name"]')?.value;
      const role = form.querySelector('input[name="applied_role"]')?.value;

      closeModal();
      form.reset();

      if (window.showToast) {
        window.showToast(`Application submitted! Thank you ${name}, our Talent Acquisition team has received your application for ${role}.`, 'success');
      }
    });
  }

  window.openCareerModal = openModal;
  window.closeCareerModal = closeModal;
}

