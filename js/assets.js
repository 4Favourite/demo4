/* ALOFT — real-photo overrides. Drop files into /assets with the names below
   (jpg, webp or png). Anything missing keeps its procedural stand-in. */
(function () {
  'use strict';
  const EXT = ['jpg', 'webp', 'png'];
  const inline = window.ASSET_DATA || {};            // filled by build.py for the single-file build
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const found = {};                                   // name -> url | false
  const waiters = {};

  function probe(name) {
    if (name in found) return Promise.resolve(found[name]);
    if (inline[name]) return Promise.resolve((found[name] = inline[name]));
    if (waiters[name]) return waiters[name];
    return (waiters[name] = new Promise((res) => {
      let i = 0;
      (function next() {
        if (i >= EXT.length) { found[name] = false; return res(false); }
        const url = 'assets/' + name + '.' + EXT[i++], im = new Image();
        im.onload = () => { found[name] = url; res(url); };
        im.onerror = next; im.src = url;
      })();
    }));
  }
  function swap(img, name, after) {
    probe(name).then((url) => { if (!url) return; img.src = url; img.dataset.real = '1'; if (after) after(img); });
  }

  /* sections */
  $$('img[data-art]').forEach((img) => {
    const [n, a] = img.dataset.art.split(':');
    swap(img, n === 'mini' ? 'mini-' + a : n);
  });
  /* listing cards (built by app.js) */
  $$('.card .ph img').forEach((img, i) => swap(img, 'listing-' + (i + 1)));

  /* hero building: one transparent PNG, themed with CSS filters */
  const FILTER = {
    dawn: 'sepia(.25) saturate(1.1) hue-rotate(-12deg) brightness(1.02)',
    day: 'none',
    golden: 'sepia(.45) saturate(1.35) brightness(1.02)',
    night: 'brightness(.5) saturate(.9) hue-rotate(185deg) contrast(1.1)',
  };
  function hero() {
    probe('hero-building').then((url) => {
      if (!url) return;
      const t = document.body.dataset.time || 'day';
      $$('[data-bld]').forEach((i) => { i.src = url; i.style.filter = FILTER[t]; });
      const w = document.getElementById('wmImg');
      if (w) { w.setAttribute('href', url); w.style.filter = FILTER[t]; }
    });
  }
  hero();
  /* app.js re-sets sources on every time-of-day change; re-apply after it */
  new MutationObserver(() => { hero(); $$('.card .ph img').forEach((im) => { if (im.dataset.real) im.style.filter = document.body.dataset.time === 'night' ? 'brightness(.7) saturate(1.1)' : ''; }); })
    .observe(document.body, { attributes: true, attributeFilter: ['data-time'] });
})();
