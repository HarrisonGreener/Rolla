/* Generative cover art and company marks.
   Every job gets a seeded illustration in its studio's colours, styled after the discipline,
   so cards, listings and profiles show "work" instead of empty boxes. */
(function () {
  function rng(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function r1(r, a, b) { return a + (b - a) * r(); }
  function n(v) { return Math.round(v * 10) / 10; }
  var DISPLAY = "font-family=\"Figtree, 'Helvetica Neue', Arial, sans-serif\" font-weight=\"800\"";

  var painters = {
    brand: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.bg + '"/>';
      for (var x = 40; x < 400; x += 40) s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="260" stroke="' + b.ink + '" stroke-opacity="0.08"/>';
      for (var y = 40; y < 260; y += 40) s += '<line x1="0" y1="' + y + '" x2="400" y2="' + y + '" stroke="' + b.ink + '" stroke-opacity="0.08"/>';
      var tx = n(r1(r, 26, 60));
      s += '<text x="' + tx + '" y="196" ' + DISPLAY + ' font-size="170" letter-spacing="-8" fill="' + b.ink + '">Aa</text>';
      var cx = 318, cols = [b.accent, b.soft, b.ink];
      for (var i = 0; i < 3; i++) s += '<circle cx="' + cx + '" cy="' + (70 + i * 58) + '" r="22" fill="' + cols[i] + '" stroke="' + b.ink + '" stroke-opacity="0.15"/>';
      s += '<rect x="' + n(tx + 6) + '" y="214" width="' + n(r1(r, 90, 170)) + '" height="6" rx="3" fill="' + b.accent + '"/>';
      return s;
    },
    packaging: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.bg + '"/>';
      s += '<ellipse cx="200" cy="232" rx="170" ry="14" fill="' + b.ink + '" fill-opacity="0.12"/>';
      var items = 3, x = 60;
      for (var i = 0; i < items; i++) {
        var w = n(r1(r, 64, 84)), h = n(r1(r, 120, 170)), top = 230 - h;
        var kind = Math.floor(r() * 3);
        if (kind === 0) { // can
          s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="12" fill="' + b.soft + '"/>' +
            '<rect x="' + x + '" y="' + n(top + h * 0.3) + '" width="' + w + '" height="' + n(h * 0.42) + '" fill="' + b.accent + '"/>' +
            '<circle cx="' + n(x + w / 2) + '" cy="' + n(top + h * 0.51) + '" r="' + n(w * 0.22) + '" fill="' + b.bg + '"/>';
        } else if (kind === 1) { // bottle
          s += '<rect x="' + n(x + w * 0.35) + '" y="' + n(top - 26) + '" width="' + n(w * 0.3) + '" height="34" rx="4" fill="' + b.ink + '"/>' +
            '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="' + n(w * 0.3) + '" fill="' + b.accent + '"/>' +
            '<rect x="' + n(x + 8) + '" y="' + n(top + h * 0.38) + '" width="' + n(w - 16) + '" height="' + n(h * 0.34) + '" rx="4" fill="' + b.soft + '"/>' +
            '<rect x="' + n(x + 16) + '" y="' + n(top + h * 0.46) + '" width="' + n(w - 32) + '" height="5" rx="2.5" fill="' + b.bg + '"/>';
        } else { // box
          s += '<rect x="' + x + '" y="' + top + '" width="' + n(w + 14) + '" height="' + h + '" rx="6" fill="' + b.soft + '"/>' +
            '<rect x="' + x + '" y="' + top + '" width="' + n(w + 14) + '" height="22" rx="6" fill="' + b.ink + '"/>' +
            '<text x="' + n(x + (w + 14) / 2) + '" y="' + n(top + h * 0.62) + '" text-anchor="middle" ' + DISPLAY + ' font-size="30" fill="' + b.bg + '">' + 'No.' + Math.floor(r1(r, 1, 9)) + '</text>';
          w += 14;
        }
        x += w + 22;
      }
      return s;
    },
    ui: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.soft + '"/>';
      s += '<circle cx="' + n(r1(r, 300, 360)) + '" cy="' + n(r1(r, 40, 80)) + '" r="70" fill="' + b.accent + '" fill-opacity="0.25"/>';
      // phone
      s += '<rect x="120" y="22" width="150" height="270" rx="26" fill="' + b.bg + '"/>' +
        '<rect x="130" y="32" width="130" height="250" rx="18" fill="#FFFFFF"/>' +
        '<rect x="142" y="48" width="70" height="8" rx="4" fill="' + b.bg + '"/>' +
        '<rect x="142" y="66" width="106" height="62" rx="10" fill="' + b.accent + '"/>' +
        '<rect x="152" y="104" width="50" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.85"/>';
      for (var i = 0; i < 3; i++) {
        var y = 140 + i * 36;
        s += '<rect x="142" y="' + y + '" width="106" height="28" rx="8" fill="' + b.soft + '"/>' +
          '<circle cx="156" cy="' + (y + 14) + '" r="7" fill="' + b.bg + '" fill-opacity="0.8"/>' +
          '<rect x="170" y="' + (y + 10) + '" width="' + n(r1(r, 34, 66)) + '" height="7" rx="3.5" fill="' + b.bg + '" fill-opacity="0.45"/>';
      }
      // floating component
      s += '<g transform="rotate(' + n(r1(r, -6, 6)) + ' 320 150)"><rect x="262" y="118" width="116" height="62" rx="12" fill="#FFFFFF" stroke="' + b.bg + '" stroke-opacity="0.15"/>' +
        '<rect x="276" y="134" width="56" height="8" rx="4" fill="' + b.bg + '"/><rect x="276" y="150" width="86" height="16" rx="8" fill="' + b.accent + '"/></g>';
      s += '<g transform="rotate(' + n(r1(r, -8, 4)) + ' 70 190)"><rect x="18" y="160" width="96" height="56" rx="12" fill="' + b.bg + '"/>' +
        '<circle cx="40" cy="188" r="10" fill="' + b.accent + '"/><rect x="58" y="182" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.8"/><rect x="58" y="193" width="28" height="5" rx="2.5" fill="#FFFFFF" fill-opacity="0.5"/></g>';
      return s;
    },
    motion: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.bg + '"/>';
      var cx = n(r1(r, 150, 250)), cy = n(r1(r, 100, 130));
      for (var i = 7; i >= 1; i--) {
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (i * 17) + '" fill="none" stroke="' + (i % 2 ? b.accent : b.ink) + '" stroke-opacity="' + (0.15 + i * 0.08) + '" stroke-width="' + (i % 3 === 0 ? 6 : 2) + '" stroke-dasharray="' + (i % 2 ? '0' : n(r1(r, 6, 24)) + ' ' + n(r1(r, 6, 18))) + '"/>';
      }
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="26" fill="' + b.accent + '"/>' +
        '<path d="M' + n(cx - 7) + ' ' + n(cy - 11) + ' L' + n(cx + 12) + ' ' + cy + ' L' + n(cx - 7) + ' ' + n(cy + 11) + ' Z" fill="' + b.bg + '"/>';
      // timeline
      s += '<rect x="24" y="226" width="352" height="4" rx="2" fill="' + b.ink + '" fill-opacity="0.25"/>' +
        '<rect x="24" y="226" width="' + n(r1(r, 120, 260)) + '" height="4" rx="2" fill="' + b.accent + '"/>';
      for (var k = 0; k < 5; k++) {
        var kx = n(40 + k * 74 + r1(r, -10, 10));
        s += '<rect x="' + (kx - 5) + '" y="223" width="10" height="10" transform="rotate(45 ' + kx + ' 228)" fill="' + b.ink + '"/>';
      }
      return s;
    },
    social: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.soft + '"/>';
      var tiles = [[70, 40, -9, b.bg], [150, 30, 4, b.accent], [232, 44, 11, b.ink]];
      tiles.forEach(function (t, i) {
        var a = n(t[2] + r1(r, -3, 3));
        s += '<g transform="rotate(' + a + ' ' + (t[0] + 60) + ' ' + (t[1] + 75) + ')">' +
          '<rect x="' + t[0] + '" y="' + t[1] + '" width="120" height="150" rx="14" fill="#FFFFFF"/>' +
          '<rect x="' + (t[0] + 8) + '" y="' + (t[1] + 8) + '" width="104" height="104" rx="9" fill="' + t[3] + '"/>' +
          (i === 1 ? '<text x="' + (t[0] + 60) + '" y="' + (t[1] + 74) + '" text-anchor="middle" ' + DISPLAY + ' font-size="42" fill="' + b.bg + '">NEW</text>' :
            '<circle cx="' + (t[0] + 60) + '" cy="' + (t[1] + 60) + '" r="' + n(r1(r, 18, 30)) + '" fill="' + (i === 0 ? b.accent : b.soft) + '"/>') +
          '<path d="M' + (t[0] + 20) + ' ' + (t[1] + 134) + ' c0 -6 8 -8 9 -2 c1 -6 9 -4 9 2 c0 5 -9 10 -9 10 s-9 -5 -9 -10z" fill="' + '#E5484D' + '"/>' +
          '<rect x="' + (t[0] + 46) + '" y="' + (t[1] + 128) + '" width="' + n(r1(r, 30, 56)) + '" height="7" rx="3.5" fill="#0E0E0E" fill-opacity="0.2"/>' +
          '</g>';
      });
      s += '<rect x="262" y="206" width="112" height="34" rx="17" fill="' + b.bg + '"/><text x="318" y="229" text-anchor="middle" ' + DISPLAY + ' font-size="15" fill="' + b.ink + '">+' + Math.floor(r1(r, 2, 19)) + '.' + Math.floor(r1(r, 1, 9)) + 'k likes</text>';
      return s;
    },
    code: function (b, r) {
      var dark = '#14161C';
      var s = '<rect width="400" height="260" fill="' + b.bg + '"/>';
      s += '<rect x="34" y="28" width="332" height="210" rx="14" fill="' + dark + '"/>' +
        '<circle cx="54" cy="46" r="5" fill="#FF5F57"/><circle cx="70" cy="46" r="5" fill="#FEBC2E"/><circle cx="86" cy="46" r="5" fill="#28C840"/>';
      var cols = [b.accent, '#8AB4FF', '#F7F7F5', '#FFB86B', '#C8F55A'];
      for (var i = 0; i < 8; i++) {
        var y = 72 + i * 19, x = 54 + (i > 0 && i < 7 ? (i % 3) * 16 : 0);
        var segs = 1 + Math.floor(r() * 3);
        s += '<rect x="44" y="' + (y - 3) + '" width="6" height="5" rx="1" fill="#F7F7F5" fill-opacity="0.18"/>';
        for (var k = 0; k < segs; k++) {
          var w = n(r1(r, 22, 80));
          s += '<rect x="' + x + '" y="' + (y - 4) + '" width="' + w + '" height="8" rx="4" fill="' + cols[Math.floor(r() * cols.length)] + '" fill-opacity="0.9"/>';
          x += w + 8;
        }
      }
      s += '<rect x="250" y="168" width="100" height="54" rx="10" fill="' + b.accent + '"/><text x="300" y="201" text-anchor="middle" ' + DISPLAY + ' font-size="18" fill="' + dark + '">&lt;/&gt;</text>';
      return s;
    },
    editorial: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.soft + '"/>';
      var a = n(r1(r, -10, -3));
      s += '<g transform="rotate(' + n(-a / 2) + ' 280 130)"><rect x="210" y="40" width="150" height="190" rx="4" fill="#FFFFFF"/>';
      for (var i = 0; i < 9; i++) s += '<rect x="226" y="' + (62 + i * 16) + '" width="' + n(r1(r, 80, 118)) + '" height="5" rx="2.5" fill="' + b.ink + '" fill-opacity="0.22"/>';
      s += '</g>';
      s += '<g transform="rotate(' + a + ' 140 130)"><rect x="60" y="24" width="150" height="210" rx="4" fill="' + b.bg + '"/>' +
        '<circle cx="135" cy="' + n(r1(r, 100, 130)) + '" r="' + n(r1(r, 34, 50)) + '" fill="' + b.accent + '"/>' +
        '<rect x="78" y="44" width="80" height="10" rx="2" fill="' + b.ink + '"/>' +
        '<text x="78" y="214" font-family="Georgia, \'Times New Roman\', serif" font-style="italic" font-size="24" fill="' + b.ink + '">' + ['Salt', 'Tides', 'North', 'Embers', 'Paper'][Math.floor(r() * 5)] + '</text></g>';
      return s;
    },
    illustration: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.bg + '"/>';
      s += '<circle cx="' + n(r1(r, 260, 330)) + '" cy="' + n(r1(r, 70, 100)) + '" r="' + n(r1(r, 38, 56)) + '" fill="' + b.accent + '"/>';
      var y0 = 170;
      s += '<path d="M0 ' + y0 + ' C 80 ' + n(y0 - r1(r, 40, 80)) + ', 160 ' + n(y0 + 20) + ', 240 ' + n(y0 - r1(r, 30, 60)) + ' S 360 ' + n(y0 - 10) + ', 400 ' + n(y0 - 30) + ' L400 260 L0 260Z" fill="' + b.soft + '" fill-opacity="0.9"/>';
      s += '<path d="M0 ' + (y0 + 40) + ' C 100 ' + n(y0 + 10) + ', 200 ' + n(y0 + 60) + ', 300 ' + n(y0 + 20) + ' S 380 ' + (y0 + 40) + ', 400 ' + (y0 + 30) + ' L400 260 L0 260Z" fill="' + b.ink + '" fill-opacity="0.85"/>';
      for (var i = 0; i < 5; i++) {
        var x = n(r1(r, 30, 370)), y = n(r1(r, 200, 240)), h = n(r1(r, 26, 52));
        s += '<path d="M' + x + ' ' + y + ' q -10 ' + n(-h / 2) + ' 0 ' + (-h) + ' q 10 ' + n(h / 2) + ' 0 ' + h + 'z" fill="' + b.accent + '" fill-opacity="0.9"/>' +
          '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + n(y + 10) + '" stroke="' + b.accent + '" stroke-width="2"/>';
      }
      return s;
    },
    data: function (b, r) {
      var s = '<rect width="400" height="260" fill="' + b.soft + '"/>';
      s += '<rect x="28" y="26" width="344" height="208" rx="16" fill="#FFFFFF"/>';
      s += '<rect x="48" y="46" width="90" height="10" rx="5" fill="' + b.bg + '"/><text x="48" y="92" ' + DISPLAY + ' font-size="30" fill="' + (b.bg === '#FFDE59' ? '#111111' : b.bg) + '">+' + Math.floor(r1(r, 12, 64)) + '%</text>';
      var pts = [];
      for (var i = 0; i < 7; i++) {
        var h = n(r1(r, 30, 110)), x = 52 + i * 44;
        s += '<rect x="' + x + '" y="' + (214 - h) + '" width="26" height="' + h + '" rx="6" fill="' + (i === 5 ? b.accent : b.bg) + '" fill-opacity="' + (i === 5 ? 1 : 0.35) + '"/>';
        pts.push((x + 13) + ' ' + n(214 - h - 14));
      }
      s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + b.accent + '" stroke-width="3" stroke-linejoin="round"/>';
      return s;
    },
  };

  function art(kind, brand, seed, cls) {
    var paint = painters[kind] || painters.brand;
    return '<svg class="art' + (cls ? ' ' + cls : '') + '" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + paint(brand, rng(seed + kind)) + '</svg>';
  }

  /* Company marks: a simple glyph per studio, in its own colours. */
  var glyphs = {
    circle: function (b) { return '<circle cx="24" cy="28" r="9" fill="' + b.accent + '"/><circle cx="14" cy="17" r="4" fill="' + b.accent + '"/><circle cx="24" cy="13" r="4" fill="' + b.accent + '"/><circle cx="34" cy="17" r="4" fill="' + b.accent + '"/>'; },
    diamond: function (b) { return '<path d="M24 8 L36 22 L24 36 L12 22Z" fill="' + b.accent + '"/><path d="M24 36 q -3 4 0 6" stroke="' + b.accent + '" stroke-width="2" fill="none"/>'; },
    wave: function (b) { return '<path d="M9 20 q 7.5 -8 15 0 t 15 0" stroke="' + b.ink + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M9 30 q 7.5 -8 15 0 t 15 0" stroke="' + b.ink + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; },
    ring: function (b) { return '<circle cx="24" cy="24" r="10" fill="none" stroke="' + b.accent + '" stroke-width="4"/><ellipse cx="24" cy="24" rx="17" ry="5" fill="none" stroke="' + b.ink + '" stroke-width="2" transform="rotate(-20 24 24)"/>'; },
    square: function (b) { return '<text x="24" y="33" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="28" fill="' + b.accent + '">Q</text>'; },
    bars: function (b) { var s = '', hs = [10, 20, 28, 16, 8]; for (var i = 0; i < 5; i++) s += '<rect x="' + (10 + i * 6) + '" y="' + (24 - hs[i] / 2) + '" width="4" height="' + hs[i] + '" rx="2" fill="' + b.accent + '"/>'; return s; },
    bean: function (b) { return '<ellipse cx="24" cy="24" rx="10" ry="14" transform="rotate(25 24 24)" fill="' + b.accent + '"/><path d="M20 13 q 8 11 0 22" stroke="' + b.bg + '" stroke-width="2.5" fill="none" transform="rotate(25 24 24)"/>'; },
    plane: function (b) { return '<path d="M9 23 L39 11 L29 37 L23 27Z" fill="' + b.accent + '"/><path d="M23 27 L39 11" stroke="' + b.bg + '" stroke-width="2"/>'; },
    tiles: function (b) { return '<rect x="11" y="11" width="12" height="12" rx="3" fill="' + b.accent + '"/><rect x="25" y="11" width="12" height="12" rx="3" fill="' + b.accent + '" fill-opacity="0.4"/><rect x="11" y="25" width="12" height="12" rx="3" fill="' + b.accent + '" fill-opacity="0.4"/><rect x="25" y="25" width="12" height="12" rx="6" fill="' + b.accent + '"/>'; },
    record: function (b) { return '<circle cx="24" cy="24" r="14" fill="' + b.accent + '"/><circle cx="24" cy="24" r="5" fill="' + b.bg + '"/><circle cx="24" cy="24" r="1.5" fill="' + b.accent + '"/>'; },
    peak: function (b) { return '<path d="M7 35 L19 16 L26 26 L31 19 L41 35Z" fill="' + b.accent + '"/><path d="M19 16 L22 21 L16 21Z" fill="' + b.ink + '"/>'; },
    grid: function (b) { var s = ''; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) s += '<rect x="' + (12 + i * 9) + '" y="' + (12 + j * 9) + '" width="6" height="6" rx="1.5" fill="' + (i === 2 && j === 0 ? b.accent : b.ink) + '"/>'; return s; },
  };

  function mark(c, size) {
    size = size || 40;
    var radius = Math.round(size * 0.28);
    return '<span class="co-mark" style="width:' + size + 'px;height:' + size + 'px;border-radius:' + radius + 'px;background:' + c.brand.bg + '" aria-hidden="true">' +
      '<svg viewBox="0 0 48 48" width="' + Math.round(size * 0.86) + '" height="' + Math.round(size * 0.86) + '">' + (glyphs[c.shape] || glyphs.circle)(c.brand) + '</svg></span>';
  }

  window.ART = { art: art, mark: mark };
})();
