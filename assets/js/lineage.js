/* AetherSDR lineage timeline — rail geometry, reveal, and sticky readout.
 *
 * The legend and the event list are PRE-RENDERED into lineage.html so the page
 * has real content without JS. Regenerate them with:
 *
 *     python3 scripts/gen-lineage.py
 *
 * which reads LANES and EVENTS straight out of this file. Edit the data here —
 * it stays the single editing surface — then run the generator.
 *
 * This script still needs the data at runtime: the rail is drawn from measured
 * DOM positions, but lane membership and ordering come from EVENTS.
 */

/* ============================================================
   TIMELINE DATA — edit here, then re-run scripts/gen-lineage.py
   lane: legacy | hpsdr | flex | native | aether
   ============================================================ */

const LANES = [
  { id: 'legacy', label: 'PowerSDR (Flex legacy)', hex: '#3FC9A8' },
  { id: 'hpsdr',  label: 'OpenHPSDR / Thetis',     hex: '#F2B441', forksFrom: 'legacy', dead: true },
  { id: 'flex',   label: 'SmartSDR (proprietary)', hex: '#8B7FF0', forksFrom: 'legacy', dashedFork: true },
  { id: 'native', label: 'piHPSDR (native C)',     hex: '#EE7355', forksFrom: 'hpsdr' },
  { id: 'aether', label: 'AetherSDR',              hex: '#5DE3FF' }
];

