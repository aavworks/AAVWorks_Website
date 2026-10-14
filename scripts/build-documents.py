"""
Builds the Products page document section from the PDFs in public/documents/.

Workflow for new client PDFs:
  1. Drop them in source-docs/ (git-ignored, never published).
  2. Add an entry to OPS below: which PDFs form one document, which category,
     and which page/crop to use for the preview image.
  3. python scripts/build-documents.py   (needs PyMuPDF + Pillow)

It (re)writes: public/documents/<folder>/<slug>.pdf, public/documents/previews/<slug>.jpg,
the document tabs in products.html, the PDF counts and fan previews on the home page, and DOCUMENTS.md.
The catalog (titles, descriptions, categories) lives in scripts/documents-catalog.json.
"""
import html
import json
import os
import re

import fitz
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'source-docs')
PUB = os.path.join(ROOT, 'public', 'documents')
PREV = os.path.join(PUB, 'previews')
CATALOG = os.path.join(ROOT, 'scripts', 'documents-catalog.json')
e = html.escape

# category id, slug, source files (in sheet order), preview = (source file, page, crop fraction or None)
# optional: title / desc for new or reworded documents
OPS = [
    dict(cat='abs', slug='abs-interface-circuits', files=['ABS HUT CIRCUITS.pdf', 'ABS HUT CIRCUITS1.pdf'],
         preview=('ABS HUT CIRCUITS.pdf', 0, None),
         desc="ABS equipment hut main functions (SIL-4 / UFSBI-A) with the inputs from and outputs to the hut equipment, and the relay room sheet linking the hut to the EI rack inputs and outputs."),
    dict(cat='core', slug='track-bonding-plans', files=['BONDING PLAN.pdf'], preview=('BONDING PLAN.pdf', 0, 0.15)),
    dict(cat='abs', slug='abs-data-logger-circuits', files=['DATALOGGER.pdf'], preview=('DATALOGGER.pdf', 0, None)),
    dict(cat='kavach', slug='rfid-tag-tin-layouts', files=['STATION LAYOUT KAVACH.pdf', 'SECTION KAVACH LAYOUT.pdf'],
         preview=('STATION LAYOUT KAVACH.pdf', 0, 0.30)),
    dict(cat='core', slug='station-working-rule-diagrams', files=['SWRD AUTO SECTION.pdf'], preview=('SWRD AUTO SECTION.pdf', 0, 0.35),
         desc="Station working diagram for an automatic block section with electronic interlocking: up and down main and loop lines, aspect sequence chart, and track section and supervisory track section tables."),
    dict(cat='abs', slug='abs-cable-route-plan', files=['CABLE PATH DIAG.pdf'], preview=('CABLE PATH DIAG.pdf', 0, None),
         desc="Cable path diagram for the ABS section between km 426/37 and 427/14: up and down main lines, cable alignments inside the railway boundary, trench offsets and distances, culvert crossings and km post references."),
    dict(cat='core', slug='level-crossing-gate-circuits', files=['LC CKT.pdf', 'lc.pdf'], preview=('LC CKT.pdf', 0, None),
         desc="Level crossing gate control circuits for the relay hut: gate panel, road signals, buzzer switch and outdoor switches, together with the L.C. Gate No. 351 layout covering the approach tracks."),
    dict(cat='abs', slug='abs-hut-indication-panel', files=['.ABS HUT INDICATION PANEL.pdf'], preview=('.ABS HUT INDICATION PANEL.pdf', 0, None),
         title='ABS Hut Indication Panel',
         desc="ABS hut indication panel showing the up and down line track sections with signal aspect lamps and the controlling gears details for the hut."),
    dict(cat='abs', slug='station-to-station-communication-diagram', files=['STATION TO STATION COMMUNICATION DIAGRAM.pdf'],
         preview=('STATION TO STATION COMMUNICATION DIAGRAM.pdf', 0, None), title='Station to Station Communication Diagram',
         desc="Station-to-station communication diagram: axle counter evaluator cubicles with main and redundant switches linked over OFC and CAT6 cable through FMS boxes."),
]

cats = json.load(open(CATALOG, encoding='utf-8'))
by_id = {c['id']: c for c in cats}


def find_item(slug):
    for c in cats:
        for it in c['items']:
            if it['slug'] == slug:
                return c, it
    return None, None


