#!/usr/bin/env python3
"""Regenerate every machine-readable artifact the site publishes for agents.

    python3 scripts/gen-agent-discovery.py [--check]

Everything below is derived from the HTML that is already committed, so the
generated files can never drift from the pages they describe. Run it after
adding a page or a blog post (CI runs it too, and fails on drift).

Writes:
    sitemap.xml                           canonical URLs, lastmod from git
    index.md, blog.md, lineage.md         markdown renderings of each page
    functions/md-map.js                   path -> markdown asset + token count
    functions/site-headers.js             the _headers rules, for the middleware
    _routes.json                          which paths invoke the middleware
    api/v1/site.json                      project facts
    api/v1/posts.json                     blog post index
    api/v1/status.json                    health endpoint
    api/v1/openapi.json                   OpenAPI 3.1 description of the above
    .well-known/api-catalog               RFC 9727 linkset
    .well-known/agent-skills/index.json   skill index, with sha256 digests

Deterministic: no timestamps, no network. Same commit in, same bytes out.
"""

import hashlib
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://www.aethersdr.com'
REPO = 'https://github.com/aethersdr/AetherSDR'

# source file, public path, sitemap priority, changefreq
PAGES = [
    ('index.html', '/', '1.0', 'weekly'),
    ('blog.html', '/blog', '0.9', 'weekly'),
    ('lineage.html', '/lineage', '0.5', 'monthly'),
]


# --------------------------------------------------------------------------
# A very small DOM, so the rest of this file can ask structural questions
# instead of pattern-matching markup.
# --------------------------------------------------------------------------

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}


class Node:
    __slots__ = ('tag', 'attrs', 'children', 'text')

    def __init__(self, tag, attrs=None, text=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children = []
        self.text = text

    def cls(self):
        return (self.attrs.get('class') or '').split()

    def find_all(self, tag=None, cls=None):
        out = []
        for child in self.children:
            if child.tag == '#text':
                continue
            if (tag is None or child.tag == tag) and (cls is None or cls in child.cls()):
                out.append(child)
            out.extend(child.find_all(tag, cls))
        return out

    def first(self, tag=None, cls=None):
        found = self.find_all(tag, cls)
        return found[0] if found else None

    def plain(self):
        """All descendant text, whitespace-collapsed."""
        if self.tag == '#text':
            return self.text
        if self.tag in ('svg', 'script', 'style'):
            return ''
        return ''.join(c.plain() for c in self.children)


class DOM(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root')
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, dict(attrs)))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(Node('#text', text=data))


def parse(path):
    dom = DOM()
    dom.feed(path.read_text(encoding='utf-8'))
    dom.close()
    return dom.root


def collapse(text):
    return re.sub(r'\s+', ' ', text).strip()


# --------------------------------------------------------------------------
# HTML -> Markdown
# --------------------------------------------------------------------------

# Chrome, not content: navigation, decorative SVG, script/style, the cookie-
# free analytics-free furniture. Dropping these is what makes the markdown
# worth reading.
DROP_TAGS = {'script', 'style', 'svg', 'noscript', 'template', 'head', 'nav',
             'link', 'meta', 'title', 'form', 'input', 'select', 'iframe'}
DROP_CLASSES = {'nav', 'nav-inner', 'foot', 'sep', 'blog-more', 'dl-reco',
                'skip-link', 'to-top'}
INLINE = {'#text', 'a', 'b', 'strong', 'i', 'em', 'code', 'span', 'time',
          'small', 'sup', 'sub', 'abbr', 'mark', 's', 'u', 'kbd', 'var',
          'cite', 'q', 'img', 'br', 'label', 'output', 'data'}
HEADINGS = {'h1': 1, 'h2': 2, 'h3': 3, 'h4': 4, 'h5': 5, 'h6': 6}


