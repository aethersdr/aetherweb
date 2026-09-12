# Roadmap — AetherSDR

> What AetherSDR has shipped, what is being built now, and why new radio families are deliberately paused until the headless engine split is finished.

Source: <https://www.aethersdr.com/roadmap>

Roadmap

## One engine, many front ends

AetherSDR is being split in two: an engine that owns the radio, and an interface that talks to it over a versioned protocol. Everything here either builds toward that split or waits for it. Phases are an order of work, not dates — a piece ships when it is right rather than when a calendar says so.

Release view

Progress

Radios Engine Interfaces Across everything Released Committed Tentative Paused

**Shipped**available now*6*

ReleasedRadios

#### One interface for every radio

Supporting a new model became a self-contained piece of work instead of a change threaded through the whole application.

v26.7.4

ReleasedRadios

#### Hermes-Lite 2

Receive and transmit, with the signal chain running on your computer.

v26.7.4

ReleasedRadios

#### Networked Icom

Control and audio over the network, with each model's real capabilities read from the radio rather than assumed.

v26.8.2

ReleasedRadios

#### ANAN-G2 and RTL-SDR receive

openHPSDR Protocol 2 and RTL dongles, both demodulating through the same chain.

shipped

ReleasedEngine

#### The engine as a library

What makes a build with no interface attached possible at all.

shipped

ReleasedAcross everything

#### Transmit safeguards

Every intent that can key a transmitter passes the same refusal checks — including the antenna tuner, which had slipped through.

continuing

**Building now**in progress*3*

CommittedEngine

#### The control protocol

The engine describes what the radio can do; the interface subscribes to what it needs. Both upgrade independently.

ships with transmit arbitration

CommittedEngine

#### Transmit arbitration and per-client authorisation

Exactly one client may key the transmitter, and each is authorised separately. Never lands after the protocol — always with it.

ships with the protocol

CommittedAcross everything

#### Honest capability reporting

A control that quietly stops matching the radio is worse than one that is plainly unavailable.

in progress

**Next**after the above*2*

CommittedEngine

#### Spectrum and audio across the network

Shared memory on one machine, compressed frames over a link, so a remote interface gets the same waterfall as one sitting at the radio.

needs the protocol first

CommittedInterfaces

#### A reference thin client

Part of the desktop, ported to speak the protocol — proof the boundary is complete. If a real interface can be built on it, so can any other.

after the data plane

**Exploring**designed before built*3*

TentativeInterfaces

#### A browser interface

Once the protocol carries everything the desktop needs, this is an interface problem rather than a radio one.

follows the protocol

TentativeInterfaces

#### Two radios in one session

Needs decisions about audio routing, settings separation and which radio a transmit request means, before any of it is code.

design first

PausedRadios

#### New radio families

Four are written or requested. They wait until the split lands — see below for why, and why paused is not declined.

paused on purpose

#### Why new radios are paused

Each additional radio multiplies work on a boundary that is still moving: capability reporting is not yet consistent across the radios we already support, the original FlexRadio path still bypasses part of the new data route, and the conversion of the command path has not started. Adding a seventh and eighth radio now would mean doing each of those conversions twice more, against code that is changing underneath them. Finishing first makes every radio after it cheaper to add and safer to review.

ColibriNANO — parked Yaesu FT-991 — parked Expert Electronics SunSDR — queued ADALM-Pluto — queued

Parked is not declined. Two of these are finished, reviewed contributions waiting on sequencing rather than quality, and the work is credited to the people who wrote it. Radios we already support keep getting fixes throughout.

#### What the labels mean

**Released** is in a build you can download today. **Committed** has been reviewed and is being built or is definitely next. **Tentative** is wanted and thought about, but the design is not settled and it may move. **Paused** is a deliberate hold, not a rejection.

#### Shaping what comes next

This roadmap is written in public and argued about in public. Feature requests, radio support and design disagreements live in the issue tracker, and the decisions behind them are written down rather than announced.

[Issue tracker](https://github.com/aethersdr/AetherSDR/issues) [Discussions](https://github.com/aethersdr/AetherSDR/discussions)
