/* AetherSDR download wiring — progressive enhancement.
 *
 * 1. Highlights the download card matching the visitor's OS (no network).
 * 2. Resolves the LATEST release from the GitHub API and points every
 *    download link straight at the correct installer asset — the asset
 *    filenames carry the version, so we read them rather than guess URLs.
 *
 * If the API is unavailable (offline, rate-limited, or the artifact CSP),
 * every link keeps its fallback href to the GitHub "latest release" page,
 * so nothing ever breaks.
 */
(function () {
  var REPO = 'aethersdr/AetherSDR';
  var API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  var STORE_URL = 'https://apps.microsoft.com/detail/9nc6bmwfn811';
  var CACHE_KEY = 'aetherLatestRelease';
  var TTL = 3600 * 1000; // 1 hour

  function detectOS() {
    var uaData = navigator.userAgentData;
    var platform = (uaData && uaData.platform) || navigator.platform || '';
    var s = (platform + ' ' + (navigator.userAgent || '')).toLowerCase();
    if (/mac|iphone|ipad|ipod|darwin/.test(s)) return 'macos';
    if (/win/.test(s)) return 'windows';
    if (/linux|x11|android|cros/.test(s)) return 'linux';
    return null;
  }

  var currentOS = detectOS();

  function highlight() {
    if (!currentOS) return;
    var card = document.querySelector('.dl-card[data-os="' + currentOS + '"]');
    if (!card) return;
    card.classList.add('is-recommended');
    var badge = card.querySelector('.dl-reco');
    if (badge) badge.hidden = false;
  }

  // First asset whose name contains one of the priority substrings.
  function pick(assets, patterns) {
    for (var p = 0; p < patterns.length; p++) {
      var pat = patterns[p].trim().toLowerCase();
      if (!pat) continue;
      for (var i = 0; i < assets.length; i++) {
        if (assets[i].name.toLowerCase().indexOf(pat) !== -1) return assets[i];
      }
    }
    return null;
  }

  function wire(release) {
    if (!release || !release.assets) return;
    var assets = release.assets;

    // Per-variant links carry their own asset patterns.
    var links = document.querySelectorAll('[data-dl]');
    for (var i = 0; i < links.length; i++) {
      var asset = pick(assets, links[i].getAttribute('data-dl').split(','));
      if (asset) links[i].href = asset.browser_download_url;
    }

    // Hero primary button -> the detected OS's installer (Store on Windows).
    var primary = document.querySelector('[data-dl-primary]');
    if (primary && currentOS) {
      if (currentOS === 'windows') {
        primary.href = STORE_URL;
        primary.target = '_blank';
        primary.rel = 'noopener';
      } else {
        var patts = currentOS === 'macos'
          ? ['apple-silicon.dmg', '.dmg']
          : ['x86_64.appimage', '.appimage'];
        var a = pick(assets, patts);
        if (a) primary.href = a.browser_download_url;
      }
    }

    // Live "latest release" version label.
    if (release.tag_name) {
      var tag = release.tag_name.charAt(0) === 'v' ? release.tag_name : 'v' + release.tag_name;
      var tags = document.querySelectorAll('[data-latest-tag]');
      for (var j = 0; j < tags.length; j++) tags[j].textContent = tag;
    }
  }

  function readCache() {
    try {
      var o = JSON.parse(localStorage.getItem(CACHE_KEY));
      return o && Date.now() - o.t < TTL ? o.r : null;
    } catch (e) { return null; }
  }
  function writeCache(r) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), r: r })); } catch (e) {}
  }

  function loadRelease() {
    var cached = readCache();
    if (cached) { wire(cached); return; }
    if (!window.fetch) return;
    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { if (!res.ok) throw new Error('github ' + res.status); return res.json(); })
      .then(function (release) {
        var slim = {
          tag_name: release.tag_name,
          assets: (release.assets || []).map(function (a) {
            return { name: a.name, browser_download_url: a.browser_download_url };
          })
        };
        writeCache(slim);
        wire(slim);
      })
      .catch(function () { /* keep fallback /releases/latest links */ });
  }

  function init() { highlight(); loadRelease(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
