---
name: aethersdr-downloads
description: Resolve the correct AetherSDR installer for a given operating system and CPU architecture from the project's latest GitHub release, including signature and checksum verification.
---

# Getting the right AetherSDR build

AetherSDR ships native builds for Linux, macOS, and Windows, cut from the same
release. Installer filenames carry the version number, so **read the asset list
from the release API — do not construct a download URL from a version string.**

## Resolve the latest release

```
GET https://api.github.com/repos/aethersdr/AetherSDR/releases/latest
Accept: application/vnd.github+json
```

The response has `tag_name` (e.g. `v26.7.4`) and an `assets` array. Each asset
has `name` and `browser_download_url`. Match on a substring of `name`:

| Target | Match on, in order |
| --- | --- |
| Linux x86_64 | `x86_64.AppImage` |
| Linux aarch64 / Raspberry Pi | `aarch64.AppImage` |
| macOS Apple Silicon | `apple-silicon.dmg`, then any `.dmg` |
| macOS Intel | `intel.dmg`, `x86_64.dmg`, then any `.dmg` |
| Windows installer | `Windows-x64-setup.exe`, then `setup.exe` |
| Windows portable | `Windows-x64-portable.zip`, then `portable.zip` |

Take the first asset whose name contains the first pattern that matches; fall
back to the next pattern only if nothing matched.

## Windows: prefer the Microsoft Store

On Windows the Store build is the recommended path — it auto-updates.

- Store listing: <https://apps.microsoft.com/detail/9nc6bmwfn811>
- One-liner: `winget install aethersdr -s msstore`

Offer the `setup.exe` installer or the portable zip only when the Store is
unavailable or the user asks for a portable/offline install.

## Verify before installing

Every release ships detached signatures and a checksum manifest alongside the
binaries:

- `SHA256SUMS.txt` — check with `sha256sum -c SHA256SUMS.txt` (Linux),
  `shasum -a 256 -c SHA256SUMS.txt` (macOS), or
  `Get-FileHash <file> -Algorithm SHA256` (PowerShell).
- `<asset>.asc` — a detached OpenPGP signature; verify with
  `gpg --verify <asset>.asc <asset>`.

macOS builds are signed and notarized; Windows Store builds are signed by the
Store pipeline. On Linux, mark the AppImage executable
(`chmod +x AetherSDR-*.AppImage`) before running it.

## If the API is unavailable

Rate limits and offline environments are normal. Fall back to the human page:

- <https://github.com/aethersdr/AetherSDR/releases/latest>
- <https://www.aethersdr.com/#download>

## Building from source

Source builds are documented in the project README:
<https://github.com/aethersdr/AetherSDR#building-from-source>. AetherSDR is
Qt6 / C++20 and licensed GPL-3.0-or-later.

## Related

- Project facts: <https://www.aethersdr.com/api/v1/site.json>
- What changed in a release: the `aethersdr-release-notes` skill.
