#!/usr/bin/env bash
# Publish the DNS-AID entrypoint record for aethersdr.com.
#
#   export CLOUDFLARE_API_TOKEN=...      # needs Zone → DNS → Edit on the zone
#   scripts/apply-dns-aid.sh             # plan only — prints, changes nothing
#   scripts/apply-dns-aid.sh --apply     # create or update the record
#   scripts/apply-dns-aid.sh --verify    # query DNS and report what's live
#
# This writes to production DNS for a live domain, so planning is the default
# and --apply is deliberate. It is idempotent: an existing record with the same
# name is updated in place rather than duplicated.
#
# Why only _index and not _a2a/_mcp: the draft defines _index._agents as "a
# well-known entry point to a more complete capability description", which this
# domain has — /.well-known/api-catalog and the agent-skills index, reachable
# over plain HTTPS at the target below. It does not operate an A2A or MCP
# endpoint, so there is no honest _a2a._agents or _mcp._agents record to
# publish, and alpn="a2a" would point agents at something that isn't there.
#
# Spec: draft-mozleywilliams-dnsop-dnsaid, RFC 9460 (SVCB).

set -euo pipefail

ZONE="aethersdr.com"
RECORD="_index._agents.aethersdr.com"
TARGET="www.aethersdr.com"
TTL=3600

# ServiceMode (priority > 0) so a single lookup carries the connection
# parameters. Only IANA-registered SvcParamKeys are used: alpn, port and
# mandatory are all RFC 9460. The draft's cap/cap-sha256/policy/realm keys are
# still provisional and unregistered — publishing them would mean inventing a
# keyNNNNN number that a later registration could collide with, so the
# capability description is left to be discovered at the target host.
PRIORITY=1
PARAMS='alpn="h2,h3" port=443 mandatory=alpn,port'

API="https://api.cloudflare.com/client/v4"
MODE="plan"
case "${1:-}" in
  --apply)  MODE="apply" ;;
  --verify) MODE="verify" ;;
  ""|--plan) MODE="plan" ;;
  *) echo "usage: $0 [--plan|--apply|--verify]" >&2; exit 2 ;;
esac

say() { printf '%s\n' "$*"; }

# Decode SVCB rdata (RFC 9460 §2.2) from dig's TYPE64 hex and check the parts
# DNS-AID depends on. Single-quote-free so it survives the shell quoting below.
SVCB_DECODE_PY='
import sys
try:
    raw = bytes.fromhex(sys.argv[1])
except ValueError:
    sys.exit("  could not parse rdata: " + sys.argv[1][:60])

KEYS = {0:"mandatory",1:"alpn",2:"no-default-alpn",3:"port",
        4:"ipv4hint",5:"ech",6:"ipv6hint"}

priority = int.from_bytes(raw[:2], "big")
i = 2
labels = []
while raw[i]:
    n = raw[i]
    labels.append(raw[i+1:i+1+n].decode())
    i += 1 + n
i += 1

params = {}
while i < len(raw):
    key = int.from_bytes(raw[i:i+2], "big")
    ln = int.from_bytes(raw[i+2:i+4], "big")
    params[KEYS.get(key, "key" + str(key))] = raw[i+4:i+4+ln]
    i += 4 + ln

alpn = []
if "alpn" in params:
    v = params["alpn"]
    j = 0
    while j < len(v):
        alpn.append(v[j+1:j+1+v[j]].decode())
        j += 1 + v[j]
port = int.from_bytes(params["port"], "big") if "port" in params else None

print("  target   : " + ".".join(labels) + ".")
print("  priority : " + str(priority) + ("  ServiceMode" if priority else "  AliasMode"))
print("  alpn     : " + (",".join(alpn) if alpn else "MISSING"))
print("  port     : " + (str(port) if port else "(default)"))

problems = []
if priority == 0:
    problems.append("priority 0 is AliasMode; DNS-AID wants ServiceMode")
if not alpn:
    problems.append("no alpn parameter")
for p in problems:
    print("  WARN: " + p)
sys.exit(1 if problems else 0)
'

