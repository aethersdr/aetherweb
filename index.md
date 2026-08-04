# AetherSDR — A native amateur-radio workstation for FlexRadio

> AetherSDR is a native amateur-radio workstation for FlexRadio 6000, 8000, and Aurora transceivers on Linux, macOS, and Windows. Open interfaces, GPU spectrum, DAX, noise reduction, and the data-mode tools you already use.

Source: <https://www.aethersdr.com/>

Open-source · Cross-platform · Native

## The native workstation for your whole station

AetherSDR is a native amateur-radio workstation for FlexRadio 6000, 8000, and Aurora transceivers — native builds for Linux, macOS, and Windows, no Wine, no virtual machines. Built around open interfaces and the tools you already run, it sits at the center of your station, not just in front of the radio.

[Download for your platform](#download) [What's New](https://github.com/aethersdr/AetherSDR/releases) [View source](https://github.com/aethersdr/AetherSDR)

**v26.7.1** · latest release GPL v3 Qt6 · C++20 GPG-signed commits

AetherSDR v26.6.5 — 40m · 3D stacked-trace panadapter

![AetherSDR's 3D stacked-trace panadapter over the 40m band, with a live waterfall below and the full control surface](https://www.aethersdr.com/assets/img/hero-3dss.jpg)

3

Native desktop platforms

Up to 8

Detachable panadapters

60 fps

GPU spectrum & waterfall

6

Noise-reduction engines

Built for the whole station

### Everything your station needs, in one place

GPU spectrum, a full RX/TX signal chain, data-mode plumbing, spotting, and control surfaces — connected through open, widely used interfaces.

#### GPU spectrum & waterfall

QRhi rendering on the GPU (OpenGL/Metal/D3D11) with a per-pixel FFT trace at up to **60 fps** and an optional **3D stacked-trace** mode.

#### Multi-slice & multi-panadapter

Colour-coded VFO overlays, independent TX assignment, diversity/ESC beamforming — up to **8 detachable pans** with native VITA-49 waterfall tiles and per-flag SmartMTR views.

#### Aetherial Audio channel strip

A unified RX **and** TX DSP suite — gate, EQ, compressor, de-esser, tube, AetherVoice exciter, reverb, brickwall limiter — with a preset library and per-side scope.

#### Six noise-reduction engines

NR2 spectral, RN2 (RNNoise), NR4 (libspecbleach), DFNR (DeepFilterNet3), BNR (NVIDIA GPU AI Maxine denoiser), and MNR on macOS — pick per slice.

#### DAX virtual audio + IQ

4 RX + 1 TX channels and raw I/Q at 24–192 kHz for WSJT-X, fldigi, VARA, JS8Call, and Winlink — plus a per-slice WFM demodulator for satellite data.

#### AetherModem packet radio

KISS-over-TCP TNC, connected-mode AX.25 BBS, a personal mailbox, and an **APRS client** with station map, GPS beacon, and messaging.

#### AetherSweep SWR analyzer

In-panadapter SWR analysis with log scale, threshold-band shading, and interpolated bandwidth at SWR ≤ 1.5 / 2.0.

#### SpotHub & net reminders

DX Cluster, RBN, WSJT-X, POTA, PSK Reporter, and FreeDV Reporter spots in one place, with auto mode-switch and one-click **QRZ lookups** — plus recurring **net reminders** so you never miss a sked.

#### CW operator suite

Real-time Morse decoder, with MIDI/keyboard straight-key & iambic paddles and full QSK break-in.

#### FreeDV RADE

AI digital-voice codec with a client-side neural encoder/decoder for natural-sounding low-SNR voice.

#### KiwiSDR receiver browser

Find and connect to public KiwiSDR receivers worldwide through an API-policy-aware directory, with diversity receive and receive-only TX inhibit.

#### SmartLink remote + TCI v2.0

Secure remote operation from anywhere (Auth0 + TLS), plus CAT + audio + IQ + CW + spots over a single TCI WebSocket server.

#### Broad hardware control

rigctld + virtual-serial CAT, MIDI mapping, the FlexControl knob, serial PTT/CW keying, and Multi-Flex operation alongside SmartSDR/Maestro.

GPU rendering

#### Spectrum that keeps up with the band

The panadapter and waterfall render entirely on the GPU with a per-pixel FFT trace — smooth at up to 60 fps while freeing ~71% of the CPU the old QPainter path burned.

- OpenGL, Metal, and Direct3D 11 backends via Qt's QRhi
- Optional 3D stacked-trace mode — perspective FFT history with floor-anchored ridges
- GPU-composited slice flags and multi-GPU adapter selection
- Native VITA-49 waterfall tiles across up to 8 panadapters

![Three slices across the 20m band on a FLEX-8600 — split operation at 14.263 MHz plus a third slice at 14.300, over a live GPU waterfall](https://www.aethersdr.com/assets/img/pan-multislice.jpg)

Signal chain

#### A full studio between you and the air

The Aetherial Audio channel strip gives every RX and TX path a complete DSP suite, with six selectable noise-reduction engines and a preset library so your sound follows you from rig to rig.

- Gate, EQ, compressor, de-esser, tube, AetherVoice exciter, reverb, limiter
- Six NR engines: NR2, RN2, NR4, DFNR, NVIDIA BNR, and macOS MNR
- Per-side scope and a shareable preset library
- DAX virtual audio + raw I/Q for WSJT-X, fldigi, VARA, JS8Call

![The Aetherial Audio channel strip: noise-reduction engine selector, gate with transfer curve, 10-band parametric EQ with live passband, compressor, and de-esser](https://www.aethersdr.com/assets/img/aetherial-strip.jpg)

Supported hardware

### Works with your FlexRadio

Any FlexRadio transceiver, plus the station-control hardware and amplifiers you already run.

#### Transceivers

FLEX-63006400 / 6400M 65006600 / 6600M6700 FLEX-8400 / M8600 / 8600M Aurora AU-510 / 520ML / CL / RT series

Active test target: FLEX-8600 firmware 4.2.18 (SmartSDR protocol v1.4.0.0). Earlier 4.x firmware works; v3.x is unsupported.

#### Controllers & accessories

FlexControl knobIcom RC-28 Griffin PowerMateShuttleXpress / Pro v2 MIDI controllersStream Deck Ulanzi dialsUSB PTT / CW PGXL ampTGXL tuner Antenna GeniusShackSwitch

USB serial, USB HID, MIDI (with learn mode & profiles), and Stream Deck / StreamController plugins on macOS, Windows, and Linux.

Get AetherSDR

### Native builds, released together

Every platform is built, tested in CI, and released together. Signed & notarized where the OS supports it.

Linux

[AppImage x86\_64](https://github.com/aethersdr/AetherSDR/releases/latest) [AppImage aarch64 · Pi](https://github.com/aethersdr/AetherSDR/releases/latest)

macOS

[DMG Apple Silicon](https://github.com/aethersdr/AetherSDR/releases/latest) [DMG Intel · Rosetta](https://github.com/aethersdr/AetherSDR/releases/latest)

Windows

[Microsoft Store recommended](https://apps.microsoft.com/detail/9nc6bmwfn811) [Installer x64 setup.exe](https://github.com/aethersdr/AetherSDR/releases/latest) [Portable x64 zip](https://github.com/aethersdr/AetherSDR/releases/latest)

> winget install aethersdr -s msstore

Auto-updating via the Store, or one line for PowerShell users.

All releases are on [GitHub Releases](https://github.com/aethersdr/AetherSDR/releases/latest) with `.asc` signatures and `SHA256SUMS.txt` · [Build from source](https://github.com/aethersdr/AetherSDR#building-from-source)

How AetherSDR is built

### An AI-augmented open-source project

Developed primarily through Claude Code and a mix of AI tools — with a human review gate on every commit. Nothing reaches `main` without it.

~50

Pull requests merged per week

15k–30k

Lifetime downloads

≥6

Distinct AI tools in the codebase

14

Constitution principles enforced

- **Human-gated merges.** Project lead Jeremy (KK7GWY) and a core contributor team work through Claude Code — every commit passes the merge gate.
- **AetherClaude orchestrator.** A bot auto-triages issues, drafts implementation plans, and opens PRs for `aetherclaude-eligible` work.
- **One rulebook for every tool.** Codex, Copilot, Cursor, Gemini, and Aider all follow the project Constitution and `AGENTS.md`.
- **Branch protection.** Signed commits, green CI, and CODEOWNERS review — the same gate for humans and AI alike.

Agent automation bridge

#### Agents that can actually drive the radio

AetherSDR ships an opt-in, in-process command channel that exposes the live Qt widget tree and can capture any widget — **including the GPU panadapter** — as a PNG. It's how an AI agent proves a change works before the pull request ever opens.

The result: every UX, meter, audio, and transmit fix is verified against real hardware — or headless CI with an offscreen renderer — in a deterministic, cross-OS **snapshot → act → assert** loop. Off in production; it only exists when a developer turns it on.

dumpTree**Snapshot.** Read the widget tree — slider values, button state, label text, accessible names.

get**Read truth.** Pull live model state: frequency, mode, center, dBm, NB/NR, DSP.

invoke**Act.** Click a button, move a slider, open a menu, add or close a panadapter.

grab**Assert.** Capture what the panadapter or a dialog actually rendered, as a PNG.

Transmit verbs are gated behind an explicit allow-TX flag and a dummy-load / ANT2 safety guard — agents can't key the radio by accident.

[Provenance Twenty-three years of amateur SDR, and where AetherSDR picks up Almost every SDR console an amateur can run today traces back to one C# codebase FlexRadio released under the GPL in 2003. Here's which branches forked, which went quiet, and which are still being written. See the lineage](https://www.aethersdr.com/lineage.html)

Partners & friends

### Projects we build alongside

Open-source tools, hardware, and communities in the AetherSDR orbit.

[FR FlexRadioThe software-defined transceivers AetherSDR is built for — the FLEX-6000, FLEX-8000, and Aurora series, and the SmartSDR ecosystem.](https://www.flexradio.com) [DV FreeDV / RADEOpen-source HF digital voice. The Radio Autoencoder blends ML with DSP for clear speech at SNRs down to −2 dB — the codec behind AetherSDR's FreeDV mode.](https://freedv.org/radio-autoencoder/) [KW KiwiSDRThe worldwide network of public 0–30 MHz web receivers that AetherSDR's receiver browser taps for remote and diversity listening.](http://kiwisdr.com) [SDC SDC — Software Defined ConnectorsCW/RTTY skimming, transceiver sync, remote audio, and station plumbing that pairs with AetherSDR over its TCI server.](https://www.lw-sdc.com) [SM SmartMTRDual analog S-meters, live TX needles, and a spectrum analyser for FLEX radios on macOS & iOS — the meter style AetherSDR mirrors in its slice flags.](https://smartmtr.net) [PC POTACATHunt POTA, SOTA & DX with one-click QSY — plus ECHOCAT, which turns nearly any rig and a Raspberry Pi into a free remote station.](https://potacat.com) [VK VK Contest AnalyzerReal-time contest intelligence for N1MM+ logs — live QSO rates, multipliers, band performance, and where to point your effort next.](https://github.com/ezypezy22/vkca_web/) [FS Flex-SimA synthetic FLEX-6000 emulator in pure Python — programmable signals, meters, and CW for testing AetherSDR with no radio on the bench.](https://github.com/nigelfenton/flex-sim) [AG Aether-gateAetherSDR for any radio — a bridge that brings the long tail of CAT rigs and SDR dongles into AetherSDR, beyond the natively-supported FLEX hardware.](https://github.com/nigelfenton/Aether-gate)

Building something that pairs with AetherSDR? [Let's talk](https://github.com/aethersdr/AetherSDR/discussions) about a spot here.

Call for contributors

### Help build the client Flex operators deserve

AetherSDR is developed in the open with Claude Code and a merge gate that treats every contributor — human or AI — the same. Bring a fix, a feature, a translation, a bug report, or a screenshot. You don't have to be a C++ developer to help.

[Read the contributing guide](https://github.com/aethersdr/AetherSDR/blob/main/CONTRIBUTING.md) [Good first issues](https://github.com/aethersdr/AetherSDR/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) [Join Discussions](https://github.com/aethersdr/AetherSDR/discussions)

**46** contributors and counting **~50** PRs merged / week **GPG-signed** commits **≥6** AI tools in the codebase **Qt6 · C++20** Not a dev? The in-app **lightbulb** files AI-assisted reports

Sponsor AetherSDR

### Fuel the next release

AetherSDR is free, GPL, and always will be. Sponsorship through [Open Collective](https://opencollective.com/aethersdr) directly drives the product forward — it funds the AI development subscriptions behind our ~50 merged PRs a week, and puts real control hardware on the test bench so knobs, dials, and decks work the day we ship them.

AI development

Claude Code & AetherClaude subscriptions — the engine behind the release pace

Device lab

Buying the knobs, dials, and Stream Decks we implement and test on real hardware

Public ledger

Every dollar in and out is visible on Open Collective — no black box

[Sponsor on Open Collective](https://opencollective.com/aethersdr) [See who's on the band](https://www.aethersdr.com/supporters.html) [See the public ledger](https://opencollective.com/aethersdr#category-BUDGET)

Prefer to contribute gear instead? Controller hardware loans and donations for the device lab are just as welcome — [start a thread](https://github.com/aethersdr/AetherSDR/discussions).
