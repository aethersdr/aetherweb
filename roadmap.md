# Roadmap — AetherSDR

> What AetherSDR has shipped, what is being built now, and why new radio families are deliberately paused until the headless engine split is finished.

Source: <https://www.aethersdr.com/roadmap>

Roadmap

## One engine, many front ends

AetherSDR is being split in two: an engine that owns the radio, and a user interface that talks to it over a versioned protocol. Everything below either builds toward that split or waits for it. Phases are an order of work, not dates — we ship when a piece is right rather than when a calendar says so.

### Why the split is worth doing

Today the interface and the radio engine are one program, so the engine cannot run without a screen and the interface cannot be replaced without rebuilding everything. Separating them means the engine can run headless on the machine next to the radio, a second device can drive it across the network, and a browser or a text interface becomes possible without touching radio code. It also means every transmit safeguard lives in one place, below the boundary, where no client can talk its way past it.

6

Radio families behind one interface

3

Native platforms, no emulation

1

Engine, once the split lands

GPL

v3, all of it

#### Shipped

available now

##### The radio boundary v26.7.4

Every radio now sits behind one internal interface, so support for a new model is a self-contained piece of work rather than a change threaded through the whole application. The engine also became a library in its own right, which is what makes a headless build possible at all.

##### Hermes-Lite 2 v26.7.4

Direct-sampling receive and transmit with the signal processing running on your computer, including the noise reduction, filters and transmit chain you already use on a FlexRadio.

##### Networked Icom v26.8.2

Control and audio over the network for Icom transceivers that speak it, with each model's real capabilities read from the radio rather than assumed.

##### ANAN-G2 and RTL-SDR receive

Receive support for Apache Labs ANAN over openHPSDR Protocol 2, and for RTL-SDR dongles. Both demodulate on your computer through the same signal chain.

##### Transmit safeguards, tightened

Every intent that can key a transmitter — including the antenna tuner, which had slipped through — now passes the same refusal checks, and the engine reports a blocked control instead of silently doing nothing.

#### Building now

in progress

##### The control protocol

A versioned conversation between engine and interface: the engine describes what the connected radio can actually do, the interface subscribes to what it needs, and both sides can be upgraded independently.

##### Transmit arbitration and per-client authorisation

Once more than one client can reach the engine, exactly one of them may key the transmitter at a time, and each is authorised separately. This lands together with the protocol rather than after it — a scriptable interface that could reach the transmitter before the guard existed is not something we ship, even briefly.

##### Honest capability reporting

Radios revise what they can do mid-session, and a control that quietly stops matching the radio is worse than one that is plainly unavailable. Every backend is being made to announce its changes so the interface never shows a control the radio cannot honour.

#### Next

after the above

##### Spectrum and audio across the network

A dedicated path for the heavy data, shared memory on the same machine and compressed frames over a network link, so a remote interface gets the same waterfall and audio as one sitting at the radio.

##### A reference thin client

Part of the existing desktop interface, ported to speak the protocol instead of calling the engine directly. It exists to prove the boundary is complete — if a real interface can be built on it, so can any other.

#### Exploring

designed before built

##### A browser interface

Once the protocol carries everything the desktop needs, a web client is an interface problem rather than a radio one. It follows the proven protocol rather than leading it.

##### Two radios in one session

Running a second receiver alongside your main radio — a remote antenna, a second site, a receive-only source — needs decisions about audio routing, settings separation and which radio a transmit request means, before any of it is code.

### Why new radios are paused

We are not adding support for new radio families until the engine split is finished. Each additional radio multiplies work on a boundary that is still moving: capability reporting is not yet consistent across the radios we already support, the original FlexRadio path still bypasses part of the new data route, and the conversion of the command path has not started. Adding a seventh and eighth radio now would mean doing each of those conversions twice more, against code that is changing underneath them.

Finishing first makes every radio after it cheaper to add, safer to review, and less likely to arrive with the quiet gaps that are expensive to find later.

ColibriNANO — parked Yaesu FT-991 — parked Expert Electronics SunSDR — queued ADALM-Pluto — queued

Parked is not declined. Two of these are finished, reviewed contributions waiting on sequencing rather than quality, and the work is credited to the people who wrote it. Radios we already support keep getting fixes and improvements throughout.

### Shaping what comes next

This roadmap is written in public and argued about in public. Feature requests, radio support and design disagreements all live in the issue tracker, and the decisions behind them are written down rather than announced. If something here matters to your station, the discussion is the place to say so.

[Issue tracker](https://github.com/aethersdr/AetherSDR/issues) [Discussions](https://github.com/aethersdr/AetherSDR/discussions) [Sponsor the work](https://opencollective.com/aethersdr)