def dropped(node):
    if node.tag in DROP_TAGS:
        return True
    if node.attrs.get('aria-hidden') == 'true':
        return True
    if DROP_CLASSES & set(node.cls()):
        return True
    # `hidden` marks UI that isn't showing yet — except blog posts, where it is
    # exactly how a not-yet-routed-to article is held off the index.
    if 'hidden' in node.attrs and node.tag != 'article':
        return True
    return False


def absolute(url):
    if not url or url.startswith(('http://', 'https://', 'mailto:', '#')):
        return url
    return SITE + '/' + url.lstrip('/')


def escape(text):
    return re.sub(r'([\\`*_\[\]])', r'\\\1', text)


def inline(node):
    """Render an inline subtree to markdown."""
    if node.tag == '#text':
        return escape(re.sub(r'\s+', ' ', node.text))
    if dropped(node):
        return ''
    if node.tag == 'br':
        return '\n'
    if node.tag == 'img':
        alt = collapse(node.attrs.get('alt', ''))
        return '![%s](%s)' % (escape(alt), absolute(node.attrs.get('src', '')))

    inner = ''.join(inline(c) for c in node.children)
    if not inner.strip():
        return inner

    if node.tag == 'a':
        href = absolute(node.attrs.get('href', ''))
        return '[%s](%s)' % (inner.strip(), href) if href else inner
    if node.tag in ('b', 'strong'):
        return '**%s**' % inner.strip()
    if node.tag in ('i', 'em', 'cite'):
        return '*%s*' % inner.strip()
    if node.tag in ('code', 'kbd', 'var', 'samp'):
        return '`%s`' % inner.strip().replace('`', '')
    return inner


def is_inline(node):
    return node.tag in INLINE


def blocks(node, shift=0, indent=0):
    """Render a subtree to a list of markdown blocks."""
    out = []
    buf = []

    def flush():
        text = collapse(''.join(buf))
        buf.clear()
        if text:
            out.append(text)

    for child in node.children:
        if child.tag == '#text' and not child.text.strip():
            buf.append(' ')
            continue
        if dropped(child):
            continue

        if is_inline(child):
            buf.append(inline(child))
            continue

        flush()
        tag = child.tag

        if tag in HEADINGS:
            level = min(HEADINGS[tag] + shift, 6)
            text = collapse(''.join(inline(c) for c in child.children))
            if text:
                out.append('#' * level + ' ' + text)

        elif tag == 'p':
            text = collapse(''.join(inline(c) for c in child.children))
            if text:
                out.append(text)

        elif tag in ('ul', 'ol'):
            items = [c for c in child.children if c.tag == 'li' and not dropped(c)]
            lines = []
            for n, li in enumerate(items, 1):
                marker = '%d. ' % n if tag == 'ol' else '- '
                sub = blocks(li, shift, indent + 1)
                if not sub:
                    continue
                pad = ' ' * (indent * 2)
                lines.append(pad + marker + sub[0])
                for extra in sub[1:]:
                    lines.append(pad + ' ' * len(marker) + extra)
            if lines:
                out.append('\n'.join(lines))

        elif tag == 'blockquote':
            sub = blocks(child, shift, indent)
            if sub:
                body = '\n\n'.join(sub)
                out.append('\n'.join('> ' + ln if ln else '>'
                                     for ln in body.split('\n')))

        elif tag == 'pre':
            code = child.plain().strip('\n')
            if code.strip():
                out.append('```\n%s\n```' % code)

        elif tag == 'hr':
            out.append('---')

        elif tag == 'table':
            table = render_table(child)
            if table:
                out.append(table)

        elif tag in ('dl', 'dt', 'dd'):
            sub = blocks(child, shift, indent)
            out.extend(sub)

        else:
            out.extend(blocks(child, shift, indent))

    flush()
    return out


