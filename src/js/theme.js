/**
 * AAV Works - Light / dark gray theme toggle.
 * The saved choice is applied before first paint by a tiny inline script in each page's <head>;
 * this module wires up the header button and keeps it in sync.
 */

const KEY = 'aav-theme';

function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch (_) {
    /* storage blocked: the choice just won't persist */
  }
  syncButtons();
}

function syncButtons() {
  const dark = currentTheme() === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  syncButtons();
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
  });
});
