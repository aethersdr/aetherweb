# Lineage — AetherSDR

> Twenty-three years of amateur SDR software, from FlexRadio's 2003 GPL release of PowerSDR through OpenHPSDR, Thetis and piHPSDR — which branches forked, which went quiet, and which are still being written.

Source: <https://www.aethersdr.com/lineage>

Provenance

## Twenty-three years of amateur SDR, and where *AetherSDR* picks up.

Almost every software-defined radio console an amateur can run today traces back to one C# codebase that FlexRadio released under the GPL in 2003. This is what happened to it — which branches forked, which ones went quiet, and which are still being written.

23

Years of lineage

5

Independent codebases

2003

The GPL release that started it

0

Lines AetherSDR inherited

PowerSDR (Flex legacy) OpenHPSDR / Thetis SmartSDR (proprietary) piHPSDR (native C) AetherSDR

2002 Origins

1. 2002 PowerSDR (Flex legacy)
   ### A software defined radio for the masses
   Gerald Youngblood publishes a four-part series in ARRL’s QEX between July 2002 and March 2003. Part four announces the SDR-1000 as a semi-assembled board set, with the software to be released in open-source form.
   **AC5OG** · Gerald Youngblood
2. 2002 PowerSDR (Flex legacy)
   ### DttSP becomes the DSP core
   Frank Brickle and Bob McGwier write the C signal-processing engine that sits underneath PowerSDR and release it under the GPL. Every console on this page inherits its architecture, directly or by way of a rewrite.
   **AB2KT** · Frank Brickle**N4HY** · Bob McGwier
3. 2003 PowerSDR (Flex legacy)
   ### SDR-1000 and PowerSDR ship under GPLv2
   A headless box that converts RF to an 11 kHz I/Q pair over a parallel port, with everything else done in software. The GPL release is the single most consequential decision in this history — it is why the rest of the page exists.
   FlexRadio Systems
4. 2005– 06 OpenHPSDR / Thetis
   ### The HPSDR group forms
   Phil Covington’s FPGA project merges with the XYLO effort by Phil Harman and Bill Tracey. The result is a modular open-hardware bus — Atlas, Ozy, Mercury, Penelope — built around direct conversion from DC to 55 MHz.
   **N8VB** · Phil Covington**VK6APH** · Phil Harman**KD5TFD** · Bill Tracey
5. 2007 OpenHPSDR / Thetis
   ### PowerSDR is ported to HPSDR hardware
   Bill Tracey and Doug Wigley adapt FlexRadio’s GPL console to drive Mercury, Penelope, Ozy and Metis. The branch becomes OpenHPSDR PowerSDR mRX PS. From this point the two codebases evolve separately.
   **KD5TFD** · Bill Tracey**W5WC** · Doug Wigley
6. 2008 OpenHPSDR / Thetis
   ### TAPR funds Mercury development
   TAPR agrees to fund the Mercury receiver proposal in March and continues underwriting OpenHPSDR hardware from then on, distributing boards as kits and assembled units.
   TAPR
7. 2012OCT OpenHPSDR / Thetis
   ### Apache Labs ships the ANAN-10
   The Hermes board collapses Mercury, Metis and Penelope onto one PCB with Ethernet. Apache Labs wraps it in a chassis with a PA and filters. The ANAN-100 and ANAN-100D follow in March 2013, the latter built on the dual-ADC Angelia board.
   **M0KHZ** · Kevin WheatleyApache Labs
8. 2012 SmartSDR (proprietary)
   ### FlexRadio closes the source, and opens the API
   The FLEX-6000 series is shown at Dayton with a direct-sampling architecture that moves DSP into the radio. SmartSDR is written from scratch as closed source and no code crosses between the two families again — but the same move opens something up. With the DSP inside the radio, a console is no longer a signal-processing engine; it is a control surface over the network, and FlexRadio documents that surface in full. A versioned command protocol, VITA-49 streaming for spectrum, waterfall and audio, and FlexLib published as a reference implementation. Slices, panadapters, meters, profiles, the ATU, DAX and remote access are all reachable from outside, so a client written from nothing can reach parity rather than approximate it. That depth is why AetherSDR could start from an empty file instead of a fork.
   FlexRadio Systems
9. 2013JUN SmartSDR (proprietary)
   ### First FLEX-6700 units ship
   General release begins in June. SmartSDR v1.1 later that year doubles panadapters and slice receivers to eight on the 6700.
   FlexRadio Systems
10. 2013DEC PowerSDR (Flex legacy)
    ### PowerSDR 2.7.2 — FlexRadio’s last release
    The final upstream build for the FLEX-1500, 3000 and 5000. The source stays available under GPLv2, which keeps the legacy line alive long after the company stops working on it.
    FlexRadio Systems
11. 2014 OpenHPSDR / Thetis
    ### WDSP replaces DttSP
    Warren Pratt rewrites the DSP layer as a new GPL library with separate receive and transmit chains. It becomes the shared engine under every non-FlexRadio console that follows — Thetis, piHPSDR, linHPSDR, deskHPSDR.
    **NR0V** · Warren Pratt
