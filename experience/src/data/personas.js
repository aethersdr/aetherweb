// The operators on the ring. These are archetypes drawn from the research —
// not real people — and each station is dressed the way that operator works.

export const personas = [
  {
    id: 'contester', name: 'The Contester', color: '#ffb547',
    tagline: 'Rate, multipliers, two radios, 48 hours',
    look: { desk: 'contest', shots: ['multislice', 'stack3d'], antenna: 'stack', lean: -0.24, reach: [-3.5, 6.5], color: '#ffb547' },
    who: 'Lives for CQ WW, WPX and Field Day weekends. Runs on one band while searching and pouncing on another, measures success in QSOs per hour, and has spent more time configuring software than they’d like to admit. In CQ WW CW 2025, Assisted single-op entries outnumbered Unassisted 3,112 to 2,260.[[cqww-cw-2025]]',
    needs: [
      'See two bands at once and switch focus without thinking.',
      'Spots from the cluster and skimmers on the band map, with dupes and needed multipliers marked.[[cqww-rules]]',
      'Contest messages on F-keys in CW and voice, and a logger that owns the screen.',
      'An antenna check before the contest, and amps and tuners that follow band changes.',
    ],
  },
  {
    id: 'dxer', name: 'The DXer', color: '#5de3ff',
    tagline: 'Rare entities, split pileups, weak signals',
    look: { desk: 'island', shots: ['multislice'], antenna: 'hexport', color: '#5de3ff' },
    who: 'Chases DXCC entities and DXpeditions. Knows the drill: listen first, find where the DX is listening, call once, at the right moment.[[split-art,ari-dxped]] Fights an urban noise floor that measured well above the ITU-R reference in a Dutch study,[[noise-twente]] on a declining Solar Cycle 25.[[sc25-peak]]',
    needs: [
      'Hear the DX and the pileup together, and know exactly where they will transmit.',
      'Pull weak signals out of local noise.',
      'Know whether the path is open — and how they’re being heard.',
    ],
  },
  {
    id: 'digital', name: 'The Digital-Mode Operator', color: '#8ef7a8',
    tagline: 'FT8, FT4, JS8, packet, RADE — often at once',
    look: { desk: 'shack', shots: ['multislice'], antenna: 'hex' },
    who: 'FT8 by breakfast, packet by lunch, a RADE QSO in the evening. FT8 passed 60% of Club Log activity by 2021,[[clublog-ft8]] and digital was the only mode that grew at Field Day 2025.[[fd-2025]] Every mode means another program — and another virtual audio cable and CAT port.[[flex-wsjtx-multi]]',
    needs: [
      'Audio and rig control for decoders without a stack of virtual cables and ports.',
      'More than one band decoding at once.',
      'A clock within ±1 s of UTC.[[wsjtx-guide]]',
      'Packet, APRS and digital voice without extra hardware.',
    ],
  },
  {
    id: 'ragchewer', name: 'The Rag Chewer', color: '#ff8a65',
    tagline: 'Long QSOs, round tables and the Sunday net',
    look: { desk: 'studio', shots: ['audio', 'stack3d'], antenna: 'dipole', lean: 0.32, phones: false },
    who: 'Here for the conversation, not the exchange: the Sunday-morning round table on 75 m, the regulars who know each other’s voices, QSOs that sail past the thirty minutes the ARRL Rag Chewers’ Club asks for.[[arrl-rcc]] This one’s shack looks like a podcast studio — a Shure SM7B on a boom arm, an audio interface, studio monitors instead of headphones, and a chair that leans back.',
    needs: [
      'Transmit audio that sounds like them — warm, even, no sibilance — from a broadcast mic that wants 60 dB of clean gain.[[shure-sm7b-gain]]',
      'Receive audio comfortable enough for an hour on speakers: less hiss, strong and weak stations levelled.',
      'Ride out the fading on a long-haul QSO.',
      'A clean signal when the amplifier is on.',
      'Know who just joined, and when the net starts.',
    ],
  },
  {
    id: 'portable', name: 'The Park Hunter & Activator', color: '#ffd166',
    tagline: 'POTA from the shack and from the picnic table',
    look: { desk: 'picnic', shots: ['stack3d'], antenna: 'endfed' },
    who: 'Hunts parks from home during the week and activates one on Saturday — 10 contacts in a UTC day makes it count.[[pota-wiki]] One of the 10,396 activators logged in 2025 (secondary data).[[pota-2025]]',
    needs: [
      'Work a park the moment it’s spotted.',
      'A light, honest setup in the field — and a quick antenna check.',
      'Know the grid square and that the clock is right.',
    ],
  },
  {
    id: 'remote', name: 'The Remote Operator', color: '#7db7ff',
    tagline: 'The home station, from a laptop anywhere',
    look: { desk: 'cafe', shots: ['stack3d'], antenna: 'none' },
    who: 'The radio is at home (or at a remote contest station); the operator is in a hotel, an office, or a café. Carries whatever laptop they own — which is often not a Windows PC.[[flex-8600,flex-linux]]',
    needs: [
      'A client that runs on the laptop they have.',
      'Reach the radio through carrier-grade NAT.',
      'Survive a bad link without losing the session — or leaving the transmitter keyed.',
    ],
  },
  {
    id: 'accessible', name: 'The Accessible Operator', color: '#f9a8d4',
    tagline: 'Screen reader, keyboard, and words for what’s on air',
    look: { desk: 'shack', shots: ['audio'], antenna: 'vertical' },
    who: 'A blind or low-vision ham, or one with hearing loss. Panadapters, waterfalls and sliders are the barrier: with one remote client, blind users could tune but “cannot adjust sliders or CW speed.”[[handiham-remote]] The usual answer has been a dedicated Windows-only accessible client.[[jjflex]]',
    needs: [
      'Every control named and reachable from the keyboard.',
      'Meters and frequency announced, not just drawn.',
      'Text channels for what’s heard: CW decode, and a transcript for voice.',
    ],
  },
  {
    id: 'experimenter', name: 'The Experimenter', color: '#c9a7ff',
    tagline: 'Hermes-Lite 2, Icom, dongles, automation',
    look: { desk: 'shack', shots: ['audio', 'claude'], antenna: 'vertical' },
    who: 'Owns more than one kind of radio — a $269 open-hardware Hermes-Lite 2,[[hl2-price,hl2-home]] an Icom, an RTL-SDR — runs Home Assistant in the shack, and reads source code for fun.',
    needs: [
      'One polished client across their radios, on their OS.',
      'Hooks for automation that can’t key the transmitter by accident.',
      'One client that grows with every radio they bring home.',
    ],
  },
];
