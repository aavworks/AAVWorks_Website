"""One-off: read the current Products page back into scripts/documents-catalog.json."""
import re, json, html
s = open('products.html', encoding='utf-8').read()
cats = []
for tab in re.finditer(r'<button[^>]*data-tab="(\w+)"[^>]*--accent:(#[0-9a-f]+)[^>]*>.*?docs-tab-label">(.*?)</span>', s, re.S):
    cid, accent, short = tab.group(1), tab.group(2), html.unescape(tab.group(3))
    pm = re.search(r'<div class="docs-panel"[^>]*id="%s".*?(?=<div class="docs-panel"|</div>\s*</section>)' % cid, s, re.S)
    panel = pm.group(0)
    title = html.unescape(re.search(r'<h2>(.*?)</h2>', panel).group(1))
    blurb = html.unescape(re.search(r'docs-panel-head">.*?<p>(.*?)</p>', panel, re.S).group(1))
    items = []
    for a in re.finditer(r'<a class="doc-card[^"]*"[^>]*data-doc="documents/([^/]+)/([^"]+)\.pdf".*?<h3>(.*?)</h3>\s*<p>(.*?)</p>', panel, re.S):
        folder, slug, t, d = a.groups()
        items.append({'slug': slug, 'title': html.unescape(t), 'desc': html.unescape(d)})
    cats.append({'id': cid, 'folder': folder, 'accent': accent, 'short': short, 'title': title, 'blurb': blurb, 'items': items})
json.dump(cats, open('scripts/documents-catalog.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
for c in cats: print(c['id'], c['folder'], len(c['items']), c['title'])
