import re


def rw(path, fn):
    s = open(path, encoding='utf-8').read()
    s2 = fn(s)
    open(path, 'w', encoding='utf-8').write(s2)
    return s != s2


# ---------------- projects.html ----------------
def projects(s):
    m = re.search(r'\s*<button[^>]*data-tab="corridors".*?</button>', s, re.S)
    s = s.replace(m.group(0), '', 1)
    m2 = re.search(r'\s*<div class="proj-panel"[^>]*id="corridors".*?(?=\n        <div class="proj-panel"[^>]*id="yards")', s, re.S)
    open('scripts/future-projects-corridors.html', 'w', encoding='utf-8').write(m2.group(0).strip() + '\n')
    s = s.replace(m2.group(0), '', 1)
    s = s.replace('<span class="docs-tab-num">04</span>\n            <span class="docs-tab-label">Yard IV',
                  '<span class="docs-tab-num">03</span>\n            <span class="docs-tab-label">Yard IV')
    s = s.replace('Over 350+ stations commissioned, 85+ RKM of Automatic Block Signalling, and turnkey Electronic Interlocking proof consultancy delivered across dedicated freight and passenger corridors.',
                  'Over 200+ stations commissioned, 150+ RKM of Automatic Block Signalling, and turnkey Electronic Interlocking proof consultancy delivered across Indian Railways.')
    s = s.replace('ABS SIGNALLING • 85+ RKM', 'ABS SIGNALLING • 150+ RKM').replace('<b>85+ RKM</b>', '<b>150+ RKM</b>')
    s = s.replace('Complete turnkey design, circuit diagrams, application logic, and technical assurance',
                  'Complete turnkey design, circuit diagrams, drawings, and technical assurance')
    s = s.replace('<b>Multi-OEM</b><span>Interlocking Logic</span>', '<b>Multi-OEM</b><span>Design &amp; Drawing</span>')
    s = s.replace('ATP / KAVACH • 120+ RKM', 'ATP / KAVACH • 80+ DESIGNS').replace('<b>120+ RKM</b><span>Survey</span>', '<b>80+</b><span>Designs</span>')
    s = s.replace('<span>V3.2</span>', '<span>V4.0</span>')
    s = s.replace('STATION REDEV • 12 STATIONS', 'STATION REDEV • 50+ STATIONS').replace('<b>12</b><span>Stations</span>', '<b>50+</b><span>Stations</span>')
    s = s.replace('<b>EI</b><span>Medha &amp; Kyosan</span>', '<b>EI</b><span>Electronic Interlocking</span>')
    s = s.replace('<b>Southern</b><span>Railway</span>', '<b>Indian</b><span>Railways</span>')
    s = s.replace('across Southern Railway corridors', 'across Indian Railways')
    s = s.replace('<b>Multi-OEM</b><span>Logic</span>', '<b>Multi-OEM</b><span>Design &amp; Drawing</span>')
    s = s.replace('<b>Zonal</b><span>Railways</span>', '<b>Indian</b><span>Railways</span>')
    s = s.replace('verification and validation of bit chart logic, station data tables', 'verification and validation of bit charts, station data tables')
    s = s.replace('<b>32 Routes</b><span>Yard</span>', '<b>100+</b><span>Routes</span>')
    s = s.replace('<b>Siemens</b><span>EI</span>', '<b>EI</b><span>Electronic Interlocking</span>')
    s = s.replace('<b>Central</b><span>Railway</span>', '<b>Indian</b><span>Railways</span>')
    s = s.replace('Independent verification of interlocking logic, and electronic interlocking upgrades',
                  'Independent verification of interlocking design, and electronic interlocking upgrades')
    s = re.sub(r'(<span class="pitem-where"><span class="ic ic-pin" aria-hidden="true"></span>)[^<]*(</span>)', r'\1Indian Railways\2', s)
    s = re.sub(r'(<span class="pitem-when"><span class="ic ic-calendar" aria-hidden="true"></span>)[^<]*(</span>)', r'\g<1>2023 – Present\2', s)
    s = s.replace('<span class="istat-val">350+</span>', '<span class="istat-val">200+</span>')
    s = s.replace('<span class="istat-val">85+ RKM</span>', '<span class="istat-val">150+ RKM</span>')
    return s


print('projects', rw('projects.html', projects))