def make_preview(path, page_no, frac, out):
    page = fitz.open(path)[page_no]
    r = page.rect
    asp = 1.414
    if frac is None:
        clip = r
    else:
        cw = min(r.width, r.height * asp)
        x0 = max(0, min(r.width - cw, r.width * frac))
        clip = fitz.Rect(x0, 0, x0 + cw, r.height)
    z = 1100 / clip.width
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip, alpha=False)
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    im = im.resize((720, round(720 * im.height / im.width)), Image.LANCZOS)
    im.save(out, quality=84, optimize=True)


# ---------- 1. merge sources into published PDFs ----------
os.makedirs(PREV, exist_ok=True)
for op in OPS:
    missing = [f for f in op['files'] if not os.path.exists(os.path.join(SRC, f))]
    if missing:
        print('skip', op['slug'], '- missing source:', missing)
        continue
    cat = by_id[op['cat']]
    _, item = find_item(op['slug'])
    title = op.get('title') or (item and item['title'])
    out = fitz.open()
    for f in op['files']:
        out.insert_pdf(fitz.open(os.path.join(SRC, f)))
    out.set_metadata({'title': title + ' - AAV Works', 'author': 'AAV Works Private Limited'})
    os.makedirs(os.path.join(PUB, cat['folder']), exist_ok=True)
    out.save(os.path.join(PUB, cat['folder'], op['slug'] + '.pdf'), garbage=3, deflate=True)
    pf, pg, frac = op['preview']
    make_preview(os.path.join(SRC, pf), pg, frac, os.path.join(PREV, op['slug'] + '.jpg'))
    if item is None:
        item = {'slug': op['slug'], 'title': title, 'desc': op['desc']}
        cat['items'].append(item)
    elif op.get('desc'):
        item['desc'] = op['desc']
    print('built', op['slug'], len(out), 'sheet(s)')