const EVENTS = [
  {
    year: '2002', lane: 'legacy', era: 'Origins',
    title: 'A software defined radio for the masses',
    body: 'Gerald Youngblood publishes a four-part series in ARRL’s QEX between July 2002 and March 2003. Part four announces the SDR-1000 as a semi-assembled board set, with the software to be released in open-source form.',
    people: [['AC5OG', 'Gerald Youngblood']]
  },
  {
    year: '2002', lane: 'legacy', era: 'Origins',
    title: 'DttSP becomes the DSP core',
    body: 'Frank Brickle and Bob McGwier write the C signal-processing engine that sits underneath PowerSDR and release it under the GPL. Every console on this page inherits its architecture, directly or by way of a rewrite.',
    people: [['AB2KT', 'Frank Brickle'], ['N4HY', 'Bob McGwier']]
  },
  {
    year: '2003', lane: 'legacy', era: 'Origins',
    title: 'SDR-1000 and PowerSDR ship under GPLv2',
    body: 'A headless box that converts RF to an 11 kHz I/Q pair over a parallel port, with everything else done in software. The GPL release is the single most consequential decision in this history — it is why the rest of the page exists.',
    people: [['FlexRadio Systems']]
  },
  {
    year: '2005', month: '– 06', lane: 'hpsdr', era: 'The HPSDR era',
    title: 'The HPSDR group forms',
    body: 'Phil Covington’s FPGA project merges with the XYLO effort by Phil Harman and Bill Tracey. The result is a modular open-hardware bus — Atlas, Ozy, Mercury, Penelope — built around direct conversion from DC to 55 MHz.',
    people: [['N8VB', 'Phil Covington'], ['VK6APH', 'Phil Harman'], ['KD5TFD', 'Bill Tracey']]
  },
  {
    year: '2007', lane: 'hpsdr', era: 'The HPSDR era',
    title: 'PowerSDR is ported to HPSDR hardware',
    body: 'Bill Tracey and Doug Wigley adapt FlexRadio’s GPL console to drive Mercury, Penelope, Ozy and Metis. The branch becomes OpenHPSDR PowerSDR mRX PS. From this point the two codebases evolve separately.',
    people: [['KD5TFD', 'Bill Tracey'], ['W5WC', 'Doug Wigley']]
  },
  {
    year: '2008', lane: 'hpsdr', era: 'The HPSDR era',
    title: 'TAPR funds Mercury development',
    body: 'TAPR agrees to fund the Mercury receiver proposal in March and continues underwriting OpenHPSDR hardware from then on, distributing boards as kits and assembled units.',
    people: [['TAPR']]
  },
  {
    year: '2012', month: 'OCT', lane: 'hpsdr', era: 'Commercialisation',
    title: 'Apache Labs ships the ANAN-10',
    body: 'The Hermes board collapses Mercury, Metis and Penelope onto one PCB with Ethernet. Apache Labs wraps it in a chassis with a PA and filters. The ANAN-100 and ANAN-100D follow in March 2013, the latter built on the dual-ADC Angelia board.',
    people: [['M0KHZ', 'Kevin Wheatley'], ['Apache Labs']]
  },
  {
    year: '2012', lane: 'flex', era: 'Commercialisation',
    title: 'FlexRadio closes the source, and opens the API',
    body: 'The FLEX-6000 series is shown at Dayton with a direct-sampling architecture that moves DSP into the radio. SmartSDR is written from scratch as closed source and no code crosses between the two families again — but the same move opens something up. With the DSP inside the radio, a console is no longer a signal-processing engine; it is a control surface over the network, and FlexRadio documents that surface in full. A versioned command protocol, VITA-49 streaming for spectrum, waterfall and audio, and FlexLib published as a reference implementation. Slices, panadapters, meters, profiles, the ATU, DAX and remote access are all reachable from outside, so a client written from nothing can reach parity rather than approximate it. That depth is why AetherSDR could start from an empty file instead of a fork.',
    people: [['FlexRadio Systems']]
  },
  {
    year: '2013', month: 'JUN', lane: 'flex', era: 'Commercialisation',
    title: 'First FLEX-6700 units ship',
    body: 'General release begins in June. SmartSDR v1.1 later that year doubles panadapters and slice receivers to eight on the 6700.',
    people: [['FlexRadio Systems']]
  },
  {
    year: '2013', month: 'DEC', lane: 'legacy', era: 'Commercialisation',
    title: 'PowerSDR 2.7.2 — FlexRadio’s last release',
    body: 'The final upstream build for the FLEX-1500, 3000 and 5000. The source stays available under GPLv2, which keeps the legacy line alive long after the company stops working on it.',
    people: [['FlexRadio Systems']]
  },
  {
    year: '2014', lane: 'hpsdr', era: 'WDSP',
    title: 'WDSP replaces DttSP',
    body: 'Warren Pratt rewrites the DSP layer as a new GPL library with separate receive and transmit chains. It becomes the shared engine under every non-FlexRadio console that follows — Thetis, piHPSDR, linHPSDR, deskHPSDR.',
    people: [['NR0V', 'Warren Pratt']]
  },
  {
    year: '2014', lane: 'hpsdr', era: 'WDSP',
    title: 'PureSignal wins the ARRL Technical Innovation Award',
    body: 'Adaptive predistortion implemented in WDSP pushes IMD3 on the ANAN line to around −50 dB — cleaner than a class-A transmitter while keeping class-AB efficiency.',
    people: [['NR0V', 'Warren Pratt']]
  },
  {
    year: '2016', lane: 'hpsdr', era: 'Protocol 2',
    title: 'Thetis begins',
    body: 'HPSDR’s next-generation firmware introduces an entirely new radio-to-PC protocol that PowerSDR cannot speak, and gigabit Ethernet becomes mandatory. Doug Wigley leads a new console for it. Later versions speak both protocols.',
    people: [['W5WC', 'Doug Wigley']]
  },
  {
    year: '2016', month: 'JAN', lane: 'legacy', era: 'Protocol 2',
    title: 'KE9NS forks PowerSDR 2.7.2',
    body: 'Darrin Kohn picks up the abandoned legacy branch on New Year’s Day and adds cluster spotting on the panadapter, callsign decoding in the waterfall, band stacking and much else. It is still the best software for a FLEX-5000.',
    people: [['KE9NS', 'Darrin Kohn']]
  },
  {
    year: '2016', lane: 'native', era: 'Protocol 2',
    title: 'piHPSDR takes the codebase native',
    body: 'John Melton writes a client in C on his own Linux and Android port of WDSP, breaking the dependency on Windows and .NET. Christoph van Wüllen later takes over as maintainer and his fork becomes the mainline.',
    people: [['G0ORX', 'John Melton'], ['DL1YCF', 'Christoph van Wüllen']]
  },
  {
    year: '2019', lane: 'hpsdr', era: 'Protocol 2',
    title: 'MW0LGE starts working on Thetis',
    body: 'Richard Samphire begins contributing, and over the following years his fork becomes the de facto mainline — multi-panadapter rendering, TCI, the voice keyer and a long run of releases through v2.10.',
    people: [['MW0LGE', 'Richard Samphire']]
  },
  {
    year: '2021', lane: 'native', era: 'Protocol 2',
    title: 'Hermes-Lite 2 wins the ARRL Technical Innovation Award',
    body: 'Steve Haynal’s low-cost open transceiver puts protocol 1 in reach of anyone, and the native-C clients are what make it usable across Linux and macOS.',
    people: [['Steve Haynal'], ['N2ADR', 'Jim Ahlstrom'], ['M5EVT', 'Matthew']]
  },
  {
    year: '2023', month: 'JUL', lane: 'hpsdr', era: 'Handover',
    title: 'The canonical Thetis repository goes quiet',
    body: 'TAPR’s upstream stops at v2.10.0.0. Development continues only in the MW0LGE fork.',
    people: [['TAPR']]
  },
  {
    year: '2023', lane: 'hpsdr', era: 'Handover',
    title: 'ANAN-G2 arrives on the SATURN board',
    body: 'A large FPGA rated around 930 GMAC/s with a Raspberry Pi compute module on board, derived from the 7000DLE mk2 RF chain. For the first time the radio can run its own console.',
    people: [['G8NJJ', 'Laurence Barker'], ['N1GP', 'Rick Koch']]
  },
  {
    year: '2025', month: 'SEP', lane: 'flex', era: 'AetherSDR',
    title: 'SmartSDR moves to a subscription',
    body: 'From v4.0, bug fixes stay free under SmartSDR Basic while new features require an annual SmartSDR+ licence. FlexRadio’s stated reasoning is that fourteen years of major-version upgrades produced only two paid releases.',
    people: [['FlexRadio Systems']]
  },
  {
    year: '2026', month: 'MAR', lane: 'aether', era: 'AetherSDR',
    title: 'AetherSDR starts from an empty file',
    body: 'First commit lands on 12 March — a root commit with no history behind it. A native Qt6 and C++20 console written clean-room against FlexRadio’s published VITA-49 and SmartSDR APIs. No PowerSDR ancestry, no Thetis ancestry.',
    people: [['KK7GWY', 'Jeremy Fielder']]
  },
  {
    year: '2026', month: 'APR', lane: 'hpsdr', era: 'AetherSDR',
    title: 'Thetis is archived',
    body: 'Richard Samphire archives the repository. The reasons are entirely technical: the codebase still depends on .NET Framework 4.8, rendering runs on SharpDX which is itself archived, and multiple receive slices would need a full display-engine rewrite. Final release v2.10.3.15 ships in May.',
    people: [['MW0LGE', 'Richard Samphire']]
  },
  {
    year: '2026', month: 'JUN', lane: 'native', era: 'AetherSDR',
    title: 'Apache Labs funds piHPSDR',
    body: 'Apache Labs forms an in-house software team whose first stated mission is assisting DL1YCF with piHPSDR, plus companion tooling and continued support for the 7000DLE and 8000DLE. After twenty years, the OpenHPSDR side finally has paid engineers.',
    people: [['Apache Labs'], ['DL1YCF', 'Christoph van Wüllen']]
  },
  {
    year: 'Today', lane: 'aether', era: 'AetherSDR', terminal: true,
    title: 'Where AetherSDR sits',
    body: 'Native on Linux, macOS and Windows, driving the FLEX-6000 and 8000 series and Aurora. More than 15,000 downloads and over 40 contributors, on a monthly CalVer release cadence. Nothing above the AetherSDR lane is a dependency — it is a parallel start, written for this decade rather than inherited from the last one.',
    people: [['GPL-3.0'], ['aethersdr.com']]
  }
];

