# AetherSDR feature inventory (cited)

Compiled 2026-10-23 for a promotional 3D web experience aimed at contesters, DXers and digital-mode operators. Accuracy comes before enthusiasm: every claim below cites its source. If a claim has no source, it is marked **unverified**. If a "without AetherSDR" line rests on common knowledge rather than a source, it is labelled **[common knowledge]**.

## Sources and citation shorthand

| Short | Full URL / location |
|---|---|
| SITE | https://www.aethersdr.com/ (index.html in /home/jeremy/aetherweb) |
| BLOG#slug | https://www.aethersdr.com/blog.html#<slug> (e.g. `release-26-9-4`, `one-main-branch`, `adaptive-throttle-cq-wpx-cw`, `first-contribution`) |
| ROADMAP | https://www.aethersdr.com/roadmap.html |
| LINEAGE | https://www.aethersdr.com/lineage.html |
| DOCS/slug | https://docs.aethersdr.com/<slug>. This is the Stable docs, labelled 26.10.3. All pages listed returned HTTP 200 on 2026-10-23. The source lives in repo `docs/user/versioned_docs/version-stable/`. |
| README | https://github.com/aethersdr/AetherSDR#readme (commit dd2f62f, 2026-10-23) |
| CHANGELOG | https://github.com/aethersdr/AetherSDR/blob/main/CHANGELOG.md (version sections listed) |
| GHREL/vX | https://github.com/aethersdr/AetherSDR/releases/tag/vX |
| REPO-ROADMAP | https://github.com/aethersdr/AetherSDR/blob/main/ROADMAP.md |
| GATE | https://github.com/nigelfenton/Aether-gate (mirror: https://github.com/aethersdr/Aether-gate) |
| CTR2REPO | https://github.com/aethersdr/AetherCTR2 |
| CLAUDEREPO | https://github.com/ten9876/aetherclaude |

**"First shipped" convention.**
- "shipped vX" means a blog post or CHANGELOG section explicitly introduces the feature in that release.
- "present by vX" means the earliest CHANGELOG mention is a fix or tweak rather than the introduction, so the feature is at least that old. The CHANGELOG is sparse before v0.7.
- The early v0.x GitHub releases no longer list assets.

---

## 1. Aether-branded name registry

These names come from a case-sensitive grep for `Aether[A-Z]…`, `Aether-…` and `Aetherial …` across the website, the AetherSDR repo (md/cpp/h) and the related repos. Class names that appear only in code are left out: AetherClockEngine, AetherDspWidget, AetherAFSKDemod, AetherAx25LibmodemShim, AetherBuildIdentity, AetherX11*, AetherQtPin and AetherTest.