json.dump(cats, open(CATALOG, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


# ---------- 2. products.html ----------
def meta_for(cat, slug):
    path = os.path.join(PUB, cat['folder'], slug + '.pdf')
    if not os.path.exists(path):
        return None
    d = fitz.open(path)

    def kind(p):
        w, h = sorted((round(p.rect.width), round(p.rect.height)))
        for name, (a, b) in {'A3': (842, 1191), 'A4': (595, 842), 'Letter': (612, 792)}.items():
            if abs(w - a) < 4 and abs(h - b) < 4:
                return name
        return 'Large format'
    kinds = {kind(p) for p in d}
    size = os.path.getsize(path)
    return dict(sheets=len(d), fmt=kinds.pop() if len(kinds) == 1 else 'Mixed sizes',
                size=f'{size / 1024 / 1024:.1f} MB' if size >= 1024 * 1024 else f'{round(size / 1024)} KB')


def card(cat, it, m):
    path = f"documents/{cat['folder']}/{it['slug']}.pdf"
    style = f'style="--accent:{cat["accent"]}"'
    title, desc = e(it['title']), e(it['desc'])
    if m:
        sheets = f"{m['sheets']} sheet{'s' if m['sheets'] > 1 else ''}"
        return f'''            <a class="doc-card has-preview" href="{path}" data-doc="{path}" target="_blank" rel="noopener" {style}>
              <div class="doc-card-thumb">
                <span class="doc-preview"><img src="/documents/previews/{it['slug']}.jpg" width="720" alt="Preview of {title}" loading="lazy"><em class="doc-paper-badge">PDF</em></span>
              </div>
              <div class="doc-card-body">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
              <div class="doc-card-foot">
                <span class="doc-card-action"><span class="doc-act-label">View PDF</span> <span class="doc-act-arrow">→</span></span>
                <span class="doc-card-meta">{m['fmt']} • {sheets} • {m['size']}</span>
                <span class="doc-card-state" hidden>PDF coming soon</span>
              </div>
            </a>'''
    return f'''            <a class="doc-card compact is-pending" data-doc="{path}" aria-disabled="true" {style}>
              <span class="doc-mini" aria-hidden="true"><b>PDF</b></span>
              <div class="doc-card-body">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
              <div class="doc-card-foot">
                <span class="doc-card-action"><span class="doc-act-label">View PDF</span> <span class="doc-act-arrow">→</span></span>
                <span class="doc-card-state">PDF coming soon</span>
              </div>
            </a>'''


tabs, panels, counts = [], [], {}
for n, cat in enumerate(cats, 1):
    rows = [(it, meta_for(cat, it['slug'])) for it in cat['items']]
    have = [(it, m) for it, m in rows if m]
    wait = [(it, m) for it, m in rows if not m]
    have.sort(key=lambda r: r[0]['slug'] == 's-and-t-estimation')  # estimate always last
    counts[cat['id']] = len(have)
    tabs.append(f'''          <button type="button" class="docs-tab" role="tab" id="tab-{cat['id']}" aria-controls="{cat['id']}" aria-selected="{'true' if n == 1 else 'false'}" tabindex="{0 if n == 1 else -1}" data-tab="{cat['id']}" style="--accent:{cat['accent']}">
            <span class="docs-tab-num">{n:02d}</span>
            <span class="docs-tab-label">{e(cat['short'])}</span>
            <span class="docs-tab-count">{len(have)} of {len(rows)} PDFs</span>
          </button>''')
    rich = "\n".join(card(cat, it, m) for it, m in have)
    more = ''
    if wait:
        compact = "\n".join(card(cat, it, m) for it, m in wait)
        more = f'''
        <details class="docs-soon">
          <summary><span class="docs-soon-title">Coming soon</span><span class="docs-soon-count">{len(wait)} more document{'s' if len(wait) > 1 else ''}</span><span class="docs-soon-chevron" aria-hidden="true"></span></summary>
          <div class="docs-grid docs-grid-compact">
{compact}
          </div>
        </details>'''
    panels.append(f'''    <div class="docs-panel" role="tabpanel" id="{cat['id']}" aria-labelledby="tab-{cat['id']}">
        <div class="docs-panel-head">
          <h2>{e(cat['title'])}</h2>
          <p>{e(cat['blurb'])}</p>
        </div>
        <div class="docs-grid">
{rich}
        </div>{more}
    </div>''')

block = f'''    <!-- Documents (tabbed by category) -->
    <section class="docs-browser" id="documents" data-tabs>
      <div class="content">
        <div class="docs-tabs" role="tablist" aria-label="Document categories">
{chr(10).join(tabs)}
        </div>
{chr(10).join(panels)}
      </div>
    </section>

'''
p = open(os.path.join(ROOT, 'products.html'), encoding='utf-8').read()
a = p.index('    <!-- Documents')
b = p.index('    <!-- Clean CTA Banner -->')
open(os.path.join(ROOT, 'products.html'), 'w', encoding='utf-8').write(p[:a] + block + p[b:])

# ---------- 3. home page: PDF counts on the carousel cards ----------
ix = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
for cid, n in counts.items():
    cat = by_id[cid]
    pat = re.compile(r'(<h3>' + re.escape(e(cat['short'])) + r'</h3>\s*<h4>)\d+ Documents Available(</h4>)')
    ix, k = pat.subn(lambda m: m.group(1) + f'{n} Documents Available' + m.group(2), ix, count=1)
    if not k:
        print('home count not updated for', cid)
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(ix)

# ---------- 4. DOCUMENTS.md ----------
lines = ['# Product documents', '',
         'Each card on the Products page links to `public/documents/<folder>/<file>.pdf`.',
         'To add or replace documents: put the client PDFs in `source-docs/` (git-ignored), add an entry to',
         '`OPS` in `scripts/build-documents.py`, then run `python scripts/build-documents.py`.',
         'A card whose PDF does not exist yet shows "PDF coming soon" automatically.', '']
for cat in cats:
    lines += ['## ' + cat['title'], '', 'Folder: `' + cat['folder'] + '/`', '',
              '| # | Document | File name | Status |', '|---|----------|-----------|--------|']
    for i, it in enumerate(cat['items'], 1):
        m = meta_for(cat, it['slug'])
        st = f"uploaded ({m['sheets']} sheet{'s' if m['sheets'] > 1 else ''})" if m else 'pending'
        lines.append(f"| {i} | {it['title']} | `{it['slug']}.pdf` | {st} |")
    lines.append('')
open(os.path.join(ROOT, 'DOCUMENTS.md'), 'w', encoding='utf-8').write('\n'.join(lines))
print('counts', counts)