12. 2014 OpenHPSDR / Thetis
    ### PureSignal wins the ARRL Technical Innovation Award
    Adaptive predistortion implemented in WDSP pushes IMD3 on the ANAN line to around −50 dB — cleaner than a class-A transmitter while keeping class-AB efficiency.
    **NR0V** · Warren Pratt
13. 2016 OpenHPSDR / Thetis
    ### Thetis begins
    HPSDR’s next-generation firmware introduces an entirely new radio-to-PC protocol that PowerSDR cannot speak, and gigabit Ethernet becomes mandatory. Doug Wigley leads a new console for it. Later versions speak both protocols.
    **W5WC** · Doug Wigley
14. 2016JAN PowerSDR (Flex legacy)
    ### KE9NS forks PowerSDR 2.7.2
    Darrin Kohn picks up the abandoned legacy branch on New Year’s Day and adds cluster spotting on the panadapter, callsign decoding in the waterfall, band stacking and much else. It is still the best software for a FLEX-5000.
    **KE9NS** · Darrin Kohn
15. 2016 piHPSDR (native C)
    ### piHPSDR takes the codebase native
    John Melton writes a client in C on his own Linux and Android port of WDSP, breaking the dependency on Windows and .NET. Christoph van Wüllen later takes over as maintainer and his fork becomes the mainline.
    **G0ORX** · John Melton**DL1YCF** · Christoph van Wüllen
16. 2019 OpenHPSDR / Thetis
    ### MW0LGE starts working on Thetis
    Richard Samphire begins contributing, and over the following years his fork becomes the de facto mainline — multi-panadapter rendering, TCI, the voice keyer and a long run of releases through v2.10.
    **MW0LGE** · Richard Samphire
17. 2021 piHPSDR (native C)
    ### Hermes-Lite 2 wins the ARRL Technical Innovation Award
    Steve Haynal’s low-cost open transceiver puts protocol 1 in reach of anyone, and the native-C clients are what make it usable across Linux and macOS.
    Steve Haynal**N2ADR** · Jim Ahlstrom**M5EVT** · Matthew
18. 2023JUL OpenHPSDR / Thetis
    ### The canonical Thetis repository goes quiet
    TAPR’s upstream stops at v2.10.0.0. Development continues only in the MW0LGE fork.
    TAPR
19. 2023 OpenHPSDR / Thetis
    ### ANAN-G2 arrives on the SATURN board
    A large FPGA rated around 930 GMAC/s with a Raspberry Pi compute module on board, derived from the 7000DLE mk2 RF chain. For the first time the radio can run its own console.
    **G8NJJ** · Laurence Barker**N1GP** · Rick Koch
20. 2025SEP SmartSDR (proprietary)
    ### SmartSDR moves to a subscription
    From v4.0, bug fixes stay free under SmartSDR Basic while new features require an annual SmartSDR+ licence. FlexRadio’s stated reasoning is that fourteen years of major-version upgrades produced only two paid releases.
    FlexRadio Systems
21. 2026MAR AetherSDR
    ### AetherSDR starts from an empty file
    First commit lands on 12 March — a root commit with no history behind it. A native Qt6 and C++20 console written clean-room against FlexRadio’s published VITA-49 and SmartSDR APIs. No PowerSDR ancestry, no Thetis ancestry.
    **KK7GWY** · Jeremy Fielder
22. 2026APR OpenHPSDR / Thetis
    ### Thetis is archived
    Richard Samphire archives the repository. The reasons are entirely technical: the codebase still depends on .NET Framework 4.8, rendering runs on SharpDX which is itself archived, and multiple receive slices would need a full display-engine rewrite. Final release v2.10.3.15 ships in May.
    **MW0LGE** · Richard Samphire
23. 2026JUN piHPSDR (native C)
    ### Apache Labs funds piHPSDR
    Apache Labs forms an in-house software team whose first stated mission is assisting DL1YCF with piHPSDR, plus companion tooling and continued support for the 7000DLE and 8000DLE. After twenty years, the OpenHPSDR side finally has paid engineers.
    Apache Labs**DL1YCF** · Christoph van Wüllen
24. Today AetherSDR
    ### Where AetherSDR sits
    Native on Linux, macOS and Windows, driving the FLEX-6000 and 8000 series and Aurora. More than 15,000 downloads and over 40 contributors, on a monthly CalVer release cadence. Nothing above the AetherSDR lane is a dependency — it is a parallel start, written for this decade rather than inherited from the last one. Where it goes next runs the other way. The split this page traces is an accident of hardware and protocol history rather than anything operators asked for, and the intent is to close it inside the client: native support for the Metis- and Thetis-derived radios alongside the FLEX families, so one console speaks both branches. The three things that ended Thetis — a .NET Framework dependency, a rendering stack archived underneath it, and multiple receive slices needing a display engine it never got — are already solved here. Same console, same habits, whichever branch your radio came down.
    GPL-3.0aethersdr.com

Lane colours mark independent codebases, not companies. A dashed fork means no shared source.