| Name | What it is | Kind | Status / first version | Cite |
|---|---|---|---|---|
| **AetherSDR** | The application itself | Product | shipped (CalVer from v26.5.1; earlier v0.x tags from 2026-03) | README, BLOG#release-26-5-1 |
| **AetherRX** | Receive-chain window: NR, gate, EQ, compressor, tube, AetherVoice, output, as a drag-reorderable stage column | Window / DSP chain | Single window shipped v26.9.4; live BYPASS/REC/PLAY v26.9.5 | BLOG#release-26-9-4, GHREL/v26.9.5, DOCS/aetherial-audio |
| **AetherTX** | Transmit-chain window: Gate, EQ, De-esser, Compressor, Tube, Exciter, Reverb, Final Output | Window / DSP chain | shipped v26.9.4 | BLOG#release-26-9-4 |
| **Aetherial Audio** | Umbrella name for the client-side RX+TX audio-processing suite, formerly the "Aetherial Audio Channel Strip". Stage titles: Aetherial Gate, Parametric EQ, Compressor, De-Esser, Tube, Waveform. | DSP suite | Channel Strip shipped v0.9.6; TX path "feature-complete" v26.5.3 | CHANGELOG [v0.9.6], BLOG#release-26-5-3, DOCS/aetherial-audio |
| **AetherVoice** (tm) | Harmonic "presence and body" exciter stage in the Aetherial chain. It was renamed from the "PooDoo(tm)" exciter. | DSP stage | Name present by v0.9.6 | CHANGELOG [v0.9.6] ("PooDoo(tm) exciter -> AetherVoice(tm)"), DOCS/aetherial-audio |
| **AetherNR** | Label of the noise-reduction stage and method strip inside AetherRX | DSP stage label | Arrived with AetherRX (v26.9.4); not independently pinned in CHANGELOG | repo `resources/help/understanding-noise-cancellation.md` |
| **AetherDSP** | Name for the client DSP settings and voice-processing umbrella. Used as "every other AetherDSP method" for NR methods. | DSP umbrella | "AetherDSP settings dialog" present by v0.8.4 | CHANGELOG [v0.8.4], BLOG#release-26-8-2, DOCS/rtl-sdr |
| **AetherModem** | Built-in AX.25 packet modem: decoder, KISS TNC, BBS terminal, mailbox, APRS, digipeater, D-STAR page | Subsystem / window | Phase 0 shipped v26.5.2.1; TNC/BBS/PMS v26.6.2; APRS v26.6.3; digipeater v26.9.3 | BLOG#release-26-5-2-1, #release-26-6-2, #release-26-6-3, #release-26-9-3 |
| **AetherMailbox** | SID that the Personal Mailbox System greets callers with | Sub-component of AetherModem | v26.6.2 (PMS) | repo docs/MODEM.md, BLOG#release-26-6-2 |
| **AetherSweep** | In-panadapter SWR sweep / analyzer | Tool | present by v0.9.4 (Phase 2 in v0.9.6 Channel Strip release) | CHANGELOG [v0.9.4], DOCS/aethersweep |
| **AetherMap** | PSK Reporter reception map, with globe, weather radar, precipitation and night lights. Renamed to AetherMap in v26.10.2. | Window | Map shipped v26.6.3; renamed v26.10.2 | BLOG#release-26-6-3, #release-26-10-2, DOCS/psk-reporter-map |
| **AetherGPS** | GPS / station-location dashboard (renamed from the GPS window) | Window | Dashboard shipped v26.7.4; renamed v26.10.2 | BLOG#release-26-7-4, #release-26-10-2, DOCS/aetherclock-and-gps |
| **AetherClock** | Decodes WWV/WWVH/WWVB off-air and shows the computer clock offset | Applet | shipped v26.7.4 | BLOG#release-26-7-4, DOCS/aetherclock-and-gps |
| **AetherControl** | On-screen virtual FlexControl knob panel | Window | shipped v26.5.3 (#2888) | CHANGELOG [v26.5.3], DOCS/flexcontrol-tuning-knob |
| **AetherPad** / aether-pad | Arduino Giga R1 control surface running RC-28 emulator firmware (MIT, by Nigel Fenton). AetherSDR recognises it by VID/PID alias. | Community hardware | Recognition shipped v26.6.1 | BLOG#release-26-6-1, README, https://github.com/nigelfenton/aether-pad |
| **AetherCTR2** | Firmware for the Lynovation CTR2-Max that turns it into a FlexRadio front panel through AetherSDR's CTR2 USB relay. It installs beside the stock firmware and is installed from AetherSDR. Its face is based on SmartMTR (SQ5X). **The source is not published**; the repo holds signed images only. | Hardware firmware | Firmware 0.9.2 to 0.9.5 released. The CTR2-Max Firmware window needs an AetherSDR release newer than v26.10.2, i.e. v26.10.3. Docs status: "Early". | CTR2REPO, /home/jeremy/aetherweb/firmware/catalog.json, DOCS/ctr2-proxy |
| **AetherKnob** | Elecrow CrowPanel 2.1" rotary display, recognised on the CTR2 USB relay with link extensions (32-bar audio spectrum, etc.) | Hardware device | CHANGELOG v26.10.2 (#6338) | CHANGELOG [v26.10.2], repo docs/ctr2-usb-relay-design.md |
| **AetherDV** / **AetherDStar** | AetherDV is the local digital-voice helper process. AetherDStar is the waveform name it registers on the radio for D-STAR via ThumbDV. | Process / waveform name | v26.7.2 (D-STAR) | repo docs/architecture/digital-voice-thumbdv-waveform.md, BLOG#release-26-7-2 |
| **AetherClaude** | Autonomous GitHub triage / implementation / review bot (AGPL). It runs on a sandboxed Mac Mini. | Dev infrastructure | Active since at least v0.8.6 (credited) | BLOG#one-main-branch, CLAUDEREPO, CHANGELOG [v0.8.6] |
| **Aether-gate** | Separate GPL-3.0+ bridge (by Nigel Fenton, G0JKN) that presents any CAT rig, Icom LAN rig or SoapySDR dongle to AetherSDR as a Flex. **Receive and control only; no transmit.** | Partner project | Upstream v0.5.3 (2026-09-23); surfaced in README v26.7.2 | GATE README, README "Related projects", SITE partners |
| `.aethertheme` | Theme file format (Theme Editor) | File format | Early beta v26.6.1 | BLOG#release-26-6-1 |

Name-only notes:
- "Aetherial Poodoo" appears in code and history only (the old exciter name). Do not use it.
- `AetherSDRDAX` appears as a device-name string. It is not a feature name.

---

## 2. Feature entries

Template: **Name**, then Pitch / Description / Category / Status / Personas / Without AetherSDR / Cite.

Persona key:
- CON = contester
- DX = DXer
- DIG = digital-mode operator
- PORT = portable/POTA
- REM = remote operator
- NEW = newcomer
- A11Y = accessibility / visually impaired
- DEV = developer

### 2.1 Spectrum / display

**GPU spectrum & waterfall (QRhi)**
- Pitch: The panadapter and waterfall render on the GPU, at up to 60 fps.
- Description: Rendering goes through Qt QRhi on OpenGL, Metal or Direct3D 11. Since v26.7.1 the FFT trace is computed per pixel on the GPU, so render cost does not grow with pan width or frame rate. The FFT ceiling went from 30 to 60 fps in v26.7.1. If the GPU cannot take the fast path, rendering falls back to the CPU. Multi-GPU adapter selection and GPU-composited slice flags are supported.
- Category: spectrum/display
- Status: GPU path shipped v0.8.0 ("GPU-accelerated spectrum/waterfall via QRhi"); 60 fps per-pixel trace shipped v26.7.1.
- Personas: CON, DX, DIG, REM
- Without AetherSDR: no sourced comparison.
- Cite: SITE; README; CHANGELOG [v0.8.0]; BLOG#release-26-7-1; DOCS/gpu-rendering
- Note: "~71% less CPU than the old QPainter path" appears only on SITE and README (no measurement published). Treat it as **unverified**.

**3D stacked-trace panadapter**
- Pitch: The band's recent history stands up as perspective terrain.
- Description: A Spectrum 2D/3D toggle turns the spectrum into a perspective stacked-trace surface. Ridge height is anchored to the measured noise floor and coloured floor-to-peak. A 3D Floor slider sets how far below the floor the surface shows. Single-frame impulse bursts are rejected. The waterfall, scales, spots, memories, markers and band plan keep rendering. A 3D Span slider was added in v26.8.2. The blog's stated uses are surveying a band, catching intermittent signals, watching a contest fill up and characterising noise.
- Category: spectrum/display
- Status: shipped v26.7.1
- Personas: CON, DX
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-7-1; BLOG#release-26-8-2; CHANGELOG [v26.7.1]; ROADMAP

**Multi-slice & multi-panadapter (up to 8)**
- Pitch: Up to 8 detachable pans, colour-coded slices A–H, and independent TX assignment.
- Description: There are multiple receivers (slices) on one pan or across several. Each slice has its own colour and a VFO "flag". Pans detach, and there are layouts for up to 8 panadapters. Slice and pan capacity is read from the radio (v26.9.3). Slice Link (v26.7.4) links two slices so that tuning one retunes the other, across pans and including Kiwi slices.
- Category: spectrum/display / workflow
- Status: 8-pan layouts present by v0.8.15. Slice Link shipped v26.7.4.
- Personas: CON (SO2V-style watching), DX, DIG
- Without AetherSDR: no sourced comparison.
- Cite: SITE; README; CHANGELOG [v0.8.15]; BLOG#release-26-7-4; BLOG#release-26-9-3; DOCS/multi-slice-operation; DOCS/slice-colors

**K4-style mini-pan**
- Pitch: A ±5/±10 kHz floating zoom window on the active VFO that stays on top of your logger.
- Description: A detachable top-level window centred on the active VFO and independent of the main pan. It is usable when the main pan is hidden in Minimal Mode. It floats over other applications and survives AetherSDR being minimised, "which is the entire point when a contest logger owns the screen". On a FLEX-6500 it runs at about 26 Hz per bin.
- Category: spectrum/display
- Status: shipped v26.8.2
- Personas: CON, DX
- Without AetherSDR: no sourced comparison (the blog names the Elecraft K4 style as the inspiration).
- Cite: BLOG#release-26-8-2

**Band plan overlay, time markers, trace shaping**
- Pitch: Legal band edges, UTC time ticks on the waterfall, and cleaner traces.
- Description:
  - The band-plan overlay (present by v0.5.7) was updated to the FCC 60 m Report & Order of 13 Feb 2026 in v26.8.2. IARU R1 80 m was corrected in v26.8.1.
  - Clock-aligned UTC waterfall time markers (Off / 15 s to 15 min), each pinned to the rows it was captured with, shipped v26.9.3.
  - FFT Smooth and FFT De-comb sliders shipped v26.10.2. De-comb keeps a voice's peak envelope instead of averaging it away.
  - Glacier waterfall palette shipped v26.9.5.
  - A K-index / Solar Flux readout on the panadapter is present by v0.8.6 (visible as "K2.00 A14 SFI 201" in hero-3dss.jpg).
- Category: spectrum/display
- Status: components are dated inline above.
- Personas: CON, DX, DIG
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-8-2; BLOG#release-26-8-1; BLOG#release-26-9-3; BLOG#release-26-10-2; GHREL/v26.9.5; CHANGELOG [v0.8.6], [v0.5.7]

**Workspace canvas**
- Pitch: Place pans and applets freely, across several windows, and bind layouts to profiles.
- Description: An opt-in alternative shell, under View > Workspace Canvas. Pans and applets become freely placed, resizable, layered items on a canvas that can span several top-level windows. Named workspaces recall which applets are open and where, and can be bound to radio profiles. Items move between windows via a right-click menu (cross-window drag was deliberately left out). It is off by default and leaves no trace unless enabled.
- Category: workflow / display
- Status: shipped v26.8.3. README roadmap still lists it as "experimental alternative shell"; remaining work is live cross-window drag.
- Personas: CON, DX, REM
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-8-3; README Roadmap; DOCS/workspace-canvas

**Metering: SmartMTR flags, cross-needle, S-meter faces**
- Pitch: Analog-style meters you can read in peripheral vision.
- Description:
  - SmartMTR-style meter views on each VFO flag shipped v26.6.4; SmartMTR TX meters (SWR / forward / compression) shipped v26.6.5.
  - A classic cross-needle PWR/SWR meter, with corrected SWR maths, shipped v26.7.3.
  - The analog S-meter gained configurable face themes in v26.7.3.
  - Hover numeric readouts on TX meters shipped v26.7.1.
  - One set of SmartMTR ballistics everywhere shipped v26.9.5.
  - Several "meters that lied" fixes followed: S-meter average vs peak on raw-IQ backends (v26.9.4), TGXL voice metering from peak (v26.9.4), and stale SWR / forward-power readings (v26.8.1).
  - Slow-release PWR ballistics were fixed live during CQ WPX CW.
- Category: spectrum/display / hardware
- Personas: CON ("a changed crossing point is visible in peripheral vision"), DX
- Without AetherSDR: a physical cross-needle wattmeter (Bird / Daiwa named in the source).
- Cite: BLOG#release-26-6-4 (CHANGELOG [v26.6.4]); BLOG#release-26-6-5; BLOG#release-26-7-3; BLOG#release-26-7-1; GHREL/v26.9.5; BLOG#release-26-9-4; BLOG#release-26-8-1; BLOG#adaptive-throttle-cq-wpx-cw; DOCS/meters

**Themes & Theme Editor**
- Pitch: Every colour, font and size comes from an editable theme.
- Description: Settings > Theme Editor with the `.aethertheme` format; it started as early beta. v26.10.2 introduced a written style guide and "canon" frameless windows, applied one surface at a time.
- Category: display
- Status: Theme Editor shipped v26.6.1 (beta). Canon windows started in v26.10.2 (in progress).
- Personas: A11Y (contrast), all
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-6-1; BLOG#release-26-10-2; DOCS/themes-and-theme-editor; README Roadmap ("The visual canon")

### 2.2 RX DSP

**Client-side noise reduction: seven engines (site still says six)**
- Pitch: Pick the noise-reduction engine that suits each signal, per slice.
- Description: The engines are:
  - NR2: spectral; WDSP emnr port, with psychoacoustic post-processing from v26.9.4.
  - RN2: RNNoise, with a Noise Floor blend option from v26.8.1.
  - NR4: libspecbleach.
  - NNR: WDSP 2.10 Neural Noise Reduction, v26.9.4.
  - DFNR: DeepFilterNet3.
  - BNR: NVIDIA Maxine denoiser, in-process on a local RTX GPU since v26.7.1; RTX 50-series packs since v26.7.2; Linux and Windows.
  - MNR: macOS only. Its attenuation was fixed in v26.8.2, from a measured 4.54 dB to 24.4 dB.

  Since v26.9.5 every method denoises left and right independently, so pans and diversity survive NR.
- Category: RX DSP
- Status:
  - NR2: present by v0.4.7
  - RN2: present by v0.5.7
  - BNR: present by v0.7.6 (Docker container era)
  - NR4 / AetherDSP dialog: present by v0.8.4
  - DFNR: shipped v0.8.6 (#970)
  - MNR: present by v0.8.19
  - NNR: shipped v26.9.4
- Personas: DX (weak signals), CON, DIG
- Without AetherSDR: no sourced comparison.
- Cite: README; SITE; BLOG#release-26-9-4; BLOG#release-26-8-1; BLOG#release-26-8-2; BLOG#release-26-7-1; BLOG#release-26-7-2; GHREL/v26.9.5; CHANGELOG [v0.4.7], [v0.5.7], [v0.7.6], [v0.8.4], [v0.8.6], [v0.8.19]; DOCS/dsp-noise-mitigation; DOCS/nr2-noise-reduction; DOCS/bnr-gpu-noise-removal

**AetherRX receive chain**
- Pitch: The whole receive chain in one window, and you set the order.
- Description: There is a stage column on the left. Each row has an enable checkbox and a grip, and dragging rewrites the actual audio order. A profile library (save/load/import/export) captures every stage, the order and the active NR method. The EQ page draws the receive filter edges, and dragging an edge retunes the slice. BYPASS / REC / PLAY sit at the foot of the column (v26.9.5). "TX Playback" transmits the last client-side recording.
- Category: RX DSP
- Status: shipped v26.9.4; live controls v26.9.5
- Personas: DX, all
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-9-4; GHREL/v26.9.5; DOCS/aetherial-audio

**Diversity & ESC beamforming**
- Pitch: Two antennas, two receivers, with beam-steering between them.
- Description: Diversity uses two SCUs to receive the same signal on two antennas at once. ESC (Enhanced Signal Clarity) combines them. It needs the radio's DIV_ESC licence (SmartSDR+ or higher, per v0.7.5 notes).
- Category: RX DSP
- Status: present by v0.7.5
- Personas: DX
- Without AetherSDR: no sourced comparison.
- Cite: README; DOCS/diversity-and-esc; CHANGELOG [v0.7.5]; pan-multislice.jpg shows the DIV/ESC panel

**Tracking notch filters, noise blanker, squelch**
- Pitch: Kill carriers and keep squelch honest per slice.
- Description:
  - Right-click TNFs present by v0.4.0. Extended TNF mirrors a tracking notch through the waterfall (v26.9.4).
  - Auto squelch got twelve corrections in v26.10.3, so each slice and pan keeps independent Auto squelch across CW/FT8 mode changes.
  - SmartSDR 4.3 radio-owned Auto AGC-T and DSP parameter Reset (v26.10.3).
  - Adaptive RX filter auto-fits the SSB passband (v26.7.2).
- Category: RX DSP
- Personas: DX, CON
- Without AetherSDR: no sourced comparison.
- Cite: CHANGELOG [v0.4.0]; BLOG#release-26-9-4; GHREL/v26.10.3; BLOG#release-26-7-2; DOCS/tnf-tracking-notch-filters

**Copy Assist (on-device speech-to-text)**
- Pitch: A live transcript of received voice under the waterfall, colour-coded by confidence.
- Description: Copy Assist uses whisper.cpp locally on CPU or GPU (Vulkan/Metal, auto-detected), with models downloaded on demand. An optional remote OpenAI-compatible endpoint is off unless configured: "Nothing leaves your computer unless you point it somewhere." The transcription language can be pinned. Since v26.10.2 it can transcribe pre-NR audio, which "cut its error rate by a third" on one recorded ragchew. The blog says not to log callsigns from it. It is not in the Intel macOS build.
- Category: RX DSP / accessibility
- Status: shipped v26.7.4
- Personas: A11Y ("Operating with hearing loss. The case that matters most."), DX (pileup second pair of ears), NEW, net control
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-7-4; BLOG#release-26-8-1; BLOG#release-26-10-2; README; DOCS/copy-assist

**KiwiSDR & Web-888 receiver browser + geographic diversity**
- Pitch: Listen from a public receiver anywhere in the world and align it with your own radio.
- Description:
  - An API-policy-aware browser for public KiwiSDRs, which surfaces directory Limits. Kiwi pans carry a structural receive-only TX inhibit.
  - v26.6.5 added GCC-PHAT auto-alignment of a Kiwi with your Flex in both audio and waterfall, for diversity across continents.
  - The directory has been served from an AetherSDR CDN mirror, in partnership with the KiwiSDR team, since v26.9.2.
  - Web-888 became its own receiver family in v26.9.3.
  - Per-receiver passwords are kept in the OS keychain.
  - The KiwiSDR DX Community database is a spot overlay (v26.8.2).
- Category: RX / remote
- Status: browser shipped v26.6.4; GCC-PHAT v26.6.5; mirror v26.9.2; Web-888 v26.9.3
- Personas: DX (propagation check, hear yourself), PORT ("a public receiver near home tells you what your home station would be hearing"), CON, NEW
- Without AetherSDR: opening KiwiSDR receivers in a web browser **[common knowledge]**.
- Cite: BLOG#release-26-6-4; BLOG#release-26-6-5; BLOG#release-26-9-2; BLOG#release-26-9-3; BLOG#release-26-8-2; DOCS/kiwisdr-and-web-888

### 2.3 TX / audio

**AetherTX / Aetherial transmit chain**
- Pitch: A studio channel strip between your mic and the air.
- Description: The stages are Gate, EQ, De-esser, Compressor, Tube, AetherVoice exciter, Reverb, and Final Output (brickwall limiter), with a profile library and scope. v26.5.3 rewrote the de-esser as split-band; the old one "was costing you 30 watts" of forward power on voice. The same release added a PAPR all-pass processor (Drive 0–18 dB, Phase) for more average power at the same peak. TX audio has been 48 kHz float end to end since v26.8.3.
- Category: TX/audio
- Status: Channel Strip shipped v0.9.6; TX complete v26.5.3; one window v26.9.4
- Personas: DX ("PAPR buys average power at a fixed peak limit"), CON (phone)
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-5-3; BLOG#release-26-9-4; BLOG#release-26-8-3; CHANGELOG [v0.9.6]; DOCS/aetherial-audio; DOCS/tx-controls

**Digital Voice Keyer: radio DVK + local keyer**
- Pitch: Twelve contest messages on F1–F12, with or without a SmartSDR+ subscription.
- Description:
  - Radio DVK uses the Flex's own keyer: 10 s slots, SmartSDR+ required.
  - The Local keyer (v26.10.3) records from the PC mic into 12 slots of up to 30 s ("enough for a contest exchange or a longer CQ"). It works on any radio AetherSDR can transmit on. VOX is held off while recording.
  - WAV import with resampling arrived in v26.10.2.
  - F-keys follow mode: CWX macros in CW, DVK in voice.
  - Repeat/CQ automation is listed as a follow-up (not shipped).
- Category: TX/audio / workflow
- Status: radio DVK present by v0.5.7; local keyer shipped v26.10.3
- Personas: CON
- Without AetherSDR: the Flex radio DVK needs a SmartSDR+ subscription (the source says so). Contest loggers' own voice keyers are **[common knowledge]**.
- Cite: DOCS/dvk-panel; GHREL/v26.10.3; BLOG#release-26-10-2; README

**Split operation, Monitor TX, Split Up**
- Pitch: One click into split, with your audio arrangement remembered.
- Description: SPLIT on a VFO flag creates a TX slice 1 kHz up in CW or 5 kHz up otherwise. SWAP exchanges the two frequencies. Since v26.9.5, split remembers TX-slice mute/level/pan. Monitor TX (Hold) solos the TX frequency, like XFC/TF-SET/TXW on conventional rigs, or lets you hear both. Split Up 1/5/10 kHz is available as shortcut actions.
- Category: workflow / TX
- Status: Monitor TX / Split Up / remembered audio shipped v26.9.5
- Personas: DX ("the usual way to work a DX station or a pile-up"), CON
- Without AetherSDR: the XFC / TF-SET / TXW button on a conventional transceiver (named in the source).
- Cite: DOCS/split-operation; GHREL/v26.9.5; ROADMAP

**QSO recording**
- Pitch: Record received and sent audio on your computer.
- Description: Client-side QSO recording is rate-aware and uses exclusive-create filenames (v26.9.4). Since v26.9.2 recordings capture sent CW rather than the mic. On non-Flex radios, Radio Side recording records on the computer (v26.10.1).
- Category: TX/audio
- Status: present by v26.5.1
- Personas: CON (log review), DX
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-9-4; BLOG#release-26-9-2; BLOG#release-26-10-1; DOCS/audio-settings

### 2.4 Digital modes

**DAX virtual audio + DAX IQ**
- Pitch: Virtual sound cards and raw I/Q for WSJT-X, fldigi, VARA, JS8Call and Winlink, with no SmartSDR install.
- Description: Up to 8 RX audio channels (radio-dependent; the 8-channel FLEX-6700 path was fixed in v26.8.3) plus 1 TX. Up to 4 channels of raw I/Q at 24/48/96/192 kHz; DAX IQ became fully usable in v26.6.3. Since v26.10.3, DAX IQ rates follow the exact Flex model.
- Category: digital modes
- Status: present by v0.7.11 (DAX IQ pipe); full IQ v26.6.3
- Personas: DIG, CON (skimmers)
- Without AetherSDR: on Windows, SmartSDR's DAX utility; no Linux/macOS official equivalent **[common knowledge]**.
- Cite: README; DOCS/dax-virtual-audio; DOCS/dax-iq-streaming; BLOG#release-26-6-3; BLOG#release-26-8-3; GHREL/v26.10.3
- Note: SITE says "4 RX + 1 TX", which is stale.

**WSJT-X / FT8 integration**
- Pitch: Rig control plus audio for WSJT-X, JTDX and JS8Call.
- Description: Combines CAT/TCI rig control and DAX audio. SpotHub's WSJT-X tab spots decodes (CQ / CQ POTA / Calling Me colours), each placed on the reporting instance's band. TCI routing was fixed so that two WSJT-X instances no longer steal each other's TX slice (v26.8.1).
- Category: digital modes
- Status: first version not pinned. Components are dated inline (TCI v0.7.19, rigctld v0.2.8, SpotHub WSJT-X tab, TCI routing fix v26.8.1).
- Personas: DIG, PORT (POTA)
- Without AetherSDR: no sourced comparison.
- Cite: DOCS/wsjt-x-integration; DOCS/spothub; BLOG#release-26-8-1; BLOG#release-26-9-3

**AetherModem packet radio**
- Pitch: Your radio is the TNC, with no external hardware.
- Description:
  - Native HDLC/AX.25 decoding with a 21-lane phase bank and FCS validation (300 bd HF, 1200 bd VHF).
  - KISS-over-TCP TNC server on default port 8001 for Xastir, YAAC, APRSdroid and UISS.
  - Connected-mode BBS terminal, verified on-air against SJVBBS-1, and a Personal Mailbox System.
  - Shared one-at-a-time TX queue.
  - The Direwolf-derived 1200 bd demodulator "out-copied both Dire Wolf and Graywolf" on a 1,875-packet overnight run.
  - APRS client with station table, weather decode, GPS beacon and messaging.
  - WIDE1-1 fill-in digipeater that must be armed every session.
- Category: digital modes
- Status: shipped v26.5.2.1 / v26.6.2 / v26.6.3 / v26.9.3
- Personas: DIG, PORT, emergency comms (the BBS use case)
- Without AetherSDR: "the traditional path to decoding AX.25 runs through a TNC, a sound-card modem, or a separate application"; "Point it at localhost:8001 and the sound-card modem, the hardware, and the cables all disappear".
- Cite: BLOG#release-26-5-2-1; BLOG#release-26-6-2; BLOG#release-26-6-3; BLOG#release-26-9-3; DOCS/aethermodem-packet-radio

**WFM demodulator for 9600-bd satellites**
- Pitch: 9600-baud G3RUH satellite telemetry from a Flex into HS-SoundModem.
- Description: A per-slice WFM toggle runs DAX IQ, phase-continuous NCO Doppler correction, exact 48 kHz resampling and a flat atan2 discriminator out to a virtual cable. In-span CAT/TCI Doppler retunes no longer recentre the pan.
- Category: digital modes
- Status: shipped v26.6.3
- Personas: DIG (satellite)
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-6-3

**FreeDV RADE digital voice**
- Pitch: AI digital voice that copies down to about −2 dB SNR.
- Description: RADE v1 (Radio Autoencoder) runs with a client-side neural encoder/decoder. FreeDV Reporter is integrated: a double-click tunes and forces RADE (v26.9.3). Long-session phase normalisation was added in v26.10.3.
- Category: digital modes
- Status: present by v0.5.7
- Personas: DIG, DX
- Without AetherSDR: the standalone FreeDV application with a sound-card interface **[common knowledge]**.
- Cite: SITE (partner card, "SNRs down to −2 dB"); README; DOCS/rade-digital-voice; BLOG#release-26-9-3; GHREL/v26.10.3

**D-STAR via ThumbDV**
- Pitch: D-STAR on a Flex with a USB dongle instead of a second radio.
- Description: Receive and transmit DV, headers, callsigns, repeater routing and 20-character messages. Needs a ThumbDV or DV3000U hardware AMBE vocoder. Software AMBE is deliberately excluded because of patents. AetherModem has a D-STAR station/routing page. Network Diagnostics shows DV delivery metrics.
- Category: digital modes
- Status: shipped v26.7.2
- Personas: DIG
- Without AetherSDR: "D-STAR on a Flex has historically meant a second radio."
- Cite: BLOG#release-26-7-2; DOCS/d-star-thumbdv

**RTTY decoder**
- Pitch: Built-in RTTY decode with adjustable sensitivity.
- Description: RTTY decoder pane with mark/space lines. Sensitivity has been adjustable from the decoder bar since v26.9.1.
- Category: digital modes
- Status: RTTY mode present by v0.2.5 ("RTTY mark default"). The decoder's first version is not pinned. Sensitivity control shipped v26.9.1.
- Personas: CON (RTTY contests), DIG
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-9-1; DOCS/rtty-operation; CHANGELOG [v0.2.5]

### 2.5 CW

**CW operator suite: decoders, keyer, CWX**
- Pitch: Three CW decoders, a sample-accurate local keyer and F-key macros.
- Description:
  - Decoders: ggmorse (default, about 0.5 s latency), plus the optional neural decoders DeepFist (v26.9.4, about 2 s behind, for weak or hand-sent CW) and DeepCW (v26.10.3, about 6–8 s behind). Neural models download on first use (about 13 and 15 MB). They are not available on Intel Mac.
  - The decoder can read your own sending (TX decode) to check fist timing.
  - Local iambic / straight keyer from MIDI or keyboard with full QSK. After a timing fix in v26.8.2, a 30 WPM setting measures 40.002 ms per unit (it was 26.26 WPM before). Iambic Mode B behaves correctly.
  - CWX text keyer with F1–F12 macros, using the radio's keyer. On IC-705 / IC-7300MK2 it is labelled CWK.
  - "Live CW contacts" QRZ cards from the decoder.
  - Optional Quindar tones.
- Category: CW / workflow
- Status: CW decode present by v0.7.0; QSK v0.7.0; DeepFist v26.9.4; DeepCW v26.10.3
- Personas: CON, DX, NEW (learning), A11Y
- Without AetherSDR: no sourced comparison.
- Cite: README; DOCS/cw-decoder; DOCS/cwx-panel; DOCS/callsign-lookup; BLOG#release-26-8-2; BLOG#release-26-9-4; GHREL/v26.10.3; CHANGELOG [v0.7.0], [v0.9.7]

### 2.6 Spotting / workflow

**SpotHub**
- Pitch: Every spot source on your panadapter, colour-coded, in one place.
- Description:
  - Sources: DX Cluster (telnet; GoCluster "Hide Unverified" filter), RBN (with rate limit "so contests don't flood the display"), WSJT-X decodes, DXLab SpotCollector, POTA, N1MM+/DXLog contest spots, the EiBi SW schedule, FreeDV Reporter, and the KiwiSDR DX Community overlay.
  - The N1MM+/DXLog listener (UDP 12060) shows dupe, needed-multiplier, CQ, busy and bust status with 8 colour swatches.
  - Auto mode-switch on click. Freeze toggle (v26.8.1). DXCC spot colouring from ADIF logbook auto-reload.
- Category: workflow / spotting
- Status: SpotHub shipped v0.7.7; FreeDV Reporter v0.7.9; N1MM/EiBi/Kiwi DX v26.8.2
- Personas: CON, DX, PORT (POTA), DIG
- Without AetherSDR: a separate cluster client or bandmap in the logger **[common knowledge]**. The N1MM listener matches the SmartSDR-documented `FocusHelperN1MMPort`, so "an existing broadcast configuration works unchanged".
- Cite: DOCS/spothub; BLOG#release-26-8-2; BLOG#release-26-8-1; CHANGELOG [v0.7.7], [v0.7.9], [v0.8.20]

**Four TCI DAX IQ subscriptions (multi-band skimming)**
- Pitch: Feed four CW skimmers through one TCI server.
- Description: Four concurrent TCI IQ subscriptions are allowed. Receivers on one pan share its IQ stream, and four bands need four pans. "This is the kind of capability that only shows its value at 0400 in a contest."
- Category: digital modes / automation
- Status: shipped v26.9.2
- Personas: CON
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-9-2

**AetherMap (PSK Reporter map)**
- Pitch: See who hears you, on a flat map or a globe, with weather and the night side drawn in.
- Description: Live PSK Reporter reports on OpenStreetMap with mode-coloured markers and great-circle paths. Additions:
  - globe projection (v26.9.1)
  - NOAA radar playback and NASA city lights (v26.9.3)
  - LibreWXR worldwide precipitation with NOAA/ECCC/EUMETNET OPERA regional backups (v26.9.4)
  - one-shot WSPR beacon (v26.7.4)
- Category: workflow / propagation
- Status: shipped v26.6.3; renamed AetherMap v26.10.2
- Personas: DX, DIG, PORT
- Without AetherSDR: the pskreporter.info website **[common knowledge]**.
- Cite: BLOG#release-26-6-3; #release-26-9-1; #release-26-9-3; #release-26-9-4; #release-26-7-4; #release-26-10-2; DOCS/psk-reporter-map

**Net Scheduler (net reminders)**
- Pitch: Never miss a sked: reminders with one-click tune.
- Description: Stored on the computer and works with any radio. Supports once/daily/weekly/monthly ("second Tuesday") recurrence, reminder lead time, and frequency/mode/filter capture.
- Category: workflow
- Status: shipped v26.6.4
- Personas: NEW, net operators, PORT
- Without AetherSDR: no sourced comparison.
- Cite: DOCS/net-scheduler; CHANGELOG [v26.6.4]; SITE

**QRZ callsign lookup**
- Pitch: Name, grid, licence class and photo, with a 7-day cache.
- Description: A QRZ.com XML lookup window. The password is kept in the OS keychain. Country-level prefix data works without an account.
- Category: workflow
- Status: The QRZ XML lookup window with a 7-day cache shipped v26.7.2. A right-click "QRZ Lookup" action on spots is present by v0.7.11.
- Personas: DX, CON
- Without AetherSDR: the QRZ website or the logger's lookup **[common knowledge]**.
- Cite: BLOG#release-26-7-2; DOCS/callsign-lookup

**Memory channels, profiles, CHIRP import, transverters**
- Pitch: Radio memories, global/TX/mic profiles and XVTR set-up in one client.
- Description: A memory editor for the radio's memory bank. PROF applet for live profile switching (v26.6.5). CHIRP-next CSV import (v26.7.2). XVTR transverter configuration. Settings live in a SQLite store with verified backups since v26.8.1, plus a headless `aethersdr --config` recovery CLI.
- Category: workflow
- Status: memories present by v0.2.4. PROF applet v26.6.5. CHIRP import v26.7.2. SQLite settings v26.8.1.
- Personas: all; PORT
- Without AetherSDR: no sourced comparison.
- Cite: DOCS/memory-channels; DOCS/profile-management; DOCS/xvtr-transverters; BLOG#release-26-6-5; BLOG#release-26-7-2; BLOG#release-26-8-1

### 2.7 Automation / integration

**TCI v2.0 server**
- Pitch: CAT, audio, IQ, CW and spots over one WebSocket.
- Description: Full TCI v2.0 (72 command handlers at introduction). The identity was changed to `device:AetherSDR` / `protocol:ExpertSDR3` after a WSJT-X power-halving quirk (v26.5.2.1). Every argument goes through a checked parse (v26.8.3). Streaming moved to its own I/O thread (v26.9.5). Tune start/stop events are announced for tuner controllers (v26.10.2). Partner SDC uses it for CW/RTTY skimming.
- Category: automation/integration
- Status: shipped v0.7.19
- Personas: CON, DIG, DEV
- Without AetherSDR: no sourced comparison.
- Cite: CHANGELOG [v0.7.19]; BLOG#release-26-5-2-1; BLOG#release-26-8-3; GHREL/v26.9.5; BLOG#release-26-10-2; DOCS/tci-server; SITE partners (SDC)

**Built-in CAT (rigctld / Kenwood / Flex dialects)**
- Pitch: Loggers and digital apps connect directly, with no SmartSDR CAT install.
- Description: Up to eight CAT ports. Each speaks Hamlib rigctld (NET rigctl), Kenwood TS, or Flex (Kenwood plus ZZ extensions), over TCP or virtual serial. rigctl `STRENGTH` reports the real S-meter since v26.9.5.
- Category: automation/integration
- Status: rigctld shipped v0.2.8 (TCP port 4532, "works with WSJT-X, fldigi, N1MM")
- Personas: CON (N1MM+), DIG, DX
- Without AetherSDR: "without an external rigctld or a SmartSDR CAT install".
- Cite: DOCS/cat-control; CHANGELOG [v0.2.8]; GHREL/v26.9.5

**Automation bridge + MCP server (the app's agent interface)**
- Pitch: AI agents can drive and verify the real radio app, but cannot key it by accident.
- Description: An opt-in in-process command channel:
  - `dumpTree` returns the widget tree as JSON.
  - `get` reads live model truth.
  - `invoke` drives controls.
  - `grab` returns a PNG of any widget, including the GPU panadapter.

  It is also wrapped as a Model Context Protocol server with 25 typed tools, `assert_state`/`wait_for`, and a `validate_ui_change` prompt. Transmit-keying controls are refused unless an env var opts in. Access is gated by a token held in the OS keychain. It runs headless in CI.
- Category: automation/integration
- Status: bridge shipped v26.6.4; MCP v26.7.2
- Personas: DEV, A11Y-adjacent tooling, station automation
- Without AetherSDR: none; the blog says no industry agent tooling applies to a native Qt Widgets app.
- Cite: BLOG#one-main-branch; BLOG#release-26-6-4; BLOG#release-26-7-2; SITE; DOCS/automation-bridge-and-mcp; https://github.com/aethersdr/AetherSDR/blob/main/docs/automation-bridge.md
- Do not confuse this with the website's WebMCP tools (`assets/js/webmcp.js` in aetherweb: get_project_info, search_blog_posts, etc.). Those belong to the site, not the app (aetherweb `docs/agent-readiness.md`).

**MQTT station automation**
- Pitch: Home Assistant, Node-RED and the shack bus on the panadapter.
- Description: Shows MQTT values (rotator, antenna, amp) on the panadapter, adds custom command buttons, and publishes built-in topics so other software can follow the radio. Bundled libmosquitto.
- Category: automation/integration
- Status: present by v0.8.11
- Personas: REM, DEV, CON (station integration)
- Without AetherSDR: no sourced comparison.
- Cite: DOCS/mqtt-station-automation; CHANGELOG [v0.8.11]

**MIDI mapping**
- Pitch: Any class-compliant MIDI controller becomes a radio front panel.
- Description: MIDI Learn, manual entry, import/export profiles including SmartSDR `.map` files, and relative encoders. 50+ parameters at introduction.
- Category: hardware/control
- Status: shipped v0.7.9
- Personas: CON, REM, A11Y (tactile control)
- Without AetherSDR: no sourced comparison.
- Cite: CHANGELOG [v0.7.9]; BLOG#release-26-8-4; DOCS/midi-controller-mapping

**Demo mode**
- Pitch: Try the whole app with no radio, antenna or licence.
- Description: A synthetic backend that generates RX audio and a matching panadapter, with 10 noise/signal channels for testing NR engines. It cannot transmit. A "your first session" tutorial uses it.
- Category: workflow
- Status: shipped v26.7.4
- Personas: NEW, DEV
- Without AetherSDR: no sourced comparison.
- Cite: BLOG#release-26-7-4; DOCS/demo-mode; DOCS/your-first-session

### 2.8 Remote

**SmartLink**
- Pitch: Operate your Flex over the internet.
- Description: Auth0 + TLS WAN operation with Opus audio compression. Since v26.10.3 it sends UDP keepalive registration throughout the session.
- Category: remote
- Status: present by v0.3.90-beta
- Personas: REM, PORT
- Without AetherSDR: SmartSDR's own SmartLink on Windows **[common knowledge]**.
- Cite: README; DOCS/smartlink-setup; GHREL/v26.10.3; CHANGELOG [v0.3.90-beta]

**Remote over CGNAT (in-radio Tailscale)**
- Pitch: Reach a FLEX-8000 or Aurora behind carrier-grade NAT, with no box at home.
- Description: `flex-tailnet-shim` installs a Tailscale node into the radio as a waveform container. AetherSDR verifies the pinned SHA-256. The shim closes the radio connection the moment a client goes away, so a dead tunnel cannot leave TX keyed. An allowlist controls who can connect. MTU is capped at 1200 on tailnet. Network Diagnostics gains a Remote Link view.
- Category: remote
- Status: shipped v26.10.2 (shim releases v0.4.0/v0.4.1 on GitHub)
- Personas: REM, CON (remote stations)
- Without AetherSDR: "SmartLink works around it through a relay. A VPN works around it if you have a box at home to run one on."
- Cite: BLOG#release-26-10-2; DOCS/tailscale-remote-access; GitHub releases list

**Adaptive Throttle (remote resilience)**
- Pitch: A congested link drops frame rate instead of dropping you.
- Description: As network quality steps from Good to Fair to Poor, every pan cuts its FFT/waterfall rate (15 fps to 8 fps to 4 fps). In Poor, the disconnect threshold extends from 5 to 15 missed pings. It was proven in CQ WPX CW: 1,048 QSOs run remotely Illinois to Ohio by WT2P at NW8S/KB8O. PGXL/TGXL/Antenna Genius auto-reconnect (#3321) was fixed live mid-contest.
- Category: remote
- Status: shipped v26.5.3 (#2829 in CHANGELOG [v26.5.3])
- Personas: REM, CON
- Without AetherSDR: before the fix, "5 missed pings (about 5 seconds) was enough to … tear down every panadapter". The post says SmartSDR drops frame rate first.
- Cite: BLOG#adaptive-throttle-cq-wpx-cw; CHANGELOG [v26.5.3]; DOCS/low-bandwidth-connections

**Multi-Flex**
- Pitch: Run alongside SmartSDR, Maestro or another AetherSDR on the same radio.
- Description: AetherSDR creates its own slice and panadapter when other clients are connected.
- Category: remote / workflow
- Status: shipped v0.2.2
- Personas: CON (multi-op), REM
- Without AetherSDR: n/a
- Cite: CHANGELOG [v0.2.2]; DOCS/multi-flex

### 2.9 Hardware / control

**Physical controllers**
- Pitch: Knobs, dials and decks: tune without looking.
- Description: Supported devices:
  - FlexControl (plus on-screen AetherControl)
  - Icom RC-28 (native; v26.6.1)
  - Griffin PowerMate
  - Contour ShuttleXpress / ShuttlePro v2 (variable-speed ring tuning v26.10.3)
  - Elgato Stream Deck+ (native USB HID, "no Elgato software and no plugin"; slice-aware v26.8.1)
  - Ulanzi Dial (v26.6.1)
  - ELAD/WoodBoxRadio TMate 2
  - AetherPad
  - USB-serial PTT/CW (HaliKey)

  All device classes are opt-in so that macOS Input Monitoring prompts never appear uninvited.
- Category: hardware/control
- Status: RC-28/PowerMate/Shuttle present by v0.7.18.6; Stream Deck+/Ulanzi/RC-28 native v26.6.1
- Personas: CON ("Contest band changes … one press with visual confirmation"), A11Y, REM
- Without AetherSDR: Elgato software plus plugins (the source says these are no longer needed).
- Cite: README "Tested Controller Devices"; BLOG#release-26-6-1; BLOG#release-26-8-1; GHREL/v26.10.3; DOCS/streamdeck; DOCS/usb-control-surfaces
- Note: SITE still advertises "Stream Deck / StreamController plugins". The docs say these plugins are **no longer shipped** (#5600).

**CTR2 Proxy + AetherCTR2 (Lynovation CTR2-Max)**
- Pitch: A real front panel for your Flex, routed through AetherSDR.
- Description: The CTR2 Proxy relays a CTR2-Max to the radio byte-for-byte as an independent client, over AetherSDR's route (including VPN/tailnet). It never touches AetherSDR's TX paths. Wi-Fi mode works with stock CTR2 firmware. USB mode needs AetherCTR2 or an AetherKnob. AetherSDR installs signed AetherCTR2 releases beside the stock firmware.
- Category: hardware/control
- Status: Proxy shipped v26.10.1 (docs: "Early"). AetherCTR2 0.9.2–0.9.5; installer window in v26.10.3 or later. SITE partner card mentions Lynovation; Lynovation test release on GitHub (2026-10-16).
- Personas: CON, REM
- Without AetherSDR: a CTR2 connecting to the radio directly over LAN, which cannot follow a VPN or tailnet route (source).
- Cite: BLOG#release-26-10-1; DOCS/ctr2-proxy; CTR2REPO; aetherweb firmware/catalog.json

**Amplifiers, tuners, antenna switches, rotators**
- Pitch: The whole station in one window: amp, tuner, switch, rotator.
- Description:
  - 4O3A PGXL / TGXL / Antenna Genius, with front-panel layouts (v26.9.4) and access-code auth (v26.10.1)
  - ShackSwitch
  - ACOM S-series (v26.7.4)
  - SPE Expert 1.3K/1.5K/2K-FA (v26.8.2) and original 1K-FA (v26.10.3), plus a floating LCD mirror (v26.9.2)
  - VK3AMP (v26.8.3)
  - Elecraft KPA500 / KAT500 / KXPA100 (v26.10.3); KPA1500 over TCP (not hardware-validated)
  - RF-KIT RF2K-S
  - TelePost LP-100A wattmeter, read-only (v26.9.2)
  - Green Heron Everyware antenna switch + rotator (v26.9.1)
  - Radio USB-cable management (BCD band decoder etc.)
- Category: hardware/control
- Status: components are dated inline above (4O3A support present by v0.4.10 for Antenna Genius).
- Personas: CON, DX, REM
- Without AetherSDR: for PGXL/TGXL/Antenna Genius, SmartSDR's own utilities (the source says they "reconnect on their own"). For ACOM/SPE/Elecraft, the vendor's own control software **[common knowledge]**.
- Cite: README Supported Hardware; DOCS/amplifiers; DOCS/peripherals; DOCS/shackswitch; DOCS/green-heron-everyware; DOCS/usb-cable-management; BLOG#release-26-8-2; #release-26-8-3; #release-26-9-1; #release-26-9-2; #release-26-9-4; #release-26-10-1; GHREL/v26.10.3

**AetherSweep SWR analyzer**
- Pitch: Sweep your antenna's SWR across the band, drawn on the panadapter.
- Description: Steps a 1 W tune carrier in 20 kHz steps (up to 260 points) across the TX band, within the band plan and a 5 kHz guard. It draws the curve with the resonance point and the bandwidth at SWR ≤ 1.5 / 2.0, and exports CSV. A licence confirmation is required. It refuses while a PGXL is in OPERATE; other amps must be put in standby manually. 60 m is excluded.
- Category: hardware / station
- Status: present by v0.9.4
- Personas: CON (pre-contest antenna check), DX, PORT
- Without AetherSDR: a standalone antenna analyzer (RigExpert, NanoVNA, etc.) **[common knowledge]**.
- Cite: DOCS/aethersweep; SITE; README; CHANGELOG [v0.9.4]

**AetherClock & AetherGPS**
- Pitch: Know your clock offset and position, which matters for FT8 DT.
- Description: AetherClock decodes WWV / WWVH / WWVB, runs a five-stage lock and shows the offset. AetherGPS shows fix, satellites, 10 MHz reference lock, grid square (copy button), station map and radio NTP/GPS clock sync. Position feeds AetherMap, the APRS beacon and callsign bearings.
- Category: hardware / station
- Status: shipped v26.7.4; renamed AetherGPS v26.10.2
- Personas: DIG ("rough guide when looking at FT8 DT"), PORT (grid square)
- Without AetherSDR: NTP or a separate GPS time utility **[common knowledge]**.
- Cite: DOCS/aetherclock-and-gps; BLOG#release-26-7-4

**Radio families beyond Flex (experimental)**
- Pitch: One workstation, more radios.
- Description: All of these sit behind the `IRadioBackend` seam. FlexRadio remains the supported target.
  - Hermes-Lite 2: experimental, RX+TX (v26.7.4 / v26.8.1)
  - Networked Icom: early. IC-705 since v26.8.2; IC-7300MK2 **supported** since v26.9.5.
  - ANAN-G2: experimental, receive-only (v26.9.2)
  - RTL-SDR: experimental, receive-only; bundled in every package (v26.9.2 / v26.10.2)
- Category: hardware
- Personas: PORT (IC-705), NEW (RTL-SDR on a budget)
- Without AetherSDR: n/a
- Cite: README Supported Hardware; BLOG#release-26-8-2; BLOG#release-26-9-2; ROADMAP; DOCS/supported-radios

**Firmware upload (Flex)**
- Pitch: Update Flex firmware from Linux and macOS too.
- Description: Uses the SmartSDR installer you download. Since v26.10.3 a firmware indicator compares against FlexRadio's newest published release.
- Category: workflow
- Status: first version not pinned. Byte-accounting fix v26.9.3; release-comparison indicator v26.10.3.
- Personas: all non-Windows Flex owners
- Without AetherSDR: no sourced comparison (the doc does not say it is Windows-only otherwise).
- Cite: DOCS/firmware-update; GHREL/v26.10.3

### 2.10 Accessibility

**Screen-reader and keyboard accessibility**
- Pitch: Built to be usable with VoiceOver, NVDA, Narrator, JAWS and Orca.
- Description: Every control is named. The S-meter and VFO frequency announce their values once they settle. Custom-painted meters report their readings. Status is given in words, not colour alone. Unavailable controls are dimmed with the reason announced. The first accessibility pass for custom widgets, with a CI check, came in v26.6.4. Copy Assist and the CW decoder add text channels. Keyboard shortcuts are fully assignable.
- Category: workflow / accessibility
- Status: CI-backed pass v26.6.4, ongoing
- Personas: A11Y
- Without AetherSDR: no sourced comparison.
- Cite: DOCS/accessibility; BLOG#release-26-6-4; BLOG#release-26-9-4 ("announces itself through accessibility"); DOCS/keyboard-shortcuts

### 2.11 Project / platform features (promo-relevant)

**Native cross-platform builds**
- Linux AppImage on x86_64 and aarch64 (Raspberry Pi; needs Pi OS Trixie).
- macOS DMG for Apple Silicon and Intel, signed and notarized; requires macOS 14.4 since v26.10.1.
- Windows installer, portable ZIP and Microsoft Store (`winget install aethersdr -s msstore`). Authenticode-signed since v26.10.2.
- GPG-signed releases with SHA256SUMS.
- Qt 6.12 everywhere since v26.10.1.
- Cite: README; SITE; BLOG#release-26-10-1; BLOG#release-26-10-2; BLOG#release-26-8-1.

**docs.aethersdr.com + Log Analyzer**
- User guide with Stable and Next versions, plus a signed PDF manual.
- More than 100 real-radio screenshots.
- Browser-only Log Analyzer that uploads nothing.
- Shipped v26.10.2. Cite: BLOG#release-26-10-2.

**AI-assisted reporting (Help > Submit your Idea, the lightbulb)**
- Creates an AI-assisted bug report or feature request, for non-developers.
- Present by v0.7.18.2.
- Cite: README; SITE; CHANGELOG [v0.7.18.2].

**AetherClaude + governance**
- Triage / implement / review bot with pf firewall, tinyproxy, CodeGuard, Tetragon and Antares-1B vulnerability hunting.
- 14-principle Constitution; human-gated merges.
- Cite: BLOG#one-main-branch; CLAUDEREPO; SITE.

**Aether-gate (partner)**
- Brings Icom/Kenwood/Yaesu/Elecraft CAT rigs, Icom LAN rigs and SoapySDR dongles into AetherSDR as a virtual Flex 6000, with panadapter and waterfall.
- Receive and control only, no transmit. "Very young."
- Proven on IC-9700 and TS-450S. Runs as a Raspberry Pi appliance.
- Cite: GATE README; README.

### 2.12 Roadmap-only / in progress (do not present as shipped)

| Item | Status label | Cite |
|---|---|---|
| aetherd headless engine + versioned control protocol | Committed, "largely landed, finishing now" | ROADMAP; REPO-ROADMAP |
| Transmit arbitration / per-client authorisation | Committed, in progress | ROADMAP |
| Spectrum & audio across the network (compressed frames) | Committed, next | ROADMAP |
| Reference thin client | Committed, next | ROADMAP |
| Browser interface | **Tentative / exploring** | ROADMAP |
| Two radios in one session | **Tentative / exploring** | ROADMAP |
| New radio families: ColibriNANO, Yaesu FT-991 (written, parked), SunSDR, ADALM-Pluto (requested) | **Paused** until the split lands | ROADMAP |
| ANAN-G2 transmit | Future phase | README |
| CTR2 USB link with stock CTR2 | Waits on a CTR2 USB firmware release | BLOG#release-26-10-1 |
| Workspace canvas cross-window drag | Remaining work | README Roadmap |
| Flathub submission | Remaining step | README Roadmap |
| Aether-gate transmit | "next planned feature" | GATE README |
| DVK repeat/CQ automation | Follow-up | GHREL/v26.10.3 |

---

## 3. Key project stats

| Stat | Value | Source | Verification |
|---|---|---|---|
| Licence | GPL-3.0 | GitHub API, README | verified |
| Stack | Qt 6.12 / C++20 | README | verified |
| Repo created | 2026-03-12 | GitHub API | verified |
| Latest release | **v26.10.3 (2026-10-18)**. SITE says v26.10.2, which is stale. | GitHub releases, README | verified |
| Release cadence | Weekly CalVer (`YY.M.patch`) since v26.5.1 (2026-05-10), the "1.0-equivalent" | CHANGELOG, BLOG#release-26-5-1 | verified |
| Platforms | Linux x86_64 + aarch64, macOS (AS + Intel), Windows (installer, portable, MS Store) | README, SITE | verified |
| Stars / forks | 245 / 135 | GitHub API 2026-10-23 | verified (snapshot) |
| Merged PRs | 2,603 total; 1,220 since 2026-07-01 (about 76/wk); 353 in 2026-09-25..10-22 (about 88/wk) | GitHub search API 2026-10-23 | verified |
| PR rate claims | SITE "~85 per week" matches the last 4 weeks. README "roughly 50 PRs a week" is outdated or a lower estimate. | SITE, README | site figure consistent with API |
| Per-release merged changes | v26.10.3: 80; v26.10.2: 106; v26.10.1: 95; v26.9.5: 52; v26.9.4: 97; v26.9.3: 86; v26.9.2: 67; v26.9.1: 53 | blog / release notes | verified (as stated) |
| Contributors | GitHub API: 72 User-type contributors. SITE: 68. LINEAGE: "over 65". Blog (Aug 6): "fifty-odd contributor identities". | GitHub API; SITE; LINEAGE; BLOG#one-main-branch | API count verified; site figures are older snapshots |
| Downloads | SITE / LINEAGE say "48k+" / "more than 48,000". GitHub assets today: 60,714 across all release assets; 39,645 on app `vN` releases; 15,384 asr-models-v1 and 4,704 dfnr-libs helper packages. Older v0.x releases have no assets listed. Microsoft Store installs are not counted. | GitHub API 2026-10-23 | **48k+ unverified** (plausible, method unknown) |
| Code size | about 2,700 commits, 380,000 lines of C++/Qt, about 1,800 PRs (as of Aug 6, 2026) | BLOG#one-main-branch | **unverified** (author's statement) |
| Community | "more than two thousand operators worldwide" | BLOG#one-main-branch | **unverified** |
| AI tools | at least 6 (Claude Code, AetherClaude, Codex, Copilot, Gemini, Aider; README also lists Cursor) | SITE, README, BLOG#one-main-branch | as stated |
| Constitution | 14 principles | SITE, BLOG#one-main-branch | as stated |
| NR engines | **7** (README). SITE says 6, which is stale since v26.9.4. | README | verified in README/CHANGELOG |
| Test target | FLEX-8600 fw 4.2.18 (SmartSDR protocol 1.4.0.0). SmartSDR 4.3 support added v26.10.3. | README, GHREL/v26.10.3 | as stated |

---

## 4. Real screenshots in /home/jeremy/aetherweb/assets/img

| File | What it shows |
|---|---|
| `hero-3dss.jpg` | Full AetherSDR main window. The title bar reads **"AetherSDR v26.6.5"**. 3D stacked-trace panadapter over 40 m CW (7.020–7.085 MHz), slice A at 7.053000 MHz CW, with the CW Extra/Tech and Data DX band-plan strip below. Top-right readout "K2.00 A14 SFI 201 WNB +8 dB". Live waterfall below. On the right: analog S-meter (S4, −104 dBm), RX Controls, TX Controls (TUNE/MOX/ATU), Phone/CW (break-in, iambic, pitch 600), Phone (VOX, DEXP) and an applet button grid (VU, RX, TX, P/CW, WAV, LOCK, PHN, EQ, VUDU, CAT, DAX, TCI, IQ, MTR, MQTT, HLTH, RADE, TUN, AMP, AG, KSDR, PROF). **Inconsistency:** the 3D stacked trace shipped in v26.7.1 per the blog, so this is presumably a pre-release v26.6.5 build. The SITE caption repeats "v26.6.5". |
| `og-image.jpg` | 1200×630 crop of the same hero screenshot (social preview). |
| `pan-multislice.jpg` | Classic 2D view on 20 m: FLEX-8600 (status bar firmware "4.1.5.39794"), three slices. A at 14.263 is SPLIT; B at 14.263 is TX/SWAP; D at 14.300. Visible: DSP side panel (NB, NR, NR2, ANF, NRL, NRS, RNN, RN2, NRF, ANFL, ANFT, BNR); a DIV/ESC beamforming panel with polar plot; S-meter (S5, −95 dBm); Tuner Genius XL applet; TX, Phone, P/CW, EQ; CAT Control (TCP base 4532, per-slice ports A–D); DAX Audio Channels. Status bar shows "STATION: BIGBOX", GPS 17/31, PA 21.1 °C, Network Excellent, TGXL, grid DN18rg, and +PAN/TNF/CWX/DVK/FDX indicators. A "Feature Request" lightbulb button sits top-right. |
| `aetherial-strip.jpg` | The Aetherial Audio channel strip, RX side, from the older single-strip UI before the v26.9.4 AetherRX/AetherTX windows. Top tabs: TX/RX, RADIO, ADSP, AGC-G, EQ, AGC-C, DESS, TUBE, EVO, BYPASS, Presets. NR engine selector: NR2, NR4, MNR, DFNR, RN2, with BNR greyed. NR2 options: Gain Method Linear/Log/Gamma/Trained; NPE OSMS/MMSE/NSTAT. Also visible: Aetherial Gate RX with transfer graph; Aetherial Parametric EQ RX, 10 bands with live SSB passband and E-SSB/SSB/AM-FM regions; Aetherial Compressor RX and De-Esser RX (partly visible). My inference, not a sourced fact: this is probably a macOS build, since MNR is macOS-only. |
| `aetherclaude-dashboard.jpg` | AetherClaude operations dashboard (dev infrastructure, not the radio app). Defense posture 93 "Strong". Counters: firewall 466 blocked, web proxy 268 denied, agent sandbox 14,480 runs, CodeGuard 454 scanned, MCP isolation, validation gate 51 failed. Panels: 24 h agent runs (14), issues & PRs handled (28), Antares findings (14), run success 100 %, eval quality 100 %, "Cycle API cost avoided $403". Also an activity graph, an alerts feed (blocked outbound / Datadog proxy denials) and recent agent activity on issues #4808–#4815. |
| `logo-96.png`, `logo-256.png`, `apple-touch-icon.png` | Project logo / icons (not screenshots). |
| `release-*-hero.svg`, `release-*-card.svg`, `adaptive-throttle-*`, `first-contribution-*`, `one-main-branch-*` | **Generated release and blog art** ("drawn as an AetherSDR spectrum panel"). Not screenshots; do not present them as product UI. |

**Secondary pool of real screenshots:** the AetherSDR repo has **119 real doc screenshots** in `docs/user/static/img/screens/`, served at `https://docs.aethersdr.com/img/screens/<name>.png`. The v26.10.2 post says they come "from a real radio on a real band, with addresses, serials and locations redacted". Examples relevant to this audience: `pan-3d-stacked-trace.png`, `spothub.png`, `spothub-display-tab.png`, `cw-decoder-panel.png`, `cwx-panel.png`, `dvk-panel.png`, `split-pair.png`, `split-badge-menu.png`, `diversity-esc.png`, `mini-pan-applet.png`, `pwr-cross-needle.png`, `smartmtr-flag.png`, `aethermodem-aprs.png`, `copy-assist-panel.png`, `ant-panel-sweep.png`, `aetherrx.png`, `aethertx.png`, `tgxl-applet.png`, `tailnet-remote-access.png`, `multiflex-dashboard.png`, `rtty-decoder-pane.png`, `tci-applet.png`, `net-scheduler-window.png`, `minimal-mode.png`, `main-window.png`. Repo `docs/assets/` also has `screenshot-3dstackedtrace.JPG` (README hero), `gps-location-dashboard.png`, `aetherclock-applet.png` and three `pwr-meter-*` face themes. Repo `docs/screenshots/` has `aethermodem-dstar.png` and `hl2-noise-blanker.png`. None of these were viewed for this report except by filename.

---

## 5. Site vs GitHub discrepancies (fix before copying numbers)

1. **Latest version.** index.html says **v26.10.2**; GitHub and README say **v26.10.3** (2026-10-18).
2. **NR engines.** index.html says **six**; README says **seven** (NNR, v26.9.4).
3. **DAX channels.** index.html says "4 RX + 1 TX"; README says up to **8 RX** (radio-dependent) + 1 TX, and 4 IQ channels.
4. **Receiver browser.** index.html says KiwiSDR only; README says KiwiSDR **and Web-888** (v26.9.3).
5. **Stream Deck plugins.** index.html lists "Stream Deck / StreamController plugins". Docs say the plugins are **no longer shipped** (#5600); Stream Deck+ is now driven natively, and other models go via TCI or the bridge.
6. **PR rate.** SITE "~85/week" matches the last 4 weeks (about 88/wk). README "roughly 50 PRs a week" is lower.
7. **Contributors.** SITE 68, LINEAGE "over 65", GitHub API 72 user contributors.
8. **hero-3dss.jpg.** The title bar shows v26.6.5, but the 3D stacked trace shipped in v26.7.1.
9. **AetherClaude repo URL.** README links `github.com/aethersdr/aetherclaude`, which returns **404**. The working repo is `github.com/ten9876/aetherclaude` (as the blog links).
10. **Copy Assist on Intel Mac.** It was dropped from Intel DMGs in v26.8.1, and the README confirms it is "Not in the Intel macOS build". Neural CW decoders are also not available on Intel Mac.
12. **Release cadence.** LINEAGE says "monthly CalVer release cadence". The releases list shows weekly v26.x tags since July 2026.
11. **macOS minimum.** Since v26.10.1 both DMGs need macOS 14.4. Older copy that says "macOS 12" (from v26.8.1) is stale.

## 6. Unverified or unsupported numbers / claims

- "48k+ lifetime downloads" (SITE, LINEAGE). The GitHub API gives 39,645 for app releases and 60,714 for all assets. Method unknown.
- "~71% less CPU than the QPainter path" (SITE, README). No published measurement found.
- "more than two thousand operators worldwide", "380,000 lines", "2,700 commits" and "~1,800 PRs" (BLOG#one-main-branch, Aug 2026). These are author statements, not independently checked. The API shows 2,603 merged PRs as of 2026-10-23, which is consistent with growth.
- "a single orchestrated run … can fan out to ninety [agents]" (blog). Author statement.
- RADE "SNRs down to −2 dB" is FreeDV's own claim (SITE partner card), not measured by AetherSDR.
- The AetherModem demodulator "out-copied both Dire Wolf and Graywolf" rests on one overnight run of 1,875 packets (blog). This is a single test, not a benchmark.
- Any "without AetherSDR" line marked [common knowledge] is not source-backed.