def render_table(node):
    rows = []
    for tr in node.find_all('tr'):
        cells = [collapse(''.join(inline(c) for c in cell.children))
                 for cell in tr.children
                 if cell.tag in ('td', 'th')]
        if cells:
            rows.append(cells)
    if not rows:
        return ''
    width = max(len(r) for r in rows)
    rows = [r + [''] * (width - len(r)) for r in rows]
    lines = ['| ' + ' | '.join(rows[0]) + ' |',
             '| ' + ' | '.join(['---'] * width) + ' |']
    lines += ['| ' + ' | '.join(r) + ' |' for r in rows[1:]]
    return '\n'.join(lines)


def to_markdown(root, title, description, url):
    """A page as markdown: title, standfirst, source link, then the content.

    Content headings shift down one level so the page title is the only H1.
    """
    body = root.first('body') or root
    parts = blocks(body, shift=1)

    head = ['# ' + title]
    if description:
        head.append('> ' + description)
    head.append('Source: <%s>' % url)

    text = '\n\n'.join(head + parts)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip() + '\n'


def token_estimate(text):
    """Rough token count — words plus punctuation runs, which lands within a
    few percent of a BPE tokenizer on English prose. Advisory only."""
    return len(re.findall(r"[A-Za-z0-9']+|[^\sA-Za-z0-9]", text))


# --------------------------------------------------------------------------
# Page + post metadata
# --------------------------------------------------------------------------

def meta(root):
    head = root.first('head')
    title = collapse(head.first('title').plain()) if head and head.first('title') else ''
    description = ''
    canonical = ''
    for m in (head.find_all('meta') if head else []):
        if m.attrs.get('name') == 'description':
            description = collapse(m.attrs.get('content', ''))
    for link in (head.find_all('link') if head else []):
        if link.attrs.get('rel') == 'canonical':
            canonical = link.attrs.get('href', '')
    return title, description, canonical


def git_date(path):
    """Author date of the last commit to touch a file, as YYYY-MM-DD."""
    try:
        out = subprocess.run(
            ['git', 'log', '-1', '--format=%ad', '--date=short', '--', str(path)],
            cwd=ROOT, capture_output=True, text=True, timeout=15)
        return out.stdout.strip() or None
    except (OSError, subprocess.SubprocessError):
        return None


def blog_posts(blog_root):
    """The card grid is the post index — read it rather than keep a list."""
    posts = []
    for card in blog_root.find_all('a', 'blog-card'):
        href = card.attrs.get('href', '')
        if not href.startswith('#'):
            continue
        slug = href[1:]
        body = card.first('div', 'blog-card-body') or card
        heading = body.first('h3')
        summary = body.first('p')
        time_el = body.first('time')
        img = card.first('img')

        reading = ''
        for span in (body.first('span', 'blog-meta') or Node('x')).find_all('span'):
            text = collapse(span.plain())
            if text.endswith('min read'):
                reading = text

        posts.append({
            'slug': slug,
            'title': collapse(heading.plain()) if heading else slug,
            'url': '%s/blog#%s' % (SITE, slug),
            'published': time_el.attrs.get('datetime', '') if time_el else '',
            'summary': collapse(summary.plain()) if summary else '',
            'readingTime': reading,
            'image': absolute(img.attrs.get('src')) if img else None,
            'pinned': 'is-pinned' in card.cls(),
        })
    return posts


# --------------------------------------------------------------------------
# Artifacts
# --------------------------------------------------------------------------

def sitemap(entries):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, lastmod, priority, changefreq in entries:
        lines.append('  <url>')
        lines.append('    <loc>%s%s</loc>' % (SITE, path))
        if lastmod:
            lines.append('    <lastmod>%s</lastmod>' % lastmod)
        lines.append('    <changefreq>%s</changefreq>' % changefreq)
        lines.append('    <priority>%s</priority>' % priority)
        lines.append('  </url>')
    lines.append('</urlset>')
    return '\n'.join(lines) + '\n'


