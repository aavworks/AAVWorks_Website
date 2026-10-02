/**
 * AAV Works - accessible tabs shared by the Products (documents) and Services pages.
 *
 * Markup contract:
 *   <section data-tabs>
 *     <button class="docs-tab" role="tab" data-tab="id" aria-controls="id">...</button>
 *     <div role="tabpanel" id="id">...</div>
 *   </section>
 * Panels stay visible without JS; with JS only the active one shows. Tab ids double as URL hashes
 * (#core, #engineering ...), and any .anchor-pill-link[href="#id"] on the page switches the tab.
 */
export function initTabs(root) {
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  if (!tabs.length) return;
  const ids = tabs.map((t) => t.dataset.tab);

  function activate(id, { focus = false } = {}) {
    if (!ids.includes(id)) id = ids[0];
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => { p.hidden = p.id !== id; });
    return id;
  }

  const setHash = (id) => history.replaceState(null, '', `#${id}`);
  const scrollToTabs = () => root.scrollIntoView({ behavior: 'smooth', block: 'start' });

  root.dataset.ready = 'true';
  activate(location.hash.slice(1));

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => setHash(activate(tab.dataset.tab)));
    tab.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      setHash(activate(next.dataset.tab, { focus: true }));
    });
  });

  document.querySelectorAll('.anchor-pill-link[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!ids.includes(id)) return;
      e.preventDefault();
      setHash(activate(id));
      scrollToTabs();
    });
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (ids.includes(id)) {
      activate(id);
      scrollToTabs();
    }
  });

  if (ids.includes(location.hash.slice(1))) {
    requestAnimationFrame(() => root.scrollIntoView({ block: 'start' }));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tabs]').forEach(initTabs);
});
