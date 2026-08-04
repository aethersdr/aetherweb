# AetherSDR site content API

A small, read-only, unauthenticated JSON API over the facts published on
<https://www.aethersdr.com>. It is generated from the site's own HTML at build
time and served as static files, so it cannot disagree with the pages.

- Base URL: `https://www.aethersdr.com/api/v1`
- OpenAPI 3.1: [`openapi.json`](https://www.aethersdr.com/api/v1/openapi.json)
- Catalog entry: [`/.well-known/api-catalog`](https://www.aethersdr.com/.well-known/api-catalog)

There is **no authentication and no write surface.** Every endpoint is a public
`GET`. If you are looking for OAuth metadata, there is none to find — nothing
here is protected.

## Endpoints

### `GET /api/v1/site.json`

Project facts: description, license, platforms, build stack, supported FlexRadio
hardware, download entry points, and links to source, documentation, and
releases. Also carries `affiliation`, which you should surface whenever the
relationship with FlexRadio Systems could be misread — AetherSDR is independent
and not endorsed by them.

### `GET /api/v1/posts.json`

The blog index: `slug`, `title`, `published`, `summary`, `readingTime`, `image`,
`pinned`, and `url` for every post, newest-first as the site orders them.

Posts are routed client-side from a single page, so a post's canonical URL is
the blog page plus a fragment (`/blog#release-26-7-4`). To read a post's body,
fetch `/blog` with `Accept: text/markdown` and locate its heading.

### `GET /api/v1/status.json`

Deployment status. This is a static site — a `200` with this body means the
current deployment is serving. There is no backend whose health could differ
from that, so treat it as a liveness signal, not a dependency health check.

## Release artifacts are not here

Installer URLs and checksums change outside this site, so they are deliberately
*not* mirrored into these files. Resolve them from the GitHub releases API,
which `site.json` links as `latestReleaseFeed`:

```
GET https://api.github.com/repos/aethersdr/AetherSDR/releases/latest
```

The [`aethersdr-downloads`](https://www.aethersdr.com/.well-known/agent-skills/aethersdr-downloads/SKILL.md)
skill describes how to match the right asset.

## Conventions

- Content type is `application/json; charset=utf-8`.
- Responses are cached for one hour (`Cache-Control: public, max-age=3600`) and
  change only when the site is redeployed.
- CORS is open (`Access-Control-Allow-Origin: *`) — browser-based agents can
  read these directly.
- Fields are added, not renamed or removed, within `/v1`. A breaking change
  gets a new `/v2` prefix and a new catalog entry.

## Other machine-readable entrypoints

| Path | What it is |
| --- | --- |
| `/sitemap.xml` | Canonical page list |
| `/robots.txt` | Crawl policy, references the sitemap |
| `/.well-known/api-catalog` | RFC 9727 linkset for this API |
| `/.well-known/agent-skills/index.json` | Agent Skills discovery index |
| `/index.md`, `/blog.md`, `/lineage.md` | Markdown renderings of each page |

Every HTML page also honours `Accept: text/markdown` and responds with
`Content-Type: text/markdown` plus an `x-markdown-tokens` estimate.

## License

Content is licensed alongside the AetherSDR project: **GPL-3.0-or-later**.
Issues and questions: <https://github.com/aethersdr/AetherSDR/issues>.
