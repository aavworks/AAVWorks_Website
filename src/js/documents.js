/**
 * AAV Works - Product documents
 *  1. Category tabs (one category visible at a time, deep-linkable via #core / #abs / #kavach).
 *  2. PDF status: a card links to its PDF when the file exists in public/documents/, otherwise it
 *     shows "PDF coming soon". Dropping a new PDF into place activates its card with no code change
 *     (see DOCUMENTS.md for the expected file names).
 */

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

/* ---------- Category tabs ---------- */

function initTabs() {
  const root = document.querySelector('.docs-browser');
  if (!root) return;
  const tabs = [...root.querySelectorAll('.docs-tab')];
  const panels = [...root.querySelectorAll('.docs-panel')];
  if (!tabs.length) return;

  function activate(id, { focus = false } = {}) {
    if (!tabs.some((t) => t.dataset.tab === id)) id = tabs[0].dataset.tab;
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => { p.hidden = p.id !== id; });
    return id;
  }

  root.dataset.ready = 'true';
  activate(location.hash.slice(1));

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      const id = activate(tab.dataset.tab);
      history.replaceState(null, '', `#${id}`);
    });
    tab.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      history.replaceState(null, '', `#${activate(next.dataset.tab, { focus: true })}`);
    });
  });

  // Links to #core / #abs / #kavach (hero pills, home carousel) switch the tab, then bring the tabs into view
  const scrollToTabs = () => root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.anchor-pill-link[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!tabs.some((t) => t.dataset.tab === id)) return;
      e.preventDefault();
      history.replaceState(null, '', `#${activate(id)}`);
      scrollToTabs();
    });
  });
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (tabs.some((t) => t.dataset.tab === id)) {
      activate(id);
      scrollToTabs();
    }
  });
  if (tabs.some((t) => t.dataset.tab === location.hash.slice(1))) {
    requestAnimationFrame(() => root.scrollIntoView({ block: 'start' }));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.doc-card[data-doc]').forEach(checkCard);
  initTabs();
});