# --------------------------------------------------------------------------
# Verify: what does the world actually see?
# --------------------------------------------------------------------------
verify() {
  local rc=0
  say "Querying $RECORD"

  if command -v dig >/dev/null 2>&1; then
    # Query by numeric type, not by name. SVCB is type 64, and dig only learned
    # the mnemonic in 9.18 — macOS still ships 9.10, where `dig SVCB` returns
    # NOERROR and prints nothing. That reads as "not published" for a record
    # that is being served perfectly well, so ask for TYPE64 and decode the
    # rdata here instead of trusting dig to render it.
    local answer="" r
    for r in "" @1.1.1.1 @9.9.9.9 @8.8.8.8; do
      # Strip dig's "\# <rdlength> " prefix while the spaces are still there to
      # delimit it — collapsing whitespace first makes the length field
      # indistinguishable from the hex that follows it.
      answer=$(dig $r +short "$RECORD" TYPE64 2>/dev/null \
               | sed 's/^\\# [0-9]* //' | tr -d ' \n')
      [[ -n "$answer" ]] && break
    done

    if [[ -n "$answer" ]]; then
      python3 -c "$SVCB_DECODE_PY" "$answer" || rc=1
    else
      say "  not published (no resolver returned a TYPE64 answer)"
      say "  If it was only just applied, a previous negative answer may still"
      say "  be cached — the zone's SOA minimum is the ceiling on that wait."
      rc=1
    fi

    say "Checking DNSSEC on $ZONE"
    if [[ -n "$(dig +short DS "$ZONE" 2>/dev/null)" ]]; then
      say "  DS present at parent"

      # Presence is not validity. A DS that no longer matches a published key
      # makes validating resolvers refuse the zone outright — worse than
      # unsigned — and that failure looks identical to "signed" if you only
      # check that the DS exists. Ask a validating resolver whether the chain
      # actually verifies, via the AD (authenticated data) flag.
      local validated=""
      local r
      for r in 1.1.1.1 9.9.9.9 8.8.8.8; do
        if dig @"$r" +dnssec "$ZONE" SOA 2>/dev/null \
           | grep -m1 "^;; flags:" | grep -q " ad[;,]"; then
          validated="$r"
          break
        fi
      done
      if [[ -n "$validated" ]]; then
        say "  chain validates — $validated returned the AD flag"
      else
        say "  WARN: no resolver returned AD yet."
        say "  Right after a DS is added this is usually just negative caching"
        say "  of the previous unsigned answer; re-check in a few minutes. If it"
        say "  persists, the DS does not match the published KSK — fix that"
        say "  before anything else, because the zone will fail to resolve."
        rc=1
      fi
    else
      say "  no DS at parent — zone is UNSIGNED."
      say "  Enable DNSSEC (Cloudflare → DNS → Settings → DNSSEC), then add the"
      say "  DS record it gives you at the registrar. Without it a resolver"
      say "  cannot tell a real discovery record from a forged one."
      rc=1
    fi
  else
    say "  dig not available; try: curl -H 'accept: application/dns-json' \\"
    say "    'https://cloudflare-dns.com/dns-query?name=$RECORD&type=SVCB'"
    rc=1
  fi
  return $rc
}

if [[ "$MODE" == "verify" ]]; then
  verify || exit 1
  exit 0
fi

# --------------------------------------------------------------------------
# Plan / apply
# --------------------------------------------------------------------------
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN (Zone → DNS → Edit on $ZONE)}"

cf() {
  curl -sS --max-time 30 \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" "$@"
}

# Pull one field out of a Cloudflare API response, failing loudly on API errors.
# Deliberately free of single quotes so it survives the single-quoted bash
# string below — nesting shell escapes inside a Python f-string is how this
# kind of helper ends up silently broken.
CF_JSON_PY='
import json, sys
raw = sys.stdin.read()
try:
    doc = json.loads(raw)
except ValueError:
    sys.exit("non-JSON response from Cloudflare: " + raw[:300])
if not doc.get("success", False):
    parts = []
    for e in doc.get("errors", []):
        parts.append(str(e.get("code")) + ": " + str(e.get("message")))
    sys.exit("Cloudflare API error: " + ("; ".join(parts) or raw[:300]))
path = sys.argv[1]
result = doc.get("result")
if path == "first_id":
    print(result[0]["id"] if result else "")
elif path == "id":
    print(result["id"] if result else "")
else:
    print(result)
'

