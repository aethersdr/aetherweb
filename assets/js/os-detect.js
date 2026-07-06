/* Highlight the download card matching the visitor's OS.
   Progressive enhancement: if this doesn't run, all three cards show equally. */
(function () {
  function detectOS() {
    var uaData = navigator.userAgentData;
    var platform = (uaData && uaData.platform) || navigator.platform || '';
    var ua = navigator.userAgent || '';
    var s = (platform + ' ' + ua).toLowerCase();

    if (/mac|iphone|ipad|ipod|darwin/.test(s)) return 'macos';
    if (/win/.test(s)) return 'windows';
    if (/linux|x11|android|cros/.test(s)) return 'linux'; // Chromebooks + Android land on Linux/AppImage
    return null;
  }

  function apply() {
    var os = detectOS();
    if (!os) return;
    var card = document.querySelector('.dl-card[data-os="' + os + '"]');
    if (!card) return;
    card.classList.add('is-recommended');
    var badge = card.querySelector('.dl-reco');
    if (badge) badge.hidden = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
