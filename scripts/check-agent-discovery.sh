#!/usr/bin/env bash
# Smoke-test the agent-discovery surface against a deployed site.
#
#   scripts/check-agent-discovery.sh                       # production
#   scripts/check-agent-discovery.sh https://xyz.pages.dev # a preview deploy
#
# Every one of these is read by someone else's software, so a wrong status code
# or content type is a silent outage — nothing on the human site would break.
# CI runs this after each deploy.
#
# Each URL is fetched once and asserted against many times. Fetching per
# assertion instead made ~50 requests at a deployment that was still
# propagating, and read every transient failure as a missing header.

set -uo pipefail

BASE="${1:-https://www.aethersdr.com}"
BASE="${BASE%/}"
FAILURES=0

CACHE=$(mktemp -d)
trap 'rm -rf "$CACHE"' EXIT

fail() { printf '  FAIL  %s\n' "$*"; FAILURES=$((FAILURES + 1)); }
pass() { printf '  ok    %s\n' "$*"; }
lower() { tr '[:upper:]' '[:lower:]'; }

# Headers of the final response only — with -L the dump holds every hop.
last_headers() {
  awk '/^HTTP\//{buf=""} {buf = buf $0 "\n"} END{printf "%s", buf}' "$1" | tr -d '\r'
}

# fetch <key> <path> [curl args...]
# Retries transient failures: a deployment that has just gone out is not
# uniformly available yet, and a one-off connection error is not a finding.
fetch() {
  local key="$1" path="$2"; shift 2
  local body="$CACHE/$key.body" hdr="$CACHE/$key.hdr" code
  local attempt

  for attempt in 1 2 3 4 5; do
    code=$(curl -sS -L --max-time 25 -o "$body" -D "$hdr" -w '%{http_code}' \
           "$@" "$BASE$path" 2>"$CACHE/$key.err")
    if [[ "$code" == 2* ]]; then
      printf '%s' "$code" > "$CACHE/$key.code"
      printf '%s' "$path" > "$CACHE/$key.path"
      return 0
    fi
    sleep $((attempt * 3))
  done

  printf '%s' "${code:-000}" > "$CACHE/$key.code"
  printf '%s' "$path" > "$CACHE/$key.path"
}

label() { cat "$CACHE/$1.path" 2>/dev/null || printf '%s' "$1"; }

# expect_ok <key>
expect_ok() {
  local code; code=$(cat "$CACHE/$1.code")
  if [[ "$code" == 2* ]]; then
    pass "$(label "$1") — HTTP $code"
  else
    fail "$(label "$1") — HTTP $code$( [[ -s "$CACHE/$1.err" ]] && printf ' (%s)' "$(head -1 "$CACHE/$1.err")" )"
  fi
}

# expect_header <key> <header-name> <substring>   ("" = present and non-empty)
expect_header() {
  local key="$1" header="$2" want="$3"
  local value
  value=$(last_headers "$CACHE/$key.hdr" | grep -i "^$header:" \
          | sed 's/^[^:]*: *//' | paste -sd, - )

  if [[ -z "$want" ]]; then
    if [[ -n "$value" ]]; then pass "$(label "$key") — $header: $value"
    else fail "$(label "$key") — $header missing"; fi
    return
  fi

  if [[ "$(printf '%s' "$value" | lower)" == *"$(printf '%s' "$want" | lower)"* ]]; then
    pass "$(label "$key") — $header contains '$want'"
  else
    fail "$(label "$key") — $header expected '$want', got '${value:-<none>}'"
  fi
}

# expect_body <key> <substring>
expect_body() {
  local key="$1" want="$2"
  if grep -qF -- "$want" "$CACHE/$key.body" 2>/dev/null; then
    pass "$(label "$key") — body contains '$want'"
  else
    fail "$(label "$key") — body missing '$want'"
  fi
}

MD='Accept: text/markdown'
HTML='Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'

echo "Checking $BASE"

# A deployment that has just gone out needs a moment before every edge has it.
printf 'Waiting for the deployment to answer'
for attempt in $(seq 30); do
  if curl -sS -o /dev/null --max-time 10 -f "$BASE/" 2>/dev/null; then
    printf ' ready\n'
    break
  fi
  printf '.'
  sleep 4
done

echo
echo "Fetching"
fetch home_html    /                                                    -H "$HTML"
fetch home_md      /                                                    -H "$MD"
fetch blog_html    /blog                                                -H "$HTML"
fetch blog_md      /blog                                                -H "$MD"
fetch lineage_html /lineage                                             -H "$HTML"
fetch lineage_md   /lineage                                             -H "$MD"
fetch index_md     /index.md
fetch robots       /robots.txt
fetch sitemap      /sitemap.xml
fetch catalog      /.well-known/api-catalog
fetch openapi      /api/v1/openapi.json
fetch site         /api/v1/site.json
fetch posts        /api/v1/posts.json
fetch status       /api/v1/status.json
fetch apidocs      /api/v1/docs.md
fetch skills       /.well-known/agent-skills/index.json
fetch skill_dl     /.well-known/agent-skills/aethersdr-downloads/SKILL.md
fetch skill_facts  /.well-known/agent-skills/aethersdr-project-facts/SKILL.md
fetch skill_rel    /.well-known/agent-skills/aethersdr-release-notes/SKILL.md

echo
echo "Discoverability"
expect_ok     robots
expect_body   robots "Sitemap: https://www.aethersdr.com/sitemap.xml"
expect_ok     sitemap
expect_body   sitemap "<urlset"
expect_body   sitemap "<loc>https://www.aethersdr.com/</loc>"
expect_header sitemap content-type xml
for rel in api-catalog service-desc service-doc describedby sitemap; do
  expect_header home_html link "rel=\"$rel\""
done

echo
echo "API catalog + content API"
expect_ok     catalog
expect_body   catalog '"linkset"'
expect_header catalog content-type application/linkset+json
expect_ok     openapi
expect_body   openapi '"openapi"'
expect_body   site '"name": "AetherSDR"'
expect_body   posts '"posts"'
expect_body   status '"status"'
expect_body   apidocs '# AetherSDR site content API'
expect_header site content-type application/json
expect_header site access-control-allow-origin '*'

echo
echo "Agent skills"
expect_ok     skills
expect_body   skills 'schemas.agentskills.io'
expect_header skills content-type application/json
expect_body   skill_dl    'name: aethersdr-downloads'
expect_body   skill_facts 'name: aethersdr-project-facts'
expect_body   skill_rel   'name: aethersdr-release-notes'

echo
echo "Markdown negotiation"
for key in home_md blog_md lineage_md; do
  expect_ok     "$key"
  expect_header "$key" content-type text/markdown
  expect_header "$key" x-markdown-tokens ''
  expect_header "$key" vary Accept
done
expect_body home_md    '# AetherSDR'
expect_body blog_md    '## v26'
expect_body lineage_md '# Lineage'

echo
echo "The human site is unaffected"
for key in home_html blog_html lineage_html; do
  expect_ok     "$key"
  expect_header "$key" content-type text/html
done
expect_body home_html '<!doctype html'
expect_header home_html link 'rel="alternate"'
expect_header index_md content-type text/markdown

echo
echo "Security headers survive the Pages Function"
for key in home_html home_md; do
  expect_header "$key" content-security-policy "default-src 'self'"
  expect_header "$key" x-frame-options DENY
  expect_header "$key" x-content-type-options nosniff
done

echo
if [[ $FAILURES -eq 0 ]]; then
  echo "All agent-discovery checks passed."
else
  echo "$FAILURES check(s) failed."
fi
exit $((FAILURES > 0))
