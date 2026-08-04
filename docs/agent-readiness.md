# Agent readiness

What this site publishes for automated clients, where each piece lives, and —
just as important — what it deliberately does **not** publish.

Everything here is regenerated from the site's own HTML by
`scripts/gen-agent-discovery.py`, so the machine-readable surface cannot drift
from the pages it describes. CI runs it on every deploy and then smoke-tests
the result with `scripts/check-agent-discovery.sh`.

## What's published

| Surface | Path | Spec | Source |
| --- | --- | --- | --- |
| Sitemap | `/sitemap.xml` | [sitemaps.org](https://www.sitemaps.org/protocol.html) | generated |
| Crawl policy | `/robots.txt` | — | committed |
| Link headers | every response | [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288) | `_headers` |
| API catalog | `/.well-known/api-catalog` | [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) | generated |
| OpenAPI | `/api/v1/openapi.json` | OpenAPI 3.1 | generated |
| Content API | `/api/v1/{site,posts,status}.json` | — | generated |
| API docs | `/api/v1/docs.md` | — | committed |
| Agent skills | `/.well-known/agent-skills/index.json` | [Discovery RFC v0.2.0](https://github.com/cloudflare/agent-skills-discovery-rfc) | generated |
| Skill bodies | `/.well-known/agent-skills/*/SKILL.md` | — | committed |
| Markdown pages | `Accept: text/markdown`, and `/*.md` | [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) | generated |
| WebMCP tools | `assets/js/webmcp.js` | [WebMCP](https://webmachinelearning.github.io/webmcp/) | committed |

### Markdown negotiation

`functions/_middleware.js` is a Pages Function that serves the pre-rendered
markdown for a page when the request prefers `text/markdown`, and the normal
HTML otherwise. Responses carry `Content-Type: text/markdown; charset=utf-8`,
`Vary: Accept`, and an `x-markdown-tokens` estimate.

Two things are easy to break here:

- **Cloudflare does not apply `_headers` to responses produced by a Function.**
  The middleware therefore replays those headers from `functions/site-headers.js`,
  which is generated from `_headers`. Editing `_headers` and forgetting to
  regenerate would silently drop the CSP on `/`, `/blog`, and `/lineage`.
- **`_routes.json` keeps the Function off every other path**, so the rest of the
  site stays purely static and `_headers` applies to it normally.

### WebMCP

The tools are `get_project_info`, `search_blog_posts`, `read_blog_post`,
`find_download`, and `show_section`. Each is backed by something the page
already does — the content API, the GitHub releases API that
`assets/js/downloads.js` already uses, or in-page navigation. None of them
write, and none invent data. Browsers without `navigator.modelContext` are
unaffected.

## What is deliberately *not* published

These come up in agent-readiness scanners as missing. They are missing on
purpose: publishing them would describe infrastructure that does not exist,
and an agent that believed them would waste requests — or worse, attempt an
auth flow against a site that has no auth.

### OAuth / OIDC discovery — not applicable

`/.well-known/openid-configuration` and `/.well-known/oauth-authorization-server`
describe an authorization server. There isn't one. This is a static marketing
site; there is no account system, no token endpoint, and nothing to log into.

### OAuth Protected Resource Metadata — not applicable

`/.well-known/oauth-protected-resource` ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728))
tells an agent which authorization servers can issue tokens for a protected
resource. Every endpoint this site serves is public and unauthenticated, so
there is no protected resource to describe. `/api/v1/docs.md` says so
explicitly, which is the useful answer to "how do I authenticate?" — you don't.

### `auth.md` — not applicable

[auth.md](https://github.com/workos/auth.md) is agent *registration*
instructions, and it builds on the two files above. With no accounts and no
protected endpoints there is nothing to register for.

**If that changes** and AetherSDR gains a hosted, authenticated API, all three
land together: the authorization-server metadata, the protected-resource
metadata pointing at it, and `/auth.md` describing registration. Adding any one
alone advertises a flow that doesn't complete.

### MCP Server Card — not applicable *to this domain*

An MCP Server Card at `/.well-known/mcp/server-card.json`
([SEP-1649](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127))
advertises an MCP server reachable at a transport endpoint on this domain.

AetherSDR *does* ship an MCP server — it landed in v26.7.2 — but it runs
**inside the desktop application, on the operator's own machine**, alongside
their radio. It is not hosted at `www.aethersdr.com` and has no public
endpoint. A server card here would point agents at a URL that cannot exist,
and would imply the project operates a service it doesn't.

The site does expose browser-side tools over WebMCP, which is the appropriate
mechanism for a website. Publish a server card if and when there is a hosted
MCP endpoint to name.

### DNS-AID — needs DNS access, and an endpoint worth pointing at

[DNS for AI Discovery](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
publishes ServiceMode SVCB records under `_agents.<domain>` so resolvers can
find agent endpoints without an HTTP round trip. Two things block it:

1. **It cannot be done from this repository.** These are DNS records in the
   `aethersdr.com` zone, managed in the Cloudflare dashboard. Nothing in a
   Pages deployment can create them.
2. **There is currently no agent endpoint to advertise.** DNS-AID names a
   service (an A2A or MCP endpoint, via the `alpn` parameter). This site serves
   documents, not an agent protocol. A record pointing at nothing is worse than
   no record.

The draft is also a work in progress and its SvcParamKeys (`cap`, `cap-sha256`,
`well-known`, `bap`, `policy`, `realm`) are not yet IANA-registered, so the
syntax may still change. Treat the sketch below as a starting point to check
against the current draft, not as a spec-conformant record.

**When there is an endpoint to advertise**, in Cloudflare → *DNS → Records* for
the `aethersdr.com` zone:

```dns
; Organizational index — where an agent starts.
_index._agents.aethersdr.com. 3600 IN SVCB 1 agents.aethersdr.com. (
    alpn="h2,h3"
    port=443
    well-known="agent-card.json" )

; One entry per agent service actually operated, e.g. an MCP endpoint:
mcp._agents.aethersdr.com.    3600 IN SVCB 1 mcp.aethersdr.com. (
    alpn="mcp,h2"
    port=443
    well-known="mcp/server-card.json" )
```

Then **sign the zone with DNSSEC** — *DNS → Settings → DNSSEC → Enable* — so
validating resolvers get authenticated answers. Without DNSSEC the records are
trivially spoofable, which for service discovery is the whole risk. The zone is
already on Cloudflare, so signing is a toggle plus a DS record at the registrar.

Verify with:

```bash
dig +dnssec _index._agents.aethersdr.com SVCB
```

## Adding a page

1. Add the page and its `<link rel="canonical">`.
2. Add it to `PAGES` in `scripts/gen-agent-discovery.py`.
3. Run `python3 scripts/gen-agent-discovery.py`.
4. Add the file to the `Stage site` step in `.github/workflows/deploy.yml`.

Blog posts need none of this — they're read out of `blog.html` automatically.

## Adding a skill

1. Write `.well-known/agent-skills/<name>/SKILL.md`.
2. Add `(<name>, <description>)` to `SKILLS` in the generator.
3. Run the generator — it recomputes the `sha256` digests in the index.

Ground skills in what the site actually documents. A skill that guesses is
worse than no skill, because it will be trusted.
