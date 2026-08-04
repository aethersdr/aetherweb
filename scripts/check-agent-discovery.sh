#!/usr/bin/env bash
# Smoke-test the agent-discovery surface against a deployed site.
#
#   scripts/check-agent-discovery.sh                       # production
#   scripts/check-agent-discovery.sh https://xyz.pages.dev # a preview deploy
#
# Every one of these is read by someone else's software, so a wrong status code
# or content type is a silent outage — nothing on the human site would break.
# CI runs this after each deploy.

set -uo pipefail

BASE="${1:-https://www.aethersdr.com}"
BASE="${BASE%/}"
FAILURES=0

fail() { printf '  FAIL  %s\n' "$*"; FAILURES=$((FAILURES + 1)); }
pass() { printf '  ok    %s\n' "$*"; }

lower() { tr '[:upper:]' '[:lower:]'; }

# expect_header <path> <header-name> <substring> [extra curl args...]
# An empty substring means "present and non-empty".
expect_header() {
  local path="$1" header="$2" want="$3"; shift 3
  local got value
  got=$(curl -sSL --max-time 20 -o /dev/null -D - "$@" "$BASE$path" 2>/dev/null \
        | tr -d '\r' | grep -i "^$header:" | tail -1)
  value=$(printf '%s' "${got#*:}" | sed 's/^ *//')

  if [[ -z "$want" ]]; then
    if [[ -n "$value" ]]; then pass "$path — $header present ($value)"
    else fail "$path — $header missing"; fi
    return
  fi

  if [[ "$(printf '%s' "$value" | lower)" == *"$(printf '%s' "$want" | lower)"* ]]; then
    pass "$path — $header contains '$want'"
  else
    fail "$path — $header expected '$want', got '${value:-<none>}'"
  fi
}

# expect_body <path> <substring> [extra curl args...]
expect_body() {
  local path="$1" want="$2"; shift 2
  local code body
  body=$(curl -sSL --max-time 20 -w '\n%{http_code}' "$@" "$BASE$path" 2>/dev/null)
  code="${body##*$'\n'}"
  body="${body%$'\n'*}"
  if [[ "$code" != "200" ]]; then
    fail "$path — HTTP $code"
  elif [[ "$body" == *"$want"* ]]; then
    pass "$path — 200, contains '$want'"
  else
    fail "$path — 200 but missing '$want'"
  fi
}

echo "Checking $BASE"

echo
echo "Discoverability"
expect_body   /robots.txt "Sitemap: https://www.aethersdr.com/sitemap.xml"
expect_body   /sitemap.xml "<urlset"
expect_body   /sitemap.xml "<loc>https://www.aethersdr.com/</loc>"
expect_header /sitemap.xml content-type xml
expect_header / link 'rel="api-catalog"'
expect_header / link 'rel="service-desc"'
expect_header / link 'rel="service-doc"'
expect_header / link 'rel="describedby"'
expect_header / link 'rel="sitemap"'

echo
echo "API catalog + content API"
expect_body   /.well-known/api-catalog '"linkset"'
expect_header /.well-known/api-catalog content-type application/linkset+json
expect_body   /api/v1/openapi.json '"openapi"'
expect_body   /api/v1/site.json '"name": "AetherSDR"'
expect_body   /api/v1/posts.json '"posts"'
expect_body   /api/v1/status.json '"status"'
expect_body   /api/v1/docs.md '# AetherSDR site content API'
expect_header /api/v1/site.json content-type application/json
expect_header /api/v1/site.json access-control-allow-origin '*'

echo
echo "Agent skills"
expect_body   /.well-known/agent-skills/index.json 'schemas.agentskills.io'
expect_header /.well-known/agent-skills/index.json content-type application/json
for skill in aethersdr-downloads aethersdr-project-facts aethersdr-release-notes; do
  expect_body "/.well-known/agent-skills/$skill/SKILL.md" "name: $skill"
done

echo
echo "Markdown negotiation"
for path in / /blog /lineage; do
  expect_header "$path" content-type text/markdown -H 'Accept: text/markdown'
  expect_header "$path" x-markdown-tokens '' -H 'Accept: text/markdown'
  expect_header "$path" vary Accept -H 'Accept: text/markdown'
  # The human site must be untouched by any of this.
  expect_header "$path" content-type text/html \
    -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
done
expect_body / '# AetherSDR' -H 'Accept: text/markdown'
expect_body /blog '## v26' -H 'Accept: text/markdown'

echo
echo "Security headers still applied on negotiated paths"
expect_header / content-security-policy "default-src 'self'" -H 'Accept: text/markdown'
expect_header / x-frame-options DENY -H 'Accept: text/markdown'
expect_header / x-content-type-options nosniff

echo
if [[ $FAILURES -eq 0 ]]; then
  echo "All agent-discovery checks passed."
else
  echo "$FAILURES check(s) failed."
fi
exit $((FAILURES > 0))
