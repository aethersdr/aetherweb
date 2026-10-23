# Ham radio operating use cases: grounding for the AetherSDR "without / with" 3D experience

All URLs accessed **2026-10-23** unless noted. Labels:
- **[sourced]**: the fact is stated at the cited URL (I read the text or extracted the PDF).
- **[sourced\*]**: confirmed only from a search-engine excerpt of the cited page, not a direct read. (For example, the FlexRadio SO2R PDF URL now returns HTML instead of the PDF.)
- **[secondary]**: from a secondary or aggregator source. Usable, but say where it came from.
- **[anecdote]**: forum or blog post. Use only for color or a quote.
- **[common practice]**: how operators usually work, from general knowledge of the hobby. No single citation.
- **[assumption]**: my inference. Verify before using it as a claim.

Timing hook: **CQ WW DX SSB 2026 runs Oct 24–25, 2026 (tomorrow)**, and CQ WW CW runs Nov 28–29. Each is 48 h, 00:00 UTC Saturday to 23:59 UTC Sunday. [sourced: http://cqww.com/rules/]

FlexRadio-specific context. SmartSDR (FlexRadio's client) is a Windows application. A Mac client does exist: "SmartSDR for MacOS" is a separate paid app from a separate developer (DL8MRE), branded the "Official FlexRadio Systems Client for your Mac" [secondary: https://machamradio.com/?p=4492]. Do not imply that no Mac client exists. Windows SmartSDR "is not built to run on ARM windows", which is the Windows that Parallels runs on Apple Silicon Macs [anecdote: https://community.flexradio.com/discussion/8030358/requirements-for-smartsdr-on-mac-hardware]. I found no official Linux client. [assumption: an absence of evidence, not a FlexRadio statement]

---

## 1. Contesting

### (a) Workflow
1. **Pre-contest** [common practice]: load the logger (N1MM Logger+, DXLog.net or Win-Test) with the contest module. Configure CAT ports per radio, CW/PTT keying ports, voice/CW message macros, the telnet cluster connection, the band map, and the multiplier windows.
2. **Run** (hold one frequency and call CQ): type the call, press Enter (ESM, "Enter Sends Message"), and log. The goal is a high hourly rate. In the 2025 CQ WW CW results, a 9A single-band entrant wrote that "approximately 80% of the time I was in 'RUN' mode calling CQ with the remainder searching and pouncing for QSOs and new multipliers." [sourced: https://cqww.com/results/2025_cq_ww_dx_cw_results.pdf, soapbox section]
3. **Search and pounce (S&P)**: tune the band, or click spots on the band map, to work multipliers. The band map is fed by DX cluster, RBN and local skimmer spots. Entrants who use spots must enter **Assisted**. CQ WW defines "QSO finding assistance" as "any technology or other source that provides callsign or multiplier identification… includes… CW decoder, DX cluster, DX spotting Web sites… CW Skimmer or Reverse Beacon Network." [sourced: http://cqww.com/rules/]
4. **SO2R** (single operator, two radios): run on radio 1 while S&P on radio 2, or alternate CQs between two bands. The logger switches TX/RX focus and headphone audio over the OTRSP protocol. For a FlexRadio, the official guide has you configure **four applications (SmartSDR, DAX, SmartCAT, N1MM+)**, add a second panadapter on another band, assign DAX channels per slice, and set the Two-Radio Protocol to OTRSP. [sourced\*: https://www.flexradio.com/wp-content/uploads/assets/SO2R-Mode-with-N1MM-for-the-FLEX-6700-How-to-Guide.pdf]
5. **Post-contest**: export Cabrillo and upload. The sponsor cross-checks logs (CQ WW CW 2025 cross-checked 95.6% of QSOs) [sourced: CQ WW CW 2025 results PDF above]. Then upload to LoTW and Club Log. [common practice]

### (b) Typical tools
- Loggers: N1MM Logger+ (Windows-only), DXLog.net (Windows), Win-Test (Windows). [common practice] N1MM+ "is only available for the Microsoft Windows operating platform". Linux users run it under Wine with known breakage, for example settings forgotten on every launch because of a Wine audio-enumeration bug, plus manual serial-port mapping. [secondary: https://scivision.dev/n1mm-logger-linux-wine ; https://www.nf8m.com/nf8m/?p=343]
- Skimmers: CW Skimmer (VE3NEA, Windows) decodes "all CW signals in the receiver passband" and up to 700 signals in parallel with a wideband receiver. With a 3 kHz radio it decodes only about 3 kHz. [sourced: http://www.dxatlas.com/CwSkimmer/] For Flex, SKimmer Server or CW Skimmer is fed from DAX IQ. [common practice]
- Spot networks: Reverse Beacon Network (RBN) and DX cluster telnet nodes. [sourced: https://reversebeacon.net/pages/A+Short+History+29]
- Hardware: OTRSP/SO2R box, keyer (WinKeyer), band decoder, antenna switch, amplifier. [common practice]

### (c) Pain points
- **Many configuration surfaces.** The SO2R guide above needs four apps configured and kept in sync.
- **CAT "Auto-Switch" conflicts in SO2R.** A long-time user lists "Having 'Auto-Switch' active in one or the other CAT Port definition… will mess things up. In SO2R/V mode, you need to rely on the OTRSP port to do the TX Slice switching." [anecdote: https://community.flexradio.com/discussion/7481391/n1mm-so2r-so2v-setup-flex-6300 , surfaced via search]
- **Same-band SO2R blocked.** A user hit "Can not set both radios to the same band" on 20 m. [anecdote: FlexRadio community, same search]
- **Keying latency.** A moderator advised contesters to plug the key directly into the radio because "latency due to WiFi and LAN is noticeable for higher speed CW operators." [anecdote: https://community.flexradio.com/discussion/8024326/3-2-31-maestro-cw-keying-slow-rx-recovery]
- **Spot overload and validation.** RBN averaged about 63 spots per second during CQ WW CW 2023 (below). Operators need filtering and dupe/mult coloring to make that usable. [assumption, based on the rate]
- **Windows lock-in.** Every major contest logger is Windows-only. [common practice / secondary above]

### (d) Quantitative facts
| Fact | Source |
|---|---|
| CQ WW 2025 set an all-time record of **19,005 logs** (SSB 10,576 + CW 8,429), beating 18,414 from 2021 | https://cqww.com/results/2025_cq_ww_dx_cw_results.pdf ; https://cqww.com/results/2025_cq_ww_dx_ssb_results.pdf |
| CQ WW CW 2025: 53,536 unique calls, 192 entities, **5.1 M QSOs**, 95.6% cross-checked | CQ WW CW 2025 results PDF |
| CQ WW SSB 2025: **5,148,149 QSOs** in logs, 91% cross-checked, 324 record scores | CQ WW SSB 2025 results PDF |
| CQ WW CW 2025: **3,112 Assisted vs 2,260 Unassisted** single-op entries ("overall favoritism towards use of assistance continues") | CQ WW CW 2025 results PDF |
| Top US single-op CW 2025: 6,165 QSOs = **128 QSOs/hour average** for the whole contest | CQ WW CW 2025 results PDF |
| CQ WPX SSB 2025: **8,474 logs**, nearly 2.9 M QSOs, >10,000 operators, "all are records" | https://cqwpx.com/results/results_2025_wpx_ssb_article.pdf |
| CQ WPX CW 2025: record **6,661 operators**, 5,918 logs (+9%), QSOs up only slightly to about 2.6 M because of solar flares and degraded high bands | https://cqwpx.com/results/results_2025_wpx_cw_article.pdf |
| ARRL DX Phone 2025: **4,646 logs** (5,193 in 2024) | https://contests.arrl.org/ContestResults/2025/DX-Phone-2025-FinalQSTResults.pdf [secondary: via search snippet of the PDF] |
| ARRL Field Day 2025: **4,373 entries, 31,919 participants, 1.2 M QSOs** (phone 37% / CW 38% / digital 24%; digital +3% YoY) | https://contests.arrl.org/ContestResults/2025/Field-Day-2025-FinalQSTResults.pdf |
| RBN during CQ WW CW 2023: **10,881,462 spots**, about 227,000/h (about 63/s), >250 nodes online | https://reversebeacon.net/pages/Update+-+CQWW+2023+51 |
| CQ WW rules: remote receivers outside the station location are **not permitted**. Remote operation is OK if all TX/RX/antennas are at one location | http://cqww.com/rules/ |

---

## 2. DXing

### (a) Workflow
1. Watch the DX cluster or RBN for a needed entity, or check announced DXpedition schedules. [common practice]
2. Check propagation: is the path open, and what are SFI and K-index? [common practice]
3. Tune to the DX and **listen first**. Most DXpeditions work split, transmitting on one frequency and listening on another ("listening up 5"). The listening window "can vary from 1kHz to 5kHz span". [secondary: https://www.amateurradio.com/the-art-of-working-split-to-contact-a-dxpedition/]
4. **Find where the DX is listening.** Put VFO B or a second slice on the pileup, find the station the DX just worked, and learn the pattern. Operators often "walk" up through the window, or reset to the bottom. ARI advice: "you must find where they are listening and then pick your next transmitting frequency accordingly." [secondary: https://www.ari.it/english-area/dxpeditioning-basics.html ; amateurradio.com above] Two independent receivers let you hear the DX and the pileup together. [secondary: same]
5. Call, get logged, and check the DXpedition's Club Log online log. Confirm through LoTW for DXCC credit. [common practice]
6. On FT8 DXpeditions, use Fox/Hound or **SuperFox**: one constant-envelope signal answers up to 9 Hounds "with no signal-strength penalty". The developers report about +10 dB system gain over the old 5-slot Fox. SuperFox is "not intended for casual use or contesting". [sourced: https://wsjt.sourceforge.io/wsjtx-doc/wsjtx-main-2.7.0.html ; https://wsjt.sourceforge.io/SuperFox_User_Guide.pdf] SuperFox reached general availability in WSJT-X 2.7.0 (February 2025). [secondary: https://wsjt.sourceforge.io/wsjtx-doc/Release_Notes_2.7.0.txt via search]

### (b) Typical tools
DX cluster client (DXLab Suite, Log4OM, HRD, N1MM band map), RBN, Club Log, LoTW/TQSL, propagation sites (NOAA SWPC), a second receiver or slice, remote web SDRs (KiwiSDR/WebSDR) to hear your own signal or the DX from another continent. [common practice]

### (c) Pain points
- **Finding the split** with one receiver means flipping VFOs and losing the DX's transmissions. [common practice]
- **Urban noise floor.** A Dutch measurement campaign (Univ. of Twente) found "the noise floor is significantly higher than would be expected from the current ITU-R noise floor data", with the rise depending "on the density of habitation." [sourced\*: https://research.utwente.nl/en/publications/measurement-methodology-and-results-of-measurements-of-the-man-ma/ ; https://utwente.nl/en/eemcs/pe/3.research/emc/man_made_noise] RSGB notes "the growing number of 24/7 broadband RFI sources in residential locations." [sourced\*: https://rsgb.org/main/files/2017/12/221216-Noise-leaflet-issue-2.pdf] ARRL pushed the FCC TAC noise-floor inquiry (ET Docket 16-191). [sourced\*: https://www.arrl.org/news/arrl-encourages-comprehensive-noise-floor-study]
- **Remote receivers are a fix the rules disallow.** Hams use KiwiSDRs to hear weak DX, but CQ WW forbids remote receivers. DXCC rules also require one station location. [sourced for CQ WW; DXCC: assumption, check the ARRL DXCC rules before claiming it]
- **Propagation is declining from the peak** (below). High-band openings get shorter, so catching them needs fast spotting. [assumption]

### (d) Quantitative facts
| Fact | Source |
|---|---|
| Solar Cycle 25 peaked in **October 2024**: smoothed SSN **161** (159 Sep / 157 Nov; SILSO confirmed 2025), against the 2019 panel forecast of 105–125 (read directly 2026-10-23) | https://www.sidc.be/article/solar-cycle-25-reached-its-maximum-october-2024 |
| NASA/NOAA announced on **Oct 15, 2024** that the Sun had reached its solar-maximum period | https://svs.gsfc.nasa.gov/14683/ [sourced\*] |
| NOAA's Oct 2023 revised forecast: peak between Jan and Oct 2024, SSN 137–173 [sourced\*] | https://www.weather.gov/news/102523-solar-cycle-25-update |
| LoTW: **over 2.1 billion QSO records** (July 1, 2025) | https://www.arrl.org/news/arrl-logbook-of-the-world-return-to-service |
| LoTW passed 1 billion records in December 2018 | https://www.arrl.org/news/arrl-s-logbook-of-the-world-tops-1-billion-qso-records |
| **873 public KiwiSDRs** listed active (kiwisdr.com/public list, timestamp 23-Oct-2026 18:18 GMT) | http://rx.linkfanel.net/kiwisdr_com.js (generated from http://kiwisdr.com/public/) |
| About two-thirds of DXpeditions using Club Log used FT8 (2018) | https://www.arrl.org/news/survey-ft8-growing-as-dx-mode-in-an-era-of-waning-propagation |

---

## 3. Digital modes

### (a) Workflow (FT8 on a Flex, Windows today)
1. Sync the PC clock: WSJT-X requires "A means for synchronizing the computer clock to UTC within ±1 second." [sourced: https://wsjt.sourceforge.io/wsjtx-doc/wsjtx-main-2.7.0.html, §2]
2. Create a SmartSDR CAT port (TCP) tied to the digital slice and enable Auto-Switch TX Slice. Set WSJT-X audio in/out to the DAX RX/TX devices and put the slice in DIGU. [sourced\*: FlexRadio help desk https://helpdesk.flexradio.com/hc/en-us/articles/49224229297563]
3. Set drive: the Pwr slider, OS playback level and DAX TX gain are effectively in series. Common advice is to keep ALC near zero and the meter out of the red. [anecdote / secondary: https://wsjt-x-improved.sourceforge.io/ ; https://wiki.oarc.uk/digital_modes_setup ; FlexRadio community]
4. Watch the waterfall. FT8 uses 15 s T/R sequences and FT4 uses 7.5 s. [sourced: WSJT-X guide §1] Double-click a CQ and let auto-sequence finish. Log to WSJT-X ADIF, then forward over UDP to a logger (JTAlert, GridTracker, N1MM). Upload to LoTW. [common practice]
5. **Multiple bands at once:** each extra WSJT-X copy needs its own `--rig-name` shortcut, its own CAT TCP port, a matching DAX RX channel, and a unique UDP port. [anecdote: https://community.flexradio.com/discussion/8025342/how-to-set-up-4-multiple-instances-of-wsjt-x-on-the-flex-6600 ; https://community.flexradio.com/discussion/comment/20582577]

### (b) Typical tools
- Weak-signal: WSJT-X, JTDX, MSHV, WSJT-X Improved. [common practice]
- Keyboard chat: JS8Call. It is built on the WSJT-X engine, adds directed/relayed and store-and-forward messaging, and runs on Windows, Linux (x86_64/ARM64) and macOS. [sourced: http://js8call.com/]
- RTTY/PSK31: fldigi, MMTTY, 2Tone (RTTY contesting inside N1MM). [common practice]
- Email/EmComm: Winlink Express (Windows) over VARA HF/FM, ARDOP, PACTOR or packet. VARA HF is up to 7,050 bps in 2,300 Hz [secondary: https://hamradio.my/?p=11653]. A Winlink-published 2020 study found "the much less expensive VARA HF did especially well". [secondary: https://winlink.org/node/1360 via search; winlink.org returned 403 to my fetch]
- APRS/packet: Direwolf, YAAC, APRSIS32. [common practice]
- Helpers: SliceMaster 6000 (launches WSJT-X per slice). FlexRadio notes SliceMaster "is not currently compatible with DAXv2". [sourced\*: FlexRadio help desk article above] Also JTAlert, GridTracker, virtual audio cables (VB-Cable, VAC), BlackHole on macOS, and Meinberg NTP or BktTimeSync for time. [common practice / anecdote]
- Digital voice: FreeDV GUI. Windows 10+ is "the primary platform", with Linux AppImages or building from source. [sourced: https://freedv.org/radio-autoencoder/]

### (c) Pain points (the "plumbing")
- **Virtual audio cables.** On macOS, users report needing a third-party driver such as BlackHole for DAX audio. [anecdote: https://community.flexradio.com/discussion/comment/20588486]
- **CAT port sharing.** Only one program can own a serial port, so users add port splitters or a CAT TCP port per app. [common practice]
- **Multi-instance bugs.** One user found that starting a second WSJT-X instance moved both slices to the same frequency even though they were on different bands. [anecdote: https://community.flexradio.com/discussion/comment/20611844/]
- **ALC/overdrive.** Gain staging runs through three or more controls, the advice conflicts (keep ALC near zero, or run the slider at 100% and set drive by PC volume), and overdrive causes splatter. [secondary/anecdote above]
- **Time drift.** If the clock is more than about 1 s off, decodes fail. [sourced: WSJT-X ±1 s requirement] Users add Meinberg NTP. [anecdote: FlexRadio community]
- **Tool sprawl.** A typical FT8 desk runs SmartSDR, SmartSDR CAT, DAX, WSJT-X (×N), JTAlert or GridTracker, a logger, and an NTP tool: **6+ programs**. [assumption, from the setup guides above]

### (d) Quantitative facts: FT8 dominance
| Fact | Source |
|---|---|
| 2017: FT8 was **4.8 M of 32 M** Club Log QSOs (about 15%) in the year it launched | https://www.arrl.org/news/mode-usage-evaluation-2017-was-the-year-when-digital-modes-changed-forever |
| March 2021: "**FT8 accounts for over 60% of activity**" in Club Log, nearly 85% on 6 m. Club Log then held 731 M QSOs from 84,000+ logs | https://g7vjr.org/?p=1826 (G7VJR is Club Log's author) |
| 2020 typical callsign: 500 CW, 300 SSB, **1,700 data** QSOs (2015: 620/558/372) | https://g7vjr.org/?p=1826 |
| About 75% FT8+FT4 share of Club Log QSOs (attributed to a 2023 G7VJR analysis) | **[secondary, unverified]** https://voxbooster.com/blog/ham-radio-statistics-2026. Do not use without the caveat |
| PSK Reporter: FT8 is "the overwhelming majority at the moment". Over 20 billion reports by 2021 | https://pskreporter.info/ ; [secondary] https://en.wikipedia.org/wiki/PSK_Reporter |
| Club Log users uploading FT8: 8,000 (2017) to 14,200 (2018) | https://www.arrl.org/news/survey-ft8-growing-as-dx-mode-in-an-era-of-waning-propagation |
| Field Day 2025: digital = **24%** of 1.2 M QSOs, the only mode category that grew | Field Day 2025 QST results PDF |
| FreeDV **RADE**: about 1.5 kHz RF bandwidth ("half the bandwidth of an SSB signal"), works to −2 dB SNR, ~4 dB PAPR. Released June 2025. ARRL (Sep 25, 2026): manufacturers are integrating it, "beginning with a downloadable module for certain FlexRadio models" | https://freedv.org/radio-autoencoder/ ; https://www.arrl.org/news/will-rade-be-the-next-ssb ; https://www.ardc.net/?p=11880 |
| RBN 2018 test: FT8 was 86–87% of all spots on sample days | https://www.arrl.org/news/reverse-beacon-network-beta-testing-separate-spot-stream-for-ft8 [secondary: via search snippet] |

Caveat from G7VJR: Club Log trends are valid only "as a percentage within a particular year", and FT8 users are more likely to upload. So Club Log share is not on-air share. [sourced: g7vjr.org]

---

## 4. Portable (POTA/SOTA) and remote operation

### (a) Workflow
- **POTA activator** [common practice]: drive to a park, deploy a QRP or 100 W radio and a wire or vertical, self-spot on pota.app, and make **10 QSOs in one UTC day** for a valid activation [secondary: https://en.wikipedia.org/wiki/Parks_on_the_Air]. Log on a phone or tablet (HAMRS, Ham2K PoLo) and upload ADIF.
- **POTA hunter** (the AetherSDR-relevant side): watch the POTA spot feed, click to tune, work the park, and log the park reference. [common practice]
- **SOTA**: hike to a summit, make at least 4 QSOs for activator points (the SOTA rule, [assumption: verify at sota.org.uk, which returned no text to my fetch]), and spot through SOTAwatch. [common practice]
- **Remote station control**: run the home shack from anywhere over SmartLink (Flex), RemoteRig, or RCForb/RemoteHams. [common practice] Keep the CW keyer at the radio end. QSK delay needs tuning (about 40 ms in one report). [anecdote: https://community.flexradio.com/discussion/8024326/3-2-31-maestro-cw-keying-slow-rx-recovery]

### (b) Typical tools
Elecraft KX2/KX3, IC-705, FT-891, (tr)uSDX, or a Flex at home with SmartLink. Loggers: HAMRS, PoLo, N3FJP. Phone hotspot. [common practice]

### (c) Pain points
- **Remote CW over the internet.** A 2013 IARU entrant wrote that "loose connection" dropouts "mangle CW… even with a long latency time in the software". [anecdote: https://www.contesting.com/_3830/2013-07/msg00700.html] A 2021 Flex 6600M remote entrant had latency problems running the software on an office PC and moved it next to the radio. [anecdote: https://www.contesting.com/_3830/2021-07/msg02268.html]
- **Pileups at the activator** sound like small DXpedition pileups. Hunters need fast spot-to-tune. [assumption]

### (d) Quantitative facts
| Fact | Source |
|---|---|
| POTA founded Jan 2018. **29,000 activators** and **>49,000 active hunters (10+ parks)** as of 27 Jun 2025 | https://en.wikipedia.org/wiki/Parks_on_the_Air [secondary] |
| **10,396 POTA activators in 2025**, mean 23.4 activations each. Almost 12,000 POTA sites (US analysis, K4FMH, 26 Jan 2026) | https://www.amateurradio.com/a-snapshot-of-u-s-pota-sites-activators-and-activations/ [secondary, from pota.app data] |
| Top 1,000 parks = 52% of all activations since inception | same |

---

## 5. Accessibility (blind and visually impaired hams)
- **Handiham** (ARRL-listed nonprofit) supports hams with physical and sensory disabilities: Radio Camp, accessible VE sessions, daily nets. Membership grew from 71 (early 2023) to over 100 (January 2024). [sourced\*: https://www.arrl.org/resources-for-the-disabled ; https://handiham.org/wordpress1/?p=5216 ; https://www.arrl.org/enabling-ham-radio-s-disabled]
- Blindness and vision loss were described as the largest accessible-technology user group among hams. [anecdote/column: https://www.amateurradio.com/handiham-world-for-21-july-2010/]
- **SDR GUIs are the barrier.** A visually impaired DXer said the key issue is finding SDR software that works with screen readers [anecdote: https://swling.com/blog/2015/03/software-defined-receivers-sdrs-for-the-visually-impaired-listener]. SDR# needed a third-party screen-reader plugin [secondary: https://www.rtl-sdr.com/new-accessibility-plugin-for-sdr/]. With the Remotehams client, blind users can tune and hear mode/frequency but "cannot adjust sliders or CW speed". [sourced\*: https://handiham.org/remotebase/?p=1085]
- **Flex-specific:** JJFlexRadio is a Windows Flex client rebuilt WinForms→WPF for JAWS/NVDA, with keyboard PTT, band-jump keys, earcons, and panadapter output to refreshable braille. [anecdote: release notes posted at https://community.flexradio.com/discussion/comment/20626771]
- Pain point for the "without" scene: panadapters, waterfalls and sliders give no screen-reader output, so blind operators rely on a dedicated Windows-only client. [assumption, from the above]

---

## 6. Station-integration pain (cross-cutting)
- **Windows-only software:** N1MM Logger+, CW Skimmer (Windows XP–10 listed), Winlink Express, SmartSDR for Windows, SliceMaster, and FreeDV (Windows "primary"). [sourced individually above; Winlink Express Windows-only = common practice]
- **Mac:** a separate third-party SmartSDR client. Windows SmartSDR doesn't run under ARM Parallels. DAX on Mac needs BlackHole-style drivers. [secondary/anecdote above]
- **Linux:** N1MM under Wine with a 32-bit prefix, .NET 4.0, a settings-loss bug and manual COM mapping. One guide's advice is to "just run N1MM Logger on Windows, perhaps in a virtual machine". [secondary: https://scivision.dev/n1mm-logger-linux-wine]
- **Program count:** the FlexRadio SO2R guide names 4 applications before skimmers or cluster clients are added. An FT8 multi-band desk runs 6+ programs (section 3c). A full contest station (logger + SmartSDR + CAT + DAX + CW Skimmer + Aggregator/telnet + WinKeyer) is plausibly 7–8. [sourced for 4; the rest is assumption]

---

## Suggested "without / with" storyboard beats (assumption, derived from the pain points above)
| Scenario | Without (sourced pain) | With AetherSDR (verify each claim against the AetherSDR feature list) |
|---|---|---|
| Contest SO2R | 4 apps to configure, CAT Auto-Switch conflicts | one client, two slices, native on Linux/macOS |
| DX split | flip VFOs to find the listener | second slice on the pileup, visible on one panadapter |
| FT8 multi-band | `--rig-name` ×N, DAX channels, UDP ports, BlackHole | integrated audio/CAT plumbing |
| Remote | Windows PC at the radio, latency | native client on any OS over SmartLink |
| RADE | FreeDV GUI (Windows-primary) + audio routing | (only if AetherSDR supports it; ARRL says a Flex module exists) |
| Accessibility | GUI-only panadapters | (only if AetherSDR has screen-reader support; do not claim otherwise) |

---

## Numbers table (most useful sourced statistics)
| # | Statistic | Value | Source (accessed 2026-10-23) |
|---|---|---|---|
| 1 | CQ WW 2025 total logs (all-time record) | 19,005 (SSB 10,576 / CW 8,429) | https://cqww.com/results/2025_cq_ww_dx_cw_results.pdf |
| 2 | CQ WW 2025 QSOs | CW 5.1 M; SSB 5,148,149 | https://cqww.com/results/2025_cq_ww_dx_cw_results.pdf ; https://cqww.com/results/2025_cq_ww_dx_ssb_results.pdf |
| 3 | CQ WW CW 2025 Assisted vs Unassisted single-op entries | 3,112 vs 2,260 | https://cqww.com/results/2025_cq_ww_dx_cw_results.pdf |
| 4 | Winning US single-op CW rate, CQ WW 2025 | 128 QSOs/h average over 6,165 QSOs | same |
| 5 | CQ WPX SSB 2025 logs / operators | 8,474 logs; >10,000 ops; ~2.9 M QSOs (records) | https://cqwpx.com/results/results_2025_wpx_ssb_article.pdf |
| 6 | CQ WPX CW 2025 operators / logs | 6,661 (record); 5,918 logs | https://cqwpx.com/results/results_2025_wpx_cw_article.pdf |
| 7 | ARRL Field Day 2025 | 4,373 entries; 31,919 participants; 1.2 M QSOs | https://contests.arrl.org/ContestResults/2025/Field-Day-2025-FinalQSTResults.pdf |
| 8 | Field Day 2025 mode split | Phone 37% / CW 38% / Digital 24% (digital +3%) | same |
| 9 | RBN spots during CQ WW CW 2023 | 10.88 M (~63/s), >250 nodes | https://reversebeacon.net/pages/Update+-+CQWW+2023+51 |
| 10 | FT8 share of Club Log QSOs, 2021 | >60% overall; ~85% on 6 m | https://g7vjr.org/?p=1826 |
| 11 | FT8 in its launch year, 2017 | 4.8 M of 32 M Club Log QSOs (~15%) | https://www.arrl.org/news/mode-usage-evaluation-2017-was-the-year-when-digital-modes-changed-forever |
| 12 | Typical callsign's yearly mix, 2020 | 1,700 data / 500 CW / 300 SSB | https://g7vjr.org/?p=1826 |
| 13 | LoTW QSO records | >2.1 billion (Jul 2025) | https://www.arrl.org/news/arrl-logbook-of-the-world-return-to-service |
| 14 | Solar Cycle 25 peak | Oct 2024, smoothed SSN 161 (forecast was 105–125) | https://www.sidc.be/article/solar-cycle-25-reached-its-maximum-october-2024 |
| 15 | WSJT-X clock requirement | UTC within ±1 s; FT8 15 s / FT4 7.5 s cycles | https://wsjt.sourceforge.io/wsjtx-doc/wsjtx-main-2.7.0.html |
| 16 | SuperFox capacity | up to 9 Hounds at once, no per-signal penalty | same / https://wsjt.sourceforge.io/SuperFox_User_Guide.pdf |
| 17 | FreeDV RADE | ~1.5 kHz BW, down to −2 dB SNR; Flex module (ARRL, Sep 2026) | https://freedv.org/radio-autoencoder/ ; https://www.arrl.org/news/will-rade-be-the-next-ssb |
| 18 | POTA activators in 2025 | 10,396 (secondary, from pota.app data) | https://www.amateurradio.com/a-snapshot-of-u-s-pota-sites-activators-and-activations/ |
| 19 | Public KiwiSDR receivers online | 873 (23 Oct 2026) | http://rx.linkfanel.net/kiwisdr_com.js |
| 20 | Apps needed for Flex SO2R with N1MM [sourced\*] | 4 (SmartSDR, DAX, SmartCAT, N1MM+) | https://www.flexradio.com/wp-content/uploads/assets/SO2R-Mode-with-N1MM-for-the-FLEX-6700-How-to-Guide.pdf |

### Gaps and sources I could not reach
- No official POTA global QSO/activation totals; pota.app and SOTA pages render with JS and returned no text.
- winlink.org returned 403. I found no current Winlink message-volume figure, and the Wikipedia "100,000 messages/month" figure is undated, so I left it out.
- No verified 2023–2026 FT8 share. The "~75%" figure is secondary only.
- I did not extract the ARRL DX CW 2025 log count or the RBN CQ WW 2025 spot count (a search summary claimed 12.46 M, but I could not locate the primary source, so I excluded it).
- I did not find an official AetherSDR feature list to check against. The storyboard "with" column must be verified with the AetherSDR team.
