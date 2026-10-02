/**
 * Generates src/css/dark-theme.css (dark gray theme) from the light stylesheets.
 *
 * The site's CSS hard-codes its colours, so instead of hand-maintaining a second
 * copy, every rule that uses a light surface / dark ink colour is re-emitted under
 * html[data-theme="dark"] with a mapped colour. Accent colours (red, amber, green,
 * blue) are left untouched.
 *
 * Run after editing src/css/main.css or src/css/animations.css:
 *   node scripts/gen-dark-theme.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCES = ['src/css/main.css', 'src/css/animations.css'];
const PAGES = ['index', 'about', 'services', 'products', 'projects', 'contact'].map((p) => `${p}.html`);
const OUT = path.join(ROOT, 'src/css/dark-theme.css');
const SCOPE = 'html[data-theme="dark"]';

/* ---------- Dark gray palette ---------- */
const PAL = {
  surface: '#1f1f22',   // was white (cards, sections)
  canvas: '#19191c',    // was off-white (alternate sections)
  raised: '#2a2a2e',    // was light slate fills (#f1f5f9 ...)
  inkBg: '#2b2b2f',     // was dark navy surfaces (buttons, footers)
  midBg: '#323237',
  stroke: '#38383d',    // was light borders
  textStrong: '#f4f4f6',
  textBody: '#c9c9d0',
  textMuted: '#9b9ba4',
};

/* ---------- Colour helpers ---------- */
function parseHex(h) {
  let s = h.replace('#', '');
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  if (s.length !== 6) return null;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h, s, l };
}
/** gray / slate / navy: the "neutral" family the site uses for surfaces and ink */
function isNeutral(rgb) {
  const { h, s } = hsl(rgb);
  return s < 0.25 || (h >= 195 && h <= 260 && s < 0.6);
}

function mapBg(hex) {
  const rgb = parseHex(hex); if (!rgb) return null;
  const L = lum(rgb);
  if (isNeutral(rgb)) {
    if (L > 0.985) return PAL.surface;
    if (L > 0.93) return PAL.canvas;
    if (L > 0.55) return PAL.raised;
    if (L < 0.12) return PAL.inkBg;
    if (L < 0.25 ) return PAL.midBg;
    return null;
  }
  if (L > 0.75) return `color-mix(in srgb, ${hex} 14%, ${PAL.surface})`; // pastel tints
  return null;
}
function mapText(hex) {
  const rgb = parseHex(hex); if (!rgb) return null;
  if (!isNeutral(rgb)) return null;
  const L = lum(rgb);
  if (L < 0.04) return PAL.textStrong;
  if (L < 0.11) return PAL.textBody;
  if (L < 0.45) return PAL.textMuted;
  return null;
}
function mapBorder(hex) {
  const rgb = parseHex(hex); if (!rgb) return null;
  const L = lum(rgb);
  if (isNeutral(rgb)) {
    if (L > 0.55 || L < 0.06) return PAL.stroke;
    return null;
  }
  if (L > 0.75) return `color-mix(in srgb, ${hex} 25%, ${PAL.surface})`;
  return null;
}

const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;
function replaceHex(value, fn) {
  let changed = false;
  const out = value.replace(HEX, (m) => { const r = fn(m); if (r) { changed = true; return r; } return m; });
  return changed ? out : null;
}
function mapWhiteRgba(value) {
  // translucent white / very light neutral surfaces -> translucent dark surface
  const out = value.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/gi, (m, r, g, b, a) =>
    +r >= 225 && +g >= 225 && +b >= 225 ? `rgba(31, 31, 34, ${a})` : m);
  return out !== value ? out : null;
}
function mapBgValue(v) {
  let cur = v, changed = false;
  const a = replaceHex(cur, mapBg); if (a) { cur = a; changed = true; }
  const b = mapWhiteRgba(cur); if (b) { cur = b; changed = true; }
  const c = cur.replace(/(^|[\s,(])white\b/gi, `$1${PAL.surface}`); if (c !== cur) { cur = c; changed = true; }
  return changed ? cur : null;
}

/** map one declaration, or return null if dark theme needs no override */
function mapDecl(prop, value) {
  if (prop.startsWith('--')) return null;
  if (/^background(-color|-image)?$/.test(prop)) return mapBgValue(value);
  if (prop === 'color' || prop === 'fill' || prop === 'stroke') return replaceHex(value, mapText);
  if (/^(border|outline)/.test(prop)) return replaceHex(value, mapBorder);
  return null;
}

/* ---------- Selector prefixing ---------- */
function scopeSelector(sel) {
  sel = sel.trim();
  if (sel.startsWith(':root')) return sel.replace(':root', SCOPE);
  if (/^html\b/.test(sel)) return sel.replace(/^html/, SCOPE);
  return `${SCOPE} ${sel}`;
}

function transform(container, out) {
  container.each((node) => {
    if (node.type === 'rule') {
      const decls = [];
      node.each((d) => {
        if (d.type !== 'decl') return;
        const v = mapDecl(d.prop, d.value);
        if (v) decls.push(`  ${d.prop}: ${v} !important;`);
      });
      if (decls.length) {
        const sels = node.selectors.map(scopeSelector).join(',\n');
        out.push(`${sels} {\n${decls.join('\n')}\n}`);
      }
    } else if (node.type === 'atrule' && /^(media|supports|layer)$/.test(node.name)) {
      const inner = [];
      transform(node, inner);
      if (inner.length) out.push(`@${node.name} ${node.params} {\n${inner.join('\n').replace(/^/gm, '  ')}\n}`);
    }
  });
}

/* ---------- Inline style="" attributes in the pages ---------- */
function inlineOverrides() {
  const seen = new Map();
  for (const page of PAGES) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    for (const [, style] of html.matchAll(/style="([^"]*)"/g)) {
      for (const part of style.split(';')) {
        const m = part.match(/^\s*([a-z-]+)\s*:\s*(.+?)\s*$/i);
        if (!m) continue;
        const [, prop, value] = m;
        const mapped = mapDecl(prop.toLowerCase(), value);
        if (mapped) seen.set(`${prop}:${value}`, { prop, value, mapped });
      }
    }
  }
  return [...seen.values()].map(({ prop, value, mapped }) => {
    const needle = `${prop}: ${value}`.replace(/"/g, '&quot;');
    return `${SCOPE} [style*="${needle}"] {\n  ${prop}: ${mapped} !important;\n}`;
  });
}

const rules = [];
for (const src of SOURCES) {
  const css = fs.readFileSync(path.join(ROOT, src), 'utf8');
  rules.push(`/* ---- from ${src} ---- */`);
  transform(postcss.parse(css), rules);
}
rules.push('/* ---- inline style attributes ---- */', ...inlineOverrides());

const banner = `/* AUTO-GENERATED by scripts/gen-dark-theme.mjs - do not edit by hand.
   Dark gray theme overrides, active when <html data-theme="dark">. */\n`;
fs.writeFileSync(OUT, banner + rules.join('\n') + '\n');
console.log(`dark-theme.css: ${rules.length} blocks, ${(fs.statSync(OUT).size / 1024).toFixed(1)} kB`);