def site_json(index_root, posts, latest_release):
    return {
        'name': 'AetherSDR',
        'tagline': 'A native amateur-radio workstation for FlexRadio',
        'description': meta(index_root)[1],
        'homepage': SITE + '/',
        'license': 'GPL-3.0-or-later',
        'sourceCode': REPO,
        'issues': REPO + '/issues',
        'documentation': 'https://lu5dx.github.io/AetherSDRDocsEnglish/latest/',
        'releases': REPO + '/releases',
        'latestReleaseFeed': 'https://api.github.com/repos/aethersdr/AetherSDR/releases/latest',
        'platforms': ['linux', 'macos', 'windows'],
        'builtWith': ['Qt6', 'C++20'],
        'affiliation': 'AetherSDR is an independent project and is not affiliated '
                       'with or endorsed by FlexRadio Systems.',
        'supportedHardware': {
            'transceivers': [
                'FLEX-6300', 'FLEX-6400', 'FLEX-6400M', 'FLEX-6500',
                'FLEX-6600', 'FLEX-6600M', 'FLEX-6700',
                'FLEX-8400', 'FLEX-8400M', 'FLEX-8600', 'FLEX-8600M',
                'Aurora AU-510', 'Aurora AU-520',
            ],
            'testTarget': 'FLEX-8600 firmware 4.2.18 (SmartSDR protocol v1.4.0.0); '
                          'earlier 4.x works, v3.x is unsupported.',
        },
        'downloads': {
            'linux': {
                'x86_64': REPO + '/releases/latest',
                'aarch64': REPO + '/releases/latest',
                'format': 'AppImage',
            },
            'macos': {
                'appleSilicon': REPO + '/releases/latest',
                'intel': REPO + '/releases/latest',
                'format': 'DMG',
            },
            'windows': {
                'store': 'https://apps.microsoft.com/detail/9nc6bmwfn811',
                'installer': REPO + '/releases/latest',
                'winget': 'winget install aethersdr -s msstore',
                'format': 'MSIX / setup.exe / portable zip',
            },
            'note': 'Installer filenames carry the version, so resolve the exact '
                    'asset from the GitHub latest-release API rather than '
                    'constructing a URL.',
            'signatures': 'Every release ships .asc signatures and SHA256SUMS.txt.',
        },
        'latestReleaseMentionedOnSite': latest_release,
        'postCount': len(posts),
    }


def openapi_json():
    def get(path, summary, description, schema_ref):
        return {
            'get': {
                'summary': summary,
                'description': description,
                'operationId': 'get' + ''.join(
                    p.capitalize() for p in path.strip('/').split('/')[-1].split('.')[0].split('-')),
                'responses': {
                    '200': {
                        'description': summary,
                        'content': {'application/json': {'schema': schema_ref}},
                    },
                },
            },
        }

    return {
        'openapi': '3.1.0',
        'info': {
            'title': 'AetherSDR site content API',
            'version': '1.0.0',
            'summary': 'Read-only JSON for the facts published on www.aethersdr.com.',
            'description': (
                'A small, unauthenticated, read-only API over the content of the '
                'AetherSDR website: project facts, the blog index, and a status '
                'endpoint. It is generated from the site\'s own HTML at build time '
                'and served as static files, so it never disagrees with the pages.\n\n'
                'There is no write surface and no authentication — every endpoint is '
                'public. For release artifacts (which change outside this site), use '
                'the GitHub releases API linked from `/api/v1/site.json`.'
            ),
            'license': {'name': 'GPL-3.0-or-later',
                        'identifier': 'GPL-3.0-or-later'},
            'contact': {'name': 'AetherSDR', 'url': REPO + '/issues'},
        },
        'servers': [{'url': SITE + '/api/v1', 'description': 'Production'}],
        'externalDocs': {'description': 'API notes',
                         'url': SITE + '/api/v1/docs.md'},
        'paths': {
            '/site.json': get('/site.json', 'Project facts',
                              'Name, license, platforms, supported hardware, and '
                              'where to get builds and documentation.',
                              {'type': 'object'}),
            '/posts.json': get('/posts.json', 'Blog post index',
                               'Every published post: slug, title, publication '
                               'date, summary, reading time, and canonical URL.',
                               {'type': 'object'}),
            '/status.json': get('/status.json', 'Deployment status',
                                'A 200 from this endpoint means the current '
                                'deployment is serving.',
                                {'type': 'object'}),
        },
    }


