/**
 * AAV Works - Product documents
 * A document card links straight to its PDF. Until the PDF has been uploaded to
 * public/documents/, the card is shown as "PDF coming soon" instead of a dead link.
 * See DOCUMENTS.md for the expected file names.
 */

const isPdfResponse = (res) =>
  res.ok && /pdf|octet-stream/i.test(res.headers.get('content-type') || '');

async function markIfMissing(card) {
  const url = new URL(card.dataset.doc, document.baseURI).href;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (isPdfResponse(res)) return;
  } catch (_) {
    /* offline or blocked: treat as not available */
  }
  card.classList.add('is-pending');
  card.removeAttribute('href');
  card.removeAttribute('target');
  card.setAttribute('aria-disabled', 'true');
  card.querySelector('.doc-card-state')?.removeAttribute('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.doc-card[data-doc]').forEach(markIfMissing);
});
