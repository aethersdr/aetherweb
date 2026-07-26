/* AetherSDR blog — card index <-> full post routing.
 *
 * The index grid and every post live in blog.html; posts start `hidden`.
 * Clicking a card routes to #<slug>, which swaps the grid out for the
 * matching <article data-post="<slug>">. Routing is driven entirely by
 * location.hash, so a post URL is shareable and Back/Forward work.
 *
 * No JS -> the <noscript> rule in blog.html reveals every post stacked
 * under the index, so the content is still readable.
 */
(function () {
  var index = document.getElementById('blog-index');
  var posts = document.querySelectorAll('.blog-post[data-post]');
  var baseTitle = 'AetherSDR';
  if (!index || !posts.length) return;

  // Slug of the post we're leaving, so we can restore focus to its card.
  var lastSlug = '';

  // Build slug -> article map once.
  var bySlug = {};
  for (var i = 0; i < posts.length; i++) {
    bySlug[posts[i].getAttribute('data-post')] = posts[i];
  }

  function currentSlug() {
    // decodeURIComponent guards against slugs that arrive percent-encoded.
    var raw = (location.hash || '').replace(/^#/, '');
    try { raw = decodeURIComponent(raw); } catch (e) {}
    return raw;
  }

  // Idempotent: safe to call from hashchange and popstate both.
  function route(opts) {
    var slug = currentSlug();
    var post = Object.prototype.hasOwnProperty.call(bySlug, slug) ? bySlug[slug] : null;

    for (var i = 0; i < posts.length; i++) {
      posts[i].hidden = posts[i] !== post;
    }
    index.hidden = !!post;
    document.body.classList.toggle('is-reading', !!post);

    if (post) {
      var h1 = post.querySelector('h1');
      document.title = (h1 ? h1.textContent.trim() + ' — ' : '') + baseTitle + ' Blog';
      // Move focus to the article so keyboard and screen-reader users land
      // on the post rather than back at the top of the document.
      if (opts && opts.focus) post.focus({ preventScroll: true });
    } else {
      document.title = 'Blog — ' + baseTitle;
      // Returning to the index: put focus back on the card we came from,
      // otherwise it would be stranded on the article we just hid.
      if (lastSlug) {
        var card = index.querySelector('.blog-card[href="#' + lastSlug + '"]');
        if (card) card.focus({ preventScroll: true });
      }
    }
    lastSlug = post ? slug : '';

    if (!opts || opts.scroll !== false) scrollToContent();
  }

  // Land just below the sticky nav rather than at the very top, and skip the
  // page's smooth-scroll so view swaps feel instant instead of animated.
  function scrollToContent() {
    var behavior = 'auto';
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = behavior;
    window.scrollTo(0, 0);
    // Restore on the next frame so in-page anchor links keep smooth scrolling.
    requestAnimationFrame(function () { root.style.scrollBehavior = prev; });
  }

  // "Back to blog" — clear the hash without leaving a bare "#" in the URL.
  document.addEventListener('click', function (e) {
    var back = e.target.closest ? e.target.closest('[data-blog-back]') : null;
    if (!back) return;
    e.preventDefault();
    if (history.pushState) {
      history.pushState(null, '', location.pathname + location.search);
      route({ focus: false });
    } else {
      location.hash = '';
    }
  });

  window.addEventListener('hashchange', function () { route({ focus: true }); });
  window.addEventListener('popstate', function () { route({ focus: false }); });

  // Initial render: don't steal focus or scroll on a plain page load, but do
  // honour a deep link like blog.html#signal-chain.
  route({ focus: false, scroll: !!currentSlug() });
})();
