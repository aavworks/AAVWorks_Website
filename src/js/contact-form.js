/**
 * AAV Works - Modern Interactive S&T Consultation Contact System
 * Handles:
 * - Real-time form validation & digit mask
 * - Live character counter (0/1000)
 * - Interactive India SVG Map state & marker sync
 * - Real email delivery through Web3Forms (see contact-config.js), mailto: fallback without a key
 * - Inline feedback & global toast notifications
 */

import { CONTACT_CONFIG } from './contact-config.js';

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('cformName')?.value.trim();
    const email = document.getElementById('cformEmail')?.value.trim();
    const phone = document.getElementById('cformPhone')?.value.trim();
    const subject = 'S&T Circuit Design & Drawings'; // the only service offered, so there is no subject field
    const message = document.getElementById('cformMessage')?.value.trim();
    const submitBtn = document.getElementById('cformSubmitBtn');
    const successAlert = document.getElementById('cformSuccessAlert');

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

    // Spam trap: real visitors never tick this hidden box
    if (document.getElementById('cformBotcheck')?.checked) return;

    const enquiry = { name, email, phone, subject, message };

    // No access key configured yet: hand the enquiry to the visitor's email app instead of losing it
    if (!CONTACT_CONFIG.accessKey) {
      const body = `Name: ${name}
Email: ${email}
Phone: ${phone}
Enquiry type: ${subject}

${message}`;
      window.location.href = `mailto:${CONTACT_CONFIG.recipientEmail}?subject=${encodeURIComponent('AAV Works enquiry: ' + subject)}&body=${encodeURIComponent(body)}`;
      showToast(`Opening your email app. If nothing opens, please write to ${CONTACT_CONFIG.recipientEmail}.`, 'info');
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
      <span>Sending your enquiry...</span>
    `;
    successAlert && (successAlert.style.display = 'none');

    try {
      await sendEnquiry(enquiry);
    } catch (err) {
      console.warn('Enquiry could not be sent', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      showToast(`Sorry, your enquiry could not be sent. Please try again, or email us at ${CONTACT_CONFIG.recipientEmail}.`, 'error');
      return;
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalContent;

    if (successAlert) {
      successAlert.style.display = 'flex';
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.reset();
    const charCounter = document.getElementById('cformCharCurrent');
    if (charCounter) charCounter.textContent = '0';

    showToast(`Thank you, ${name}! Your enquiry has been sent to AAV Works. We will get back to you shortly.`, 'success');
  });
}

/**
 * POST the enquiry to Web3Forms, which emails it to the client. Throws if it was not accepted.
 */
async function sendEnquiry({ name, email, phone, subject, message }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTACT_CONFIG.timeoutMs);
  try {
    const res = await fetch(CONTACT_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CONTACT_CONFIG.accessKey,
        subject: `AAV Works website enquiry: ${subject}`,
        from_name: 'AAV Works Website',
        name,
        email, // also used as the reply-to address
        phone,
        enquiry_type: subject,
        message,
      }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
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
  toast.className = `toast toast-${type}`;
  toast.style.borderLeft = type === 'error' ? '4px solid #ed2832' : '4px solid #10b981';

  toast.innerHTML = `
    <div style="flex-grow: 1; line-height: 1.45; font-size: 13px; font-weight: 550;">${message}</div>
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
