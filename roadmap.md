# Roadmap — AetherSDR

> What AetherSDR has shipped, what is being built now, and why new radio families are deliberately paused until the headless engine split is finished.

Source: <https://www.aethersdr.com/roadmap>

Roadmap

## One engine, many front ends

AetherSDR is being split in two: an engine that owns the radio, and an interface that talks to it over a versioned protocol. Everything here either builds toward that split or waits for it. Phases are an order of work, not dates — a piece ships when it is right rather than when a calendar says so.

Release view

Progress Tracker

Expand all categories

Collapse all categories

10 releases · 57 entries · newest on the right

v26.7.1 Released, 2 Jul 2026 The 3D stacked-trace spectrum

Spectrum & Display2 entries

**3D stacked-trace spectrum**

Perspective FFT history with floor-anchored ridges, drawn on the GPU.

**60 fps panadapters**

The spectrum path reaches 60 frames per second.

Receive & Audio1 entry

**In-process NVIDIA BNR**

Broadband noise reduction without a separate helper process.

Transmit & CW1 entry

**Transmit meter readouts**

Numeric readouts alongside the transmit meters.

v26.7.2 Released, 12 Jul 2026 An MCP server, the backend seam, BNR on RTX 50-series

Receive & Audio1 entry

**BNR on RTX 50-series**

NVIDIA broadband noise reduction running on the current generation.

Data Modes & Spotting1 entry

**D-STAR over ThumbDV**

Local digital voice through a ThumbDV dongle.

Automation & Agents1 entry

**An MCP server for AI agents**

The application exposes its own actions to agents over MCP.

Core & Platform2 entries

**The aetherd radio-backend seam**

The first cut of the interface every radio now sits behind.

**Searchable Radio Setup**

Settings can be found by name rather than by hunting pages.

v26.7.3 Released, 19 Jul 2026 Cross-needle metering and operating polish

Radios1 entry

**Radio, display and slice fidelity**

State follows the radio more closely across display and slice controls.

Station Control1 entry

**Cross-needle meter**

Forward power, reflected power and SWR read from one instrument.

v26.7.4 Released, 26 Jul 2026 Demo mode, on-device speech-to-text, experimental Hermes-Lite 2

Radios1 entry

Experimental **Experimental Hermes-Lite 2**

The first radio family behind the new backend boundary.

Receive & Audio2 entries

**Copy Assist**

On-device speech-to-text over received audio. Nothing leaves the machine.

**NR2 spectral noise reduction**

A second noise-reduction stage alongside the existing ones.

Core & Platform2 entries

**The radio boundary**

Every radio moves behind one internal interface, which is what makes a headless engine possible.

**Demo mode**

A synthetic radio with spectrum and audio, so the application can be explored with no hardware at all.

v26.8.1 Released, 2 Aug 2026 Hermes-Lite 2 grows up, settings move to SQLite

Radios1 entry

**Hermes-Lite 2 grows up**

The experimental backend becomes usable day to day.

Data Modes & Spotting1 entry

**TCI PTT routing fixed**

Transmit requests from TCI clients reach the right place.

Core & Platform3 entries

**The client settings store moves to SQLite**

A durable store replacing the previous file format.

RFC #4603

**The interface follows what the radio can do**

Controls are gated on capabilities the radio reports rather than on its model name.

**Qt 6.8 across every build**

One toolkit version on all three platforms.

v26.8.2 Released, 9 Aug 2026 A third radio family: networked Icom

Radios2 entries

**Networked Icom**

A third radio family, starting with the IC-705 over its network interface.

**Notches and frequency calibration for Hermes-Lite 2**

Manual notches, plus calibration of the radio's frequency reference.

Transmit & CW1 entry

**CW timing to spec**

Element and gap timing measured against the specification rather than by feel.

Station Control1 entry

**SPE Expert amplifiers**

Control and status for the SPE Expert range.

Data Modes & Spotting1 entry

**Three new spot overlays**

More sources drawn over the panadapter.

v26.8.3 Released, 16 Aug 2026 The workspace canvas, an Icom command scheduler, a real BFO

Radios3 entries

**A CI-V command scheduler**

Commands to Icom radios are paced rather than queued blindly.

#5006

**IC-7300MK2 remote controls and meters**

Controls, metering and certification for the MK2.

#4981

**Ask the radio for its own CI-V address**

The address is read from the radio instead of configured by hand.

#4991

Spectrum & Display3 entries

**The workspace canvas**

Panes arranged freely on a canvas, with persistence and a migration from the Classic layout.

#4900

**Named workspaces**

Full recall, profile bindings and pop-out import.

#4964

**Additional canvas windows**

More than one canvas window at a time.

#4971

Receive & Audio1 entry

**A noise blanker and a real BFO for Hermes-Lite 2**

