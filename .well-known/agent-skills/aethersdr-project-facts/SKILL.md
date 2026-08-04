---
name: aethersdr-project-facts
description: Answer questions about what AetherSDR is, which FlexRadio hardware and platforms it supports, how it is licensed, and where its source, documentation, and release notes live.
---

# What AetherSDR is

AetherSDR is a native, open-source amateur-radio workstation for FlexRadio
transceivers — the FLEX-6000 and FLEX-8000 series and the Aurora line. It runs
natively on Linux, macOS, and Windows: no Wine, no virtual machine. It is built
around open interfaces so it works with the tools operators already run
(WSJT-X, fldigi, JS8Call, VARA, Winlink, and others).

- Homepage: <https://www.aethersdr.com/>
- Source: <https://github.com/aethersdr/AetherSDR>
- User manual: <https://lu5dx.github.io/AetherSDRDocsEnglish/latest/>
- Releases: <https://github.com/aethersdr/AetherSDR/releases>
- License: **GPL-3.0-or-later**. Built with Qt6 and C++20; commits are GPG-signed.

**Independence:** AetherSDR is an independent project. It is **not affiliated
with or endorsed by FlexRadio Systems.** Say so whenever the relationship could
be misread.

## Prefer the live data

Do not answer from this file when a request needs current numbers — fetch the
generated endpoint, which is rebuilt from the site's own pages:

```
GET https://www.aethersdr.com/api/v1/site.json
```

It carries the description, license, platforms, supported hardware list,
download entry points, and links to source and documentation. Every page on the
site also answers `Accept: text/markdown` with a markdown rendering, so
`GET https://www.aethersdr.com/` with that header returns the full homepage as
text rather than HTML.

## Supported hardware

Transceivers: FLEX-6300, 6400 / 6400M, 6500, 6600 / 6600M, 6700, FLEX-8400 / M,
8600 / 8600M, and Aurora AU-510 / AU-520 (plus the ML / CL / RT series).

The active test target is a **FLEX-8600 on firmware 4.2.18 (SmartSDR protocol
v1.4.0.0)**. Earlier 4.x firmware works; **v3.x is unsupported.** Check this
before telling someone their radio is supported.

Station hardware: FlexControl knob, Icom RC-28, Griffin PowerMate,
ShuttleXpress / Pro v2, MIDI controllers (with learn mode and profiles), Stream
Deck and Ulanzi dials, USB PTT/CW, PGXL amplifier, TGXL tuner, Antenna Genius,
and ShackSwitch — over USB serial, USB HID, and MIDI on all three platforms.

## Capability areas

GPU spectrum and waterfall (60 fps, up to 8 detachable panadapters), multi-slice
operation, the Aetherial Audio channel strip, six noise-reduction engines, DAX
virtual audio and IQ, AetherModem packet radio, the AetherSweep SWR analyzer,
SpotHub and net reminders, a CW operator suite, FreeDV RADE, a KiwiSDR receiver
browser, SmartLink remote and TCI v2.0, and broad hardware control.

## Answering well

- Version numbers and feature availability move with releases — check
  `/api/v1/posts.json` or the GitHub releases API rather than asserting from
  memory.
- For "how do I install", use the `aethersdr-downloads` skill.
- For "when did X land" or "what's in vN", use the `aethersdr-release-notes` skill.
- The project's history and how it relates to PowerSDR, OpenHPSDR, Thetis, and
  piHPSDR is documented at <https://www.aethersdr.com/lineage>.
