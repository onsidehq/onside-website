"""Baut die englischen Seiten unter en/ aus den deutschen Seiten.
Aufruf: python3 build_en.py /home/user/onside-website
"""
import re, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from tr import T, SAME, PRE, LEGAL_NOTE

ROOT = sys.argv[1]
os.chdir(ROOT)
SITE = 'https://onsidehq.de'

# deutsche Datei -> (englische Datei, deutscher Pfad, englischer Pfad)
PAGES = {
    'index.html': ('en/index.html', '/', '/en/'),
    'leistungen.html': ('en/services.html', '/leistungen', '/en/services'),
    'projekte.html': ('en/projects.html', '/projekte', '/en/projects'),
    'snowside.html': ('en/snowside.html', '/snowside', '/en/snowside'),
    'kontakt.html': ('en/contact.html', '/kontakt', '/en/contact'),
    'berlin-night-run.html': ('en/berlin-night-run.html', '/berlin-night-run', '/en/berlin-night-run'),
    'dagen-yachtcharter.html': ('en/dagen-yachtcharter.html', '/dagen-yachtcharter', '/en/dagen-yachtcharter'),
    'galerie.html': ('en/gallery.html', '/galerie', '/en/gallery'),
    'ueber-uns.html': ('en/about.html', '/ueber-uns', '/en/about'),
    'eventagentur.html': ('en/event-agency.html', '/eventagentur', '/en/event-agency'),
    'social-media-agentur.html': ('en/social-media-agency.html', '/social-media-agentur', '/en/social-media-agency'),
    'creator-events.html': ('en/creator-events.html', '/creator-events', '/en/creator-events'),
    'impressum.html': ('en/imprint.html', '/impressum', '/en/imprint'),
    'datenschutz.html': ('en/privacy.html', '/datenschutz', '/en/privacy'),
}
LEGAL = {'impressum.html', 'datenschutz.html'}
# Links innerhalb der englischen Seiten
LINKMAP = {de: os.path.basename(en) for de, (en, _, _) in PAGES.items()}
URLMAP = {SITE + d: SITE + e for _, (_, d, e) in PAGES.items()}

missing = []

def norm(t):
    return re.sub(r'\s+', ' ', t).strip()

def has_letters(t):
    return re.search(r'[A-Za-zÄÖÜäöüß]{2,}', t)

def tr_text(n, where):
    if n in T:
        return T[n]
    if n in SAME or not has_letters(n):
        return n
    missing.append((where, n))
    return n

def tr_chunk(chunk, where):
    n = norm(chunk)
    if not n or not has_letters(n):
        return chunk
    lead = re.match(r'^\s*', chunk).group(0)
    trail = re.search(r'\s*$', chunk).group(0)
    return lead + tr_text(n, where) + trail

def fix_url(u):
    if not u or u.startswith(('#', 'http:', 'https:', 'mailto:', 'tel:', 'data:', '//')):
        return u
    if u.startswith('/'):
        return u
    path, frag = (u.split('#', 1) + [''])[:2]
    frag = ('#' + frag) if frag else ''
    if path in LINKMAP:
        return LINKMAP[path] + frag
    return '../' + path + frag

def fix_srcset(v):
    parts = []
    for p in v.split(','):
        p = p.strip()
        if not p:
            continue
        bits = p.split()
        bits[0] = fix_url(bits[0])
        parts.append(' '.join(bits))
    return ', '.join(parts)

def tr_tag(tag, where):
    # Pfade
    tag = re.sub(r'\b(href|src|poster)="([^"]*)"', lambda m: f'{m.group(1)}="{fix_url(m.group(2))}"', tag)
    tag = re.sub(r'\b(srcset)="([^"]*)"', lambda m: f'{m.group(1)}="{fix_srcset(m.group(2))}"', tag)
    tag = re.sub(r'\b(data-players|data-projects)="([^"]*)"', lambda m: f'{m.group(1)}="' + '|'.join(fix_url(x) for x in m.group(2).split('|')) + '"', tag)
    # Texte in Attributen
    def attr(m):
        name, val = m.group(1), m.group(2)
        if name == 'content' and not re.search(r'name="description"|property="og:(title|description)"|name="twitter:(title|description)"', tag):
            return m.group(0)
        return f'{name}="{tr_text(norm(val), where) if has_letters(val) else val}"'
    tag = re.sub(r'\b(alt|aria-label|title|placeholder|content|data-label)="([^"]*)"', attr, tag)
    tag = re.sub(r'\bdata-target="Eure Marke"', 'data-target="Your brand"', tag)
    return tag

