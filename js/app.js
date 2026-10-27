/* Rolla prototype: navigation, swiping and interactions. */
(function () {
  var D = window.ROLLA, S = window.STORE, V = window.VIEWS, I = window.ICONS;
  var app = document.getElementById('app');

  var stack = [{ v: 'tab', tab: 'discover' }];
  var sheet = null;            // { jobId, msg, error, sent }
  var ui = { enter: '', arrive: false, appliedTab: 'applied' };
  var lastKey = '';
  var toastTimer = null;

  function top() { return stack[stack.length - 1]; }

  /* ---------- Rendering ---------- */
  function render(enter) {
    var view = top();
    var key = JSON.stringify(view);
    var scroller = app.querySelector('.scroll');
    var keepScroll = key === lastKey && scroller ? scroller.scrollTop : 0;
    ui.enter = enter || '';

    var html;
    if (view.v === 'job') html = V.jobView(D.job(view.id), ui);
    else if (view.v === 'company') html = V.companyView(D.company(view.id), ui);
    else if (view.v === 'employer') html = V.employerView(ui);
    else if (view.tab === 'feed') html = V.feed(ui);
    else if (view.tab === 'applied') html = V.appliedView(ui);
    else if (view.tab === 'profile') html = V.profileView(ui);
    else html = V.discover(ui);
    if (sheet) html += sheet.kind === 'filter' ? V.filterSheet() : V.standoutSheet(D.job(sheet.jobId), sheet);

    // Keep the splash and any visible toast across re-renders.
    var splashEl = document.getElementById('splash');
    var toastEl = app.querySelector('.toast');
    app.innerHTML = html;
    if (toastEl) app.appendChild(toastEl);
    if (splashEl) app.appendChild(splashEl);

    var newScroller = app.querySelector('.scroll');
    if (newScroller && keepScroll) newScroller.scrollTop = keepScroll;
    lastKey = key;
    ui.arrive = false;

    if (view.v === 'job') watchReading(view.id);
  }

  function go(view) { stack.push(view); sheet = null; render('enter-push'); }
  function back() { if (stack.length > 1) stack.pop(); sheet = null; render('enter-pop'); }
  function home(tab) { stack = [{ v: 'tab', tab: tab || 'discover' }]; sheet = null; render('enter-fade'); }

  /* ---------- Toasts ---------- */
  function toast(text, opts) {
    opts = opts || {};
    var old = app.querySelector('.toast');
    if (old) old.remove();
    clearTimeout(toastTimer);
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = (opts.icon || '') + '<span style="flex:1">' + V.esc(text) + '</span>' +
      (opts.action ? '<button class="act" data-act="' + opts.action + '" data-id="' + (opts.id || '') + '">' + opts.actionLabel + '</button>' : '');
    app.appendChild(el);
    toastTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, opts.long ? 4200 : 2800);
  }
  function tint(svg, color) { return '<span style="color:' + color + ';display:inline-flex">' + svg + '</span>'; }

  /* ---------- Reading progress: the Apply button fills as you read ---------- */
  function watchReading(jobId) {
    var sc = document.getElementById('job-scroll');
    var btn = document.getElementById('apply-btn');
    if (!sc || !btn || S.isRead(jobId)) return;
    function check() {
      if (S.isRead(jobId) || !sc.isConnected) return;
      var max = sc.scrollHeight - sc.clientHeight;
      var p = max <= 4 ? 1 : Math.min(1, sc.scrollTop / max);
      btn.style.setProperty('--p', Math.round(p * 100) + '%');
      if (p >= 0.97) {
        S.markRead(jobId);
        btn.classList.add('ready');
        btn.setAttribute('data-act', 'apply-job');
        var label = btn.querySelector('#apply-label');
        if (label) label.innerHTML = I.check + 'Apply';
        toast('Apply unlocked. Nice, you read the lot.', { icon: tint(I.check, '#7EE8C3') });
      }
    }
    sc.addEventListener('scroll', check, { passive: true });
    requestAnimationFrame(check);
  }

  /* ---------- Actions ---------- */
  function topJobId() { var d = S.deck(); return d.length ? d[0].id : null; }

  function doPass(id, fromDeck) {
    var j = D.job(id);
    S.pass(id);
    ui.arrive = false; // the flip already moved the next card into place
    if (fromDeck) render(); else back();
    toast('Passed on ' + j.title, { action: 'undo-pass', id: id, actionLabel: 'Undo' });
  }
  function doApply(id, fromDeck) {
    var j = D.job(id), c = D.company(j.co);
    S.apply(id);
    ui.arrive = false; // the flip already moved the next card into place
    if (fromDeck) render(); else back();
    toast('Applied to ' + c.name, { icon: tint(I.check, '#7EE8C3'), action: 'tab', id: 'applied', actionLabel: 'View' });
  }

  /* The Rolodex flip: the top card tips forward over its bottom edge and falls away,
     while the card behind stands up into place. */
  function flyOut(dir, then, dx) {
    var card = app.querySelector('.card.top');
    if (!card) { then(); return; }
    var x = typeof dx === 'number' ? dx : dir * 40;
    var stamp = card.querySelector(dir < 0 ? '.stamp-pass' : '.stamp-apply');
    if (stamp) stamp.style.opacity = 1;
    card.classList.add('dragging');
    card.style.transformOrigin = '50% 100%';
    card.style.transition = 'transform 0.5s cubic-bezier(0.45, 0, 0.75, 0.35), opacity 0.18s ease 0.32s';
    requestAnimationFrame(function () {
      card.style.transform = 'translateX(' + (x * 1.3) + 'px) translateY(40px) rotateX(-95deg) rotateZ(' + (dir * 4) + 'deg)';
      card.style.opacity = '0';
    });
    var next = app.querySelector('.card.back-1');
    if (next) { next.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.2s'; next.style.transform = 'none'; }
    var after = app.querySelector('.card.back-2');
    if (after) { after.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.18s, opacity 0.4s'; after.style.transform = 'translateY(-14px) scale(0.95)'; after.style.opacity = 1; }
    setTimeout(then, 560);
  }

  function share() {
    var done = function () { toast('Link copied', { icon: tint(I.check, '#7EE8C3') }); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href.split('#')[0]).then(done, function () { toast('Sharing is coming soon in this prototype'); });
        return;
      }
    } catch (e) { /* fall through */ }
    toast('Sharing is coming soon in this prototype');
  }

  var PROMPTS = [
    'I recently designed labels for Moss Side Brewing, from first sketches to the final print run.',
    'I’ve followed {co}’s work for a while and would love to learn from your team.',
    'I can start in two weeks and I’m happy to come in for a chat any time.',
  ];

  var actions = {
    tab: function (id) { home(id); },
    back: back,
    'open-filters': function () { sheet = { kind: 'filter' }; render(); },
    fsel: function (id) { var p = id.split('|'); S.setFilter(p[0], p[1]); ui.arrive = true; render(); },
    'clear-filters': function () { S.clearFilters(); ui.arrive = true; render(); },
    job: function (id) { go({ v: 'job', id: id }); },
    company: function (id) { if (top().v === 'company' && top().id === id) return; go({ v: 'company', id: id }); },
    employer: function () { go({ v: 'employer' }); },
    share: share,
    compose: function () { toast('Posting and editing are coming soon in this prototype'); },
    person: function (id) { var p = D.person(id); toast(p.name + '’s full profile is coming soon in this prototype'); },
    'applied-tab': function (id) { ui.appliedTab = id; render(); },
    'go-applied': function () { ui.appliedTab = 'applied'; home('applied'); },

    pass: function () { var id = topJobId(); if (id) flyOut(-1, function () { doPass(id, true); }); },
    apply: function () { var id = topJobId(); if (id) flyOut(1, function () { doApply(id, true); }); },
    'apply-locked': function (id) {
      var jid = id || topJobId();
      if (top().v !== 'job' && jid) go({ v: 'job', id: jid });
      toast('Scroll to the end of the listing to unlock Apply', { icon: tint(I.lock, '#B5B5B2') });
    },
    'pass-job': function (id) { doPass(id, false); },
    'apply-job': function (id) { doApply(id, false); },
    'undo-pass': function (id) { S.unpass(id); ui.arrive = true; render(); var t = app.querySelector('.toast'); if (t) t.remove(); },
    withdraw: function (id) { S.withdraw(id); render(); toast('Application withdrawn'); },
    unpass: function () { var n = S.get().passed.length; S.unpassAll(); ui.arrive = true; render(); toast(n + ' passed role' + (n === 1 ? ' is' : 's are') + ' back in your deck'); },
    save: function (id) {
      S.toggleSave(id); render();
      if (S.isSaved(id)) toast('Saved for later', { icon: tint(I.bookmarkFill, '#7EE8C3'), action: 'go-saved', actionLabel: 'View' });
    },
    'go-saved': function () { ui.appliedTab = 'saved'; home('applied'); },

    standout: function (id) {
      var jid = id || topJobId();
      if (!jid) return;
      sheet = { kind: 'standout', jobId: jid, msg: '', error: false, sent: false };
      render();
    },
    prompt: function (i) {
      var ta = document.getElementById('so-msg');
      if (!ta || !sheet) return;
      var c = D.company(D.job(sheet.jobId).co);
      var add = PROMPTS[+i].replace('{co}', c.name);
      ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + add;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.focus();
    },
    'send-standout': function (id) {
      var ta = document.getElementById('so-msg');
      var msg = ta ? ta.value.trim() : '';
      if (!msg) {
        sheet.error = true;
        var err = document.getElementById('so-err');
        if (err) { err.className = 'error'; err.textContent = 'Write a short message first'; }
        if (ta) ta.focus();
        return;
      }
      if (S.standout(id, msg)) { sheet.sent = true; sheet.msg = msg; render(); }
    },
    'close-sheet': function () {
      var wasSent = sheet && sheet.sent;
      sheet = null;
      if (wasSent && top().v === 'job') back(); else render();
    },
    'close-sheet-home': function () { ui.arrive = true; home('discover'); },

    shortlist: function (id) {
      S.toggleShortlist(id); render();
      var c = D.company(id);
      toast(S.isShortlisted(id) ? c.name + ' shortlisted. Their roles now come first.' : c.name + ' removed from your shortlist', { icon: S.isShortlisted(id) ? tint(I.check, '#7EE8C3') : '' });
    },
    like: function (id) { S.toggleLike(id); render(); },
    acq: function (id) {
      S.toggleAcquaintance(id); render();
      var p = D.person(id);
      if (S.get().acquaintances.indexOf(id) !== -1) toast('You added ' + p.name.split(' ')[0] + '. If they add you back, you’re associates.', { long: true });
    },
    reset: function () { S.reset(); ui.appliedTab = 'applied'; home('discover'); toast('Demo reset. All 30 roles are back.'); },
    'skip-splash': hideSplash,
  };

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    var fn = actions[el.getAttribute('data-act')];
    if (fn) { e.preventDefault(); fn(el.getAttribute('data-id')); }
  });

  app.addEventListener('input', function (e) {
    if (e.target.id !== 'so-msg' || !sheet) return;
    sheet.msg = e.target.value;
    var cnt = document.getElementById('so-count');
    if (cnt) cnt.textContent = e.target.value.length + '/300';
    if (sheet.error && e.target.value.trim()) {
      sheet.error = false;
      var err = document.getElementById('so-err');
      if (err) { err.className = 'caption'; err.textContent = 'Sent with your profile and work'; }
    }
  });

  /* ---------- Swiping the top card ---------- */
  var drag = null;
  var THRESHOLD = 110;

  app.addEventListener('pointerdown', function (e) {
    var card = e.target.closest('.card.top');
    if (!card || e.button > 0 || e.target.closest('button')) return;
    drag = { card: card, next: app.querySelector('.card.back-1'), id: card.getAttribute('data-id'), x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false, pid: e.pointerId };
    card.setPointerCapture(e.pointerId);
  });

  app.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    drag.dx = e.clientX - drag.x;
    drag.dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(drag.dx) + Math.abs(drag.dy) > 6) { drag.moved = true; drag.card.classList.add('dragging'); }
    if (!drag.moved) return;
    drag.card.style.transform = 'translate(' + drag.dx + 'px,' + (drag.dy * 0.2) + 'px) rotate(' + (drag.dx / 18) + 'deg)';
    var k = Math.min(1, Math.abs(drag.dx) / THRESHOLD);
    if (drag.next) { drag.next.style.transition = 'none'; drag.next.style.transform = 'translateY(' + (12 - 12 * k) + 'px) scale(' + (0.955 + 0.045 * k) + ')'; }
    var pass = drag.card.querySelector('.stamp-pass'), apply = drag.card.querySelector('.stamp-apply');
    var read = S.isRead(drag.id);
    if (!read && !apply.classList.contains('locked')) { apply.classList.add('locked'); apply.innerHTML = I.lock + 'READ FIRST'; }
    pass.style.opacity = Math.max(0, Math.min(1, -drag.dx / THRESHOLD));
    apply.style.opacity = Math.max(0, Math.min(1, drag.dx / THRESHOLD));
  });

  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.pid)) return;
    var d = drag; drag = null;
    if (!d.moved) { d.card.classList.remove('dragging'); go({ v: 'job', id: d.id }); return; }
    if (d.dx < -THRESHOLD) { flyOut(-1, function () { doPass(d.id, true); }, d.dx); return; }
    if (d.dx > THRESHOLD && S.isRead(d.id)) { flyOut(1, function () { doApply(d.id, true); }, d.dx); return; }
    d.card.classList.remove('dragging');
    d.card.style.transform = '';
    if (d.next) { d.next.style.transition = ''; d.next.style.transform = ''; }
    d.card.querySelector('.stamp-pass').style.opacity = 0;
    d.card.querySelector('.stamp-apply').style.opacity = 0;
    if (d.dx > THRESHOLD) toast('Read the full listing first. Tap the card to open it.', { icon: tint(I.lock, '#B5B5B2') });
  }
  app.addEventListener('pointerup', endDrag);
  app.addEventListener('pointercancel', endDrag);

  app.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet) { actions['close-sheet'](); return; }
    var card = e.target.closest && e.target.closest('.card.top');
    if (!card) return;
    var id = card.getAttribute('data-id');
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go({ v: 'job', id: id }); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); actions.pass(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); S.isRead(id) ? actions.apply() : actions['apply-locked'](id); }
  });

  /* ---------- Splash ---------- */
  function hideSplash() {
    var el = document.getElementById('splash');
    if (!el || el.classList.contains('out')) return;
    el.classList.add('out');
    setTimeout(function () { if (el.parentNode) el.remove(); }, 480);
  }

  // Application statuses move along over time, so refresh the Applied tab while it's open.
  setInterval(function () { if (!sheet && top().tab === 'applied' && !drag) render(); }, 5000);

  render();
  app.insertAdjacentHTML('beforeend', V.splash());
  setTimeout(hideSplash, 3900);
})();