def api_catalog():
    """RFC 9727 / RFC 9264 linkset. One anchor — the one API this site has."""
    base = SITE + '/api/v1'
    return {
        'linkset': [
            {
                'anchor': base,
                'service-desc': [{
                    'href': base + '/openapi.json',
                    'type': 'application/vnd.oai.openapi+json;version=3.1',
                    'title': 'OpenAPI 3.1 description',
                }],
                'service-doc': [{
                    'href': base + '/docs.md',
                    'type': 'text/markdown',
                    'title': 'AetherSDR content API notes',
                }],
                'status': [{
                    'href': base + '/status.json',
                    'type': 'application/json',
                    'title': 'Deployment status',
                }],
                'license': [{
                    'href': 'https://www.gnu.org/licenses/gpl-3.0.html',
                    'title': 'GPL-3.0-or-later',
                }],
            },
        ],
    }


SKILLS = [
    ('aethersdr-downloads',
     'Resolve the correct AetherSDR installer for a given operating system and '
     'CPU architecture from the project\'s latest GitHub release, including '
     'signature and checksum verification.'),
    ('aethersdr-project-facts',
     'Answer questions about what AetherSDR is, which FlexRadio hardware and '
     'platforms it supports, how it is licensed, and where its source, '
     'documentation, and release notes live.'),
    ('aethersdr-release-notes',
     'Find what changed in a given AetherSDR release, or which release '
     'introduced a particular feature, using the project blog and its '
     'machine-readable post index.'),
]


def agent_skills_index():
    skills = []
    for name, description in SKILLS:
        path = ROOT / '.well-known' / 'agent-skills' / name / 'SKILL.md'
        if not path.exists():
            raise SystemExit('missing skill file: %s' % path.relative_to(ROOT))
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        skills.append({
            'name': name,
            'type': 'skill-md',
            'description': description,
            'url': '%s/.well-known/agent-skills/%s/SKILL.md' % (SITE, name),
            'digest': 'sha256:' + digest,
        })
    return {
        '$schema': 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
        'skills': skills,
    }


def parse_headers_file(path):
    """`_headers` as an ordered [(pattern, {header: value})] list."""
    rules = []
    current = None
    for raw in path.read_text(encoding='utf-8').splitlines():
        if not raw.strip() or raw.strip().startswith('#'):
            continue
        if not raw[0].isspace():
            current = (raw.strip(), {})
            rules.append(current)
        elif current is not None:
            key, sep, value = raw.strip().partition(':')
            if sep and value.strip():
                current[1][key.strip()] = value.strip()
    return rules


def site_headers_js(rules):
    """Cloudflare does not apply `_headers` to responses a Function produced,
    so the middleware has to re-apply them itself. Generating this from
    `_headers` keeps that a copy rather than a second source of truth."""
    lines = [
        '// GENERATED by scripts/gen-agent-discovery.py from _headers — do not edit.',
        '// Pages does not apply _headers to Function responses; the middleware',
        '// replays these onto anything it returns so the two never disagree.',
        'export const HEADER_RULES = [',
    ]
    for pattern, headers in rules:
        lines.append('  [%s, %s],' % (json.dumps(pattern),
                                      json.dumps(headers, ensure_ascii=False)))
    lines.append('];')
    return '\n'.join(lines) + '\n'


