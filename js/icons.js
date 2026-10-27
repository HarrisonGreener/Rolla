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
  };

  function fan(fill) {
    var r = '';
    for (var a = -90; a <= 90; a += 15) {
      r += '<rect x="30.5" y="6" width="3" height="18" rx="1"' + (a ? ' transform="rotate(' + a + ' 32 32)"' : '') + '/>';
    }
    return '<g fill="' + fill + '">' + r + '</g>';
  }
  function ring(fill) {
    var r = '';
    for (var a = 0; a < 360; a += 15) {
      r += '<rect x="30.5" y="6" width="3" height="18" rx="1"' + (a ? ' transform="rotate(' + a + ' 32 32)"' : '') + '/>';
    }
    return '<g class="ring" fill="' + fill + '">' + r + '</g>';
  }
  function stand(ink) {
    return '<path d="M32 32 L20 55 M32 32 L44 55" stroke="' + ink + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
      '<rect x="13" y="54" width="38" height="4.5" rx="2.25" fill="' + ink + '"/>';
  }
  function hub(ink, paper) {
    return '<circle cx="32" cy="32" r="6" fill="' + ink + '"/><circle cx="32" cy="32" r="2.2" fill="' + paper + '"/>';
  }

  /* The mark: a Rolodex on its stand. */
  function mark(size) {
    return '<svg width="' + size + '" height="' + Math.round(size * 56 / 54) + '" viewBox="5 4 54 56" aria-hidden="true">' +
      stand('#0E0E0E') + fan('#1FAE80') + hub('#0E0E0E', '#FFFFFF') + '</svg>';
  }
  /* Animated mark for the splash: a full ring clipped to the top half spins like a turning Rolodex. */
  function spinningMark(size) {
    return '<svg class="mark" width="' + size + '" height="' + Math.round(size * 56 / 54) + '" viewBox="5 4 54 56" role="img" aria-label="Rolodex turning">' +
      '<defs><clipPath id="rl-top"><rect x="-10" y="-10" width="84" height="42.5"/></clipPath></defs>' +
      stand('#0E0E0E') + '<g clip-path="url(#rl-top)">' + ring('#1FAE80') + '</g>' + hub('#0E0E0E', '#FFFFFF') + '</svg>';
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

  window.ICONS = I;
  window.BRAND = { mark: mark, spinningMark: spinningMark, wordmark: wordmark, logo: logo };
})();
