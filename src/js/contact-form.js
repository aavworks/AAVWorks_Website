/**
 * AAV Works - Interactive Contact & Inquiry System
 * Handles modal contact drawer, form validation, file attachment preview,
 * localStorage preservation, and toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactModals();
  initContactForms();
  initFileUploadDropzones();
});

/**
 * Global Contact Modal Control
 */
export function openContactModal(subject = '') {
  const modal = document.getElementById('contactModal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (subject) {
    const subjectInput = modal.querySelector('input[name="subject"], select[name="subject"]');
    if (subjectInput) subjectInput.value = subject;
  }
}

export function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function initContactModals() {
  const triggers = document.querySelectorAll('[data-open-contact-modal]');
  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const subject = btn.getAttribute('data-subject') || '';
      openContactModal(subject);
    });
  });

  const closeBtns = document.querySelectorAll('[data-close-contact-modal]');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeContactModal);
  });

  // Close when clicking modal backdrop
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeContactModal();
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeContactModal();
  });
}

/**
 * Contact Form Submission & Validation
 */
function initContactForms() {
  const forms = document.querySelectorAll('.aav-contact-form');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';

  // Gather values
  const name = form.querySelector('input[name="name"]')?.value.trim();
  const email = form.querySelector('input[name="email"]')?.value.trim();
  const phone = form.querySelector('input[name="phone"]')?.value.trim();
  const subject = form.querySelector('input[name="subject"], select[name="subject"]')?.value.trim() || 'General Railway S&T Inquiry';
  const message = form.querySelector('textarea[name="message"]')?.value.trim();
  const fileInput = form.querySelector('input[name="attachment"]');
  const fileName = fileInput?.files[0]?.name || 'None';

  // Basic Validation
  if (!name || !email || !message) {
    showToast('Please fill in all required fields marked with *', 'error');
    return;
  }

  if (phone && !/^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
    showToast('Please enter a valid 10-digit phone number', 'error');
    return;
  }

  // Show Loading State
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      Sending Enquiry...
    `;
  }

  // Simulate network dispatch and save to LocalStorage
  setTimeout(() => {
    const enquiry = {
      id: 'AAV-' + Date.now().toString(36).toUpperCase(),
      name,
      email,
      phone,
      subject,
      message,
      fileName,
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('aav_enquiries') || '[]');
      existing.unshift(enquiry);
      localStorage.setItem('aav_enquiries', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage unavailable:', err);
    }

    // Reset button & form
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
    form.reset();

    // Reset dropzone if present
    const dropzoneText = form.querySelector('.dropzone-file-name');
    if (dropzoneText) dropzoneText.textContent = 'Upload attachment (.pdf, .doc, .docx max 10MB)';

    // Close modal if inside modal
    closeContactModal();

    // Show celebratory toast
    showToast(`Thank you, ${name}! Your inquiry [Ref: ${enquiry.id}] has been received. Our S&T engineering team will reach out to ${email} promptly.`, 'success');
  }, 1000);
}

/**
 * File Upload Drag & Drop Preview
 */
function initFileUploadDropzones() {
  const dropzones = document.querySelectorAll('.file-dropzone');
  dropzones.forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    const label = zone.querySelector('.dropzone-file-name');
    if (!input || !label) return;

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--color-primary)';
      zone.style.backgroundColor = 'var(--color-primary-light)';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = '';
      zone.style.backgroundColor = '';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = '';
      zone.style.backgroundColor = '';
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        updateFileName(input.files[0], label);
      }
    });

    input.addEventListener('change', () => {
      if (input.files.length) {
        updateFileName(input.files[0], label);
      }
    });
  });
}

function updateFileName(file, label) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit', 'error');
    return;
  }
  label.textContent = `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  label.style.color = 'var(--color-primary)';
  label.style.fontWeight = '700';
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
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderLeftColor = 'var(--color-primary)';
  } else if (type === 'success') {
    toast.style.borderLeftColor = 'var(--color-emerald)';
  }

  toast.innerHTML = `
    <div style="flex-grow: 1; line-height: 1.4;">${message}</div>
    <button style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 1.1rem; padding: 0 4px;" aria-label="Close">&times;</button>
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

// Make functions globally available for inline onclick handlers
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.showToast = showToast;

