/**
 * AAV Works - Modern Interactive S&T Consultation Contact System
 * Handles:
 * - Real-time form validation & digit mask
 * - Live character counter (0/1000)
 * - Interactive India SVG Map state & marker sync
 * - Drag-and-drop file upload with preview and removal
 * - LocalStorage audit preservation
 * - Inline feedback & global toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  initDirectConsultationForm();
  initIndiaMapSync();
  initEnhancedDropzone();
  initCharCounter();
});

/**
 * Direct Consultation Form Controller
 */
function initDirectConsultationForm() {
  const form = document.getElementById('directConsultationForm');
  if (!form) return;

  const phoneInput = document.getElementById('cformPhone');
  if (phoneInput) {
    // Only allow numbers and max 10 digits
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cformName')?.value.trim();
    const email = document.getElementById('cformEmail')?.value.trim();
    const phone = document.getElementById('cformPhone')?.value.trim();
    const subject = document.getElementById('cformSubject')?.value || 'S&T Circuit Design & Drawings';
    const message = document.getElementById('cformMessage')?.value.trim();
    const fileInput = document.getElementById('cformFileInput');
    const submitBtn = document.getElementById('cformSubmitBtn');
    const successAlert = document.getElementById('cformSuccessAlert');
    const ticketIdElem = document.getElementById('successTicketId');

    // Validation checks
    if (!name || name.length < 2) {
      showToast('Please enter your full name (minimum 2 characters).', 'error');
      document.getElementById('cformName')?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showToast('Please enter a valid railway or corporate email address.', 'error');
      document.getElementById('cformEmail')?.focus();
      return;
    }

    if (!phone || phone.length !== 10) {
      showToast('Please provide a valid 10-digit mobile contact number.', 'error');
      document.getElementById('cformPhone')?.focus();
      return;
    }

    if (!message || message.length < 10) {
      showToast('Please provide a detailed project scope (at least 10 characters).', 'error');
      document.getElementById('cformMessage')?.focus();
      return;
    }

    // Submit state
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <span>Logging Consultation Request...</span>
    `;

    // Simulated network transmission & ticket creation
    setTimeout(() => {
      const ticketNum = 'AAV-' + Math.floor(100000 + Math.random() * 900000);
      const attachmentName = fileInput?.files[0]?.name || null;
      const attachmentSize = fileInput?.files[0]?.size ? (fileInput.files[0].size / 1024 / 1024).toFixed(2) + ' MB' : null;

      const inquiryRecord = {
        ticket: ticketNum,
        name,
        email,
        phone,
        subject,
        message,
        attachmentName,
        attachmentSize,
        submittedAt: new Date().toISOString()
      };

      try {
        const history = JSON.parse(localStorage.getItem('aav_consultation_inquiries') || '[]');
        history.unshift(inquiryRecord);
        localStorage.setItem('aav_consultation_inquiries', JSON.stringify(history));
      } catch (err) {
        console.warn('LocalStorage unavailable', err);
      }

      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;

      // Show inline confirmation
      if (successAlert) {
        if (ticketIdElem) ticketIdElem.textContent = `#${ticketNum}`;
        successAlert.style.display = 'flex';
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form controls
      form.reset();
      const charCounter = document.getElementById('cformCharCurrent');
      if (charCounter) charCounter.textContent = '0';

      // Reset file upload view
      resetFileUpload();

      // Show global celebration toast
      showToast(`Thank you, ${name}! Your consultation request [Ticket: #${ticketNum}] has been registered with AAV Works S&T Directorate.`, 'success');
    }, 900);
  });
}

/**
 * Character Counter Controller
 */
function initCharCounter() {
  const textarea = document.getElementById('cformMessage');
  const counter = document.getElementById('cformCharCurrent');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = len;
    if (len >= 950) {
      counter.style.color = '#ef4444';
      counter.style.fontWeight = '800';
    } else if (len >= 800) {
      counter.style.color = '#f59e0b';
      counter.style.fontWeight = '700';
    } else {
      counter.style.color = '#94a3b8';
      counter.style.fontWeight = 'normal';
    }
  });
}

