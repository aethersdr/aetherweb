# Blog — AetherSDR

> Release notes, engineering deep-dives, and station notes from the AetherSDR project — the native amateur-radio workstation for FlexRadio transceivers.

Source: <https://www.aethersdr.com/blog>

From the project

### The AetherSDR blog

Release notes, engineering deep-dives, and notes from the bench — how the workstation gets built, and what's landing next.

[![A contribution pipeline drawn as a signal chain — issue, fix, merged — over a spectrum trace](https://www.aethersdr.com/assets/img/first-contribution-card.svg) Pinned July 26, 2026 8 min read Your first contribution to AetherSDR You no longer need to be a C++ programmer to fix something in this project. You need judgement, a radio, and the patience to check work — the same things that make a good Elmer. Here's what an AI coding agent changes about contributing, and what it very deliberately doesn't.](#first-contribution) [![v26.8.1 release art — settings that survive, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-8-1-card.svg) August 2, 2026 10 min read v26.8.1: settings that survive, and a way in when they don’t Your settings stop being an XML file and become a database — transactional saves, verified backups, and credentials moved out to your OS keychain. Then the part that matters when it goes wrong: a config editor that runs without the GUI, because the escape hatch can’t depend on the thing it’s rescuing.](#release-26-8-1) [![v26.7.4 release art — speech to text, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-4-card.svg) July 26, 2026 10 min read v26.7.4: Copy Assist, and the eight milliseconds that ate half the audio AetherSDR now transcribes received voice on your own machine — whisper.cpp under the waterfall, confidence colour-coding, no audio leaving the computer unless you send it. Then the deep end: why it sounded broken with NR2 engaged, and how a repaint optimisation was quietly discarding half the speech.](#release-26-7-4) [![v26.7.3 release art — meters you can trust, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-3-card.svg) July 19, 2026 5 min read v26.7.3: the cross-needle returns A cross-needle PWR/SWR applet brings the classic forward-power, reflected-power, and SWR view into AetherSDR — the meter where the reading is the crossing point. The analog S-meter gains configurable face themes, and the SWR response and scale maths got more accurate underneath.](#release-26-7-3) [![v26.7.2 release art — digital voice, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-2-card.svg) July 12, 2026 7 min read v26.7.2: D-STAR, locally, with a dongle Complete local D-STAR through a connected ThumbDV hardware vocoder — receive and transmit digital voice, headers, callsigns, repeater routing, and 20-character messages. Software AMBE is deliberately not included, and the reason is worth explaining. Plus an MCP server and Blackwell GPU support for BNR.](#release-26-7-2) [![v26.7.1 release art — the band, over time, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-1-card.svg) July 2, 2026 7 min read v26.7.1: the spectrum stands up A 2D/3D toggle turns the panadapter into a perspective stacked-trace surface — a rolling history of FFT traces receding into the distance, so you can watch a band's activity build rather than only seeing the live sweep. Ridge height is anchored to the measured noise floor, and the whole path runs at 60 fps.](#release-26-7-1) [![v26.6.5 release art — diversity across geography, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-5-card.svg) June 28, 2026 6 min read v26.6.5: aligning a Flex with a receiver a thousand miles away KiwiSDR receive sync uses GCC-PHAT correlation to time-align your Flex with a public Kiwi in both audio and the waterfall, so a diversity pair separated by a continent stays phase-coherent. Plus SmartMTR transmit meters and a profile-switcher applet.](#release-26-6-5) [![v26.6.4 release art — receivers worldwide, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-4-card.svg) June 23, 2026 6 min read v26.6.4: listening from somewhere else A KiwiSDR public-receiver browser lands — find and connect to public receivers worldwide, entirely independent of the FlexRadio path. It's deliberately policy-aware rather than pretending the world's volunteer-run receivers are a free API, and it physically cannot transmit.](#release-26-6-4) [![v26.6.3 release art — satellite data, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-3-card.svg) June 14, 2026 6 min read v26.6.3: WFM, and 9600-baud satellite work A per-slice WFM demodulator built specifically for G3RUH 9600-baud satellite telemetry — DAX IQ through Doppler correction, exact resampling, and a flat discriminator into a virtual audio cable. Plus an APRS client and a PSK Reporter map on a new reusable mapping engine.](#release-26-6-3) [![v26.6.2 release art — a complete packet station, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-2-card.svg) June 8, 2026 7 min read v26.6.2: your radio is now the TNC AetherModem grows from a decoder into a full packet station — a KISS-over-TCP TNC server for any host app, a connected-mode AX.25 terminal that calls a real BBS, and a personal mailbox that answers. All over the built-in 1200-baud AFSK modem, with no external TNC hardware anywhere in the chain.](#release-26-6-2) [![v26.6.1 release art — hands on the radio, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-1-card.svg) June 1, 2026 6 min read v26.6.1: knobs, dials, and physical controls Three new classes of physical controller land — the Elgato Stream Deck+, the Ulanzi Dial, and native Icom RC-28 support — all opt-in by design so macOS never prompts for Input Monitoring unless you actually enable one. Plus a seven-year-old noise-reduction crackle finally traced to a Bessel function.](#release-26-6-1) [![v26.5.3 release art — aetherial tx complete, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-5-3-card.svg) May 24, 2026 7 min read v26.5.3: the de-esser that was costing you 30 watts The Aetherial transmit path reaches feature-complete with a PAPR processor and a split-band de-esser. The de-esser rewrite is the interesting one: the old broadband implementation was quietly pulling roughly 30 W of forward power out of voice content, and the fix is a single change in how the gain is applied.](#release-26-5-3) [![v26.5.2.1 release art — aethermodem, phase 0, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-5-2-1-card.svg) May 17, 2026 6 min read v26.5.2.1: a packet decoder of our own AetherModem lands as a native HDLC/AX.25 receiver — a 21-lane phase bank, FCS validation, and a dedicated Packet Decode dialog, with RX live on 300-baud HF and 1200-baud VHF. Also the story of why this release has a fourth version digit, which turns out to be about one string in a device-identity handshake.](#release-26-5-2-1) [![v26.5.1 release art — the 1.0 release, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-5-1-card.svg) May 10, 2026 6 min read v26.5.1: dropping the pre-1.0 framing After eight 0.9.x cycles the version number had stopped telling the truth. v26.5.1 is the 1.0-equivalent release — full SmartSDR feature coverage, the Aetherial strip complete on both paths, and native builds on three platforms. It also switches the project to CalVer, for a reason worth explaining.](#release-26-5-1)

[Back to blog](#)

![The contribution pipeline drawn as an AetherSDR signal chain: issue, claim, fix, evidence, merged — over a spectrum trace and waterfall](https://www.aethersdr.com/assets/img/first-contribution-hero.svg)

July 26, 2026 8 min read

## Your first contribution to AetherSDR

You no longer need to be a C++ programmer to fix something in this project. You need judgement, a radio, and the patience to check work — the same things that make a good Elmer.

Every open-source project says it welcomes newcomers. Most then hand you a wall of build instructions, a toolchain that fights you for a weekend, and a code review that assumes you already know what a rebase is. The welcome is sincere; the on-ramp is still a cliff.

That cliff is what actually changed. Not the code — the on-ramp. We've published a [first-contribution cheat sheet](https://github.com/aethersdr/AetherSDR/blob/main/docs/first-contribution-cheatsheet.md) that takes you from "I've never used GitHub" to a merged pull request, and the striking thing about it is that you never type a command. Every step is a sentence you say, in English, to an AI coding agent working inside your editor.

### You're the control operator

Here's the part worth being clear about, because it's where the whole thing succeeds or fails: the agent does the typing, not the deciding.

It will install dependencies, find the bug, write the fix, and draft the pull request. It will also sound completely confident while being wrong. That is not a flaw you can prompt your way out of — it's the nature of the tool, and it's exactly why the human in the chair still matters. Your job is to read what it proposes before you say yes.

If you've ever supervised a Technician on your license, the arrangement will feel familiar. Someone else is on the mic. You're still responsible for what goes out. The cheat sheet states it as four rules, and the third one — *it sounds confident even when wrong* — is the one to internalize.

So the skill that makes you useful here isn't C++. It's knowing what AetherSDR is supposed to do when you key up, and noticing when it doesn't. That's operator knowledge, and no amount of model capability substitutes for it.

### What it costs to start

Three things: a free editor, a GitHub account, and one AI coding agent. The cheat sheet walks through Copilot, Codex, and Claude Code side by side, including which tiers can actually drive your editor and which are chat only — a distinction worth checking before you pay for anything. There is a genuinely free path. Limits shift often enough that the cheat sheet links to the live pricing pages rather than quoting numbers that go stale.

The GitHub account is the one step nothing can do for you. Pick your callsign as the username — it's public, and it's the handle the rest of us will know you by.

### Finding a first job

Issues tagged [good first issue](https://github.com/aethersdr/AetherSDR/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) are the front door. Ask your agent to read the open ones and explain the top few in plain English, then to recommend one — it's surprisingly good at judging which bugs are self-contained.

Then claim it before you start. Claiming means adding yourself to the issue's assignees, not leaving a comment saying you'll take it. Our triage bot is auto-assigned to everything, so an issue showing only the bot is free. This is the one piece of etiquette that matters on day one: it's what stops two people quietly fixing the same bug on a Saturday afternoon.

### Bring evidence, not vibes

"Works on my machine" is not evidence, and this is where a first PR usually either lands or stalls.

AetherSDR ships an agent automation bridge — a switch you flip at launch that lets your agent drive the running application directly: read the state of any control, move sliders, click buttons, capture the panadapter. So instead of asserting the bug is fixed, your agent can walk the issue's exact reproduction steps through the app and show the control values before and after.

It's the difference between eyeballing the S-meter and putting the radio on a service monitor. Reviewers here look for that trace, and a first pull request that arrives with one moves noticeably faster than one that says "works for me."

Two ground rules the cheat sheet is firm about, both of which protect your station rather than the codebase: check the radio isn't already in use before launching a test run, because two clients fighting over one radio produce evidence that is simply wrong. And ask for receive-only testing. The bridge refuses to transmit unless you explicitly enable it — leave it that way for your first run.

### When it goes wrong

It will. A build will fail, a check will go red, GitHub will call your commit "Unverified" for reasons that make sense to roughly nobody the first time.

The entire troubleshooting procedure is: copy whatever you see, paste it to your agent, and add *"This happened. What does it mean and what should we do?"* That sentence resolves the overwhelming majority of first-timer problems, because the errors are well-known ones and the agent has seen them all.

### Why we bother

Ham radio has always run on people explaining things to each other — someone signed your license test, someone talked you through your first HF contact, someone told you your audio was too wide. That tradition is the reason this project is worth contributing to at all.

The tooling now handles the part that used to gate people out: the syntax, the build system, the git incantations. What it can't supply is someone who knows what a properly-behaving panadapter looks like at 3 AM during a contest. That's you.

[Read the cheat sheet](https://github.com/aethersdr/AetherSDR/blob/main/docs/first-contribution-cheatsheet.md), pick an issue, and open the pull request. If you get stuck at any point, [start a discussion](https://github.com/aethersdr/AetherSDR/discussions) — asking early is not an imposition here, it's the tradition. 73.

[Back to blog](#)

[Back to blog](#)

![v26.8.1 release art — settings that survive, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-8-1-hero.svg)

August 2, 2026 10 min read

## v26.8.1: settings that survive, and a way in when they don’t

Your settings stop being a file that gets rewritten and become a database that gets updated. That is plumbing, and mostly you should never notice it — which is exactly why this release also ships the way back in for when you do.

There are three changes to what runs where before any of that, and they are the ones to read first.

### Read this before you upgrade

**Intel Macs no longer get Copy Assist.** In exchange the Intel DMG now targets macOS 12.0, down from 13.0, so it reaches the older hardware it exists for.

Those two facts are the same fact. The speech runtime is published with a macOS 15.5 minimum, and macOS applies the *highest* minimum of anything inside an app bundle to the whole app. Shipping Copy Assist on Intel meant shipping a DMG that most Intel Macs would refuse to launch at all — not a degraded app, a dead icon. One optional feature was setting the floor for everything else in the bundle. Apple Silicon is unaffected and keeps Copy Assist in full.

**The aarch64 AppImage now needs Raspberry Pi OS Trixie.** It moves to Qt 6.8.3 LTS, which raises its glibc floor to 2.38. Bookworm cannot run it — as was already true of the builds it replaces. What you get for that is the ARM AppImage finally rendering the spectrum on the GPU instead of falling back to CPU drawing.

**Building from source now requires Qt 6.8 or newer.** Nothing changes if you use the released binaries; they were already built against 6.8.3. Distro Qt satisfies this on Debian Trixie, Ubuntu 25.10+, Fedora 41+ and Arch. On Ubuntu 24.04 LTS it does not — build against a Qt from aqtinstall or the Qt online installer and pass `-DCMAKE\_PREFIX\_PATH=/path/to/Qt/6.8.3/gcc\_64`.

### Why a file had to become a database

Settings used to live in `AetherSDR.settings`, an XML file. Saving a setting meant writing the whole file out again.

That works until it doesn’t, and the way it fails is disproportionate. Change one checkbox and the operation on disk is not “update one checkbox” — it is “replace the entire configuration.” Lose power, run out of disk, or crash during that window and what you lose is not the checkbox. It is every panadapter layout, every profile, every controller mapping, every bookmark, replaced by a truncated file. The unit of risk had nothing to do with the size of the change.

Settings now live in a SQLite store with transactional saves. A write either lands completely or not at all, so an interrupted save leaves the previous state intact rather than a half-written file. On top of that: integrity checks at startup, automatic verified backups, and quarantine-and-restore if the store is ever damaged — with a notice telling you which backup it fell back to, rather than silently starting up looking like a fresh install.

Bookmarks get a related fix. The band stack now writes through the moment you make one, instead of riding along on a later save that a crash could beat to disk. A bookmark you made and then lost was never a corruption bug; it was a durability one.

### Your credentials leave the settings file

The MQTT password, the automation-bridge token and the remote-ASR API key move to your operating system’s keychain during the upgrade. They are not in the settings store, and they are not in the file the store replaced.

This matters more than it sounds, because a settings file is a *sociable* object. It gets attached to bug reports. It gets swept into backups that sync somewhere. It gets pasted into a forum thread by someone troubleshooting at midnight who has not thought about what else is in it. Every one of those is a reasonable thing to do with a configuration file and a bad thing to do with a password.

The new Settings Browser reflects that: credential-shaped values are masked and read-only, and its diagnostic export is sanitized. The intent is that the obvious, helpful action — export this and send it to someone who can help — stops being the one that leaks.

### The escape hatch can’t live inside the app

Two ways in, and the second one is the interesting one.

**Settings ▸ Settings Browser…** browses and edits the whole store with live filtering and guarded editing. That is for when the app starts.

**`aethersdr --config`** is for when it doesn’t. `list`, `get`, `set`, `unset`, `export` and `path` all work without starting the GUI at all.

The reason that exists is worth stating plainly, because it generalises. A stored value can be bad enough to stop the application launching. If the only tool for repairing settings is a window inside that application, then the tool is unavailable in precisely the situation it was built for. A recovery mechanism that depends on the thing it recovers is not a recovery mechanism — it is a feature that works when you don’t need it.

So the config editor runs without the GUI, without a radio, and without the store being in a good state.

### What the upgrade does to your settings

Migration happens automatically on first launch. You should not have to do anything.

The old `AetherSDR.settings` file is left in place, untouched. That is deliberate: if you roll back to an older release, it finds the settings you had at the moment you upgraded and carries on. The one thing to understand is that it is a snapshot, not a mirror — changes you make after upgrading live in the new store, so a rollback returns you to the upgrade point rather than to last night.

### TCI keys the slice you asked for

Some continuity first, because it was never written up here. v26.7.4 broke WSJT-X rig control over TCI, and v26.7.4.1 was a same-day hotfix that restored it — band changes were failing and transmissions could go out of band, which is not a thing to leave sitting until the next release. If you are still on v26.7.4, upgrade regardless of anything else on this page.

This release fixes the deeper fault underneath it. Since v26.7.4, no TCI client could activate the slice it named: keying stayed pinned to wherever transmit already happened to sit. And before that, every client’s `trx:0` promoted the first slice — so a second WSJT-X instance would yank transmit off the slice the first one was working.

That second one is the one that ruins an evening. Two clients, one radio, both behaving correctly by their own lights, and the one that connected most recently silently takes the transmit slice away from the one that is mid-QSO. Nothing errors. It just stops being your slice.

Both are fixed, and satellite and cross-band split are preserved. Three related faults in the same path go with them:

- A cached route can no longer outlive the live transmit slice and move transmit onto a stale slice’s band *and antenna*. That is the one worth a second look — the failure was not a wrong dial reading, it was RF out of the wrong port.
- An unresolvable receiver is now declined, rather than transmitting on the first slice as a fallback. “I don’t know which slice you meant” is not a good reason to pick one.
- Two clients on one radio each resolve against the receiver they actually declared.

Refusals now reply instead of failing silently, receiver numbers stay stable when a slice is closed mid-session, and the routing decision is logged — which is the change that makes the next report of this class diagnosable at all.

### Meters that stop lying

Three metering bugs, with a common shape: the number on screen outlived the measurement behind it.

**Forward power kept reporting for about three seconds after unkey.** The raw meter read zero within 200 ms; the derived watts value decayed exponentially from full power on its own schedule. The radio knew you had stopped. The display was still telling you a story about it.

**SWR reported a stale reading while receiving.** With no transmit for sixteen minutes, the meter still showed the value measured during the *previous* transmit — which, if that transmit happened to be into a poorly matched antenna, reads as a live fault on a station that is working perfectly.

**Amplifier bar gauges kept painting the old scale** after an auto-range or a LOW/MID/HIGH change. Measured on the bench: an ACOM reflected-power gauge showed 206 W for an actual 120 W, and stayed there.

Reflected power is the worst possible reading to get wrong, and not because the error was large. It is the number you look at to decide whether to stop transmitting. A forward-power display that reads high is an annoyance. A reflected-power display that reads high sends you hunting a fault that isn’t there — or, with the error in the other direction, doesn’t send you anywhere at all.

Related, and in the same spirit: the TX filter now tells you when it is removing your transmit audio. A low/high cut that excludes the audio keys the radio normally and produces almost no RF — and in DIGU/DIGL there was no cue whatsoever. Everything looked correct except the part you cannot see from the operating position.

### RN2 stops pumping on binaural audio

If you listen with binaural or diversity audio, the noise floor no longer rises every time somebody talks.

RN2 was deriving a single gain envelope from an L/R downmix and applying it to both channels. For a mono source that is exactly right — both channels carry the same signal, so one envelope describes both. For binaural audio the channels differ by design, and a gain curve computed from their sum fits neither. The audible result was pumping: speech on one side dragging the gain for both.

Nothing changes for duplicated-mono slices, and nothing changes in how much noise RN2 removes.

New, and off by default: **RN2 ▸ Noise Floor**. RNNoise gates hard, and some operators hear that as the receiver going dead rather than quiet — the band vanishing between phrases is unnerving when you are used to judging conditions by what sits underneath them. This leaves a percentage of the original signal under the denoised audio so the band still sounds live. 10–20% is a usable floor.

Transmit audio also no longer breaks up with RN2 enabled. The pacer could never repay a missed deadline, so recovered microphone frames accumulated until the queue cap discarded audio outright. Reported by @Bill6000 on a FLEX-6500 under Linux Mint.

### Also in this release

**Changing the waterfall Scheme now recolours the history you are already looking at**, rather than only the rows that arrive next. Switching themes does the same, and nothing moves while it happens — scroll position, paused scrollback and the scroll animation are all preserved.

**The interface follows what your radio actually reports.** GPS status is gated on live hardware presence as well as radio family, so a Flex without the GPSDO option fitted no longer shows a GPS stack. The DVK button follows your SmartSDR+ entitlement — without it, DVK read as *broken* rather than *unlicensed*, after you had already recorded into a slot that was never going to work. The status bar no longer invents a `0.00 V` PA supply reading on radios that never report one.

**Squelch behaves.** Manual squelch is remembered per slice again on every path — a non-active slice’s VFO flag, a MIDI or controller knob, or the radio itself. Previously only the RX applet kept that memory current, so cycling the SQL button pushed a stale value back and quietly undid what you had set. It is also no longer saved between sessions: squelch belongs to the radio, and new slices start from the radio’s own level.

**Controllers and operating.** Stream Deck becomes slice-aware, with a Slice Target action cycling `TRX0 → TX → ACTIVE` and keys showing live values from the radio instead of static labels — the default is unchanged, so an existing deck behaves exactly as before. Ulanzi Dial buttons can hold PTT and key CW and remember their mappings; only the button-down half of each press was being read, so those did nothing at all. FlexControl recovers on its own after losing its USB port instead of staying dead until you restart the PC. SpotHub gains a Freeze toggle so you can click a spot without the list shifting under you. The IARU Region 1 80 m band plan is corrected — 3.600–3.620 MHz is ALL, not DIGI.

**Platform.** The Linux AppImage runs natively on Wayland instead of XWayland, so text and the spectrum are sharp under fractional scaling — and it asks for Wayland with a fallback, so a machine without it quietly uses XWayland rather than failing to start. Qt 6.8.3 LTS is now pinned everywhere, including both macOS legs; the Apple Silicon DMG previously took whatever Qt Homebrew was publishing that day. Every HTTP request now has a transfer timeout, so a half-open connection no longer leaves space-weather, POTA, PSK Reporter, SmartLink auth and map tiles pending forever with no error.

**Themes** get a quieter but satisfying fix: the compiled fallback table is now generated from the bundled theme and pinned in CI, rather than hand-maintained. It had drifted on nine tokens — it claimed slice A was red while both bundled themes say cyan — and twenty-four more tokens had no fallback at all, resolving to transparent on older themes, which could leave the waterfall with no colormap. “Reset to default” also follows the theme you are actually editing; on Default Light it had been restoring the *dark* value for 96 of the 147 shared tokens.

Work continued on the experimental Hermes-Lite 2 backend and on the host-side memory bank for radios without memory slots. To be explicit about it: **Hermes-Lite 2 remains experimental and is not a supported radio family. FlexRadio remains the supported target.**

118 commits across 15 contributors. Full release notes and the complete commit list: [v26.8.1 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.8.1).

[Back to blog](#)

[Back to blog](#)

![v26.7.4 release art — speech to text, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-4-hero.svg)

July 26, 2026 10 min read

## v26.7.4: Copy Assist, and the eight milliseconds that ate half the audio

AetherSDR now transcribes received voice locally, docked under the waterfall. The interesting part isn't the transcription — it's what we found when operators turned NR2 on.

Speech-to-text has been usable for a while. Putting it in a radio client is a different problem: the audio is worse than anything these models were trained on, the vocabulary is callsigns and signal reports, and the operator needs to know how much to trust what appears.

### It runs on your machine

Copy Assist uses **whisper.cpp**, running locally. It'll use the CPU, or a GPU through Vulkan or Metal — detected automatically, so there's no backend to pick. Models are downloaded on demand rather than shipped, which keeps the installer honest.

There is an optional remote OpenAI-compatible endpoint if you'd rather the work happened somewhere else — a beefier machine on your LAN, or a hosted service. It's off unless you configure it. **Nothing leaves your computer unless you point it somewhere.**

That default is deliberate, and it isn't only about your own privacy. Every transcript is of somebody else's transmission. They consented to being heard on the air; they didn't consent to being fed through a third party's API. Local-by-default means the decision to change that is one you make explicitly, for traffic you're responsible for.

### It tells you when it's guessing

The transcript is colour-coded by confidence, and that's the feature that makes the rest safe to use.

A speech-to-text model always returns its best guess. On a clean studio recording the best guess is usually right. On an SSB signal at the noise floor, it will still return fluent, plausible, confidently-formatted English — and it may be entirely invented. A transcript that renders a wild guess in the same typeface as a certain one is worse than no transcript, because it converts "I didn't copy that" into "I copied something wrong."

Colour-coding puts the model's own uncertainty on screen where your eye can use it. Treat the confident text as a strong hint and the uncertain text as a prompt to ask for a repeat. It is not a log entry — do not put a callsign in your log because Copy Assist rendered it. Confirm it on the air, the way you always have.

### Tell it what language to expect

You can pick the transcription language rather than relying on auto-detection, and on weak or accented signals that makes a real difference.

The reason is worth understanding. Language identification is itself a model running on the same degraded audio — so exactly when conditions are worst, you get two chances to be wrong instead of one. Worse, the failure compounds: misidentify the language and every subsequent word is decoded against the wrong phoneme inventory, which produces fluent nonsense rather than an obvious error.

If you're working a pileup into a specific region, or a net that runs in one language, pinning it removes an entire class of failure. And accented speech in a language the detector isn't confident about is precisely the case where auto-detection is least reliable and a human operator is most certain.

### The bug: eight milliseconds against 5.33

Now the part worth reading even if you never turn Copy Assist on.

Operators reported that with NR2 engaged, Copy Assist produced mangled output — while the audio through the speaker sounded fine. That framing sent everyone looking at NR2's speech quality, which was the wrong place entirely.

Copy Assist was being fed from a *visualization* signal — a tap intended for driving displays. That tap coalesces: if a block arrives within **8 ms** of the previous one, it's dropped, because there's no point repainting a meter faster than anyone can see. Entirely reasonable for its intended purpose.

It doesn't skip the repaint. It **discards the whole block** — samples and all.

With NR2 engaged, blocks arrive every **5.33 ms**. (Which is what 256 samples at 48 kHz comes to, if you want to picture the buffer.) Walk it through: a block is accepted at t=0. The next arrives at 5.33 ms — inside the 8 ms window, dropped. The next at 10.66 ms — outside the window, accepted. Then 16 ms, dropped. Accept, drop, accept, drop.

**Roughly half the speech samples were being thrown away**, and the surviving halves were spliced end to end with a discontinuity at every join.

### Why that's worse than losing half the audio

Losing half the samples at random would be bad. Losing every other block and concatenating the remainder is worse, because nothing downstream can tell that it happened.

The resampler and the voice-activity detector both assume contiguous audio. They had no way to see the gaps. So the resampler interpolated across joins that weren't continuous, and the VAD measured energy envelopes across time that had been silently compressed. The model then received audio that was self-consistent, correctly formatted, and describing speech that never happened at that cadence.

And the speaker path was never touched — it reads from a different tap. That's precisely why this presented as "NR2 makes Copy Assist sound bad" rather than "something is dropping samples." The one signal a human could actually verify was the one that was fine.

The fix is one line's worth of intent: Copy Assist now reads the unconditional presentation tap. **No audio processing changed.** Nothing was tuned, no filter was adjusted, NR2 was never at fault. A consumer had been wired to a tap whose contract was "good enough to look at," and used it as though the contract were "every sample, in order."

The same fix cleared a second symptom that had looked unrelated: a station running a KiwiSDR alongside a Flex was getting both receivers interleaved into one transcript. Copy Assist now follows a single receiver.

If there's a lesson to carry off the bench, it's that a tap optimised for human perception and a tap suitable for machine analysis are different things, and the moment you feed the first into the second the failure will surface somewhere that looks nothing like the cause.

### Where to find it

Copy Assist docks under the waterfall. Its settings — backend, model, language, and the optional remote endpoint — now live under a single configuration key, so they default, migrate, and save as one unit rather than drifting apart across upgrades. The settings window also honours frameless mode like the rest of the app.

### Use cases

**Operating with hearing loss.** The case that matters most. A running transcript with visible confidence turns a marginal signal from impossible into workable, and it's the difference between being on the air and not.

**Catching a callsign in a pileup.** Not as authority — as a second pair of ears. When you half-copied something, the transcript tells you whether your guess has support before you call.

**Running a net.** Check-ins arrive faster than you can write. A transcript scrolling under the waterfall lets you catch up on the one you missed without asking the whole net to hold.

**Working across a language barrier.** With the language pinned, a DX contact in a language you don't speak becomes legible enough to complete the exchange.

**Learning the bands.** New operators spend a lot of effort simply decoding what's being said. Seeing the words alongside the audio shortens that considerably.

**Testing your own audio.** Point a KiwiSDR at yourself and read the transcript. If the model can't copy you, that's worth knowing before someone tells you on the air.

### What feedback helps

Which model and which hardware, with a sense of whether it kept up. The CPU/GPU matrix across Vulkan and Metal is wide, and real-time performance is the thing that determines whether this is useful or merely impressive.

Whether the confidence colours are calibrated. This is the one we most want checked. If text shown as high-confidence turns out wrong at a rate that surprises you, the display is actively misleading and we need to know — that's a more serious bug than a missed word.

How it does on languages other than English, and on accented speech with the language pinned. The language selector exists because auto-detection struggled; we'd like to know how much of the gap it actually closes.

And the vocabulary. Callsigns, signal reports, and Q-codes are not what these models were trained on. If Copy Assist reliably mangles a particular construction, tell us what it turns it into — the pattern matters more than the instance.

### Also in this release

**Demo mode** — a synthetic backend that generates its own receive audio and a matching panadapter, so you can run the full interface with no radio attached. Ten independently-enabled noise and signal channels make it a genuine test bench for the noise-reduction engines. It synthesizes receive audio only and cannot transmit. If you've been curious about AetherSDR without a Flex on the desk, this is the way in — and it's how a contributor can work on the UI without owning the hardware.

**NR2 itself** gained better suppression quality and more reliable settings behaviour, independent of the Copy Assist fix. The **3D spectrum** got its largest polish pass yet: slice shadows surface-mapped onto the FFT, history preserved across smooth-scroll boundaries, a stable rear edge when rows arrive late, and fixes for the DC-edge comb and the wide right-edge artifact.

**AetherClock** decodes NIST time signals and displays your clock's offset against the broadcast standard, alongside a new **GPS and station-location dashboard**. **Slice Link** lets you right-click a panadapter to link two slices so tuning either retunes the other — across panadapters, including Kiwi-sourced slices. PSK Reporter gained a one-shot WSPR beacon, and there's **ACOM S-series amplifier** support over serial or ser2net.

Full release notes and the complete commit list: [v26.7.4 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.7.4).

[Back to blog](#)

[Back to blog](#)

![v26.7.3 release art — meters you can trust, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-3-hero.svg)

July 19, 2026 5 min read

## v26.7.3: the cross-needle returns

The classic cross-needle meter arrives — forward power, reflected power, and SWR read from where the needles cross.

Anyone who has operated with a Bird or a Daiwa knows the cross-needle. Two needles sweep from opposite corners — one forward power, one reflected — and SWR is read from the arc where they intersect. It's a small piece of analog computing, and decades of operators have it in their hands.

### Why the crossing point matters

Three numbers on a digital readout give you three numbers. The cross-needle gives you a geometry, and geometry is something the eye evaluates faster than it reads digits.

You don't compute the ratio; you see whether the crossing sits in the comfortable part of the arc. Tuning an antenna, that difference is the difference between glancing at the meter and stopping to read it.

### The maths underneath got better too

This isn't only a new face on old numbers. The SWR meter's response and scale maths were corrected, so the reading is more accurate — not just more familiar.

The HLTH applet also stopped raising false SWR warnings during normal transmit transitions. An alarm that fires when nothing is wrong trains you to ignore it, which means it won't work when something genuinely is wrong. A meter you can trust is worth more than a meter that is merely vigilant.

### Where to find it

The cross-needle PWR/SWR applet. The analog S-meter separately gained configurable face themes, so the receive side can be styled to match.

### Use cases

**Tuning an antenna.** The case the instrument was designed for. Watch the crossing move as you adjust, without reading anything.

**Catching a problem mid-contest.** A changed crossing point is visible in peripheral vision. A changed number is not.

**Matching the rest of the bench.** If a physical cross-needle sits next to your keyboard, having the software agree with it removes a translation step.

### Also in this release

Panadapters now honour the radio's live display state and bound the rendering work spent on hidden pans, so stale client state stops fighting the radio. The VFO DSP badge shows when noise reduction is active, and the SPLIT/SWAP badge follows the slice's actual role. **Connect to a Radio** keeps its local-radio list scrollable on compact displays — including 1024×600 Raspberry Pi panels with several radios discovered. On Linux, PC Audio capture no longer stalls after a TCI transmit handoff.

For anyone building from source on an Intel Mac: a cached Qt build cut that path from roughly two and a half hours to about twenty minutes.

### What feedback helps

Compare it against your physical meter. If AetherSDR and a known-good external meter disagree on the same transmission, that's the report we want — with the make and model, because reference meters have their own characteristics.

Which meter faces you'd want. The face theming exists precisely because operators have strong preferences here, and we'd rather ship the ones people actually want than guess.

And whether the SWR ballistics feel right. Needle damping is a judgement call: too fast and it's twitchy, too slow and it lags the adjustment you're making. The correct answer comes from people tuning antennas, not from us.

Full release notes and the complete commit list: [v26.7.3 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.7.3).

[Back to blog](#)

[Back to blog](#)

![v26.7.2 release art — digital voice, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-2-hero.svg)

July 12, 2026 7 min read

## v26.7.2: D-STAR, locally, with a dongle

Complete local D-STAR through a connected ThumbDV — RX and TX digital voice, callsigns, repeater routing, and messaging, with no proprietary drivers shipped.

D-STAR on a Flex has historically meant a second radio. This release does it with a USB dongle and the radio you already own.

### What works

Receive and transmit digital voice, headers, callsigns, repeater routing, and the 20-character messages D-STAR carries alongside audio. The **Waveforms** window handles ThumbDV discovery and lifecycle. **AetherModem** gains a D-STAR station and routing page. **Network Diagnostics** reports digital-voice delivery metrics, so when audio breaks up you can tell whether you're losing frames or losing signal.

The serial layer is cross-platform and no proprietary drivers ship with the application.

### Why there's no software vocoder

A hardware dongle — a ThumbDV or DV3000U — is required. Software AMBE is intentionally not included.

AMBE is patent-encumbered, and the codec is licensed per-implementation. A project that shipped a software AMBE implementation would be handing its users a legal problem in exchange for saving them a dongle purchase. The hardware vocoder carries a licence in the chip; buying one is buying the licence.

We'd rather say this plainly than have you discover the constraint after downloading. If D-STAR matters to you, budget for the dongle.

### Where to find it

The **Waveforms** window for the dongle itself, the D-STAR station and routing page in **AetherModem**, and delivery metrics in **Network Diagnostics**.

### Use cases

**D-STAR without a second radio.** The Flex covers the RF; the dongle covers the codec.

**Repeater routing from the desk.** Callsign routing is where D-STAR is genuinely distinctive, and it's fiddly on a handheld keypad and comfortable on a keyboard.

**Diagnosing a marginal DV path.** Digital voice fails abruptly rather than gracefully. Delivery metrics tell you which side of the cliff you're on before you fall off.

### Also in this release

The automation bridge is now exposed over the **Model Context Protocol**, with schema-validated tools gated behind a Radio Setup toggle and token auth. Transmit keying stays behind a separate environment variable — an AI assistant that can drive your radio should not be one command away from keying it.

**BNR** gained packs for consumer Blackwell RTX 50-series GPUs on Windows and Linux, auto-detecting the GPU and fetching the matching model; GPUs with no published pack disable cleanly and steer you to DFNR. **KiwiSDR** received per-receiver passwords in the OS keychain and a fix for a waterfall-history leak that was costing about 170 MB per receiver. Radio Setup and Network Diagnostics were both rebuilt from flat tab rows into categorised, symptom-searchable browsers. There's also QRZ callsign lookup with a 7-day cache, an adaptive RX filter that auto-fits the SSB passband to the signal, and CHIRP-next CSV import.

### What feedback helps

Which dongles work. ThumbDV and DV3000U are the tested pair, but the DV dongle ecosystem is wider than that and enumeration differs between them.

Repeater routing edge cases. Routing behaviour varies between repeater systems and networks in ways that are difficult to enumerate without operators on those systems trying it.

And whether the delivery metrics correlate with what you hear. If the numbers look healthy while the audio is breaking up, we're measuring the wrong thing — that's a more valuable report than a crash.

Full release notes and the complete commit list: [v26.7.2 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.7.2).

[Back to blog](#)

[Back to blog](#)

![v26.7.1 release art — the band, over time, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-7-1-hero.svg)

July 2, 2026 7 min read

## v26.7.1: the spectrum stands up

A 2D/3D toggle turns the panadapter into a perspective stacked-trace surface: the band's recent history, standing up and receding into the distance.

A panadapter shows you now. A waterfall shows you the past as colour. The 3D stacked-trace spectrum shows you the past as shape, which turns out to suit some signals much better.

### Anchored to the noise floor

Ridge height is anchored to the *measured* noise floor, with a colour gradient running from floor to peak. Anchoring to a fixed dBm value would mean the display's usefulness changed every time band conditions did — at night on 40m everything would be a mountain range, and on a quiet morning the surface would flatten to nothing.

A **3D Floor** depth slider tunes how far below the measured floor to surface, so you choose between a clean display and one that shows everything struggling at the edge.

Single-frame impulse bursts are rejected. Without that, one static crash from a distant storm plants a permanent spike in the terrain that scrolls away for the next thirty seconds, drawing your eye to something that already happened and doesn't matter.

### Nothing else goes away

The waterfall, the scales, and every overlay — spots, memories, markers, band plan — keep rendering underneath. The right-edge dBm scale carries into 3D as a full-height linear axis.

This is what separates a usable operating display from a demo. A 3D view that costs you your spots and your band plan is one you'll switch on to admire and back off to work.

### 60 fps, at flat CPU cost

Alongside it, the FFT ceiling went from 30 to 60 fps. The trace is now computed per-pixel on the GPU instead of baking vertices on the CPU every frame, so the panadapter's render cost is independent of both its width and its frame rate. Wider pans and more of them stopped being something you pay for in CPU.

It's cross-platform across macOS, Windows, and Linux, with graceful GPU→CPU fallback if the hardware can't take the fast path.

### Where to find it

The **Spectrum: 2D / 3D** toggle on the panadapter, and the **3D Floor** depth slider. The Display pane was also reorganised into labelled sections with a dedicated background **Off** button.

### Use cases

**Surveying a band before committing.** Which parts have been busy for the last minute, not just this instant — the question you actually have when you arrive on a band.

**Catching intermittent signals.** A station that transmits briefly every few seconds is nearly invisible on a live trace and obvious as a repeating ridge.

**Watching a contest fill up.** The build of activity across a band over minutes is legible as terrain in a way it isn't as colour.

**Characterising a noise source.** Interference has structure over time, and structure over time is exactly what this view is for.

### Also in this release

**BNR** — the NVIDIA AI denoiser now runs in-process on a local RTX GPU with no container, downloading its runtime on demand. TX meters gained mouse-over numeric readouts, so hovering SWR, power, ALC, mic level, or compression gives an exact value instead of a bar to eyeball. Model capabilities now come from the FlexLib platform table, which fixed missing extended-DSP filters on AU-510 and the ML/CL "S" variants.

### What feedback helps

GPU and driver combinations, especially ones that fall back to CPU. The fallback is deliberate, but if it's triggering on hardware that should manage the fast path, that's a bug we want to see.

Whether the 3D Floor default is right for your bands and antenna. It's the one control most likely to need adjusting before the display becomes useful, which suggests the default is doing too much work.

And whether the floor-to-peak colour gradient reads correctly for you — colour choices that seem obvious to one operator are frequently unreadable to another.

Full release notes and the complete commit list: [v26.7.1 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.7.1).

[Back to blog](#)

[Back to blog](#)

![v26.6.5 release art — diversity across geography, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-5-hero.svg)

June 28, 2026 6 min read

## v26.6.5: aligning a Flex with a receiver a thousand miles away

GCC-PHAT correlation time-aligns your Flex and a public KiwiSDR in both audio and the waterfall — diversity reception where the two receivers are a continent apart.

The previous release made public KiwiSDR receivers available. This one makes them useful *together* with your own radio, which is a considerably harder problem.

### Why alignment is the whole problem

Diversity reception combines two receivers to beat fading. It only works if the two are phase-coherent — combining misaligned signals doesn't cancel the fade, it manufactures a new one.

On a single radio this is free; the receivers share a clock. A Flex on your bench and a Kiwi in another country share nothing. Different clocks, different sample rates in practice, and a network path whose latency varies as you watch.

### GCC-PHAT

Generalised Cross-Correlation with Phase Transform is the standard tool for finding the time offset between two recordings of the same source. The phase transform is the important part: it whitens the magnitude spectrum before correlating, so alignment is driven by phase alone rather than by whichever signal happens to be loudest.

That property is what makes it work here. Your Flex and a distant Kiwi hear the same transmission with wildly different signal-to-noise and completely different noise floors. Correlating raw magnitude would lock onto the local noise; correlating phase locks onto the shared signal.

The Auto-Assist aligns both the audio and the spectrum/waterfall, so the visual and the audible stay consistent with each other.

### Where to find it

The Auto-Assist on the KiwiSDR path. Kiwi audio also now mutes during non-FDX transmit — you don't want a distant receiver's delayed copy of your own signal in your ears mid-over.

### Use cases

**Diversity across real distance.** Two antennas in one backyard fade together more often than not. Two receivers a thousand miles apart genuinely don't.

**Understanding a fade.** When a signal drops, an aligned second receiver tells you whether the path failed or the transmitter stopped.

**Checking a directional antenna.** Compare your beam against an omni far away on the same signal, aligned, and the pattern difference is visible rather than inferred.

### Also in this release

**SmartMTR TX meters** — selectable SWR, forward-power, and compression gauges with analog ballistics on the VFO flag, and VOX-keyed transmit now engages the meter and audio gate. A new **PROF** applet gives live Global, TX, and Mic profile switching from the sidebar. S-meter configuration moved to a right-click context menu. The CW decode panel is resizable with a persistent font size.

Under the surface, closing a panadapter created by a panafall now correctly frees its waterfall stream on the radio — the teardown was leaking streams that only showed up as degraded connection quality much later.

### What feedback helps

Which receiver pairings lock, and which won't. Kiwi hardware, network path, and the signal itself all contribute, and the failure modes will only surface across many combinations.

How long a lock holds. Clock drift between independent receivers is inevitable; the question is whether the sync re-converges before you notice or whether you have to re-run it.

And whether the aligned audio actually sounds better. GCC-PHAT can report a confident alignment that doesn't improve intelligibility — the ear is the acceptance test.

Full release notes and the complete commit list: [v26.6.5 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.6.5).

[Back to blog](#)

[Back to blog](#)

![v26.6.4 release art — receivers worldwide, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-4-hero.svg)

June 23, 2026 6 min read

## v26.6.4: listening from somewhere else

A browser for the world's public KiwiSDR receivers, built to be a good guest on infrastructure other people pay for.

There are hundreds of public KiwiSDR receivers around the world, run by volunteers on their own hardware and bandwidth. This release makes them a first-class source inside AetherSDR — and takes the etiquette seriously.

### Policy-aware, not just a list

The browser is an **API-policy-aware directory browser**. The public directory publishes limits on how it may be used, and the browser surfaces a **Limits** marker rather than quietly ignoring them.

That framing is deliberate. It would have been easy to scrape the directory and present it as a receiver list. These are volunteer-operated stations with real bandwidth costs, and software that treats them as a free API is the reason such directories eventually close. Connection failures also carry source-attributed denial messages, so when a receiver turns you away you learn whether it was full, restricted, or unreachable — rather than staring at a generic error.

### It cannot transmit

Kiwi panadapters carry a receive-only TX inhibit, and diversity receive has an interlock. A public receiver is somebody else's antenna, thousands of miles away — the guarantee that no sequence of clicks keys a transmitter while you're pointed at one is structural, not a warning dialog you can click through.

### Where to find it

The receiver browser, independent of the FlexRadio connection path — you don't need a radio connected to use it. Dedicated logging categories live under the Support menu for when a connection misbehaves, and the reference documentation is `docs/kiwisdr-public-directory.md`.

### Use cases

**Hearing yourself as others hear you.** Transmit, listen on a Kiwi a thousand miles away, and you have an honest answer about your audio and your antenna that no local monitor can give you.

**Bands you have no antenna for.** Curious about 160m without a 160m antenna? Someone else has one and is sharing it.

**Checking propagation directly.** Rather than inferring from spots, listen from the far end and hear what's actually arriving.

**Operating while portable.** A public receiver near home tells you what your home station would be hearing.

### Also in this release

The agent automation bridge arrives — an in-app, agent-drivable interface for the GUI, off in production and gated behind an environment variable. That's the same bridge the contribution workflow uses to produce before-and-after evidence in a pull request. There's also a first accessibility pass for custom-painted widgets, backed by a CI check, and a large round of CAT and rigctld parity fixes — including a safety fix where a bare `ZZTX;` was being treated as a key command rather than a read.

### What feedback helps

Whether the Limits marker is legible enough to actually change behaviour. If operators are hammering receivers without noticing it, the marker has failed regardless of its accuracy.

Which receivers misbehave, and how. Kiwi firmware versions vary and the public fleet is genuinely heterogeneous. And if you run a public Kiwi yourself, we especially want to hear whether AetherSDR clients are well-behaved guests — that's the report we can't generate from this side.

Full release notes and the complete commit list: [v26.6.4 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.6.4).

[Back to blog](#)

[Back to blog](#)

![v26.6.3 release art — satellite data, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-3-hero.svg)

June 14, 2026 6 min read

## v26.6.3: WFM, and 9600-baud satellite work

A per-slice WFM demodulator built for the specific job of getting 9600-baud satellite telemetry out of a Flex and into a decoder.

Satellite data work has a chain of small requirements that each break the whole thing if you get them slightly wrong. This release builds that chain deliberately, end to end.

### The signal path

A per-slice **WFM** toggle on FM modes runs: DAX IQ in, phase-continuous NCO Doppler correction, exact 48 kHz resampling, a flat atan2 discriminator, and out to a virtual audio cable for HS-SoundModem.

Each stage is there for a reason. *Phase-continuous* Doppler correction matters because a satellite pass means retuning constantly — a correction that glitches phase on every step destroys the very demodulation you're doing it for. *Exact* 48 kHz resampling matters because 9600-baud G3RUH is unforgiving of sample-rate error. And a *flat* discriminator matters because G3RUH is pre-emphasised at the satellite; any de-emphasis on your side fights it.

### Doppler steps stopped fighting the panadapter

A behaviour change that satellite operators will notice immediately: in-span retunes arriving over CAT or TCI no longer recenter the panadapter. Cross-band tunes still do.

A tracking program issuing Doppler corrections every few seconds was previously yanking your display back to centre every few seconds. Now the pan holds still and the signal moves within it, which is what you wanted to watch in the first place.

### Where to find it

The WFM toggle is per-slice, on FM modes. DAX IQ also became fully usable this cycle — end-to-end sample delivery, a dBFS level meter, switchable 24/48/96/192 kHz rates with persistence, and state restore at startup.

### Use cases

**Working the 9600-baud birds.** The case this was built for: a Flex, a tracking program handling Doppler, and HS-SoundModem on the far end of a virtual cable.

**Wideband FM generally.** Nothing in the path is satellite-specific — it's a clean WFM demodulator wherever you need one.

**Feeding any external decoder.** The virtual audio cable output means anything that takes audio can consume it.

### Also in this release

The AX.25 tab gained a full **APRS client** — live station table, weather decode, timed GPS position beacon, and two-way messaging with retries, auto-ack, and digipeat de-duplication. **View ▸ PSK Reporter** shows who's hearing your callsign on an OpenStreetMap basemap with mode-coloured markers and great-circle paths, built on a new reusable mapping engine the APRS map will share.

VHF 1200-baud AX.25 also moved to a Direwolf-derived demodulator with nine amplitude slicers. An overnight live run of 1,875 packets out-copied both Dire Wolf and Graywolf.

### What feedback helps

Decode rates on actual passes, with the satellite named. Pass geometry, elevation, and your antenna all matter enough that a single number without context is hard to act on.

Whether the Doppler correction holds phase through a full pass, particularly at high elevation where the rate of change peaks. And if you use a tracking program we haven't considered, tell us how it issues corrections — the in-span retune behaviour was tuned against a specific pattern and others may need accommodating.

Full release notes and the complete commit list: [v26.6.3 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.6.3).

[Back to blog](#)

[Back to blog](#)

![v26.6.2 release art — a complete packet station, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-2-hero.svg)

June 8, 2026 7 min read

## v26.6.2: your radio is now the TNC

AetherModem stops being a decoder and becomes a packet station: a software TNC, a BBS terminal, and a mailbox that answers — no external hardware.

Phase 0 could read packet. This release closes the loop in three directions at once, all riding the built-in 1200-baud VHF Bell 202 AFSK modem.

### A KISS TNC other software can use

The **KISS-over-TCP TNC server** turns AetherSDR into a software TNC for any host packet or APRS application — Xastir, YAAC, APRSdroid, UISS, terminal programs, anything that speaks KISS. It accepts multiple simultaneous clients with resync-safe framing, so a client that connects mid-stream recovers rather than reading garbage.

The lifecycle handling is the part that determines whether this survives a weekend: TCP keepalive, a write-backlog cap for slow consumers, and an idle sweep that reaps dead clients instead of leaking them.

### A terminal that calls a BBS

The **Terminal tab** is a connected-mode AX.25 client — call a 1200-baud VHF packet BBS, read and send messages, disconnect. Connected mode means real error correction with T1 retries over a half-duplex link, not fire-and-forget.

It was verified on the air against a live BBS (SJVBBS-1): reads, sends, retries hold, no session drops. Worth stating plainly, because connected-mode AX.25 has many ways to work in a test harness and fail on a real channel.

### A mailbox that answers

The **Personal Mailbox System** is the answering side — your own connected-mode mailbox that other stations can call. It shares the same data-link state machine as the terminal, so both sides of a connection are the same tested code.

### The part that stops it double-keying

Four things can now want the transmitter: APRS, the KISS TNC, the mailbox, and the terminal. All of them ride a shared one-at-a-time TX keying queue.

Without that, a beacon firing while the terminal is mid-retry produces a collision you caused yourself, on your own frequency, and it's nearly impossible to diagnose from the outside. The queue makes it structurally impossible.

### Where to find it

AetherModem, with the new **Terminal** tab for connected-mode sessions. The TNC server has **Enable TNC**, **Start on Startup**, and a **TCP port** control defaulting to 8001 — all persisted.

### Use cases

**Running Xastir with no TNC.** Point it at localhost:8001 and the sound-card modem, the hardware, and the cables all disappear from your setup.

**Reading the local BBS.** Packet BBSs are still running in most regions and are considerably more interesting than their reputation suggests.

**Leaving a mailbox up.** If you're already running the station for HF, the mailbox costs nothing extra and puts you on the local packet network as a participant.

### What feedback helps

Which host applications connect cleanly over KISS, and which don't. That list is only discoverable by people running the actual software — every client has its own framing quirks.

On the terminal: BBS compatibility. Different BBS software has different ideas about line endings, prompts, and timeouts. Tell us which BBS you called and what broke.

And on marginal paths, whether the T1 retry behaviour feels right. Retry timing is a tradeoff between throughput and channel courtesy, and the correct answer depends on how busy your local frequency is — which we can't see from here.

Full release notes and the complete commit list: [v26.6.2 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.6.2).

[Back to blog](#)

[Back to blog](#)

![v26.6.1 release art — hands on the radio, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-6-1-hero.svg)

June 1, 2026 6 min read

## v26.6.1: knobs, dials, and physical controls

Three new classes of physical controller, all opt-in, so the operating system never asks for input permissions you didn't ask to grant.

Software radio moved every control onto a screen, and something was lost: you can't find a mouse pointer by feel. This release adds three device classes that put controls back under your hands.

### The three devices

**Elgato Stream Deck+** — encoders, LCD buttons, and the touchscreen, with live labels. The labels matter: a button that reads out the current band or mode beats a button you have to remember the meaning of.

**Ulanzi Dial** — cross-platform across Linux evdev, Windows, and macOS. On Linux, evdev devices are frequently unreadable by your user account by default; rather than leaving you to work out udev rules, AetherSDR detects the inaccessible device and offers a one-click grant.

**Icom RC-28** — native support for the encoder, no shim. The parser also picked up a fix for byte offsets that had been wrong for seven years.

### Opt-in for a specific reason

All three are off until you enable them, and that isn't caution for its own sake. On macOS, reading HID devices triggers an Input Monitoring permission prompt — the same dialog a keylogger would produce. An application that asks for that on first launch, before you've expressed any interest in controllers, has given you a reason to distrust it.

So the prompt never appears unless you turn a device class on. If you never plug in a controller, AetherSDR never asks.

### Where to find it

Each device class has its own opt-in. The Ulanzi Dial also ships a sibling plugin, `ulanzi-aethersdr`, for Ulanzi Studio alongside the in-app mapper — use whichever fits your setup.

### Use cases

**Tuning without looking.** An encoder mapped to the VFO is the control every operator misses first when moving from a physical radio.

**Contest band changes.** Stream Deck+ LCD buttons with live labels turn a band change into one press with visual confirmation, which is worth real time over a weekend.

**Riding AF and RF gain.** Continuous adjustments are exactly what a dial is for and exactly what a mouse is bad at.

### Also in this release

A seven-year-old noise-reduction bug: NR2 Gamma crackling, traced to incorrect Bessel function variants in the spectral NR implementation. If you'd written off NR2 Gamma as unusable, it's worth another listen. The theming system also arrives as early beta under **Settings → Theme Editor** — token names and the `.aethertheme` format are expected to change, so treat it as a preview.

### What feedback helps

Which parameters you map, and which ones you wanted to map and couldn't. The mappable surface grows based on what people reach for, and the gaps are only visible from the operating position.

On Linux specifically: whether the one-click udev grant worked on your distribution. That path touches system permissions and distributions differ more than we can test for.

And if you're using a controller we haven't listed — an Arduino build, another vendor's dial — tell us what it enumerates as. The RC-28 already recognises the AetherPad Arduino emulator by VID/PID alias, and that pattern can extend.

Full release notes and the complete commit list: [v26.6.1 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.6.1).

[Back to blog](#)

[Back to blog](#)

![v26.5.3 release art — aetherial tx complete, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-5-3-hero.svg)

May 24, 2026 7 min read

## v26.5.3: the de-esser that was costing you 30 watts

The Aetherial transmit path is feature-complete. The headline is a de-esser rewrite that gives operators back roughly 30 watts of forward power on voice.

A de-esser is supposed to attenuate sibilance — the harsh energy around 5–8 kHz that makes an "s" spit. The old implementation attenuated everything.

### The bug, in one line

The old code multiplied the whole signal by the computed gain: `l \*= gainLin; r \*= gainLin;`. When the detector fired on sibilance, the entire audio band came down with it — bass, body, presence, all of it.

The new form applies the reduction only where it belongs: `output = full + bandpass × (gain − 1)`. The full-band signal passes through untouched, and a scaled copy of just the sibilant band is subtracted from it.

The practical consequence was not subtle. Operators running de-essing were losing on the order of **30 W of forward power** on voice content, because average power was being pulled down every time the detector triggered. If you'd turned de-essing off because "it made me sound quiet," your instinct was correct and the cause was this.

### PAPR, and why it isn't a compressor

The other addition is a peak-to-average-power-ratio processor: a four-stage all-pass biquad cascade at 300, 700, 1500, and 2500 Hz.

An all-pass filter changes phase without changing magnitude. Speech has a high peak-to-average ratio largely because its harmonics happen to line up in phase; shift them relative to each other and the peaks flatten while the spectrum — and how you sound — is unchanged. You get more average power for the same peak, without the pumping a compressor introduces.

**Drive** (0–18 dB) and **Phase** knobs sit in the channel strip. Auto-makeup gain is linked to Drive, so RMS rises with the peaks instead of vanishing into the compressor's gain reduction below it.

### Where to find it

The Aetherial Audio Channel Strip, transmit side. Drive and Phase are the PAPR controls; the de-esser gains user-selectable cascade steepness at 12, 24, 36, or 48 dB per octave. Every meter now has a peak-hold toggle, and meter ballistics are unified through a single smoother at 30 ms attack and 180 ms release.

### Use cases

**A bright microphone you otherwise like.** Split-band de-essing lets you tame the top end without dulling everything underneath — the reason to reach for a de-esser rather than an EQ shelf.

**Working DX at the edge.** PAPR buys average power at a fixed peak limit, which is the currency that matters when the other station is digging you out of the noise.

**Rebuilding a transmit chain you'd given up on.** If you disabled de-essing on an older build, this is worth a fresh pass with a monitor recording.

### What feedback helps

Numbers, ideally. Forward power average and PEP with de-essing off, then on, on the same voice — that's the measurement that would have caught the original bug years earlier.

On PAPR: the Phase control interacts with your voice and microphone in ways that are hard to predict from first principles. If a setting sounds hollow or phasey, tell us the Drive/Phase pair and roughly what you're speaking into. And if audio reports improved after this release without you changing anything, that's a data point too.

Full release notes and the complete commit list: [v26.5.3 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.5.3).

[Back to blog](#)

[Back to blog](#)

![v26.5.2.1 release art — aethermodem, phase 0, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-5-2-1-hero.svg)

May 17, 2026 6 min read

## v26.5.2.1: a packet decoder of our own

AetherModem arrives as a native HDLC/AX.25 receiver — no external TNC, no third-party decoder in the path.

Packet radio has a hardware problem: the traditional path to decoding AX.25 runs through a TNC, a sound-card modem, or a separate application. AetherSDR already has the audio. Phase 0 of AetherModem does the decoding in-process.

### How it decodes

The receiver runs a **21-lane phase bank** — twenty-one demodulator instances at staggered phase offsets, all fed the same audio, with the frame taken from whichever lane produces a valid checksum. Bit timing on a noisy channel is a guess, so rather than making one guess well, it makes twenty-one guesses in parallel and lets the FCS decide.

Every frame is FCS-validated before it surfaces. A packet decoder that shows you corrupt frames is worse than one that shows you nothing, because it costs you the trust you'd need to act on what it displays.

### Where to find it

The **Packet Decode dialog**. Receive is active on 300-baud HF and 1200-baud VHF; transmit is live on 300-baud HF, with timing refinements queued for Phase 1. If you're expecting 1200-baud VHF transmit, that's the next phase, not this one.

### Use cases

**Watching a local VHF packet frequency.** Park a slice on 144.390 and leave the decoder open — you'll see the shape of the local network without committing to a TNC.

**HF packet on 300 baud.** Narrower, slower, and far more sensitive to tuning than VHF. The phase bank earns its keep here, where a hardware TNC with a single timing recovery loop struggles.

**Checking your own transmissions.** With a second receiver you can decode what you're actually putting on the air rather than what you believe you are.

### Why there's a .1 on the end

v26.5.2 was tagged and immediately surfaced a regression worth documenting, because the cause is genuinely surprising.

The TCI server had adopted the identity `device:SunSDR2DX` with `protocol:ExpertSDR2` to satisfy an amplifier's whitelist. WSJT-X contains a code path that **halves outgoing TX sample amplitude** when the device string is SunSDR2DX or SunSDR2PRO and the protocol isn't ExpertSDR3. Operators measured about 70 W where 100 W was expected. Nothing in our audio path was wrong — we had described ourselves as a radio that WSJT-X believes needs its transmit level cut in half.

The fix was the identity string: `device:AetherSDR`, `protocol:ExpertSDR3`. Two more Day-1 fixes rode along — a Windows process that lingered in Task Manager after close, traced to three independent causes, and an AppImage build failure on gcc 11's stricter two-phase name lookup.

### What feedback helps

Decode rate against a known-good reference is the number we want. If you run Dire Wolf, a hardware TNC, or another decoder, point both at the same audio and tell us where we lose frames that they catch — and where we win, because that's just as informative.

Beyond that: which bands and baud rates you actually use. Phase 1's priorities should be set by what operators are running, not by what's tidy to implement.

Full release notes and the complete commit list: [v26.5.2.1 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.5.2.1).

[Back to blog](#)

[Back to blog](#)

![v26.5.1 release art — the 1.0 release, drawn as an AetherSDR spectrum panel](https://www.aethersdr.com/assets/img/release-26-5-1-hero.svg)

May 10, 2026 6 min read

## v26.5.1: dropping the pre-1.0 framing

After eight 0.9.x cycles, the version number had stopped telling the truth. v26.5.1 is the 1.0-equivalent release.

A leading zero is a promise about stability, and by the eighth 0.9.x cycle ours was misleading people in the wrong direction. Operators were running AetherSDR as their daily driver on a FLEX-8600 while the version string implied they were beta testers.

### What 1.0 actually claims

Three things, specifically. The client covers every documented SmartSDR feature on the FLEX-6000, FLEX-8000, and Aurora platforms. The Aetherial Audio Channel Strip ships complete on both the receive and transmit paths. And it runs natively on Linux, macOS, and Windows — no Wine, no virtual machines, no compatibility shims anywhere in the stack.

It does not claim the absence of bugs. It claims that the feature surface is no longer the thing holding you back, and that we're confident enough across all three platforms to stop hedging in the version string.

For the record of what that covers: GPU-accelerated waterfall and FFT spectrum, up to eight panadapters, multi-slice with diversity and ESC beamforming, six client-side noise-reduction engines, SmartLink remote operation, a full TCI v2.0 server, rigctld CAT for the loggers and data-mode apps, DAX audio and IQ, MIDI mapping, FlexControl, and the CW operator suite with a real-time decoder.

### Why the version looks like a date

v26.5.1 is CalVer — `YY.M.patch`. The previous `v0.9.x` tags stay in git history; new tags start here.

Semantic versioning encodes a promise about API stability to downstream consumers. That is a real and useful promise for a library. AetherSDR is an application, and its release cadence is driven by three things that have nothing to do with API compatibility: FlexLib protocol changes, ham contest seasons, and a steady stream of community-contributed fixes.

Under semver we'd have spent judgement on whether a change was "minor" or "major" — energy better spent on the change itself. `26.5.1` tells you what shipped in May 2026, which is the question operators actually ask.

### Where to find it

The version string appears in the title bar and in the About dialog. Worth checking before you file anything: a bug report against a known version is dramatically more actionable than one against "the latest".

### Use cases

**Deciding whether to move off SmartSDR.** If you've been waiting for a specific feature to land before switching, the 1.0 surface is the list to check against.

**Running Linux as your only station computer.** This is the case the project exists for, and 1.0 is the point at which we stopped treating it as aspirational.

**Reporting problems usefully.** A CalVer tag pins your report to a specific month's build, which makes bisecting a regression tractable.

### What feedback helps

The most useful thing you can tell us is which SmartSDR workflow still feels unfinished. Feature coverage is not the same as feature parity in feel — a control can exist and still be in the wrong place, take too many clicks, or behave differently under pressure than the muscle memory you built over years.

Second: hardware. The tested list covers FLEX-6000, FLEX-8000, and Aurora series plus ML, CL, and RT devices. If you're running something on that list and it misbehaves, that's a bug we want. If you're running something adjacent to it, we want to know that too.

Full release notes and the complete commit list: [v26.5.1 on GitHub](https://github.com/aethersdr/AetherSDR/releases/tag/v26.5.1).

[Back to blog](#)