def routes_json(paths):
    """Keep the middleware off every path that does not need it — the rest of
    the site stays purely static, with `_headers` applied normally."""
    return {
        'version': 1,
        'include': sorted(set(paths)),
        'exclude': [],
    }


def md_map_js(entries):
    """A tiny module the Pages middleware imports — no runtime asset lookup
    just to decide whether a markdown rendering exists."""
    lines = [
        '// GENERATED by scripts/gen-agent-discovery.py — do not edit.',
        '// Public path -> its markdown rendering, for Accept: text/markdown.',
        'export const MD_MAP = {',
    ]
    for path, asset, tokens in entries:
        lines.append("  '%s': { asset: '%s', tokens: %d }," % (path, asset, tokens))
    lines.append('};')
    return '\n'.join(lines) + '\n'


# --------------------------------------------------------------------------

def main():
    check = '--check' in sys.argv[1:]
    written, drifted = [], []

    def emit(relpath, content):
        path = ROOT / relpath
        current = path.read_text(encoding='utf-8') if path.exists() else None
        if current == content:
            return
        if check:
            drifted.append(relpath)
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
        written.append(relpath)

    def emit_json(relpath, obj):
        emit(relpath, json.dumps(obj, indent=2, ensure_ascii=False) + '\n')

    sitemap_entries = []
    md_entries = []
    routes = []
    index_root = None
    posts = []

    for source, public, priority, changefreq in PAGES:
        src = ROOT / source
        root = parse(src)
        title, description, canonical = meta(root)
        url = canonical or (SITE + public)

        if source == 'index.html':
            index_root = root
        if source == 'blog.html':
            posts = blog_posts(root)

        sitemap_entries.append((public, git_date(source), priority, changefreq))

        markdown = to_markdown(root, title, description, url)
        asset = '/' + src.stem + '.md'
        emit(src.stem + '.md', markdown)
        md_entries.append((public, asset, token_estimate(markdown)))
        # The .md files are addressable directly too; asking one of them for
        # markdown should not 404 in the middleware.
        md_entries.append((asset, asset, token_estimate(markdown)))
        # The middleware normalizes /blog.html to /blog, but only if the
        # request reaches it — so the .html form has to be routed too.
        routes.extend([public, asset, '/' + source])

    emit('sitemap.xml', sitemap(sitemap_entries))
    emit('functions/md-map.js', md_map_js(md_entries))
    emit('functions/site-headers.js', site_headers_js(parse_headers_file(ROOT / '_headers')))
    emit_json('_routes.json', routes_json(routes))

    latest = ''
    if index_root is not None:
        tag = index_root.find_all('b')
        for node in tag:
            if 'data-latest-tag' in node.attrs:
                latest = collapse(node.plain())
                break

    emit_json('api/v1/site.json', site_json(index_root, posts, latest))
    emit_json('api/v1/posts.json', {
        'site': SITE + '/blog',
        'count': len(posts),
        'note': 'Posts are routed client-side; the canonical URL of a post is '
                'the blog page plus its slug fragment.',
        'posts': posts,
    })
    emit_json('api/v1/status.json', {
        'status': 'operational',
        'service': 'www.aethersdr.com',
        'note': 'This is a statically hosted site. A 200 with this body means '
                'the current deployment is serving; there is no backend whose '
                'health could differ from that.',
        'endpoints': [SITE + '/api/v1/site.json',
                      SITE + '/api/v1/posts.json'],
    })
    emit_json('api/v1/openapi.json', openapi_json())
    emit_json('.well-known/api-catalog', api_catalog())
    emit_json('.well-known/agent-skills/index.json', agent_skills_index())

    if check:
        if drifted:
            print('Out of date — run python3 scripts/gen-agent-discovery.py:')
            for path in drifted:
                print('  ' + path)
            return 1
        print('All generated agent-discovery artifacts are up to date.')
        return 0

    if written:
        print('Wrote:')
        for path in written:
            print('  ' + path)
    else:
        print('Everything already up to date.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
