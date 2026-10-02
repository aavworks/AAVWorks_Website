/**
 * AAV Works - Product documents
 * Category tabs live in tabs.js. This file handles PDF status: a card links to its PDF when the file exists in public/documents/, otherwise it
 *     shows "PDF coming soon". Dropping a new PDF into place activates its card with no code change
 *     (see DOCUMENTS.md for the expected file names).
 */

import './tabs.js';

/* ---------- PDF availability ---------- */

const isPdfResponse = (res) =>
  res.ok && /pdf|octet-stream/i.test(res.headers.get('content-type') || '');

function setReady(card, ready) {
  const state = card.querySelector('.doc-card-state');
  // a "coming soon" row whose PDF has now been uploaded moves up next to the other available documents
  if (ready && card.closest('.docs-soon')) {
    const soon = card.closest('.docs-soon');
    soon.closest('.docs-panel').querySelector('.docs-grid').append(card);
    if (!soon.querySelector('.doc-card')) soon.remove();
  }
  card.classList.toggle('is-pending', !ready);
  if (ready) {
    card.href = card.dataset.doc;
    card.target = '_blank';
    card.rel = 'noopener';
    card.removeAttribute('aria-disabled');
    state?.setAttribute('hidden', '');
  } else {
    card.removeAttribute('href');
    card.removeAttribute('target');
    card.setAttribute('aria-disabled', 'true');
    state?.removeAttribute('hidden');
  }
}

async function checkCard(card) {
  const url = new URL(card.dataset.doc, document.baseURI).href;
  let ready = false;
  try {
    ready = isPdfResponse(await fetch(url, { method: 'HEAD' }));
  } catch (_) {
    /* offline or blocked: treat as not available */
  }
  setReady(card, ready);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.doc-card[data-doc]').forEach(checkCard);
});
