// Use cases: how hams operate, with sourced numbers. `band` re-tunes the live
// spectrum at the hub when the use case is opened.

export const usecases = [
  {
    id: 'contesting', name: 'Contesting', color: '#ffb547', band: 'contest',
    tagline: 'Rate, multipliers, 48 hours, two radios',
    about: 'Contesters hold a frequency and call CQ (“run”), or tune for stations and multipliers (“search and pounce”), as fast as they can for a whole weekend — often with two radios at once (SO2R). Spots from the DX cluster and the Reverse Beacon Network feed the band map; using them puts an entry in the Assisted category.[[cqww-rules]]',
    facts: [
      { value: '19,005', text: 'logs in CQ WW 2025 — an all-time record (10,576 SSB + 8,429 CW).[[cqww-cw-2025,cqww-ssb-2025]]' },
      { value: '3,112 vs 2,260', text: 'Assisted vs Unassisted single-op entries, CQ WW CW 2025 — spotting tools have become the norm.[[cqww-cw-2025]]' },
      { value: '128/h', text: 'average rate for the top US single-op over the whole CQ WW CW 2025 (6,165 QSOs).[[cqww-cw-2025]]' },
      { value: '~63/s', text: 'Reverse Beacon Network spots during CQ WW CW 2023 — 10.9 M in one weekend.[[rbn-cqww-2023]]' },
    ],
  },
  {
    id: 'dxing', name: 'DXing & pileups', color: '#5de3ff', band: 'pileup',
    tagline: 'Rare entities, split pileups, weak signals',
    about: 'DXers chase new countries and rare stations. DXpeditions usually work split — transmitting on one frequency and listening on another, often a window several kHz wide — and the trick is finding where the DX is listening right now.[[split-art,ari-dxped]] Solar Cycle 25 peaked in October 2024, so high-band openings are getting shorter.[[sc25-peak]]',
    facts: [
      { value: 'SSN 161', text: 'smoothed sunspot number at the Solar Cycle 25 peak, October 2024 — above the 105–125 forecast.[[sc25-peak]]' },
      { value: '2.1 billion', text: 'QSO records in ARRL’s Logbook of the World (July 2025).[[lotw-2b]]' },
      { value: '873', text: 'public KiwiSDR receivers online on 23 Oct 2026 — the DXer’s ears on other continents.[[kiwi-list]]' },
    ],
  },
  {
    id: 'ft8', name: 'FT8 & weak-signal digital', color: '#8ef7a8', band: 'ft8',
    tagline: 'The mode that took over the bands',
    about: 'FT8 trades conversation for sensitivity: 15-second transmit/receive cycles, a 50 Hz-wide signal, and decodes far below the noise. It needs the PC clock within ±1 second of UTC, and on a FlexRadio it is normally wired up with virtual audio (DAX) and a virtual CAT port per program.[[wsjtx-guide,flex-wsjtx-help]]',
    facts: [
      { value: '>60%', text: 'of Club Log activity was FT8 by March 2021 (nearly 85% on 6 m). Club Log share is not on-air share.[[clublog-ft8]]' },
      { value: '15%', text: 'FT8’s share in its launch year, 2017 — 4.8 M of 32 M Club Log QSOs.[[arrl-ft8-2017]]' },
      { value: '24%', text: 'of ARRL Field Day 2025 QSOs were digital — the only mode category that grew.[[fd-2025]]' },
    ],
  },
  {
    id: 'datamodes', name: 'RTTY, packet & keyboard modes', color: '#7bf2dc', band: 'rtty',
    tagline: 'RTTY contests, APRS, JS8, Winlink',
    about: 'Beyond FT8: RTTY contesting, PSK31 chat, JS8Call’s keyboard messaging and store-and-forward, AX.25 packet and APRS, and Winlink email over VARA for emergency communications. Each usually means another program and another audio/CAT connection.[[js8call,winlink-vara]]',
    facts: [
      { value: '7,050 bps', text: 'top VARA HF speed in 2,300 Hz — why Winlink stations moved to it.[[winlink-vara]]' },
    ],
  },
  {
    id: 'digivoice', name: 'Digital voice (FreeDV RADE)', color: '#c9a7ff', band: 'digital',
    tagline: 'Voice in half an SSB channel',
    about: 'FreeDV’s RADE mode uses a neural codec to send voice in about 1.5 kHz — half an SSB signal — and keeps working down to −2 dB SNR. ARRL reports manufacturers are integrating it, beginning with a downloadable module for certain FlexRadio models.[[freedv-rade,arrl-rade]]',
    facts: [
      { value: '~1.5 kHz', text: 'RADE bandwidth, working to −2 dB SNR.[[freedv-rade]]' },
    ],
  },
  {
    id: 'portable', name: 'Parks & portable', color: '#ffd166', band: 'quiet',
    tagline: 'POTA activators and the hunters who chase them',
    about: 'Parks on the Air activators set up in a park and need 10 contacts in a UTC day for a valid activation; hunters at home chase them from the spot feed.[[pota-wiki]] For the hunter, it is a small pileup every few minutes.',
    facts: [
      { value: '10,396', text: 'POTA activators in 2025, averaging 23.4 activations each (secondary, from pota.app data).[[pota-2025]]' },
      { value: '>49,000', text: 'active POTA hunters (10+ parks) as of June 2025 (secondary).[[pota-wiki]]' },
    ],
  },
  {
    id: 'ragchew', name: 'Rag chewing & nets', color: '#ff8a65', band: 'ragchew',
    tagline: 'Long conversations, round tables, the weekly net',
    about: 'A conversation, not an exchange. Rag chews run long — the ARRL Rag Chewers’ Club is for a contact of at least thirty minutes[[arrl-rcc]] — and nets meet on the same frequency at the same time every week. On phone that makes audio the whole game: how you sound, and how comfortably you can listen for an hour.',
    facts: [
      { value: '30 min', text: 'the minimum contact for the ARRL Rag Chewers’ Club.[[arrl-rcc]]' },
      { value: '60 dB', text: 'the clean preamp gain Shure recommends for the SM7B broadcast mic — more than many interfaces give.[[shure-sm7b-gain]]' },
    ],
  },
  {
    id: 'remote', name: 'Remote operation', color: '#7db7ff', band: 'mixed',
    tagline: 'Your station, from anywhere',
    about: 'Operating the home station over the internet — from the office, a hotel, or a laptop in another room. Flex radios do this with SmartLink; the client software has to run on whatever computer you have with you.[[flex-8600]] CW over the internet is sensitive to latency and dropouts.[[remote-cw-3830,flex-cw-latency]]',
    facts: [],
  },
  {
    id: 'accessible', name: 'Accessible operating', color: '#f9a8d4', band: 'mixed',
    tagline: 'Screen readers, keyboards, and text for what’s heard',
    about: 'Blind, low-vision and hard-of-hearing hams operate too — and the panadapter, the waterfall and the slider are exactly where mainstream SDR software shuts them out. With one remote client, blind users could tune and hear mode and frequency but “cannot adjust sliders or CW speed.”[[handiham-remote]]',
    facts: [],
  },
  {
    id: 'integration', name: 'Station integration', color: '#f472b6', band: 'mixed',
    tagline: 'Amps, tuners, controllers, loggers, other radios',
    about: 'A real station is more than a radio: amplifier, tuner, antenna switching, a logger, a MIDI or knob controller, sometimes radios from more than one maker. Most of the glue programs are Windows-only.[[n1mm-wine,cwskimmer]]',
    facts: [
      { value: '4', text: 'applications FlexRadio’s own SO2R guide has you configure for N1MM+: SmartSDR, DAX, SmartSDR CAT and N1MM+.[[flex-so2r]]' },
    ],
  },
];
