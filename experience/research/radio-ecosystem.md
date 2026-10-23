# HF SDR transceiver ecosystem: research brief for AetherSDR positioning

All sources accessed **2026-10-23**. Prices are USD unless noted. Retail prices change often and differ by region, so treat them as approximate.
Snapshot of the two Aether projects used here:
- **AetherSDR 26.10.3**, released 2026-10-18, GPL-3.0 (`gh api repos/aethersdr/AetherSDR/releases/latest`; README: https://github.com/aethersdr/AetherSDR)
- **Aether-gate v0.5.3**, released 2026-09-23, GPL-3.0-or-later (`gh api repos/nigelfenton/Aether-gate/releases/latest`; README: https://github.com/nigelfenton/Aether-gate). The org mirror https://github.com/aethersdr/Aether-gate has the same README, minus the Windows-installer section.

Legend: **[fetched]** means the page itself was read. **[snippet]** means only a search-result summary was seen. Anything in neither state is in the "Could not verify" list at the end.

---

## 1. FlexRadio (FLEX-6000, FLEX-8000, Aurora)

### Architecture
- **Network-attached server radio.** The radio does the DSP itself, and clients connect over Ethernet. Commands and status travel over TCP port 4992. Panadapter, waterfall, meter, audio and I/Q streams travel as **VITA-49 over UDP**, with 4991 as the default stream port (https://community.flexradio.com/discussion/comment/16725274, https://community.flexradio.com/discussion/comment/17074938, https://github.com/AB4EJ-1/FlexRadioIQ) [snippet].
- **FlexLib** is FlexRadio's official C# API library. Developers get documentation and pre-release builds through the FlexADP partner program (https://www.flexradio.com/developers) [snippet].
- **FLEX-8000 series.** The FLEX-8600 has a 16-bit, 245.76 Msps direct-sampling ADC, up to 4 receivers, up to four 14 MHz panadapters, and 100 W on HF and 6 m (https://www.flexradio.com/products/flex-8600-signature-series-sdr-transceiver/) [fetched]. The 8400 has 2 receivers and 1 SCU; the 8600 has 4 receivers and 2 SCUs. The M variants add a built-in front panel with an 8" touchscreen and run without a PC (https://www.flexradio.com/compare) [fetched].
- **FLEX-6000 series.** The 6400 has 2 receivers and 1 SCU; the 6600 has 4 receivers, 2 SCUs and diversity. Every model is marked **"Discontinued"** (https://www.flexradio.com/6400-6600-model-comparison/) [fetched]. FlexRadio announced the end of FLEX-6000 production in its June 2024 newsletter (https://www.flexradio.com/insider/flex-insider-june-2024/) [snippet].
- **Aurora (AU-510/510M, AU-520/520M).** Integrated 500 W PEP on HF and 200 W on 6 m, about 80% efficiency, built-in AC supply and a 500 W tuner. The AU-510 has 2 receivers and a 122.88 Msps, 16-bit ADC (>145 dB). The AU-520 has 4 receivers with true diversity, a 245.76 Msps ADC (>155 dB), 2 transverter ports and SO2R (OTRSP). The M models add an 8" 1920x1200 display (https://www.flexradio.com/Aurora) [fetched].

### Official software and OS support
- **SmartSDR for Windows.** "SmartSDR is for Windows platforms", with Windows 11 recommended. Current version is v4.3.16 (https://flexradio.com/ssdr-for-windows/) [fetched]. SmartSDR, SmartSDR CAT and DAX ship with the radio (FLEX-8600 page above) [fetched].
- **SmartSDR for macOS and iOS.** FlexRadio's product page lists both as **"third-party software (optional, paid)"** (FLEX-8600 page above) [fetched]. They are written by Marcus Roskosch, DL8MRE (https://machamradio.com/blog/2020/08/17/smartsdr-is-now-available-for-your-mac/, https://apppricinglab.com/app/apple/1089157289) [snippet].
  - Mac App Store: **$99.99**, supports macOS 14 and later, FLEX-6000 and FLEX-8000 (https://apps.apple.com/us/app/smartsdr-flexradio-systems/id1523656696) [snippet]. It was launched at $149.99 in 2020 (machamradio link above) [snippet].
  - iOS App Store: **$79.99**, all-inclusive with no in-app purchases. The store listing shows the seller as "FlexRadio Systems®" (https://apps.apple.com/us/app/-/id1089157289) [snippet], while a price tracker names Roskosch as developer. Both attributions are cited as found; this brief does not resolve which is the legal seller.
- **Linux: no official client.** A FlexRadio community manager said there are no plans for one, for financial reasons. He invited a third party to build, sell and support a Linux client, as was done for Mac and iOS (https://community.flexradio.com/flexradio/topics/make-a-linux-compatible-version-of-smartsdr) [snippet].
- **Maestro Control Console.** **$1,599 MSRP**. Works with any FLEX-6000, FLEX-8000 or Aurora. Connects over Gigabit Ethernet or Wi-Fi 6, supports SmartLink, and takes an optional battery for $215 (https://www.flexradio.com/maestro) [fetched].

### Remote operation
- **SmartLink.** WAN remote from SmartSDR-compatible clients (Windows, Mac, iOS, Maestro). It needs a v2.x license or later and an Internet connection (FLEX-8600 page) [fetched]. It is listed for all FLEX-8000 models (https://www.flexradio.com/compare) [fetched]. Registering a radio once requires physically pressing PTT at the radio (https://community.flexradio.com/discussion/comment/19569054) [snippet]. Some users report SmartLink failures over cellular hotspots (same forum cluster) [snippet].
- **MultiFlex.** Two clients can operate one radio simultaneously. Supported on all FLEX-8000 models (https://www.flexradio.com/compare) [fetched].

### Digital modes and audio
- **DAX.** Cable-free virtual audio and I/Q: 4 DAX audio and 4 DAX IQ channels on the FLEX-8600, used with third-party digital-mode software (FLEX-8600 page) [fetched].
- **SmartSDR CAT.** Virtual serial CAT, included with the radio (same page). DAX and SmartSDR CAT are Windows programs that come with SmartSDR. Linux users rely on community tools such as **nDAX** (DAX to PulseAudio) and **nCAT** (hamlib/rigctld protocol), both MIT-licensed by KC2G (https://github.com/kc2g-flex-tools/nDAX, https://github.com/kc2g-flex-tools/nCAT; license from `gh api`).

### Software licensing and cost (SmartSDR v4 model, announced September 2025)
- **SmartSDR v4 Basic is free** for every Aurora, FLEX-8000 and FLEX-6000. It includes 4.x bug fixes but no new feature unlocks (https://flexradio.com/ssdr-for-windows/) [fetched].
- **SmartSDR+ costs $199 per 365 days.** Features released during that window stay with the radio after it ends. **Early Access costs $299 per 365 days** and gets features about 30 days earlier. All purchases are final (same page) [fetched; prices also in https://community.flexradio.com/discussion/8032305/exciting-news-a-smarter-smartsdr-licensing-model, fetched, where they are marked "subject to change"].
- **What older owners lose without a subscription.** Moving from v1 to v4 drops SmartLink and MultiFlex. Moving from v2 to v4 drops MultiFlex. v3 owners are already current. Support for v1 and v2 is being discontinued, and end-of-life hardware may stop receiving updates (both pages above) [fetched].
- **Legacy paid upgrades.** FlexRadio says it shipped only two paid major-version upgrades in 14 years (forum thread above) [snippet]. One forum user recalled the v1/v2 to v3 upgrade as "about $200" (unverified; see list).

### What operators complain about
- **Windows-only client.** Linux users say VM performance is "abysmal" and end up dual-booting (Linux request thread above) [snippet].
- **The subscription model.** One owner says FLEX-6000 owners pay the same $199 a year as FLEX-8000 owners despite older hardware, and suggests $100 to $125. Another objects to paying for noise reduction. Buyers are confused about whether licenses are yearly or permanent (https://community.flexradio.com/discussion/8032305, related comments 20621678 and 20620797) [snippet].
- **Mac users pay extra.** Mac and iOS clients are paid third-party apps on top of the radio (FLEX-8600 page) [fetched].
- **SmartLink setup and cellular connectivity friction** (see Remote above) [snippet].

### Other clients (open-source and third-party)
- **AetherSDR.** GPL-3.0, native Qt6/C++20, runs on Linux (x86-64 and aarch64), macOS (Apple Silicon and Intel) and Windows (README).
- **RimuSDR.** Linux-native, **commercial/paid**. Its trial mode is limited to 80 m receive-only. Tested on Debian 13 and Ubuntu 24.04 (https://community.flexradio.com/discussion/8033515/rimusdr-for-linux-now-available) [snippet].
- **nDAX / nCAT.** MIT-licensed Linux helpers for audio and CAT; not a full GUI client (see above).

### Approximate prices (FlexRadio MSRP)
| Model | MSRP | Source |
|---|---|---|
| FLEX-8400 / 8400M | $2,499 / $3,649 | https://www.flexradio.com/compare [fetched] |
| FLEX-8600 / 8600M | $4,899 / $5,899 | same |
| AU-510 | $6,199 | https://www.flexradio.com/products/aurora-au-510-signature-series/ (price text scraped) |
| AU-520 | $8,599 | https://www.flexradio.com/products/aurora-au-520-signature-series/ (scraped; also RigReference 2025 new price $8,599 [snippet]) |
| AU-510M / AU-520M | about €10,500 incl. VAT for the 520M (EU retail) | https://www.wimo.com/en/flexradio-aurora-au-520m [snippet] |
| FLEX-6400/6400M/6600/6600M (discontinued) | last MSRP $2,299 / $3,449 / $4,599 / $5,699 | https://www.flexradio.com/6400-6600-model-comparison/ [fetched] |
| Maestro | $1,599 | https://www.flexradio.com/maestro [fetched] |

---

## 2. Icom (IC-7610, IC-7300 / IC-7300MK2, IC-705, IC-905)

### Architecture
- **Self-contained transceivers.** Each radio has its own front panel and internal SDR/DSP. PC control is through **CI-V**, over USB, or over the radio's LAN/WLAN on network models.
- **Network capability.** The IC-7610 has a LAN port; the IC-705 has network/WLAN (https://icomamerica.com/lineup/options/RS-BA1_Version2/) [fetched]. The **IC-7300 has no network interface** (https://wfview.org/ [fetched]; SDR-Control Mac listing, https://apps.apple.com/app/sdr-control-for-icom/id1592313285 [snippet]). The **IC-7300MK2 adds Ethernet**, giving "simplified RS-BA1 remote control without the need for a base station PC" plus remote power on/off (https://www.dxengineering.com/parts/ico-ic-7300mk2) [fetched]. The MK2 was unveiled at JARL Ham Fair, August 2025 (https://qrper.com/2025/08/icom-announces-the-ic-7300mk2-improved-performance-and-enhanced-connectivity/) [snippet].
- **IC-905.** VHF/UHF/SHF, 144 MHz to 5.6 GHz, with a 10 GHz transverter option. It uses a separate controller and RF unit connected by a PoE LAN cable (https://icomfrance.com/en/page/amateur.php [snippet]; https://www.amateurradio.com/how-about-an-icom-ic-905 [snippet]). It is not an HF radio.

### Official remote software: RS-BA1 Version 2
- **OS: Windows only** (Windows 11 64-bit, Windows 10, Windows 8.1; no Windows RT). Latest listed version is 2.70, dated 2024-05-16. For Internet use the base PC needs a static public IP or Dynamic DNS. Dualwatch and dual scope work only on the IC-7610 and IC-7850/7851. Original RS-BA1 owners have no free upgrade path (https://icomamerica.com/lineup/options/RS-BA1_Version2/) [fetched].
- **Compatibility chart.** Lists the IC-7610 (server, dualwatch), IC-7300 (no server role), IC-705 (server) and IC-9700. The **IC-905 and IC-7300MK2 are not on that chart** (same page). Icom France lists RS-BA1 as an IC-905 option (icomfrance link above) [snippet]. The IC-7300MK2 is marketed as RS-BA1 V2 compatible (DXE page above) [fetched].
- **Price.** About **$150** at a US dealer (https://northgeorgiacommunications.com/product/icom-rs-ba1-ip-remote-control-software-rs-ba1-v2-advanced-dualwatch-remote-control-software/) [snippet]; €79.90 at WiMo in the EU (https://www.wimo.com/en/rs-ba1v2) [snippet].

### Digital modes and audio
- The radios expose a USB audio codec and CI-V over USB, which is standard on the IC-7300, 7610 and 705 (general knowledge; see list). Over LAN, RS-BA1 carries audio. Icom's network protocol bundles control, scope and audio in one UDP stream (Aether-gate RADIO_SUPPORT.md, https://github.com/nigelfenton/Aether-gate/blob/main/RADIO_SUPPORT.md).

### What operators complain about
- **RS-BA1 is Windows-only, costs extra, and needs a static IP or DDNS for WAN use**, which in practice usually means port forwarding (Icom page above) [fetched].
- **There is no RS-BA1 to V2 upgrade path** (Icom page; WiMo) [fetched/snippet].
- **The original IC-7300 cannot be operated remotely over the Internet without a host PC**, because it has no network interface (SDR-Control listing; wfview.org).
- Beyond these documented constraints, no first-hand forum complaint threads about RS-BA1 were found. See the "Could not verify" list.

### Other clients (open-source and third-party)
- **wfview.** GPLv3. Runs on Linux, macOS and Windows. Covers modern Icom plus some Kenwood and Yaesu radios. Connects directly to network rigs (IC-7610, IC-705, IC-905, IC-9700, IC-R8600, IC-7850, TS-890S, Xiegu X6100). Can act as a USB-to-Ethernet bridge for an IC-7300, with a server end that runs on a Raspberry Pi. Includes a built-in hamlib-compatible rigctld server and a virtual serial port (Windows) or pseudo-terminal (Linux/macOS) (https://wfview.org/ [fetched]; license from the canonical repo https://gitlab.com/eliggett/wfview, as quoted in its GitHub mirror https://github.com/m0vse/wfview, which says "do not use this repo") [fetched].
- **SDR-Control for Icom (DL8MRE).** Commercial macOS/iOS app. Mac **$99.99**, iPad **$49.99**. Supports the IC-705, 7610, 9700, R8600, 7300 and 7760 (https://apps.apple.com/app/sdr-control-for-icom/id1592313285) [snippet].
- **SDR9700.** GPL-3.0 native Qt6/C++ client for the IC-9700 by W5JWP. It is the protocol source for Aether-gate's Icom LAN transport (Aether-gate README credits). `gh api repos/w5jwp/SDR9700` now redirects to https://github.com/MCAServicesGroup/SDR9700.

### Approximate prices (US dealer, DX Engineering)
| Model | Price | Source |
|---|---|---|
| IC-7610 (current "-32" SKU) | $3,999.95 ($3,799.95 after rebate to 2026-12-31) | https://www.dxengineering.com/parts/ico-ic-7610-32 [fetched] |
| IC-7300MK2 | $1,499.95 | https://www.dxengineering.com/parts/ico-ic-7300mk2 [fetched] |
| IC-7300 (original) | about $1,000 to $1,500 historically; current US price not confirmed | https://swling.com/blog/2016/03/icom-ic-7300-retail-price-and-shipping-dates-set [snippet] |
| IC-705 | $1,499.95 list, $1,399.95 with rebate | https://www.dxengineering.com/parts/ico-ic-705 [fetched] |
| IC-905 | $3,199.95 list, $2,699.95 sale | https://www.dxengineering.com/parts/ico-ic-905 [fetched] |
| RS-BA1 V2 | about $150 | see above |

---

## 3. Apache Labs ANAN (ANAN-7000DLE MkII, ANAN-G2 "Saturn")

### Architecture
- **openHPSDR-family "dumb radio".** The FPGA streams I/Q over Gigabit Ethernet, and the PC does the DSP (the WDSP library). openHPSDR **Protocol 1** is the original Metis/Hermes UDP protocol. **Protocol 2** is the newer one used by the 7000DLE MkII (selected by firmware) and the G2. Thetis 2.8.11 and later loads whichever matches the firmware (https://community.apache-labs.com/viewtopic.php?p=9959) [snippet]. FPGA source is at https://github.com/TAPR/OpenHPSDR-Firmware (GPL-3.0, `gh api`).
- **ANAN-G2 (Saturn).** Has an internal Raspberry Pi CM4 with Gigabit Ethernet, USB and HDMI. It can run piHPSDR standalone with a monitor attached, or act as a Protocol 2 server to a PC through piHPSDR or `p2app` (https://community.apache-labs.com/viewtopic.php?p=27081) [snippet]. User guide: https://apache-labs.com/storage/download_file/1756364841_1023_1023_G2-manual-v1.4-2_updated.pdf [snippet]. The 7" G2 is being replaced by the **G2 Ultra** with an 8" display (https://community.apache-labs.com/viewtopic.php?p=30275) [snippet].
- **ANAN-7000DLE MkII.** First shipped December 2019. A forum post says silver MkII production has ended (https://community.apache-labs.com/viewtopic.php?p=17091) [snippet]. The model does not appear on the current apache-labs.com storefront (https://apache-labs.com/) [fetched], and its old product URL returns 404.

### Official and recommended software, OS
- **Thetis.** GPL-2.0 plus a dual-licensing file. Maintained by MW0LGE at https://github.com/ramdor/Thetis [fetched]. Latest release is v2.10.3.13, dated 2026-04-01. The repo was archived in April 2026, then announced active again in July 2026 with a focus on remote operation and TCI over WebSocket. `gh api` shows archived=false and last push 2026-09-09. **Windows**: Thetis depends on .NET Framework 4.8 and SharpDX. That platform conclusion is an inference; the repo does not state it explicitly. The HL2 wiki says plainly "Thetis ... Windows only" (https://raw.githubusercontent.com/wiki/softerhardware/Hermes-Lite2/Software.md) [fetched].
- **piHPSDR.** GPL-3.0. Originally by G0ORX; DL1YCF now maintains the main branch at https://github.com/dl1ycf/pihpsdr (`gh api`: GPL-3.0, last push 2026-10-19). Runs on Linux (targets the Raspberry Pi) and macOS (https://community.apache-labs.com/viewtopic.php?p=9753) [snippet]. Speaks both Protocol 1 and Protocol 2 (repo description). Apache ships a piHPSDR manual (apache-labs.com) [fetched].
- **linHPSDR.** GPL-3.0, Linux desktop, by G0ORX: https://github.com/g0orx/linhpsdr (`gh api`, last push 2026-08-19).
- **deskHPSDR** runs on the G2's internal CM5 and can be displayed over VNC. **SDR Console** does not work with the G2 out of the box (https://swenton.com/) [fetched].

### Remote, audio and CAT
- The PC application is the station. Remote operation means remote desktop or an application-level server: Thetis is adding TCI/WebSocket remote, and the G2's internal Pi can act as a P2 server (sources above). Digital modes go through the client's CAT (TCI or Kenwood-style CAT in Thetis) plus virtual audio cables. No specific primary source was fetched for this point; see the list.

### What operators complain about
- **Thetis has a "substantial learning curve"** (https://swenton.com/) [fetched].
- **The G2's CM4 is "marginal" for running piHPSDR**, and some owners swap in a Radxa CM5 (https://community.apache-labs.com/viewtopic.php?p=32020) [snippet].
- **Protocol 2 firmware stability.** Forum advice is to run Protocol 1 for a few days before flashing Protocol 2 (https://community.apache-labs.com/viewtopic.php?p=10651) [snippet].
- **Thetis maintenance uncertainty**: archived in April 2026, revived in July 2026 (Thetis repo).

### Approximate prices (apache-labs.com, all marked "Pre-Order") [fetched]
| Model | Price |
|---|---|
| ANAN-G2E (100 W) | $2,295 |
| ANAN-G2 (no LCD) | $3,795 |
| ANAN-G2 Ultra | $4,495 |
| ANAN-G2-1K (1 kW+) | $6,295 |
| G2E-20 | $1,295 |
| ANAN-7000DLE MkII | not listed; used market only (see list) |

---

## 4. Hermes-Lite 2 (HL2)

### Specs and openness
- **Coverage and power.** 0 to 38.4 MHz, with no 6 m. 5 W QRP on all HF bands. AD9866 12-bit ADC at 76.8 MHz and DAC at 153.6 MHz. 4 receivers, or 9 with a gateware variant, each up to 384 kHz. **No audio jack**: audio is produced on the host PC (https://raw.githubusercontent.com/wiki/softerhardware/Hermes-Lite2/FAQ.md) [fetched].
- **Protocol.** Compatible with all openHPSDR **Protocol 1** software, plus HL2-specific extensions (https://raw.githubusercontent.com/wiki/softerhardware/Hermes-Lite2/Software.md) [fetched].
- **Openness.** Described as "entirely open source and open hardware, including the tools used for design and fabrication files". Over 500 HL2 units built. Project led by Steve Haynal, KF7O (https://softerhardware.github.io/Hermes-Lite2/, the hermeslite.com content) [fetched]. No LICENSE file was found in the repo tree (`gh api`), so the specific license is unverified.

### Price and purchase
- **Makerfabs: $269**, in stock (https://www.makerfabs.com/hermes-lite-2.html, price scraped). Separate items on the same page are listed at $52.80 and $16.90. They are probably the N2ADR filter board and an accessory, but that mapping is unverified. The wiki's Group-Buy page names Makerfabs as seller of the assembled HL2 and the N2ADR companion filter card, with some final assembly needed (https://raw.githubusercontent.com/wiki/softerhardware/Hermes-Lite2/Group-Buy.md) [fetched].

### Software support (per the HL2 wiki Software page [fetched])
- **Quisk.** Open source, Windows and Linux including Raspberry Pi. N2ADR prototypes new HL2 features in it.
- **SparkSDR.** "Free and easy to install". Windows, Mac and Linux including Raspberry Pi. Multiband skimming. By M0NNB. Closed source as far as can be determined (see list).
- **Thetis (HL2 fork by MI0BOT).** Experimental, Windows. https://github.com/mi0bot/OpenHPSDR-Thetis
- **linHPSDR.** Open source, Linux, includes PureSignal. HL2 updates by M5EVT.
- **piHPSDR.** Open source, Linux and Raspberry Pi. HL2 updates by DL1YCF.
- **Others.** SDR Console (Windows, free), PowerSDR, OpenWebRX, GNU Radio, CW Skimmer.
- **Rigflow 1.0.** Announced as a free MIT-licensed Rust client with HL2 transmit (https://groups.google.com/g/hermes-lite/c/pBzQ5lT9AcM) [snippet].

### Remote, audio and CAT
- Because the HL2 is a network radio with no audio jack, "remote" means placing the HL2 anywhere on a network the host can reach. Wi-Fi links can cause problems, and wired Ethernet is recommended (FAQ) [fetched]. Digital modes run through each client's CAT plus virtual audio, and the wiki has WSJT-X guides (Software page).

### Community
- Google Group https://groups.google.com/g/hermes-lite and the GitHub wiki/issues (hermeslite.com page) [fetched]. https://github.com/softerhardware/Hermes-Lite2 has 377 stars, last push 2026-07-30 (`gh api`).

### Known limitations
- QRP only (5 W), no 6 m, 12-bit ADC. The project says performance "is largely set by the AD9866" (FAQ) [fetched]. Some assembly is required (Group-Buy) [fetched].

---

## 5. Context only: Elecraft K4 and Yaesu FTDX101

- **Elecraft K4.** Has a built-in peer-to-peer remote server, so no PC or third-party server is needed. The **K4/0** zero-power remote panel acts as a client to a K4 or K4D (https://elecraft.com/products/k4-0-remote-panel) [snippet; manual https://ftp.elecraft.com/K4-Remote/Manuals%20Downloads/Elecraft%20K4_0%20Remote%20Panel%20Owner's%20Manual,%20rev%20A2.pdf]. Prices: K4/0 **$2,499.95**; K4D factory-assembled **$7,248.95** (both from elecraft.com product-page JSON). Search snippets showed an older $2,299.95 "introductory" price for the K4/0.
- **Yaesu FTDX101D/MP.** Remote operation uses the **SCU-LAN10** network interface (connects to the radio over USB and the ACC jack) plus Yaesu's **free Windows-only** remote app. Version 2 adds remote power on/off. A headset is required, and PTT is a mouse click. About €339 in the EU (https://www.yaesu.co.uk/scu-lan10, https://www.wimo.com/en/scu-lan10, QST review https://www.arrl.org/files/file/QST%20Binaries/2021%20QST/05%20May%202021/QST%20in%20Depth%20-%20May%202021%20issue%20-%20Yaesu%20SCU-LAN10.pdf) [snippet]. FTDX101D US price around $2,700 to $4,000 depending on promotions (https://mtcradio.odoo.com/shop/yaesu-ftdx-101d-100w-hf-50mhz-transceiver-in-stock-15848) [snippet, undated].

---

## Comparison table

| Platform | Official client OS | Official remote story | Open-source client options | Approx. price |
|---|---|---|---|---|
| **FlexRadio FLEX-8000** | Windows (SmartSDR). macOS/iOS through paid third-party apps ($99.99 / $79.99). No Linux. | SmartLink (built in, license-gated on v1/v2 upgrades), Maestro $1,599, MultiFlex | **AetherSDR** (GPL-3, Linux/macOS/Windows); nDAX/nCAT (MIT, helpers) | $2,499 to $5,899 |
| **FlexRadio FLEX-6000** (discontinued) | same as above | same; v4 Basic free; SmartSDR+ $199/yr for new features | same | last MSRP $2,299 to $5,699; used market |
| **FlexRadio Aurora** | same as above | same | AetherSDR | $6,199 (AU-510), $8,599 (AU-520) |
| **Icom IC-7610 / 705 / 7300MK2 / 905** | Radio is standalone. RS-BA1 V2 remote is Windows-only. | RS-BA1 V2 (~$150, static IP or DDNS); the 7300 needs a host PC; 7300MK2 has LAN | **wfview** (GPL-3, Linux/macOS/Windows); SDR-Control (paid, Mac/iOS) | 7300MK2 $1,500; 705 $1,400 to $1,500; 905 $2,700 to $3,200; 7610 $3,800 to $4,000 |
| **Apache Labs ANAN-G2 / 7000DLE MkII** | Thetis (Windows; GPL-2) | Remote desktop; Thetis TCI remote in development; G2 internal Pi as P2 server | piHPSDR (GPL-3, Linux/macOS/Pi), linHPSDR (GPL-3, Linux), Thetis itself is open source | G2 family $1,295 to $6,295 (pre-order); 7000DLE MkII used only |
| **Hermes-Lite 2** | No vendor client; community software | Network radio; place anywhere on the LAN | Quisk, linHPSDR, piHPSDR, Thetis-HL2 fork (all open); SparkSDR (free, closed) | $269 board (Makerfabs) |
| Elecraft K4 (context) | Radio is standalone | Built-in P2P server; K4/0 panel $2,499.95 | n/a | K4D $7,248.95 |
| Yaesu FTDX101 (context) | Radio is standalone | SCU-LAN10 hardware (~€339) plus free Windows app | wfview lists modern Yaesu support (model-level unverified) | $2,700 to $4,000 |

---

## Through the AetherSDR lens

Three separate tiers of support exist. Keep them separate in promotional copy:
- **Tier A, supported.** The AetherSDR README "Supported Hardware" section lists **FlexRadio only**.
- **Tier B, native but not yet supported.** These are AetherSDR's own non-Flex backends, built on its `IRadioBackend` seam and labelled exactly as the README labels them. The README says "None is a supported family yet", with the single exception of the IC-7300MK2.
- **Tier C, Aether-gate bridge.** Only the Aether-gate README "Supported radios" table counts as supported. `RADIO_SUPPORT.md` describes itself as a design document: "everything else is a best-known plan — VERIFY before relying on it."

### FlexRadio: Tier A, native
**Gains today** (all from the AetherSDR README):
- Native Linux (x86-64 and aarch64, including Raspberry Pi), macOS (Apple Silicon and Intel, signed and notarized) and Windows builds. No Wine or VM. Free and GPL-3.
- **Covers the platforms where Flex users currently pay extra or have nothing**: Linux has no official client, and macOS/iOS clients cost $99.99 and $79.99.
- **Covers every radio in this brief's Flex set**: all FLEX-6000 models (6300 through 6700, including 6400M and 6600M), FLEX-8400/8400M/8600/8600M, and AU-510/510M/520/520M.
- **Built-in DAX equivalent**: up to 8 RX audio channels plus 1 TX, and 4 I/Q channels at 24 to 192 kHz, for WSJT-X, fldigi, VARA and JS8Call. CAT through rigctld or virtual serial, and a TCI v2.0 server. This replaces the Windows-only DAX and SmartSDR CAT tools.
- **Remote**: SmartLink WAN remote, plus remote through an in-radio Tailscale node for FLEX-8000 and Aurora radios behind CGNAT.
- **Shared operation**: Multi-Flex alongside SmartSDR and Maestro.
- **Features of its own**: seven client-side NR engines, GPU spectrum at up to 60 fps, FreeDV RADE, packet/APRS, a CW decoder suite, a speech-to-text copy assist, a SWR sweep, and amplifier/tuner integration (PGXL, TGXL, ACOM, SPE, KPA1500 and others).
- **No SmartSDR+ subscription for the client itself.** Because AetherSDR targets 4.x firmware and v4 Basic is free, a FLEX-6000 owner on v3 can move to 4.x without paying.

**Not supported or caveats:**
- **SmartSDR v3.x firmware is unsupported.** The active test target is FLEX-8600 firmware 4.2.18.
- **Firmware feature unlocks still follow FlexRadio's license.** AetherSDR does not unlock SmartSDR+ features, and SmartLink and MultiFlex availability on v1/v2-upgraded radios depends on the radio's license (inferred; see list).
- **Legal disclaimer to carry into promotional copy:** "AetherSDR is an independent project and is not affiliated with or endorsed by FlexRadio Systems" (README).

### Icom: Tier B native (early) plus Tier C gate
**AetherSDR native "Networked Icom" backend, rated "early":**
- Uses CI-V over the RS-BA1 UDP transport. Brought up on the **IC-705** (receive, scope, **transmit**, FT8).
- Completed against a live **IC-7300MK2** (controls, meters, ATU, WSPR, PC audio routing, CW decoder).
- **The IC-7300MK2 over built-in Ethernet/RS-BA1 is supported as of v26.9.5.** This is the only non-Flex radio the README calls supported.
- Only the IC-705 and IC-7300MK2 are verified against their own CI-V guides. An unrecognised model "gets no scope and no transmit rather than optimistic defaults" (README).
- **Gain**: a free, cross-platform alternative to Windows-only RS-BA1 for the 7300MK2 and 705, with no RS-BA1 purchase required. The free part is inferred, because AetherSDR speaks the RS-BA1 transport itself.

**Aether-gate (Tier C):**
- **Supported table**: Icom LAN with the **IC-9700** proven; **IC-7300 over USB** proven for receive and control only (USB CI-V, the radio's own scope, USB audio).
- **Transmit**: receive and control for all families. The README is internally inconsistent. Its banner says "no transmit yet", but "How it works" says the **Icom LAN adapter does key the rig** (CI-V `1C 00`) behind guards: an arm latch, a 2 m/70 cm band whitelist with 23 cm refused, a 10 s stuck-PTT watchdog, and force-unkey when AetherSDR disconnects. `--rx-only` disables it. **Treat Icom LAN TX as early and guarded. No other family keys.**
- **IC-7610, IC-705 and IC-905** appear in the gate's Icom LAN design table, with the 905's upper bands via XVTR mapping. They are not proven.

**Not supported:**
- **IC-7610 and IC-905 in AetherSDR natively**: an unrecognised model gets no scope and no TX.
- **Original IC-7300 natively**: it has no LAN, so it is reachable only through the gate's USB adapter, receive-only.
- **Dual-receive/dualwatch on the 7610** is not claimed anywhere.
- **Disclaimer:** "D-STAR is a registered trademark of Icom Inc. AetherSDR is not affiliated with or endorsed by Icom Inc." (README).

### Apache Labs ANAN
**ANAN-G2, Tier B, "experimental, receive-only":**
- openHPSDR **Protocol 2** discovery, one receive path, spectrum and audio, tuning and zoom, NB/NB2, S-meter, and per-radio memory. **"Transmit is a future phase"** (README).
- **Gain**: a native macOS/Linux/Windows receive client with AetherSDR's NR and decoders.
- **Not a Thetis replacement for transmitting or PureSignal.**

**ANAN-7000DLE MkII:**
- Not named in AetherSDR's README.
- Aether-gate has an `hpsdr` adapter registered in `aether_gate/adapters/__init__.py`. Its source describes it as HPSDR **Protocol 1** (Metis), **RX-only** ("never sets the MOX bit"), verified live on a Hermes-Lite 2 and a Radioberry. **It is not in the gate's README supported table.**
- A 7000DLE MkII running Protocol 1 firmware is therefore *theoretically* reachable receive-only through the gate, but this is **unverified**.
- **The G2 (Protocol 2) is not reachable through the gate**, because the hpsdr adapter is Protocol 1 only.

### Hermes-Lite 2
**AetherSDR native backend, "experimental", with transmit:**
- Four independent receivers.
- **Transmit**: SSB/AM/DSB/FM voice through WDSP's TXA with ALC.
- **Modes and decoding**: CW/RTTY decoding and AX.25 packet.
- **Hardware control**: band switching with hardware filters, wideband bandscope, CL1 external 10 MHz reference, and board-variant declaration (bare HL2, AK4951 companion, SquareSDR 2).
- **Gain**: one polished cross-platform client, including macOS. Most open HL2 clients are Linux- or Windows-centric; SparkSDR is the cross-platform exception.

**Through the gate:**
- The `hpsdr` adapter is RX-only and missing from the README table (see the ANAN entry). It is the redundant path, since native support exists.

**Not supported or caveats:**
- **Experimental status.** AetherSDR does not claim PureSignal or the full HL2 feature set that Quisk or linHPSDR offer, and is not described as production-ready for HL2.

### Elecraft K4 and Yaesu FTDX101 (context)
**Elecraft K4:**
- **No K4-specific path** in AetherSDR or Aether-gate.
- The gate README mentions Elecraft only in the generic "Kenwood / Yaesu / Elecraft / Icom-USB (CAT) via hamlib" row, and only the Kenwood TS-450S is proven on that row.
- Any K4 use would be receive and control only, through hamlib, with an **external SDR dongle for the panadapter**. This is unverified.

**Yaesu FTDX101D/MP:**
- Has rows in the gate's **design** table (`yaesu` adapter, hamlib IDs 1040/1044, spectrum via an IF-tap or off-air dongle) marked "VERIFY". The `yaesu` adapter is registered in code.
- **Not proven. Receive and control only.**

**Platform limits in Aether-gate (these affect Kenwood/Yaesu/Elecraft users):**
- **The Windows build excludes Kenwood/Yaesu CAT** ("still to come").
- **macOS has no packaged build**; it runs from source.
- **Linux has a Raspberry Pi image and Docker images.**
- **HF CAT rigs need an HF-capable dongle** (RTL-SDR Blog V4, Airspy HF+, RX888) for the waterfall (gate README and RADIO_SUPPORT.md).

### Also in AetherSDR (not one of the requested platforms)
- **RTL-SDR**: experimental, receive-only, bundled in every package.
- **KiwiSDR and Web-888 public receivers**: receive.
- **Demo mode**: runs with no radio.

---

## Claims I could not verify

1. **The actual price paid for a SmartSDR v3 upgrade** (forum recollection: "about $200"). No official historical price page was found.
2. **The SmartSDR for iOS App Store seller vs. developer.** The listing shows FlexRadio Systems; the tracker shows Marcus Roskosch. Whether FlexRadio is now the legal seller is unresolved.
3. **SmartSDR for Mac's $99.99 is current.** It comes from an undated store snippet; earlier posts say $149.99, then $89.99 to $99.99.
4. **Whether AetherSDR's SmartLink works on radios whose license lacks SmartLink.** Almost certainly not, because registration and licensing are radio-side, but this brief did not confirm it.
5. **FlexRadio discovery port** (4991 vs. 4992 UDP). Forum posts conflict.
6. **IC-905 and IC-7300MK2 on Icom's official RS-BA1 V2 compatibility chart.** Neither is on the fetched chart; RS-BA1 support for both is claimed only by dealer and distributor pages.
7. **The current US price of the original IC-7300**, and whether it is still sold new alongside the MK2.
8. **First-hand operator complaints about RS-BA1** (latency, NAT, stability). Only the documented constraints were found.
9. **Icom USB audio codec and CI-V specifics per model**, including whether the IC-905 has USB audio. Stated from general knowledge, not fetched.
10. **ANAN-7000DLE MkII current price and availability.** A forum post says silver production ended; it is absent from the storefront; the used market price was not found.
11. **ANAN remote and digital-mode specifics** (Thetis CAT and VAC behaviour). Not fetched from primary docs.
12. **That Thetis is Windows-only.** Inferred from .NET 4.8 and SharpDX and stated by the HL2 wiki; the Thetis repo does not state it explicitly.
13. **Hermes-Lite 2 hardware license** (for example, which open-hardware license). No LICENSE file was found in the repo.
14. **The Makerfabs $52.80 and $16.90 line items.** The mapping to the N2ADR filter card and enclosure is unconfirmed. Whether $269 includes the filter board is also unconfirmed.
15. **SparkSDR licensing.** Free of charge per the HL2 wiki; the closed-source status was not confirmed.
16. **Aether-gate `hpsdr` adapter with ANAN-7000DLE MkII** (Protocol 1). It is verified only on HL2 and Radioberry, per its source docstring.
17. **Aether-gate with IC-7610, IC-705 or IC-905**, and with any Yaesu, Elecraft or other Kenwood rig beyond the TS-450S. These are design-table entries only.
18. **The Aether-gate README contradiction on TX.** The banner says no TX for every family, while "How it works" describes a guarded Icom LAN TX path. The code path was not tested.
19. **wfview model-level support for the IC-7300MK2 and the Yaesu FTDX101.** Not listed on the fetched wfview.org page.
20. **K4/0 price.** The product JSON shows $2,499.95, while a search snippet showed a $2,299.95 "introductory" price. The current K4 (non-D) base price was not found.
21. **FTDX101D current US MSRP.** Only undated dealer listings were found.
22. **The AU-510M and AU-520M USD MSRP.** Only EU retail prices were found.
23. **The FlexRadio forum complaint threads (SmartSDR+ pricing, VM performance).** Seen only via search snippets of comment pages, not read in full.
