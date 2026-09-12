# Roadmap — AetherSDR

> What AetherSDR has shipped, what is being built now, and why new radio families are deliberately paused until the headless engine split is finished.

Source: <https://www.aethersdr.com/roadmap>

Roadmap

## One engine, many front ends

AetherSDR is being split in two: an engine that owns the radio, and an interface that talks to it over a versioned protocol. Everything below either builds toward that split or waits for it. The columns are an order of work, not dates — we ship a piece when it is right rather than when a calendar says so.

Work

**Shipped**available now

**Building now**in progress

**Next**after the above

**Exploring**designed before built

Radios

**One interface for every radio**A new model became a self-contained piece of work instead of a change threaded through the whole application.

v26.7.4 · shipped

**Hermes-Lite 2**Receive and transmit, with the signal chain running on your computer.

v26.7.4 · shipped

**Networked Icom**Control and audio over the network, with each model's real capabilities read from the radio.

v26.8.2 · shipped

**ANAN-G2 and RTL-SDR receive**openHPSDR Protocol 2 and RTL dongles, both demodulating through the same chain.

shipped

**New radio families**Deliberately paused. Four are written or requested — see below for why they wait.

paused until the split lands

The engine

**The engine as a library**What makes a build with no interface attached possible at all.

shipped

**The control protocol**The engine describes what the radio can do; the interface subscribes to what it needs. Both upgrade independently.

in progress

**Transmit arbitration and per-client authorisation**Exactly one client may key the transmitter, and each is authorised separately.

in progress

These two ship together, never one after the other.

same release

**Spectrum and audio across the network**Shared memory on one machine, compressed frames over a link, so a remote interface gets the same waterfall.

next

Interfaces

**The native desktop application**Linux, macOS and Windows. Maintained and improved throughout, not frozen while the split happens.

shipped, and continuing throughout

**A reference thin client**Part of the desktop, ported to speak the protocol — proof the boundary is complete.

next

**A browser interface**Once the protocol carries everything the desktop needs, this is an interface problem rather than a radio one.

exploring

**Two radios in one session**Needs decisions about audio routing, settings separation and which radio a transmit request means.

exploring

Across everything

**Transmit safeguards**Every intent that can key a transmitter passes the same refusal checks — including the antenna tuner, which had slipped through.

shipped, and hardened as the split proceeds

**Honest capability reporting**A control that quietly stops matching the radio is worse than one that is plainly unavailable.

in progress

Shipped Building now Next Exploring Paused on purpose │ the line marks today

Scroll the chart sideways to see later phases.

#### Why new radios are paused

Each additional radio multiplies work on a boundary that is still moving: capability reporting is not yet consistent across the radios we already support, the original FlexRadio path still bypasses part of the new data route, and the conversion of the command path has not started. Adding a seventh and eighth radio now would mean doing each of those conversions twice more, against code that is changing underneath them. Finishing first makes every radio after it cheaper to add and safer to review.

ColibriNANO — parked Yaesu FT-991 — parked Expert Electronics SunSDR — queued ADALM-Pluto — queued

Parked is not declined. Two of these are finished, reviewed contributions waiting on sequencing rather than quality, and the work is credited to the people who wrote it. Radios we already support keep getting fixes throughout.

#### Why the split is worth doing

Today the interface and the radio engine are one program, so the engine cannot run without a screen and the interface cannot be replaced without rebuilding everything. Separating them lets the engine run headless next to the radio, lets another device drive it across the network, and puts every transmit safeguard in one place below the boundary where no client can talk its way past it.

#### Shaping what comes next

This roadmap is written in public and argued about in public. Feature requests, radio support and design disagreements live in the issue tracker, and the decisions behind them are written down rather than announced.

[Issue tracker](https://github.com/aethersdr/AetherSDR/issues) [Discussions](https://github.com/aethersdr/AetherSDR/discussions)