def tr_ld(src, where, en_url, de_url):
    data = json.loads(src)
    SKIP = {'@context', '@type', '@id', 'url', 'logo', 'image', 'email', 'telephone', 'sameAs', 'startDate', 'endDate',
            'postalCode', 'streetAddress', 'addressCountry', 'contentUrl', 'thumbnailUrl', 'uploadDate', 'eventStatus',
            'eventAttendanceMode', 'name_keep'}
    def walk(o, key=None):
        if isinstance(o, dict):
            return {k: (walk(v, k) if k not in SKIP else fix_ld_url(v)) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(x, key) for x in o]
        if isinstance(o, str):
            if key == 'item':
                return fix_ld_url(o)
            if o.startswith('http'):
                return fix_ld_url(o)
            return tr_text(o, where + ' (JSON-LD)')
        return o
    def fix_ld_url(v):
        if isinstance(v, str):
            base, frag = (v.split('#', 1) + [''])[:2]
            if base in URLMAP:
                return URLMAP[base] + ('#' + frag if frag else '')
            return v
        if isinstance(v, list):
            return [fix_ld_url(x) for x in v]
        if isinstance(v, dict):
            return walk(v)
        return v
    out = walk(data)
    if isinstance(out, dict) and out.get('@type') in ('WebPage', 'CollectionPage', 'AboutPage', 'ContactPage'):
        out['inLanguage'] = 'en'
    return json.dumps(out, ensure_ascii=False, indent=2)

def hreflang_block(de_path, en_path):
    return (f'  <link rel="alternate" hreflang="de" href="{SITE}{de_path}" />\n'
            f'  <link rel="alternate" hreflang="en" href="{SITE}{en_path}" />\n'
            f'  <link rel="alternate" hreflang="x-default" href="{SITE}{de_path}" />\n')

def build(de_file):
    en_file, de_path, en_path = PAGES[de_file]
    src = open(de_file, encoding='utf-8').read()
    for k, v in PRE.items():
        src = src.replace(k, v)
    src = re.sub(r'  <link rel="alternate" hreflang="[^"]*" href="[^"]*" />\n', '', src)
    out = []
    parts = re.split(r'(<!--.*?-->|<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<[^>]+>)', src, flags=re.S)
    for p in parts:
        if p.startswith('<!--'):
            out.append(p)
        elif p.startswith('<script'):
            m = re.match(r'(<script type="application/ld\+json">)(.*?)(</script>)', p, re.S)
            if m:
                body = tr_ld(m.group(2), de_file, en_path, de_path)
                body = '\n  ' + body.replace('\n', '\n  ') + '\n  '
                out.append(m.group(1) + body + m.group(3))
            else:
                p = re.sub(r'\bsrc="([^"]*)"', lambda mm: f'src="{fix_url(mm.group(1))}"', p, count=1)
                out.append(p)
        elif p.startswith('<style'):
            out.append(p)
        elif p.startswith('<'):
            out.append(tr_tag(p, de_file))
        else:
            out.append(tr_chunk(p, de_file))
    html = ''.join(out)
    # Kopf
    html = html.replace('<html lang="de">', '<html lang="en">', 1)
    html = re.sub(r'<link rel="canonical" href="[^"]*" />', f'<link rel="canonical" href="{SITE}{en_path}" />\n' + hreflang_block(de_path, en_path).rstrip('\n'), html, count=1)
    html = re.sub(r'<meta property="og:url" content="[^"]*" />', f'<meta property="og:url" content="{SITE}{en_path}" />', html, count=1)
    html = html.replace('<meta property="og:locale" content="de_DE" />', '<meta property="og:locale" content="en_GB" />\n  <meta property="og:locale:alternate" content="de_DE" />')
    # Sprachschalter: DE wird Link, EN ist aktiv
    de_link = '../' if de_path == '/' else '..' + de_path + '.html'
    html = re.sub(
        r'<span class="lang-switch__item is-active" lang="de" aria-current="true">DE</span>\s*<a class="lang-switch__item" href="[^"]*" hreflang="en" lang="en" aria-label="English version">EN</a>',
        f'<a class="lang-switch__item" href="{de_link}" hreflang="de" lang="de" aria-label="Deutsche Version">DE</a>\n        <span class="lang-switch__item is-active" lang="en" aria-current="true">EN</span>',
        html, count=1)
    html = html.replace('<div class="vg-days"><span>M</span><span>D</span><span>M</span><span>D</span>', '<div class="vg-days"><span>M</span><span>T</span><span>W</span><span>T</span>')
    if de_file in LEGAL:
        html = re.sub(r'(<h1\b[^>]*>.*?</h1>)', lambda m: m.group(1) + '\n      ' + LEGAL_NOTE.format(de='../' + de_file), html, count=1, flags=re.S)
    os.makedirs(os.path.dirname(en_file), exist_ok=True)
    open(en_file, 'w', encoding='utf-8').write(html)

def add_hreflang_de():
    for de_file, (en_file, de_path, en_path) in PAGES.items():
        s = open(de_file, encoding='utf-8').read()
        if 'hreflang="en"' in s.split('</head>')[0]:
            continue
        s = re.sub(r'(<link rel="canonical" href="[^"]*" />)', lambda m: m.group(1) + '\n' + hreflang_block(de_path, en_path).rstrip('\n'), s, count=1)
        open(de_file, 'w', encoding='utf-8').write(s)

for f in PAGES:
    build(f)
add_hreflang_de()
seen = set()
for w, n in missing:
    if n in seen:
        continue
    seen.add(n)
    print('FEHLT', w, repr(n))
print('fertig')
