/* AetherSDR roadmap — release view <-> progress view.
 *
 * Both views live in roadmap.html and describe the same work: the release
 * view groups it into what lands when, the progress view lays the same rows
 * against a phase axis. Routing is driven by location.hash (#release,
 * #progress) so a view is shareable and Back/Forward work, the same shape
 * blog.js uses for posts.
 *
 * No JS -> the <noscript> rule in roadmap.html reveals both views stacked,
 * so every row is still readable and the page never renders empty.
 */
(function () {
  var VIEWS = ['release', 'progress'];
  var DEFAULT = 'release';

  var buttons = document.querySelectorAll('.rm-view-btn[data-view]');
  var panels = document.querySelectorAll('.rm-view[data-view]');
  if (!buttons.length || !panels.length) return;

  function currentView() {
    var raw = (location.hash || '').replace(/^#/, '');
    try { raw = decodeURIComponent(raw); } catch (e) {}
    return VIEWS.indexOf(raw) === -1 ? DEFAULT : raw;
  }

  // Idempotent: safe to call from hashchange, popstate and first paint.
  function route() {
    var view = currentView();

    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].getAttribute('data-view') !== view;
    }
    for (var j = 0; j < buttons.length; j++) {
      var on = buttons[j].getAttribute('data-view') === view;
      buttons[j].setAttribute('aria-selected', on ? 'true' : 'false');
      // Only the selected tab stays in the tab order; arrow keys move between
      // them, which is what a tablist is supposed to do.
      buttons[j].tabIndex = on ? 0 : -1;
    }
  }

  for (var k = 0; k < buttons.length; k++) {
    buttons[k].addEventListener('click', function (ev) {
      var view = ev.currentTarget.getAttribute('data-view');
      if (view === currentView()) return;
      // replaceState on the first switch would swallow Back; setting the hash
      // keeps each view a real history entry.
      location.hash = view;
    });

    buttons[k].addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      ev.preventDefault();
      var at = VIEWS.indexOf(currentView());
      var next = ev.key === 'ArrowRight' ? (at + 1) % VIEWS.length
                                         : (at - 1 + VIEWS.length) % VIEWS.length;
      location.hash = VIEWS[next];
      var sel = document.querySelector('.rm-view-btn[data-view="' + VIEWS[next] + '"]');
      if (sel) sel.focus();
    });
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  route();

  // Newest release sits at the right-hand end, so start the view there rather
  // than on a release from months ago. Instant, not smooth: this is the
  // starting position, not a movement the reader should watch.
  var rels = document.querySelector('.rm-rels');
  if (rels) rels.scrollLeft = rels.scrollWidth;

  // Expand / collapse every category in the release view. The accordions are
  // native <details>, so they already work without this — these two buttons
  // just save thirty-nine clicks.
  var bulk = document.querySelectorAll('.rm-mini[data-cats]');
  for (var b = 0; b < bulk.length; b++) {
    bulk[b].addEventListener('click', function (ev) {
      var open = ev.currentTarget.getAttribute('data-cats') === 'open';
      var cats = document.querySelectorAll('details.rm-cat');
      for (var c = 0; c < cats.length; c++) cats[c].open = open;
    });
  }
}());