/**
 * India Map & Office Cards Interactivity Sync
 */
function initIndiaMapSync() {
  const cardHq = document.getElementById('officeCardHq');
  const cardChirala = document.getElementById('officeCardChirala');

  const stateTG = document.getElementById('state-tg');
  const stateAP = document.getElementById('state-ap');
  const pinHyderabad = document.querySelector('.pin-hyderabad');
  const pinChirala = document.querySelector('.pin-chirala');

  if (cardHq && stateTG) {
    cardHq.addEventListener('mouseenter', () => {
      stateTG.classList.add('active');
      if (pinHyderabad) pinHyderabad.classList.add('pulse-strong');
    });
    cardHq.addEventListener('mouseleave', () => {
      stateTG.classList.remove('active');
      if (pinHyderabad) pinHyderabad.classList.remove('pulse-strong');
    });
  }

  if (cardChirala && stateAP) {
    cardChirala.addEventListener('mouseenter', () => {
      stateAP.classList.add('active');
      if (pinChirala) pinChirala.classList.add('pulse-strong');
    });
    cardChirala.addEventListener('mouseleave', () => {
      stateAP.classList.remove('active');
      if (pinChirala) pinChirala.classList.remove('pulse-strong');
    });
  }

  // Also enable reverse interaction: clicking/hovering states on map highlights cards
  if (stateTG && cardHq) {
    stateTG.addEventListener('mouseenter', () => cardHq.classList.add('hover-highlight'));
    stateTG.addEventListener('mouseleave', () => cardHq.classList.remove('hover-highlight'));
    stateTG.addEventListener('click', () => cardHq.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  if (stateAP && cardChirala) {
    stateAP.addEventListener('mouseenter', () => cardChirala.classList.add('hover-highlight'));
    stateAP.addEventListener('mouseleave', () => cardChirala.classList.remove('hover-highlight'));
    stateAP.addEventListener('click', () => cardChirala.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
}

/**
 * File Upload Drag & Drop Preview Controller
 */
function initEnhancedDropzone() {
  const dropzone = document.getElementById('cformDropzone');
  const fileInput = document.getElementById('cformFileInput');
  const idleView = document.getElementById('dropzoneIdle');
  const attachedView = document.getElementById('dropzoneAttached');
  const fileNameElem = document.getElementById('attachedFileName');
  const fileSizeElem = document.getElementById('attachedFileSize');
  const removeBtn = document.getElementById('attachedRemoveBtn');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#attachedRemoveBtn')) return;
    fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) {
      processSelectedFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      processSelectedFile(fileInput.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetFileUpload();
    });
  }

  function processSelectedFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('File exceeds 10MB limit. Please attach a compressed document.', 'error');
      fileInput.value = '';
      return;
    }

    if (fileNameElem) fileNameElem.textContent = file.name;
    if (fileSizeElem) {
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';
      fileSizeElem.textContent = `(${sizeStr})`;
    }

    if (idleView) idleView.style.display = 'none';
    if (attachedView) attachedView.style.display = 'flex';
  }
}

function resetFileUpload() {
  const fileInput = document.getElementById('cformFileInput');
  const idleView = document.getElementById('dropzoneIdle');
  const attachedView = document.getElementById('dropzoneAttached');
  if (fileInput) fileInput.value = '';
  if (idleView) idleView.style.display = 'flex';
  if (attachedView) attachedView.style.display = 'none';
}

/**
 * Toast Notification System
 */
export function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-\${type}`;
  toast.style.borderLeft = type === 'error' ? '4px solid #ed2832' : '4px solid #10b981';

  toast.innerHTML = `
    <div style="flex-grow: 1; line-height: 1.45; font-size: 13px; font-weight: 550;">\${message}</div>
    <button style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 1.2rem; padding: 0 4px; line-height: 1;" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

window.showToast = showToast;