/* Node reads the two arrays above when pre-rendering; the browser ignores this. */
if (typeof module !== 'undefined' && module.exports) module.exports = { LANES, EVENTS };

/* ============================================================
   RUNTIME — the list and legend are already in the DOM.
   ============================================================ */
(function () {
  // scripts/gen-lineage.py requires this file in node purely to read the data
  // above; there's no DOM there, so stop before touching one.
  if (typeof document === 'undefined') return;

  var list = document.getElementById('events');
  var rail = document.getElementById('rail');
  var section = document.getElementById('lineage');
  if (!list || !rail || !section) return;

  var items = [].slice.call(list.children);
  var SVGNS = 'http://www.w3.org/2000/svg';
  var COLLAPSE_AT = 940; // matches the site's primary breakpoint

  function drawRail() {
    var collapsed = window.innerWidth < COLLAPSE_AT;
    var railBox = rail.getBoundingClientRect();
    var railW = railBox.width;
    var spacing = collapsed ? 0 : Math.min(26, (railW - 24) / (LANES.length - 1));
    var baseX = collapsed ? railW / 2 : 14;
    var laneX = function (id) {
      return collapsed ? baseX : baseX + LANES.findIndex(function (l) { return l.id === id; }) * spacing;
    };

    var top = railBox.top + window.scrollY;

    // Marker y per event, measured from the year heading — which is why this
    // has to run after document.fonts.ready and again on resize.
    var ys = items.map(function (el) {
      var yr = el.querySelector('.ev-year').getBoundingClientRect();
      return (yr.top + yr.height / 2 + window.scrollY) - top;
    });

    var svg = document.createElementNS(SVGNS, 'svg');
    var add = function (tag, attrs) {
      var n = document.createElementNS(SVGNS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      svg.appendChild(n);
      return n;
    };

    LANES.forEach(function (lane) {
      var idx = EVENTS.map(function (e, i) { return e.lane === lane.id ? i : -1; })
                      .filter(function (i) { return i >= 0; });
      if (!idx.length) return;
      var x = laneX(lane.id);
      var yStart = ys[idx[0]];
      var yEnd = ys[idx[idx.length - 1]];

      // Fork in from the parent lane.
      if (lane.forksFrom && !collapsed) {
        var px = laneX(lane.forksFrom);
        var y0 = yStart - 54;
        var p = add('path', {
          d: 'M' + px + ' ' + y0 + ' C ' + px + ' ' + (y0 + 30) + ', ' + x + ' ' + (yStart - 34) + ', ' + x + ' ' + yStart,
          fill: 'none', stroke: lane.hex, 'stroke-width': 1.5,
          opacity: lane.dashedFork ? 0.38 : 0.55
        });
        if (lane.dashedFork) p.setAttribute('stroke-dasharray', '3 4');
      }

      add('line', {
        x1: x, y1: yStart, x2: x, y2: yEnd,
        stroke: lane.hex, 'stroke-width': 1.5, opacity: collapsed ? 0.35 : 0.5
      });

      // A lane that ended decays into the noise floor.
      if (lane.dead) {
        for (var k = 0; k < 7; k++) {
          add('line', {
            x1: x, y1: yEnd + 10 + k * 11, x2: x, y2: yEnd + 17 + k * 11,
            stroke: lane.hex, 'stroke-width': 1.5, opacity: (0.42 * (1 - k / 7)).toFixed(3)
          });
        }
      }

      idx.forEach(function (i) {
        var y = ys[i];
        add('line', {
          x1: x + 6, y1: y, x2: railW, y2: y,
          stroke: lane.hex, 'stroke-width': 1, opacity: 0.16, 'class': 'tick', 'data-i': i
        });
        add('circle', {
          cx: x, cy: y, r: EVENTS[i].terminal ? 5.5 : 4,
          fill: lane.hex, opacity: 0.32, 'class': 'dot', 'data-i': i
        });
      });
    });

    rail.replaceChildren(svg);
    syncActive();
  }

  function syncActive() {
    items.forEach(function (el) {
      var on = el.classList.contains('in');
      var i = el.dataset.i;
      rail.querySelectorAll('.dot[data-i="' + i + '"]').forEach(function (d) {
        d.setAttribute('opacity', on ? 1 : 0.32);
      });
      rail.querySelectorAll('.tick[data-i="' + i + '"]').forEach(function (t) {
        t.setAttribute('opacity', on ? 0.4 : 0.16);
      });
    });
  }

  // Reveal. The CSS only hides cards once .js-reveal is set, so a no-JS
  // reader gets the full list rather than an invisible one.
  section.classList.add('js-reveal');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('in'); });
      syncActive();
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Sticky readout.
  var rYear = document.getElementById('readoutYear');
  var rEra = document.getElementById('readoutEra');
  var rBar = document.getElementById('readoutBar');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var mark = window.innerHeight * 0.32;
      var current = items[0];
      for (var i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top <= mark) current = items[i];
      }
      if (rYear.textContent !== current.dataset.year) rYear.textContent = current.dataset.year;
      if (rEra.textContent !== current.dataset.era) rEra.textContent = current.dataset.era;

      var r = section.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var pct = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      rBar.style.width = (pct * 100).toFixed(2) + '%';
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(drawRail, 140);
  });

  // Measure after fonts settle — year-heading height depends on the loaded face.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawRail);
  } else {
    window.addEventListener('load', drawRail);
  }
  drawRail();
  onScroll();
})();
