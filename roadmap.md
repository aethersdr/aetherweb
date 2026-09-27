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

v26.9.3 Released, 13 Sep 2026 A Tools-first menu bar, live map overlays and APRS digipeating

Station Control1 entry

**A Tools-first menu bar**

The operating tools gather under one Tools menu ahead of View. Shortcuts and behaviour are unchanged; only where things live moves.

#5595

Spectrum & Display2 entries

**Clock-aligned waterfall time markers**

UTC-labelled lines at 15 s to 15 minute intervals, pinned to the rows they were captured with. Off by default.

#5538

**Weather radar and night lights on PSK Reporter**

NOAA radar with playback and the NASA city-lights basemap, with retry handling so a transient tile failure no longer blanks the layer.

#5477 · #5479

Data Modes & Spotting2 entries

**APRS WIDE1-1 fill-in digipeater**

An AetherModem tab that needs a valid callsign and explicit per-session arming, and never restores arming from settings.

#5562

**Web-888 as its own receiver family**

Saved receivers keep their family, and an unchanged zoom is actually resent to the receiver.

#5529 · #5530

Core & Platform2 entries

**The Runtime Monitor Overview**

CPU, resident memory and GUI tick lag as cards and charts over 1 min to 1 h.

#5427 · #5531

**The backend seam, pinned by tests**

The IRadioBackend threading and lifetime contract is pinned, and the capability surface is frozen in CI.

#5573

v26.9.4 Released, 20 Sep 2026 AetherRX and AetherTX, Neural Noise Reduction and worldwide precipitation

Receive & Audio2 entries

**AetherRX and AetherTX, one window each**

The stage column is the chain: enable and drag each stage, with a profile library per side.

#5805 · #5819

**WDSP 2.10 and Neural Noise Reduction**

NNR becomes the seventh client-side NR method, and NR2 gains WDSP’s psychoacoustic post-processing.

#5686 · #5687 · #5703

Spectrum & Display1 entry

**Global precipitation on the PSK Reporter map**

An opt-in LibreWXR overlay with NOAA, ECCC and EUMETNET OPERA regional backups and a per-provider legend.

#5705

Radios2 entries

Experimental **The Hermes-Lite 2 transmits through WDSP**

The TXA modulator is the default after on-air testing, the ALC only reduces, and modes it cannot transmit are declared.

#5747 · #5779

**S-meters that read the average**

Both raw-IQ backends stop reading a decaying peak-hold that sat 11–14 dB above the noise floor.

#5785

Station Control1 entry

**TGXL and PGXL front panels**

Both 4O3A applets lay out like the device’s own panel, and the tuner is metered from its own peak while keyed.

#5676 · #5694

v26.9.5 Released, 27 Sep 2026 Split that remembers, stereo noise reduction and a fuller ANAN-G2

Transmit & CW2 entries

**Split remembers your audio**

The transmit slice’s mute, level and pan come back on every split, with Monitor TX and Split Up 1 / 5 / 10 kHz.

#5922

**AetherRX and AetherTX live controls**

BYPASS, REC and PLAY at the foot of each stage column, and TX Playback of the last recording.

#5913

Receive & Audio1 entry

**Stereo noise reduction on every method**

Left and right are denoised independently, so a pan is instant and diversity keeps one antenna per ear.

#5971

Radios3 entries

Experimental **The ANAN-G2 panadapter, S-meter and noise blanker**

WDSP’s display analyzer at one point per pixel, a moving S-meter, the impulse blanker and RF-gain attenuation.

#5814 · #5818 · #5820 · #5824 · #5920

Experimental **The Hermes-Lite 2 hears 84 ms sooner**

Minimum-phase RX filtering outside CW, and no more PA carrier in the receiver after an unkey.

#5954 · #5850

**The IC-7300MK2 is supported**

Over built-in Ethernet/RS-BA1 it connects without the experimental badge or disclaimer.

#5871

Station Control1 entry

**A Window menu**

The open windows with Minimize, Zoom, Full Screen and Bring All to Front. Minimal Mode moves to Ctrl+Shift+M.

#5891

Scroll sideways for earlier releases — the full history is in the changelog.

Expand all deliverables

Collapse all

16 deliverables · 30 steps