# ---------------- project-slider.js ----------------
def slider(s):
    a = s.index('  {\n    idx: "03"')
    b = s.index('  {\n    idx: "04"')
    s = s[:a] + s[b:]
    s = s.replace('idx: "04"', 'idx: "03"').replace('idx: "05"', 'idx: "04"')
    s = s.replace('Pan India • 85+ RKM', 'Indian Railways • 150+ RKM')
    s = s.replace('application logic, and technical assurance for 85+ RKM', 'drawings, and technical assurance for 150+ RKM')
    s = s.replace('85+ RKM across corridors', '150+ RKM across Indian Railways')
    s = s.replace('South India • 12 Stations', 'Indian Railways • 50+ Stations').replace('Zonal Railway compliance', 'Indian Railways compliance')
    s = s.replace('shortLoc: "Freight Networks"', 'shortLoc: "Indian Railways"').replace('shortLoc: "High-Speed Projects"', 'shortLoc: "Indian Railways"')
    s = re.sub(r'location: "[^"]*"', 'location: "Indian Railways"', s)
    s = re.sub(r'duration: "[^"]*"', 'duration: "2023 – Present"', s)
    s = s.replace('Yard Remodelling & Interlocking Logic', 'Yard Remodelling & Electronic Interlocking').replace('bit chart logic', 'bit charts')
    s = s.replace('title: "Zero Error Logic"', 'title: "Zero Error Design"')
    s = s.replace('sub: "Universal interlocking formats"', 'sub: "Design & drawing for all systems"')
    s = s.replace('Manages 5 projects', 'Manages 4 projects')
    return s


print('slider', rw('src/js/project-slider.js', slider))


# ---------------- index.html ----------------
def home(s):
    m = re.search(r'\s*<!-- 03 Item -->\s*<button class="proj-list-item" data-index="2".*?</button>\n', s, re.S)
    s = s.replace(m.group(0), '\n', 1)
    s = s.replace('<!-- 04 Item -->', '<!-- 03 Item -->').replace('<!-- 05 Item -->', '<!-- 04 Item -->')
    s = s.replace('data-index="3" role="tab"', 'data-index="2" role="tab"').replace('data-index="4" role="tab"', 'data-index="3" role="tab"')
    s = re.sub(r'(data-index="2" role="tab"[^>]*>\s*<div class="proj-item-header">\s*<span class="proj-item-num">)04', r'\g<1>03', s)
    s = re.sub(r'(data-index="3" role="tab"[^>]*>\s*<div class="proj-item-header">\s*<span class="proj-item-num">)05', r'\g<1>04', s)
    s = s.replace('01 / 05', '01 / 04')
    s = s.replace('Pan India • 85+ RKM', 'Indian Railways • 150+ RKM').replace('South India • 12 Stations', 'Indian Railways • 50+ Stations')
    s = s.replace('<span class="proj-item-meta">Freight Networks</span>', '<span class="proj-item-meta">Indian Railways</span>')
    s = s.replace('<span class="proj-item-meta">High-Speed Projects</span>', '<span class="proj-item-meta">Indian Railways</span>')
    s = s.replace('Design, circuit diagrams, application logic, and technical assurance for 85+ RKM', 'Design, circuit diagrams, drawings, and technical assurance for 150+ RKM')
    s = s.replace('85+ RKM across corridors', '150+ RKM across Indian Railways')
    s = s.replace('<span id="projLocValue" class="meta-field-value">Pan India</span>', '<span id="projLocValue" class="meta-field-value">Indian Railways</span>')
    m = re.search(r'\s*<div class="hero-stat-divider"></div>\s*<div class="hero-stat-col">\s*<div class="hero-stat-number">15<span class="hero-stat-plus">\+</span></div>.*?</div>\s*</div>', s, re.S)
    s = s.replace(m.group(0), '', 1)
    s = s.replace('<div class="hero-stat-number">10<span', '<div class="hero-stat-number">9<span')
    s = s.replace('<div class="hero-stat-number">100<span', '<div class="hero-stat-number">213<span')
    s = s.replace('<div class="hero-stat-number">50<span', '<div class="hero-stat-number">47<span')
    s = s.replace('<span>Zonal Railways Served</span>', '<span>Stations Modernized</span>')
    s = re.sub(r'(<b>)5\+(</b>\s*<span>Stations Modernized)', r'\g<1>50+\2', s)
    return s


print('home', rw('index.html', home))


# ---------------- other pages: same facts everywhere ----------------
def about(s):
    s = s.replace('350+ stations', '200+ stations').replace('across Zonal Railways, DFC, and Metro corporations', 'across Indian Railways')
    return s


def services(s):
    s = s.replace('<b>85+ RKM</b> ABS Line', '<b>150+ RKM</b> ABS Line')
    s = s.replace('for Medha, Kyosan, Siemens, and Ansaldo/Hitachi', 'for all major electronic interlocking systems')
    s = s.replace('350+ STATIONS COMMISSIONED', '200+ STATIONS COMMISSIONED').replace('350+ stations', '200+ stations').replace('<b>350+</b> Stations', '<b>200+</b> Stations')
    return s


print('about', rw('about.html', about))
print('services', rw('services.html', services))
