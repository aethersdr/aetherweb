// "On the band": what the live spectrum shows for each use case. The same
// keys drive the 3D annotations (world/bandstage.js) and the DOM legend, so
// the view reads the same with or without WebGL. The band is modeled; these
// lines describe the illustration, not measurements.

export const onband = {
  contesting: [
    { key: 'run', color: '#ffb547', title: 'Your run frequency', text: 'Slice A holds the frequency while you call CQ.' },
    { key: 'sp', color: '#5de3ff', title: 'Search and pounce', text: 'Slice B sweeps the band for the next multiplier.' },
    { key: 'spots', color: '#8ef7a8', title: 'Spots on the signal', text: 'Cluster and skimmer spots land right on the trace — new multiplier, CQ, or dupe.' },
  ],
  dxing: [
    { key: 'dx', color: '#ffffff', title: 'The DX', text: 'The rare station, transmitting on its own frequency.' },
    { key: 'pile', color: '#5de3ff', title: 'The pileup', text: 'Everyone calling, spread up 5–15.' },
    { key: 'tx', color: '#ffd166', title: 'Your TX', text: 'Monitor TX lets you hear where you’ll land — and drop into the gap.' },
  ],
  ft8: [
    { key: 'cycle', color: '#8ef7a8', title: '15-second cycles', text: 'Everyone transmits together, then everyone decodes.' },
    { key: 'decodes', color: '#ffffff', title: 'Decodes on the signal', text: 'Each message appears over the signal that sent it.' },
    { key: 'band', color: '#5de3ff', title: 'The FT8 sub-band', text: 'Dozens of stations in a few kilohertz.' },
  ],
  datamodes: [
    { key: 'pair', color: '#7bf2dc', title: 'Mark and space', text: 'RTTY is two tones; the decoder reads the shift.' },
    { key: 'text', color: '#ffffff', title: 'Text off the air', text: 'Decoded characters stream straight off the signal.' },
  ],
  digivoice: [
    { key: 'rade', color: '#c9a7ff', title: 'RADE digital voice', text: 'Voice in about 1.5 kHz.' },
    { key: 'ssb', color: '#8598b4', title: 'An SSB signal', text: 'About twice as wide as RADE.' },
    { key: 'others', color: '#8ef7a8', title: 'The neighbours', text: 'FT8, FT4 and CW sharing the same band.' },
  ],
  portable: [
    { key: 'spot', color: '#ffd166', title: 'A park is spotted', text: 'The POTA spot lands on the activator’s signal.' },
    { key: 'tune', color: '#5de3ff', title: 'One click', text: 'Click the spot and the slice is there.' },
    { key: 'weak', color: '#8ef7a8', title: 'Weak signals', text: 'QRP from the field, pulled out of a quiet band.' },
  ],
  ragchew: [
    { key: 'tables', color: '#ff8a65', title: 'Round tables', text: 'The conversation passes from station to station on one frequency.' },
    { key: 'mic', color: '#ffffff', title: 'Who has the mic', text: 'One voice at a time, each at its own strength.' },
    { key: 'qso', color: '#ffd166', title: 'A long QSO', text: 'Two stations, settled in for the hour.' },
  ],
  remote: [
    { key: 'home', color: '#7db7ff', title: 'The station, at home', text: 'Radio, antennas and amplifier stay where they are.' },
    { key: 'link', color: '#ffffff', title: 'The whole panadapter, to you', text: 'Spectrum, audio and control across the internet.' },
    { key: 'you', color: '#8ef7a8', title: 'You, anywhere', text: 'The laptop you have, on the OS you have.' },
  ],
  accessible: [
    { key: 'words', color: '#f9a8d4', title: 'Words for what’s on air', text: 'Voice becomes a live transcript.' },
    { key: 'cw', color: '#ffffff', title: 'CW, decoded', text: 'Morse becomes text.' },
    { key: 'speak', color: '#8ef7a8', title: 'Announced, not just drawn', text: 'Frequency and S-meter read out as they settle.' },
  ],
  integration: [
    { key: 'hub', color: '#f472b6', title: 'One client', text: 'AetherSDR at the centre of the station.' },
    { key: 'gear', color: '#ffffff', title: 'The whole station', text: 'Amplifier, tuner, switch, rotator, logger, automation and controllers — connected.' },
  ],
};
