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
| DNS-AID entrypoint | `_index._agents.aethersdr.com` | [DNS-AID draft](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) · [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) | DNS, applied by script |

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

## DNS-AID — published

Unlike the four items above, this one isn't declined. It is live, and it is the
one piece that does not ship from this repository.

### The record

[DNS for AI Discovery](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
publishes ServiceMode SVCB records under `_agents.<domain>` so a resolver can
find an organisation's agent entrypoint without an HTTP round trip.

Applying it **cannot run in CI**: these are records in the `aethersdr.com` zone
rather than files in a Pages deployment. It needs a Cloudflare token with
*Zone → DNS → Edit*, and if that token lacks *Zone → Zone → Read* (the "Edit
zone DNS" template doesn't grant it), pass `CLOUDFLARE_ZONE_ID` to skip the
lookup:

```bash
export CLOUDFLARE_API_TOKEN=...
scripts/apply-dns-aid.sh            # plan — prints the record, changes nothing
scripts/apply-dns-aid.sh --apply    # create or update it
scripts/apply-dns-aid.sh --verify   # query DNS and report what is live
```

The record, as published and verified live:

```dns
_index._agents.aethersdr.com. 3600 IN SVCB 1 www.aethersdr.com. (
    alpn="h2,h3" port=443 mandatory=alpn,port )
```

### Verifying it, and why `dig SVCB` lies

`dig` only learned the `SVCB` mnemonic in 9.18. macOS ships 9.10, where
`dig SVCB` returns NOERROR and prints **nothing at all** — indistinguishable
from the record not existing. That cost a real debugging detour here: the
record was live and correct while every check said "not published".

`--verify` therefore queries the numeric type and decodes the rdata itself:

```console
$ scripts/apply-dns-aid.sh --verify
Querying _index._agents.aethersdr.com
  target   : www.aethersdr.com.
  priority : 1  ServiceMode
  alpn     : h2,h3
  port     : 443
Checking DNSSEC on aethersdr.com
  DS present at parent
  chain validates — 1.1.1.1 returned the AD flag
```

To check by hand, ask for `TYPE64` rather than `SVCB`:

```bash
dig @1.1.1.1 +short _index._agents.aethersdr.com TYPE64
```

**Why only `_index`.** The draft defines `_index._agents` as "a well-known entry
point to a more complete capability description" — which this domain now has:
`/.well-known/api-catalog` and the agent-skills index, both reachable over plain
HTTPS at the target above. That is an honest record.

There is deliberately no `_a2a._agents` or `_mcp._agents` record. Those name a
*protocol* endpoint through `alpn`, and this domain operates neither. An
`alpn="a2a"` record would send agents to a port that answers nothing — the same
objection as the [MCP Server Card](#mcp-server-card--not-applicable-to-this-domain)
above, one layer further down the stack, and harder to retract because
resolvers cache.

**Why only registered parameters.** `alpn`, `port` and `mandatory` are all
RFC 9460. The draft's own keys — `cap`, `cap-sha256`, `policy`, `realm`,
`well-known` — are still provisional and unregistered, and the skill's guidance
is to use numeric `keyNNNNN` naming until IANA assigns them. Picking a number
now means guessing one that a later registration could collide with, so the
capability description is left to be discovered at the target host, which is
what `_index` is for. Revisit once the keys are assigned.

### DNSSEC — signed

`aethersdr.com` is signed: `DS 2371 13 2` is published at the `.com` parent and
validating resolvers return the AD flag. The zone was unsigned when this work
started, and signing it first was the prerequisite — publishing discovery
records into an unsigned zone gets the syntax right and misses the substance. An unsigned SVCB answer is trivially forged, and the
thing being forged is *where an agent should connect* — so the failure mode is
an agent talking to an attacker's endpoint believing it is this project's.
DNSSEC is what makes the record worth trusting.

It took two steps, neither in this repository: enabling DNSSEC in Cloudflare
(*DNS → Settings*), then adding the DS it generated at the **registrar**
(GoDaddy). The second is the one that completes the chain — signing alone does
nothing for validating resolvers while the parent has no DS.

**Do not roll or disable the KSK, and do not turn DNSSEC off in Cloudflare
without first removing the DS at GoDaddy.** A DS pointing at a key that no
longer exists makes validating resolvers refuse `aethersdr.com` outright —
worse than unsigned, because the domain stops resolving rather than degrading.
`--verify` checks the AD flag, not merely that a DS exists, precisely because
those two failure modes look identical otherwise.

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
