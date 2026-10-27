/* Rolla prototype: navigation, swiping and interactions. */
(function () {
  var D = window.ROLLA, S = window.STORE, V = window.VIEWS, I = window.ICONS;
  var app = document.getElementById('app');

  var stack = [{ v: 'tab', tab: 'discover' }];
  var sheet = null;          // { jobId, msg, error, sent }
  var lastKey = '';
  var toastTimer = null;

  function top() { return stack[stack.length - 1]; }
  function keyOf(view) { return JSON.stringify(view); }

  /* ---------- Rendering ---------- */
  function render() {
    var view = top();
    var key = keyOf(view);
    var scroller = app.querySelector('.scroll');
    var keepScroll = key === lastKey && scroller ? scroller.scrollTop : 0;

    var html;
    if (view.v === 'job') html = V.jobView(D.job(view.id));
    else if (view.v === 'company') html = V.companyView(D.company(view.id));
    else if (view.v === 'employer') html = V.employerView();
    else if (view.tab === 'feed') html = V.feed();
    else if (view.tab === 'applied') html = V.appliedView();
    else if (view.tab === 'profile') html = V.profileView();
    else html = V.discover();

    if (sheet) html += V.standoutSheet(D.job(sheet.jobId), sheet);

    // Keep the splash and any visible toast across re-renders.
    var splashEl = document.getElementById('splash');
    var toastEl = app.querySelector('.toast');
    app.innerHTML = html;
    if (toastEl) app.appendChild(toastEl);
    if (splashEl) app.appendChild(splashEl);

    var newScroller = app.querySelector('.scroll');
    if (newScroller && keepScroll) newScroller.scrollTop = keepScroll;
    lastKey = key;

    if (view.v === 'job') watchReading(view.id);
    if (sheet && !sheet.sent) {
      var ta = document.getElementById('so-msg');
      if (ta && sheet.focus) { ta.focus(); sheet.focus = false; }
    }
  }

  function go(view) { stack.push(view); sheet = null; render(); }
  function back() { if (stack.length > 1) stack.pop(); sheet = null; render(); }
  function home(tab) { stack = [{ v: 'tab', tab: tab || 'discover' }]; sheet = null; render(); }

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
      (opts.action ? '<button class="link-btn" style="color:#7EE8C3;padding:4px" data-act="' + opts.action + '" data-id="' + (opts.id || '') + '">' + opts.actionLabel + '</button>' : '');
    app.appendChild(el);
    toastTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, opts.long ? 4000 : 2600);
  }
  function starIcon() { return '<span style="color:#FFC94D;display:inline-flex">' + I.star + '</span>'; }
  function checkIcon() { return '<span style="color:#7EE8C3;display:inline-flex">' + I.check + '</span>'; }

  /* ---------- Reading progress: Apply unlocks at the end of the listing ---------- */
  function watchReading(jobId) {
    var sc = document.getElementById('job-scroll');
    if (!sc) return;
    function check() {
      var max = sc.scrollHeight - sc.clientHeight;
      var p = max <= 4 ? 1 : Math.min(1, sc.scrollTop / max);
      var already = S.isRead(jobId);
      var bar = document.getElementById('read-bar');
      if (bar && !already) {
        bar.style.width = Math.round(p * 100) + '%';
        bar.parentNode.setAttribute('aria-valuenow', Math.round(p * 100));
      }
      if (!already && p >= 0.97) {
        S.markRead(jobId);
        if (bar) { bar.style.width = '100%'; bar.parentNode.setAttribute('aria-valuenow', 100); }
        var label = document.getElementById('read-label');
        if (label) { label.textContent = 'Apply unlocked'; label.style.color = '#0E7052'; }
        var btn = document.getElementById('apply-btn');
        if (btn) {
          btn.className = 'btn grow btn-mint';
          btn.setAttribute('data-act', 'apply-job');
          btn.innerHTML = 'Apply';
        }
        toast('Apply unlocked', { icon: checkIcon() });
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
    toast('Passed on ' + j.title, { action: 'undo-pass', id: id, actionLabel: 'Undo' });
    if (!fromDeck) back(); else render();
  }
  function doApply(id, fromDeck) {
    var j = D.job(id), c = D.company(j.companyId);
    S.apply(id);
    if (!fromDeck) back(); else render();
    toast('Applied to ' + j.title + ' at ' + c.name, { icon: checkIcon() });
  }

  function flyOut(dir, then) {
    var card = app.querySelector('.card.top');
    if (!card) { then(); return; }
    card.style.transition = 'transform 0.28s ease-in, opacity 0.28s ease-in';
    card.style.transform = 'translate(' + (dir * 480) + 'px, 30px) rotate(' + (dir * 24) + 'deg)';
    card.style.opacity = '0';
    setTimeout(then, 240);
  }

  var actions = {
    tab: function (id) { home(id); },
    back: back,
    filter: function (id) { S.setFilter(id); render(); },
    job: function (id) { go({ v: 'job', id: id }); },
    company: function (id) { go({ v: 'company', id: id }); },
    employer: function () { go({ v: 'employer' }); },

    pass: function () { var id = topJobId(); if (id) flyOut(-1, function () { doPass(id, true); }); },
    apply: function () { var id = topJobId(); if (id) flyOut(1, function () { doApply(id, true); }); },
    'apply-locked': function (id) {
      var jid = id || topJobId();
      if (top().v !== 'job' && jid) { go({ v: 'job', id: jid }); }
      toast('Read the full listing to unlock Apply', { icon: '<span style="display:inline-flex;color:#B5B5B2">' + I.lock + '</span>' });
    },
    'pass-job': function (id) { doPass(id, false); },
    'apply-job': function (id) { doApply(id, false); },
    'undo-pass': function (id) {
      var st = S.get();
      st.passed = st.passed.filter(function (x) { return x !== id; });
      S.save(); render();
    },
    withdraw: function (id) { S.withdraw(id); render(); toast('Application withdrawn'); },
    unpass: function () { var n = S.get().passed.length; S.unpassAll(); render(); toast(n + ' passed job' + (n === 1 ? '' : 's') + ' back in your deck'); },

    standout: function (id) {
      var jid = id || topJobId();
      if (!jid) return;
      sheet = { jobId: jid, msg: '', error: false, sent: false, focus: true };
      render();
    },
    'send-standout': function (id) {
      var ta = document.getElementById('so-msg');
      var msg = ta ? ta.value.trim() : '';
      if (!msg) {
        sheet.error = true; sheet.msg = ta ? ta.value : '';
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
    'close-sheet-home': function () { home('discover'); },

    shortlist: function (id) {
      S.toggleShortlist(id); render();
      var c = D.company(id);
      toast(S.isShortlisted(id) ? c.name + ' shortlisted. Their jobs now come first.' : c.name + ' removed from your shortlist');
    },
    like: function (id) { S.toggleLike(id); render(); },
    acq: function (id) {
      S.toggleAcquaintance(id); render();
      var p = D.people.filter(function (x) { return x.id === id; })[0];
      if (S.get().acquaintances.indexOf(id) !== -1) toast('Added ' + p.name + ' as an acquaintance. If they add you back, you’re associates.', { long: true });
    },
    reset: function () { S.reset(); home('discover'); toast('Demo reset. All 30 jobs are back.'); },
    'skip-splash': hideSplash,
  };

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    if (el.classList.contains('card')) return; // cards are handled by the drag code
    var fn = actions[el.getAttribute('data-act')];
    if (fn) { e.preventDefault(); fn(el.getAttribute('data-id')); }
  });

  app.addEventListener('input', function (e) {
    if (e.target.id === 'so-msg' && sheet) {
      sheet.msg = e.target.value;
      var cnt = document.getElementById('so-count');
      if (cnt) cnt.textContent = e.target.value.length + '/300';
      if (sheet.error && e.target.value.trim()) {
        sheet.error = false;
        var err = document.getElementById('so-err');
        if (err) { err.className = 'caption'; err.textContent = 'Shown alongside your profile'; }
      }
    }
  });

  /* ---------- Swiping the top card ---------- */
  var drag = null;
  var THRESHOLD = 110;

  app.addEventListener('pointerdown', function (e) {
    var card = e.target.closest('.card.top');
    if (!card || e.button > 0) return;
    drag = { card: card, id: card.getAttribute('data-id'), x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false, pid: e.pointerId };
    card.setPointerCapture(e.pointerId);
  });

  app.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    drag.dx = e.clientX - drag.x;
    drag.dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(drag.dx) + Math.abs(drag.dy) > 6) { drag.moved = true; drag.card.classList.add('dragging'); }
    if (!drag.moved) return;
    drag.card.style.transform = 'translate(' + drag.dx + 'px,' + (drag.dy * 0.25) + 'px) rotate(' + (drag.dx / 16) + 'deg)';
    var pass = drag.card.querySelector('.stamp-pass');
    var apply = drag.card.querySelector('.stamp-apply');
    var read = S.isRead(drag.id);
    apply.textContent = read ? 'APPLY' : 'READ FIRST';
    apply.style.color = apply.style.borderColor = read ? '#0E7052' : '#5F5F5C';
    pass.style.opacity = Math.max(0, Math.min(1, -drag.dx / THRESHOLD));
    apply.style.opacity = Math.max(0, Math.min(1, drag.dx / THRESHOLD));
  });

  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.pid)) return;
    var d = drag; drag = null;
    d.card.classList.remove('dragging');
    if (!d.moved) { go({ v: 'job', id: d.id }); return; }
    if (d.dx < -THRESHOLD) { flyOut(-1, function () { doPass(d.id, true); }); return; }
    if (d.dx > THRESHOLD && S.isRead(d.id)) { flyOut(1, function () { doApply(d.id, true); }); return; }
    d.card.style.transform = '';
    d.card.querySelector('.stamp-pass').style.opacity = 0;
    d.card.querySelector('.stamp-apply').style.opacity = 0;
    if (d.dx > THRESHOLD) toast('Read the full listing first. Tap the card to open it.', { icon: '<span style="display:inline-flex;color:#B5B5B2">' + I.lock + '</span>' });
  }
  app.addEventListener('pointerup', endDrag);
  app.addEventListener('pointercancel', endDrag);

  app.addEventListener('keydown', function (e) {
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
    setTimeout(function () { if (el.parentNode) el.remove(); }, 450);
  }

  render();
  app.insertAdjacentHTML('beforeend', V.splash());
  setTimeout(hideSplash, 3600);
})();
