/* Inline SVG icons and the Rolla logo. */
(function () {
  function s(body, opts) {
    opts = opts || {};
    var fill = opts.fill || 'none';
    var sw = opts.sw || 2;
    return '<svg viewBox="0 0 24 24" fill="' + fill + '" stroke="' + (opts.stroke || 'currentColor') + '" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (opts.cls ? ' class="' + opts.cls + '"' : '') + '>' + body + '</svg>';
  }
  var star = '<path d="M12 3 L14.6 8.9 L21 9.5 L16.2 13.8 L17.6 20.1 L12 16.8 L6.4 20.1 L7.8 13.8 L3 9.5 L9.4 8.9 Z"/>';

  var I = {
    x: s('<path d="M6 6 L18 18 M18 6 L6 18"/>', { sw: 2.5 }),
    star: s(star, { fill: 'currentColor', stroke: 'none' }),
    check: s('<path d="M5 12.5 L10 17 L19 7"/>', { sw: 2.6 }),
    lock: s('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11 V8 a4 4 0 0 1 8 0 V11"/>'),
    back: s('<path d="M15 5 L8 12 L15 19"/>', { sw: 2.2 }),
    chev: s('<path d="M9 5 L16 12 L9 19"/>', { sw: 2.2, cls: 'chev' }),
    filter: s('<path d="M4 7 H20 M7 12 H17 M10 17 H14"/>'),
    discover: s('<rect x="5" y="4" width="14" height="16" rx="3"/>'),
    feed: s('<path d="M5 6 H19 M5 12 H19 M5 18 H13"/>'),
    applied: s('<path d="M4 7 H20 V19 H4 Z M9 7 V5 H15 V7"/><path d="M9 13 L11 15 L15 11"/>'),
    profile: s('<circle cx="12" cy="9" r="4"/><path d="M4 21 C5 17 8 15 12 15 S19 17 20 21"/>'),
    heart: s('<path d="M12 20 S4 14.5 4 9 a4 4 0 0 1 8-1 a4 4 0 0 1 8 1 c0 5.5-8 11-8 11Z"/>'),
    heartFill: s('<path d="M12 20 S4 14.5 4 9 a4 4 0 0 1 8-1 a4 4 0 0 1 8 1 c0 5.5-8 11-8 11Z"/>', { fill: 'currentColor' }),
    comment: s('<path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z"/>'),
    share: s('<path d="M12 15 V4 M7 9 L12 4 L17 9 M5 14 V20 H19 V14"/>'),
    pin: s('<path d="M12 21 S5 14.5 5 9 a7 7 0 0 1 14 0 c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>'),
    briefcase: s('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7 V5 H15 V7 M3 13 H21"/>'),
    undo: s('<path d="M9 14 L4 9 L9 4"/><path d="M4 9 H14 a6 6 0 0 1 0 12 H11"/>'),
    eye: s('<path d="M2 12 S6 5 12 5 S22 12 22 12 S18 19 12 19 S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    bookmark: s('<path d="M6 4 H18 V21 L12 16.5 L6 21Z"/>'),
    bookmarkFill: s('<path d="M6 4 H18 V21 L12 16.5 L6 21Z"/>', { fill: 'currentColor' }),
    sparkle: s('<path d="M12 3 L13.8 9.2 L20 11 L13.8 12.8 L12 19 L10.2 12.8 L4 11 L10.2 9.2Z"/>', { fill: 'currentColor', stroke: 'none' }),
    users: s('<circle cx="9" cy="9" r="3.5"/><path d="M2.5 20 c0.8-3.5 3.4-5 6.5-5 s5.7 1.5 6.5 5"/><circle cx="17" cy="8" r="2.8"/><path d="M17 13.5 c2.3 0 4 1.3 4.6 4"/>'),
    clock: s('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5 V12 L15 14"/>'),
    pound: s('<path d="M16 6.5 a3.8 3.8 0 0 0 -7 2 V19 M6 19 H17 M6.5 13 H13"/>'),
    laptop: s('<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19 H22"/>'),
    verified: s('<path d="M12 2.8 L14.4 4.6 L17.4 4.4 L18.3 7.3 L20.8 9 L19.8 11.9 L20.8 14.8 L18.3 16.5 L17.4 19.4 L14.4 19.2 L12 21 L9.6 19.2 L6.6 19.4 L5.7 16.5 L3.2 14.8 L4.2 11.9 L3.2 9 L5.7 7.3 L6.6 4.4 L9.6 4.6Z" fill="currentColor" stroke="none"/><path d="M8.5 12 L11 14.5 L15.5 9.8" stroke="#fff" stroke-width="2"/>'),
    arrowUR: s('<path d="M7 17 L17 7 M9 7 H17 V15"/>'),
    bell: s('<path d="M6 16 V11 a6 6 0 0 1 12 0 V16 L19.5 18 H4.5Z M10 20.5 a2 2 0 0 0 4 0"/>'),
    plus: s('<path d="M12 5 V19 M5 12 H19"/>', { sw: 2.4 }),
    network: s('<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="5.5" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="M8.4 10.8 L15.6 6.8 M8.4 13.2 L15.6 17.2 M18 8.1 V15.9"/>'),
    search: s('<circle cx="11" cy="11" r="6.5"/><path d="M16 16 L20 20"/>'),
    arrowUp: s('<path d="M12 19 V5 M6 11 L12 5 L18 11"/>', { sw: 2.4 }),
    arrowDown: s('<path d="M12 5 V19 M6 13 L12 19 L18 13"/>', { sw: 2.4 }),
    calendar: s('<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10 H20 M8.5 3.5 V7 M15.5 3.5 V7"/>'),
  };

  /* The Rolodex mark, drawn side-on like the reference cartoon: a solid fan of cards on a hub,
     a few loose cards flicking out of the wheel, and a curved stand that sweeps down into a flat base.
     The hub sits at (36, 25), so the wheel can spin around it. */
  var HUB = '36 25';
  function wheel(cards, weight) {
    var w = weight || 2.8;
    // Solid half-disc of cards, radius 22, with its flat edge tilted up to the right.
    var fanShape = '<path d="M36 25 L52.85 10.86 A22 22 0 0 1 50.14 41.85 A22 22 0 0 1 19.15 39.14 Z" fill="' + cards + '"/>';
    // Loose cards flicking out on the open side of the wheel.
    var loose = [[-58, 11, 27], [-49, 11, 26], [184, 11, 27], [196, 11, 25]].map(function (c) {
      var a = c[0] * Math.PI / 180, x1 = 36 + c[1] * Math.cos(a), y1 = 25 + c[1] * Math.sin(a), x2 = 36 + c[2] * Math.cos(a), y2 = 25 + c[2] * Math.sin(a);
      return '<path d="M' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' L' + x2.toFixed(2) + ' ' + y2.toFixed(2) + '" stroke="' + cards + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    }).join('');
    return '<g class="ring">' + fanShape + loose + '</g>';
  }
  function stand(ink, weight) {
    return '<path d="M35 26 L18 34 C7 39 4.5 49 9.5 54 C11.5 56 14.5 56.5 18 56.5 L52 56.5" stroke="' + ink + '" stroke-width="' + (weight || 4.5) + '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  }
  // The paper knockout ring goes over the fan, the stand goes over that, and the hub caps it.
  function draw(cards, ink, paper, weights) {
    weights = weights || {};
    return wheel(cards, weights.card) + '<circle cx="36" cy="25" r="10" fill="' + paper + '"/>' + stand(ink, weights.stand) +
      '<circle cx="36" cy="25" r="7.5" fill="' + ink + '"/><circle cx="36" cy="25" r="2.6" fill="' + paper + '"/>';
  }
  var VB = 'viewBox="2 0 60 61"';

  /* The mark: a Rolodex on its stand. */
  function mark(size, paper) {
    return '<svg width="' + size + '" height="' + Math.round(size * 61 / 60) + '" ' + VB + ' style="overflow:visible" aria-hidden="true">' +
      draw('#1FAE80', '#0E0E0E', paper || '#F4F5F2') + '</svg>';
  }
  /* Animated mark for the loading screen: the wheel spins round its hub and settles. */
  function spinningMark(size) {
    return '<svg class="mark" width="' + size + '" height="' + Math.round(size * 61 / 60) + '" ' + VB + ' style="overflow:visible" role="img" aria-label="Rolodex turning">' +
      draw('#1FAE80', '#0E0E0E', '#F4F5F2') + '</svg>';
  }
  /* Wordmark with the swiped double l. */
  function wordmark(px, cls) {
    return '<span class="wordmark' + (cls ? ' ' + cls : '') + '" style="font-size:' + px + 'px">Ro' +
      '<svg viewBox="0 0 32 72" aria-hidden="true"><rect x="2" y="0" width="11" height="72" rx="5" fill="#0E0E0E"/>' +
      '<rect class="l2" x="18" y="0" width="11" height="72" rx="5" fill="#1FAE80"' + (cls === 'word-anim' ? '' : ' transform="rotate(12 23 72)"') + '/></svg>a</span>';
  }
  function logo(markSize, wordPx) {
    return '<span class="logo" role="img" aria-label="Rolla">' + mark(markSize) + wordmark(wordPx) + '</span>';
  }

  /* The Rolodex mark as a tab icon: grey when idle, mint cards and ink stand when selected. */
  function tabMark(active) {
    var ink = active ? '#0E0E0E' : 'currentColor', cards = active ? '#1FAE80' : 'currentColor';
    return '<svg ' + VB + ' style="overflow:visible" aria-hidden="true">' + draw(cards, ink, active ? '#E8F8F1' : '#FFFFFF', { card: 3.6, stand: 5.5 }) + '</svg>';
  }

  window.ICONS = I;
  window.BRAND = { mark: mark, spinningMark: spinningMark, wordmark: wordmark, logo: logo, tabMark: tabMark };
})();
