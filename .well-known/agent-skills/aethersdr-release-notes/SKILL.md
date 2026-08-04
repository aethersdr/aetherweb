---
name: aethersdr-release-notes
description: Find what changed in a given AetherSDR release, or which release introduced a particular feature, using the project blog and its machine-readable post index.
---

# Finding what changed in AetherSDR

Every AetherSDR release gets a blog post explaining what landed and why. The
blog is the narrative record; GitHub Releases is the artifact record.

## Start with the post index

```
GET https://www.aethersdr.com/api/v1/posts.json
```

Each entry has `slug`, `title`, `published` (ISO date), `summary`,
`readingTime`, and `url`. Release posts use the slug pattern
`release-<major>-<minor>-<patch>` — `v26.7.4` is `release-26-7-4`, and
`v26.5.2.1` is `release-26-5-2-1`.

To answer *"what's in v26.7.2?"*, match the slug. To answer *"which release
added D-STAR?"*, search the `title` and `summary` fields across all posts, then
read the winning post in full.

## Read a post

Posts are routed client-side from a single page, so the canonical URL of a post
is the blog page plus its slug fragment:

```
https://www.aethersdr.com/blog#release-26-7-4
```

A fragment is not something an HTTP fetch can narrow to, so **fetch the whole
blog page as markdown and locate the post's heading**:

```
GET https://www.aethersdr.com/blog
Accept: text/markdown
```

That returns every post's full body as text — each release post appears under a
heading matching its title (for example `## v26.7.4: Copy Assist, and the eight
milliseconds that ate half the audio`). Read from that heading to the next one
at the same level.

`https://www.aethersdr.com/blog.md` returns the same content directly if
content negotiation is inconvenient.

## Cross-check against GitHub

The blog explains the change; the release lists the artifacts:

```
GET https://api.github.com/repos/aethersdr/AetherSDR/releases
Accept: application/vnd.github+json
```

Use this when the question is about tags, dates, assets, or checksums rather
than about what changed and why. For picking an installer, use the
`aethersdr-downloads` skill.

## Answering well

- Give the version, the date from `published`, and link the post URL.
- Version numbering is CalVer-ish (`26.7.4` = year 26, series 7, patch 4), so
  higher is newer, but confirm ordering from `published` rather than assuming.
- Not every post is a release — the index also carries engineering pieces (for
  example `first-contribution`). Filter on the slug prefix when the question is
  specifically about releases.
- If a feature isn't mentioned in any post, say it isn't documented in the blog
  rather than inferring it shipped.