field() { python3 -c "$CF_JSON_PY" "$1"; }

say "Zone:     $ZONE"

# Looking the zone up by name needs Zone → Zone → Read, which a DNS-only token
# doesn't carry. Rather than force a broader token, take the id directly:
#   CLOUDFLARE_ZONE_ID=... scripts/apply-dns-aid.sh --apply
# It's the hex string in the dashboard URL, and on the zone's Overview page.
if [[ -n "${CLOUDFLARE_ZONE_ID:-}" ]]; then
  ZONE_ID="$CLOUDFLARE_ZONE_ID"
  say "Zone ID:  $ZONE_ID (from CLOUDFLARE_ZONE_ID)"
else
  if ! ZONE_ID=$(cf "$API/zones?name=$ZONE" | field first_id); then
    echo >&2
    echo "Could not look up the zone. If that was a permissions error, the" >&2
    echo "token needs Zone → Zone → Read as well as Zone → DNS → Edit — or" >&2
    echo "skip the lookup entirely:" >&2
    echo "  CLOUDFLARE_ZONE_ID=<id> $0 ${1:---plan}" >&2
    exit 1
  fi
  [[ -n "$ZONE_ID" ]] || {
    echo "zone $ZONE not visible to this token — check it's scoped to the right zone" >&2
    exit 1
  }
  say "Zone ID:  $ZONE_ID"
fi

EXISTING=$(cf "$API/zones/$ZONE_ID/dns_records?type=SVCB&name=$RECORD" | field first_id)

PAYLOAD=$(python3 -c '
import json, sys
name, target, params, ttl, priority = sys.argv[1:6]
print(json.dumps({
    "type": "SVCB",
    "name": name,
    "ttl": int(ttl),
    "comment": "DNS-AID entrypoint (draft-mozleywilliams-dnsop-dnsaid)",
    "data": {"priority": int(priority), "target": target, "value": params},
}))
' "$RECORD" "$TARGET" "$PARAMS" "$TTL" "$PRIORITY")

say
say "Record to publish:"
say "  $RECORD. $TTL IN SVCB $PRIORITY $TARGET. $PARAMS"
say
say "API payload:"
python3 -c 'import json,sys; print(json.dumps(json.loads(sys.argv[1]), indent=2))' "$PAYLOAD"
say
if [[ -n "$EXISTING" ]]; then
  say "An SVCB record already exists at this name ($EXISTING) — it will be updated."
else
  say "No record exists at this name — it will be created."
fi

if [[ "$MODE" == "plan" ]]; then
  say
  say "Plan only. Re-run with --apply to write it."
  exit 0
fi

say
if [[ -n "$EXISTING" ]]; then
  RESULT=$(cf -X PATCH "$API/zones/$ZONE_ID/dns_records/$EXISTING" --data "$PAYLOAD")
else
  RESULT=$(cf -X POST "$API/zones/$ZONE_ID/dns_records" --data "$PAYLOAD")
fi

# Some Cloudflare deployments want the formatted RDATA rather than the
# decomposed data object. If the structured form is rejected, retry with it.
if ! printf '%s' "$RESULT" | python3 -c 'import json,sys; sys.exit(0 if json.load(sys.stdin).get("success") else 1)' 2>/dev/null; then
  say "Structured 'data' form rejected; retrying with formatted 'content'."
  CONTENT_PAYLOAD=$(python3 -c '
import json, sys
name, content, ttl = sys.argv[1:4]
print(json.dumps({"type": "SVCB", "name": name, "ttl": int(ttl),
                  "content": content,
                  "comment": "DNS-AID entrypoint (draft-mozleywilliams-dnsop-dnsaid)"}))
' "$RECORD" "$PRIORITY $TARGET. $PARAMS" "$TTL")
  if [[ -n "$EXISTING" ]]; then
    RESULT=$(cf -X PATCH "$API/zones/$ZONE_ID/dns_records/$EXISTING" --data "$CONTENT_PAYLOAD")
  else
    RESULT=$(cf -X POST "$API/zones/$ZONE_ID/dns_records" --data "$CONTENT_PAYLOAD")
  fi
fi

printf '%s' "$RESULT" | field id >/dev/null
say "Published."
say
say "Propagation takes a moment; then:"
say "  $0 --verify"