Host-side noise blanking, and a BFO that places the passband where the marker is.

Transmit & CW1 entry

**The transmit voice chain moves to 48 kHz float**

Higher rate and float precision through the whole voice path.

Station Control1 entry

**VK3AMP amplifiers**

Support for the VK3AMP amplifier family.

v26.8.4 Released, 22 Aug 2026 Evidence-backed Icom, client-timed HL2 CW, faster maps

Radios1 entry

**The radio's own mode vocabulary reaches the UI**

Modes are read from the radio rather than mapped onto an assumed list.

#5106

Spectrum & Display1 entry

**Faster PSK Reporter maps**

The reception map redraws noticeably faster.

Receive & Audio1 entry

**Steadier audio and noise reduction**

Fixes across the receive chain and the noise-reduction stages.

Transmit & CW2 entries

**CI-V CW text keying**

Text keying over CI-V, sent as CWK.

#5113

**Client-timed CW on Hermes-Lite 2**

Element timing is generated on the computer, where the keyer's schedule is known.

Station Control1 entry

**Steadier controllers, MIDI and TCI**

Control-surface and TCI handling hold their state more reliably.

v26.9.1 Released, 29 Aug 2026 Globe maps, antenna control and operator polish

Radios2 entries

**Radio-authoritative memories and signalling**

Memory contents and signalling follow the radio rather than a local guess.

**More accurate IC-9700 controls and telemetry**

Controls and readouts match what the radio actually reports.

Spectrum & Display1 entry

**Optional globe projection for PSK Reporter**

The reception map can be drawn on a globe instead of a flat projection.

#5273

Station Control1 entry

**Green Heron Everyware antenna control**

Rotator control from the station, alongside the existing peripherals.

#5209

Data Modes & Spotting1 entry

**RTTY decoder sensitivity**

The decoder copies weaker signals than it previously would.

#5132

Core & Platform1 entry

**System Info gains Threads and Logs tabs**

Diagnostics for support, without leaving the application.

#5246

v26.9.2 Released, 6 Sep 2026 New receivers, multi-band skimming and station control

Radios3 entries

Experimental **Experimental ANAN-G2 reception**

openHPSDR Protocol 2 discovery, a single receive path, spectrum and audio, with live tuning and zoom. Receive only for now.

#5143

Experimental **Experimental RTL-SDR USB reception**

A single slice and panadapter with AM, FM, SSB and CW demodulation, on builds carrying the RTL libraries.

#4862

**Icom identified from the wire**

Model identification and optional wake on connect replace reliance on an editable network nickname.

#5438

Transmit & CW2 entries

**Recordings capture sent CW**

Client-side recordings capture the keyed signal instead of microphone input.

#5278

**CWX sidetone follows the keyer**

The sidetone tracks the keyer's scheduled edges rather than drifting from them.

#5129

Station Control2 entries

**SPE floating front panel**

A live amplifier LCD mirror with guarded front-panel keys.

#5393

**TelePost LP-100A wattmeter**

Readings over local serial or a serial-to-network proxy. Read-only in this first version.

#5320

Data Modes & Spotting2 entries

**Four concurrent TCI DAX IQ subscriptions**

Several CW skimmers through one TCI server. Receivers on one panadapter share its IQ stream.

#4951

**KiwiSDR directory from the CDN mirror**

The public-receiver browser reads its directory from the AetherSDR mirror, and stale data is advisory rather than fatal.

#5445, #5449

Core & Platform1 entry

**Headless engine and packaging**

Further work toward the engine that runs with no interface attached.

Scroll sideways for earlier releases — the full history is in the changelog.

#### Why new radios are paused

Each additional radio multiplies work on a boundary that is still moving: capability reporting is not yet consistent across the radios we already support, the original FlexRadio path still bypasses part of the new data route, and the conversion of the command path has not started. Adding a seventh and eighth radio now would mean doing each of those conversions twice more, against code that is changing underneath them. Finishing first makes every radio after it cheaper to add and safer to review.

ColibriNANO — parked Yaesu FT-991 — parked Expert Electronics SunSDR — queued ADALM-Pluto — queued

Parked is not declined. Two of these are finished, reviewed contributions waiting on sequencing rather than quality, and the work is credited to the people who wrote it. Radios we already support keep getting fixes throughout.

#### What the labels mean

**Released** is in a build you can download today. **Committed** has been reviewed and is being built or is definitely next. **Tentative** is wanted and thought about, but the design is not settled and it may move. **Paused** is a deliberate hold, not a rejection.

#### Shaping what comes next

This roadmap is written in public and argued about in public. Feature requests, radio support and design disagreements live in the issue tracker, and the decisions behind them are written down rather than announced.

[Issue tracker](https://github.com/aethersdr/AetherSDR/issues) [Discussions](https://github.com/aethersdr/AetherSDR/discussions)
