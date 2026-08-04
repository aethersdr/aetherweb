/* WebMCP — exposes the site's real actions to an agent driving the browser.
 * https://webmachinelearning.github.io/webmcp/
 *
 * Everything here is backed by something the page already does: the content
 * API at /api/v1 (generated from these same pages at build time), the GitHub
 * releases API that assets/js/downloads.js already resolves installers from,
 * and in-page navigation. No tool invents data, and none of them write.
 *
 * Progressive enhancement: browsers without navigator.modelContext get nothing
 * and lose nothing.
 */
(function () {
  var mc = navigator.modelContext;
  if (!mc) return;

  var API = '/api/v1/';
  var GH = 'https://api.github.com/repos/aethersdr/AetherSDR/releases/latest';
  var STORE_URL = 'https://apps.microsoft.com/detail/9nc6bmwfn811';

  function text(value) {
    var body = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    return { content: [{ type: 'text', text: body }] };
  }

  function fail(message) {
    return { content: [{ type: 'text', text: message }], isError: true };
  }

  // One in-flight fetch per URL, reused for the life of the page.
  var cache = {};
  function getJSON(url) {
    if (!cache[url]) {
      cache[url] = fetch(url, { headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error(url + ' -> ' + res.status);
          return res.json();
        });
      cache[url].catch(function () { delete cache[url]; });
    }
    return cache[url];
  }

  var tools = [];

  // ---- Project facts -----------------------------------------------------
  tools.push({
    name: 'get_project_info',
    description: 'Get factual information about AetherSDR: what it is, which ' +
      'FlexRadio transceivers and desktop platforms it supports, its licence ' +
      'and build stack, and where the source, documentation, and releases ' +
      'live. Use this instead of reading the page when the question is about ' +
      'the project rather than about this page.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: function () {
      return getJSON(API + 'site.json').then(text, function (e) {
        return fail('Could not load project info: ' + e.message);
      });
    }
  });

  // ---- Blog --------------------------------------------------------------
  tools.push({
    name: 'search_blog_posts',
    description: 'Search the AetherSDR blog index — release notes and ' +
      'engineering write-ups. Matches the query against post titles and ' +
      'summaries. Omit the query to list every post, newest first. Returns ' +
      'slugs that read_blog_post accepts.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Words to match, e.g. "D-STAR", "noise reduction", or ' +
            'a version like "26.7.2". Case-insensitive.'
        },
        limit: {
          type: 'integer',
          description: 'Maximum posts to return (default 10).',
          minimum: 1,
          maximum: 50
        }
      },
      additionalProperties: false
    },
    execute: function (args) {
      var input = args || {};
      return getJSON(API + 'posts.json').then(function (data) {
        var posts = data.posts || [];
        var query = (input.query || '').toLowerCase().trim();
        if (query) {
          var words = query.split(/\s+/);
          posts = posts.filter(function (post) {
            var hay = (post.title + ' ' + post.summary + ' ' + post.slug).toLowerCase();
            return words.every(function (word) { return hay.indexOf(word) !== -1; });
          });
        }
        var limit = input.limit || 10;
        return text({
          matched: posts.length,
          query: input.query || null,
          posts: posts.slice(0, limit).map(function (post) {
            return {
              slug: post.slug,
              title: post.title,
              published: post.published,
              summary: post.summary,
              url: post.url
            };
          })
        });
      }, function (e) {
        return fail('Could not load the post index: ' + e.message);
      });
    }
  });

  tools.push({
    name: 'read_blog_post',
    description: 'Read the full text of one AetherSDR blog post, by the slug ' +
      'returned from search_blog_posts (release posts look like ' +
      '"release-26-7-4"). Posts are routed client-side, so fetching the post ' +
      'URL directly will not narrow to the post — use this.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Post slug, e.g. "release-26-7-4".' }
      },
      required: ['slug'],
      additionalProperties: false
    },
    execute: function (args) {
      var slug = (args && args.slug || '').trim();
      if (!slug) return Promise.resolve(fail('A slug is required.'));

      // On the blog page the article is already in the document.
      var article = document.querySelector('article[data-post="' + slug.replace(/"/g, '') + '"]');
      if (article) return Promise.resolve(text(article.innerText.trim()));

      // Anywhere else, slice it out of the markdown rendering of the blog.
      return getJSON(API + 'posts.json').then(function (data) {
        var post = (data.posts || []).filter(function (p) { return p.slug === slug; })[0];
        if (!post) return fail('No post with slug "' + slug + '". Try search_blog_posts.');
        return fetch('/blog.md', { headers: { Accept: 'text/markdown' } })
          .then(function (res) { return res.text(); })
          .then(function (markdown) {
            var lines = markdown.split('\n');
            var start = -1;
            for (var i = 0; i < lines.length; i++) {
              if (lines[i].indexOf('## ') === 0 && lines[i].indexOf(post.title) !== -1) {
                start = i;
                break;
              }
            }
            if (start === -1) return fail('Found "' + slug + '" in the index but not in the page text.');
            var end = lines.length;
            for (var j = start + 1; j < lines.length; j++) {
              if (lines[j].indexOf('## ') === 0) { end = j; break; }
            }
            return text(lines.slice(start, end).join('\n').trim());
          });
      }, function (e) {
        return fail('Could not read the post: ' + e.message);
      });
    }
  });

  // ---- Downloads ---------------------------------------------------------
  // Asset names carry the version, so resolve them from the release rather
  // than constructing URLs — same rule assets/js/downloads.js follows.
  var ASSET_PATTERNS = {
    linux: { x86_64: ['x86_64.AppImage'], aarch64: ['aarch64.AppImage'] },
    macos: { 'apple-silicon': ['apple-silicon.dmg', '.dmg'], intel: ['intel.dmg', 'x86_64.dmg', '.dmg'] },
    windows: { installer: ['Windows-x64-setup.exe', 'setup.exe'], portable: ['Windows-x64-portable.zip', 'portable.zip'] }
  };

  tools.push({
    name: 'find_download',
    description: 'Resolve the download URL for the current AetherSDR release ' +
      'on a given platform. Returns the exact installer asset from the latest ' +
      'GitHub release, plus the checksum and signature files to verify it ' +
      'with. On Windows the Microsoft Store build is recommended.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['linux', 'macos', 'windows'],
          description: 'Target operating system.'
        },
        variant: {
          type: 'string',
          enum: ['x86_64', 'aarch64', 'apple-silicon', 'intel', 'installer', 'portable', 'store'],
          description: 'Build variant. Linux: x86_64 or aarch64. macOS: ' +
            'apple-silicon or intel. Windows: store, installer, or portable.'
        }
      },
      required: ['platform'],
      additionalProperties: false
    },
    execute: function (args) {
      var input = args || {};
      var platform = input.platform;
      var variants = ASSET_PATTERNS[platform];
      if (!variants) return Promise.resolve(fail('Unknown platform "' + platform + '".'));

      if (platform === 'windows' && (!input.variant || input.variant === 'store')) {
        return Promise.resolve(text({
          platform: 'windows',
          variant: 'store',
          url: STORE_URL,
          winget: 'winget install aethersdr -s msstore',
          note: 'The Store build auto-updates and is the recommended Windows install.'
        }));
      }

      var variant = input.variant && variants[input.variant]
        ? input.variant
        : Object.keys(variants)[0];
      var patterns = variants[variant];

      return fetch(GH, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('GitHub returned ' + res.status);
          return res.json();
        })
        .then(function (release) {
          var assets = release.assets || [];
          var match = null;
          for (var p = 0; p < patterns.length && !match; p++) {
            for (var i = 0; i < assets.length; i++) {
              if (assets[i].name.toLowerCase().indexOf(patterns[p].toLowerCase()) !== -1) {
                match = assets[i];
                break;
              }
            }
          }
          if (!match) {
            return fail('No ' + platform + '/' + variant + ' asset in ' +
              release.tag_name + '. See https://github.com/aethersdr/AetherSDR/releases/latest');
          }
          function assetUrl(name) {
            for (var i = 0; i < assets.length; i++) {
              if (assets[i].name === name) return assets[i].browser_download_url;
            }
            return null;
          }
          return text({
            release: release.tag_name,
            platform: platform,
            variant: variant,
            file: match.name,
            url: match.browser_download_url,
            signature: assetUrl(match.name + '.asc'),
            checksums: assetUrl('SHA256SUMS.txt'),
            verify: 'Check SHA256SUMS.txt, and `gpg --verify ' + match.name + '.asc ' + match.name + '`.'
          });
        })
        .catch(function (e) {
          return fail('Could not resolve a download (' + e.message + '). ' +
            'Fall back to https://github.com/aethersdr/AetherSDR/releases/latest');
        });
    }
  });

  // ---- In-page navigation ------------------------------------------------
  var sections = [];
  var found = document.querySelectorAll('section[id], main [id][class*="block"]');
  for (var i = 0; i < found.length; i++) {
    if (found[i].id) sections.push(found[i].id);
  }

  if (sections.length) {
    tools.push({
      name: 'show_section',
      description: 'Scroll this page to one of its sections, so the user sees ' +
        'what is being described. Available on this page: ' + sections.join(', ') + '.',
      inputSchema: {
        type: 'object',
        properties: {
          section: { type: 'string', enum: sections, description: 'Section id.' }
        },
        required: ['section'],
        additionalProperties: false
      },
      execute: function (args) {
        var id = args && args.section;
        var el = id && document.getElementById(id);
        if (!el) return fail('No section "' + id + '" on this page.');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return text('Scrolled to #' + id + '.');
      }
    });
  }

  // The spec has both a declarative form and per-tool registration; sites are
  // expected to work with whichever the browser implements.
  if (typeof mc.provideContext === 'function') {
    mc.provideContext({ tools: tools });
  } else if (typeof mc.registerTool === 'function') {
    for (var t = 0; t < tools.length; t++) mc.registerTool(tools[t]);
  }
})();