Radios Engine Interfaces Across everything Released Committed Tentative Paused

Deliverable

**Shipped**available now

**Building now**in progress

**Next**after the above

**Exploring**designed before built

Radios

**One interface for every radio**Released

Every radio sits behind one internal interface.

shipped

**Hermes-Lite 2**Released

Receive and transmit, signal chain on your computer.

shipped

**Networked Icom**Released

Capabilities read from the radio rather than assumed.

shipped

**ANAN-G2 and RTL-SDR receive**Released

Receive paths for two more families.

shipped

**New radio families**Paused4 steps

Four written or requested, held until the split lands.

paused until the split lands

ColibriNANO — written, in review

paused

Yaesu FT-991 — written, in review

paused

Expert Electronics SunSDR — requested

paused

ADALM-Pluto — requested

paused

The engine

**The engine as a library**Released

What makes a build with no interface attached possible.

shipped

**The control protocol**Committed5 steps

A versioned conversation between engine and interface.

largely landed, finishing now

Versioned envelope and bounded codec

done

Capability descriptor in the handshake

done

Typed resources, snapshots and events

done

Session resync and bounded coalescing

done

An honest capability descriptor before it is frozen

**Transmit arbitration and authorisation**Committed5 steps

One client may key the transmitter; each is authorised separately.

in progress

Engine-owned operation and cancellation guards

Desktop transmit paths migrated

Per-client actor propagation

Scheduled expiry and qualified stop

Queued audio and wire fences

Ships in the same release as the control protocol, never after it.

same release

**Honest capability reporting**Committed3 steps

A control that stops matching the radio is worse than one plainly unavailable.

in progress

Every backend announces its revisions

Panadapter capacity read from the radio

A conformance suite across every backend

**One command path for every radio**Committed3 steps

Today some controls speak a FlexRadio-only dialect that other radios discard.

in progress

Freeze the count so it can only shrink

Move the FlexRadio path behind the boundary

Convert the remaining controls by area

**Spectrum and audio across the network**Committed3 steps

So a remote interface gets the same waterfall as one at the radio.

next

Shared memory on the same machine

Compressed frames over a network link

Bounded queues — newest frame wins

Interfaces

**The native desktop application**Released

Linux, macOS and Windows. Improved throughout, not frozen while the split happens.

shipped, and continuing throughout

**A reference thin client**Committed2 steps

Proof the boundary is complete.

next

Port one pane to speak the protocol

Close whatever the port proves is missing

**A browser interface**Tentative

An interface problem rather than a radio one.

exploring

**Two radios in one session**Tentative5 steps

Design decisions first, code second.

exploring

Who creates and tears down a second session

Audio routing when there are two

Settings and profiles kept apart

Port allocation for the second radio

Which radio a transmit request means

Across everything

**Transmit safeguards**Released

Every intent that can key a transmitter passes the same refusal checks.

shipped, hardened as the split proceeds

Scroll the chart sideways to see later phases.

#### Why new radios are paused

Each additional radio multiplies work on a boundary that is still moving: capability reporting is not yet consistent across the radios we already support, the original FlexRadio path still bypasses part of the new data route, and the conversion of the command path has not started. Adding a seventh and eighth radio now would mean doing each of those conversions twice more, against code that is changing underneath them. Finishing first makes every radio after it cheaper to add and safer to review.

ColibriNANO — parked Yaesu FT-991 — parked Expert Electronics SunSDR — queued ADALM-Pluto — queued

Parked is not declined. Two of these are finished, reviewed contributions waiting on sequencing rather than quality, and the work is credited to the people who wrote it. Radios we already support keep getting fixes throughout.

#### What the labels mean

**Released** is in a build you can download today. **Committed** has been reviewed and is being built or is definitely next. **Tentative** is wanted and thought about, but the design is not settled and it may move. **Paused** is a deliberate hold, not a rejection.

#### Shaping what comes next

This roadmap is written in public and argued about in public. Feature requests, radio support and design disagreements live in the issue tracker, and the decisions behind them are written down rather than announced.

[Issue tracker](https://github.com/aethersdr/AetherSDR/issues) [Discussions](https://github.com/aethersdr/AetherSDR/discussions)
