/* Screen templates. Each returns an HTML string; app.js wires up events through data-act attributes. */
(function () {
  var D = window.ROLLA, S = window.STORE, I = window.ICONS, B = window.BRAND, A = window.ART;

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function ico(svg, cls) { return '<span class="' + (cls || 'ico') + '">' + svg + '</span>'; }
  function fmt(n) { return n.toLocaleString('en-GB'); }
  function co(job) { return D.company(job.co); }
  function jobArt(job) { return A.art(job.art, co(job).brand, job.id); }
  function list(items) { return items.join(''); }
  function andList(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function initials(name) { return name.split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2); }

  function matchRing(pct) {
    var c = 2 * Math.PI * 17, off = c * (1 - pct / 100);
    return '<span class="match-ring" title="' + pct + '% match"><svg viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle cx="20" cy="20" r="17" fill="none" stroke="#E4E6E1" stroke-width="3"/>' +
      '<circle cx="20" cy="20" r="17" fill="none" stroke="#1FAE80" stroke-width="3" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
      '<b class="num">' + pct + '</b><span class="sr-only">% match</span></span>';
  }
  function verified(c) { return c.verified ? '<span class="ico-sm mint" title="Verified employer">' + I.verified + '<span class="sr-only">Verified</span></span>' : ''; }
  function whyLine(job) {
    if (job.matched.length) return '<p class="why">' + ico(I.sparkle, 'ico-sm') + 'Matches your ' + esc(andList(job.matched.slice(0, 2))) + '</p>';
    return '<p class="why" style="color:var(--muted)">' + ico(I.sparkle, 'ico-sm') + 'A stretch role: ' + esc(job.tags[0]) + ' is new for you</p>';
  }

  /* ---------- Tab bar ---------- */
  function tabbar(active) {
    var n = S.appliedList().length;
    var tabs = [['discover', 'Jobs', B.tabMark(active === 'discover')], ['feed', 'Network', I.network], ['applied', 'Applied', I.applied], ['profile', 'Profile', I.profile]];
    return '<nav class="tabbar" aria-label="Main">' + tabs.map(function (t) {
      return '<button class="tab" data-act="tab" data-id="' + t[0] + '"' + (t[0] === active ? ' aria-current="page"' : '') + '>' + t[2] + t[1] +
        (t[0] === 'applied' && n ? '<span class="dot num">' + n + '</span>' : '') + '</button>';
    }).join('') + '</nav>';
  }

  /* ---------- Discover ---------- */
  function card(job, depth, arrive) {
    var c = co(job), read = S.isRead(job.id), saved = S.isSaved(job.id);
    var cls = depth === 0 ? 'card top' + (arrive ? ' arrive' : '') : 'card back-' + depth;
    return '<article class="' + cls + '" data-id="' + job.id + '"' +
      (depth === 0 ? ' tabindex="0" aria-label="' + esc(job.title + ' at ' + c.name + ', ' + job.salary + '. Press Enter to read the listing, arrow keys to swipe.') + '"' : ' aria-hidden="true"') + '>' +
      '<div class="media">' + jobArt(job) + '<div class="shade"></div>' +
        '<div class="on-media top">' + matchRing(job.match) +
          (depth === 0 ? '<button class="save-btn" data-act="save" data-id="' + job.id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Saved' : 'Save for later') + '">' + (saved ? I.bookmarkFill : I.bookmark) + '</button>' : '') + '</div>' +
        '<div class="on-media bottom"><span class="co-pill">' + A.mark(c, 30) + '<span class="label ellipsis">' + esc(c.name) + '</span>' + verified(c) + '</span>' +
          (S.isShortlisted(c.id) ? '<span class="pill pill-mint">Shortlisted</span>' : '<span class="pill pill-dark num">' + esc(job.posted) + ' ago</span>') + '</div>' +
      '</div>' +
      '<div class="stamp stamp-pass">' + I.x + 'PASS</div><div class="stamp stamp-apply">' + I.check + 'APPLY</div>' +
      '<div class="body-area">' +
        '<h2 class="h1">' + esc(job.title) + '</h2>' +
        '<div class="meta-row num"><span>' + ico(I.pound, 'ico-sm') + esc(job.salary) + '</span><span>' + ico(I.pin, 'ico-sm') + esc(job.loc) + '</span><span>' + ico(I.laptop, 'ico-sm') + esc(job.mode) + '</span></div>' +
        whyLine(job) +
        '<div class="readline">' + (read
          ? '<span class="caption mint row g4" style="font-weight:600">' + ico(I.check, 'ico-sm') + 'Read · swipe right to apply</span>'
          : '<span class="caption row g4">' + ico(I.lock, 'ico-sm') + 'Tap to read and unlock Apply</span>') +
          '<span class="track"><span style="width:' + (read ? 100 : 4) + '%"></span></span></div>' +
      '</div>' +
    '</article>';
  }

  function discover(ui) {
    var st = S.get(), deck = S.deck(), topJob = deck[0];
    var active = S.activeFilters();
    var heading = deck.length + (active.length ? ' matching role' + (deck.length === 1 ? '' : 's') : ' roles for you');
    var sub = active.length ? esc(active.join(' · ')) : 'Best matches first';
    var body;
    if (!topJob) {
      body = '<div class="empty" style="flex:1;justify-content:center;padding-bottom:110px">' +
        '<div class="art-blob">' + A.art('motion', D.company('signal').brand, 'empty') + '</div>' +
        '<h2 class="h2">' + (active.length ? 'No more roles match' : 'You’re all caught up') + '</h2>' +
        '<p class="body muted">' + (active.length ? 'Try loosening your filters, or look again at the roles you passed.' : 'New roles land every morning. You can look again at the ones you passed.') + '</p>' +
        (st.passed.length ? '<button class="btn btn-ink" data-act="unpass">' + I.undo + 'Review ' + st.passed.length + ' passed</button>' : '') +
        (active.length ? '<button class="btn btn-ghost" data-act="clear-filters">Clear filters</button>' : '') +
        '</div>';
    } else {
      var read = S.isRead(topJob.id);
      body = '<div class="deck" id="deck">' + deck.slice(0, 3).map(function (j, i) { return card(j, i, ui.arrive); }).reverse().join('') + '</div>' +
        '<div class="actions" style="padding-bottom:96px">' +
          '<button class="round" data-act="pass" aria-label="Pass">' + I.x + '</button>' +
          '<button class="round gold" data-act="standout" aria-label="Send a Standout, ' + st.standoutsLeft + ' left">' + I.star + '<span class="left num">' + st.standoutsLeft + '</span></button>' +
          (read
            ? '<button class="round mint" data-act="apply" aria-label="Apply">' + I.check + '</button>'
            : '<button class="round locked" data-act="apply-locked" aria-label="Apply is locked until you read the listing">' + I.lock + '</button>') +
        '</div>';
    }

    return '<section class="view ' + (ui.enter || '') + '" aria-label="Jobs">' +
      '<div class="pad top-space">' +
        '<div class="row between" style="height:44px"><button class="filter-btn" data-act="open-filters" aria-label="Filter roles' + (active.length ? ', ' + active.length + ' active' : '') + '">' + I.filter + 'Filter' +
          (active.length ? '<span class="n num">' + active.length + '</span>' : '') + '</button>' + B.wordmark(34) + '</div>' +
        '<div class="discover-head"><div class="col g4"><h1 class="h1 num">' + esc(heading) + '</h1><p class="small muted">' + sub +
          (active.length ? ' · <button class="link" data-act="clear-filters" style="padding:0;font-size:13px">Clear</button>' : '') + '</p></div></div></div>' +
      body + '</section>' + tabbar('discover');
  }

  /* ---------- Job listing ---------- */
  function jobView(job, ui) {
    var c = co(job), read = S.isRead(job.id), applied = S.get().applied[job.id], saved = S.isSaved(job.id);
    var others = job.tags.filter(function (t) { return job.matched.indexOf(t) === -1; });
    var bar;
    if (applied) {
      var stage = S.appliedList().filter(function (x) { return x.job.id === job.id; })[0];
      bar = '<div class="grow col g4"><span class="pill ' + (applied.standout ? 'pill-gold' : 'pill-mint') + '" style="align-self:flex-start">' +
        ico(applied.standout ? I.star : I.check, 'ico-sm') + (applied.standout ? 'Standout sent' : 'Applied') + '</span>' +
        '<span class="caption">Status: ' + esc(S.STAGES[stage ? stage.stage : 0]) + '</span></div>' +
        '<button class="btn btn-ghost btn-sm" data-act="withdraw" data-id="' + job.id + '">Withdraw</button>';
    } else {
      bar = '<button class="round" style="width:52px;height:52px;box-shadow:var(--shadow-sm)" data-act="pass-job" data-id="' + job.id + '" aria-label="Pass">' + I.x + '</button>' +
        '<button class="btn btn-gold" style="padding:0 18px" data-act="standout" data-id="' + job.id + '">' + I.star + 'Standout</button>' +
        '<button id="apply-btn" class="btn btn-read grow' + (read ? ' ready' : '') + '" style="--p:' + (read ? 100 : 0) + '%" data-act="' + (read ? 'apply-job' : 'apply-locked') + '" data-id="' + job.id + '">' +
          '<span class="fill"></span><span id="apply-label">' + (read ? I.check + 'Apply' : I.lock + 'Read to apply') + '</span></button>';
    }

    var facts = [[I.pound, 'Salary', job.salary], [I.laptop, 'Working', job.mode], [I.clock, 'Contract', job.type],
      [I.pin, 'Location', job.loc], [I.calendar, 'Closes', job.closes], [I.users, 'Applicants', String(job.applicants)]];

    return '<section class="view ' + (ui.enter || '') + '" aria-label="' + esc(job.title) + '">' +
      '<div class="scroll" id="job-scroll" data-id="' + job.id + '">' +
        '<div class="hero">' + jobArt(job) +
          '<div class="hero-bar"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button>' +
          '<div class="row g8"><button class="icon-btn" data-act="save" data-id="' + job.id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Saved' : 'Save for later') + '" style="color:' + (saved ? 'var(--mint-text)' : 'var(--ink)') + '">' + (saved ? I.bookmarkFill : I.bookmark) + '</button>' +
          '<button class="icon-btn" data-act="share" aria-label="Share">' + I.share + '</button></div></div></div>' +
        '<div class="sheet-body">' +
          '<div class="col g12">' +
            '<button class="row g10" data-act="company" data-id="' + c.id + '" style="background:none;border:none;padding:0;text-align:left">' + A.mark(c, 40) +
              '<span class="grow"><span class="row g4 h4">' + esc(c.name) + verified(c) + '</span><span class="caption">' + esc(c.sector) + '</span></span></button>' +
            '<h1 class="h1">' + esc(job.title) + '</h1>' +
            '<p class="body">' + esc(job.summary) + '</p>' +
            '<div class="row g6 wrap"><span class="pill pill-grey">' + esc(job.cat) + '</span><span class="pill pill-grey num">Posted ' + esc(job.posted) + ' ago</span>' +
              (S.isShortlisted(c.id) ? '<span class="pill pill-mint">Shortlisted studio</span>' : '') + '</div>' +
          '</div>' +
          '<div class="facts">' + facts.map(function (f) {
            return '<div class="fact">' + ico(f[0], 'ico-sm') + '<p class="caption">' + f[1] + '</p><p class="v num">' + esc(f[2]) + '</p></div>';
          }).join('') + '</div>' +
          '<div class="match-panel"><div class="row between"><p class="h4">How you match</p><p class="h3 mint num">' + job.match + '%</p></div>' +
            '<div class="meter"><span style="width:' + job.match + '%"></span></div>' +
            '<div class="row g6 wrap">' + job.matched.map(function (t) { return '<span class="tag match">' + ico(I.check, 'ico-sm') + esc(t) + '</span>'; }).join('') +
              others.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
            '<p class="caption">' + (job.matched.length ? 'Green skills are on your profile.' : 'None of these are on your profile yet, so think of this as a stretch.') + '</p></div>' +
          '<div class="section"><h2 class="h3">About the role</h2><p class="body">' + esc(job.about) + '</p></div>' +
          '<div class="section"><h2 class="h3">What you’ll do</h2><ul class="checks">' + list(job.duties.map(function (d) { return '<li>' + ico(I.check, 'ico-sm') + esc(d) + '</li>'; })) + '</ul></div>' +
          '<div class="quote"><p class="eyebrow" style="margin-bottom:6px">A day in the role</p><p class="body" style="color:var(--ink)">' + esc(job.day) + '</p></div>' +
          '<div class="section"><h2 class="h3">You’d work with</h2><div class="team-row">' + c.team.map(function (p) {
            return '<div class="person-card"><span class="avatar" style="background:' + c.brand.bg + ';color:' + c.brand.ink + '">' + esc(initials(p[0])) + '</span>' +
              '<span><span class="h4" style="display:block">' + esc(p[0]) + '</span><span class="caption">' + esc(p[1]) + '</span></span></div>';
          }).join('') + '</div></div>' +
          '<div class="section"><h2 class="h3">What they offer</h2><ul class="checks">' + list(job.offers.map(function (d) { return '<li>' + ico(I.sparkle, 'ico-sm') + esc(d) + '</li>'; })) + '</ul></div>' +
          '<button class="row-link" data-act="company" data-id="' + c.id + '"><span class="thumb">' + A.art('brand', c.brand, c.id + 'thumb') + '</span>' +
            '<span class="grow"><span class="h4" style="display:block">About ' + esc(c.name) + '</span><span class="caption">Their ethos, team, work and other roles</span></span>' + I.chev + '</button>' +
          '<p class="caption" style="text-align:center;padding-bottom:84px">' + (read ? 'You’ve read the whole listing.' : 'Keep scrolling to the end to unlock Apply.') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="bottombar" id="job-bar">' + bar + '</div>' +
    '</section>';
  }

  /* ---------- Company ---------- */
  function companyView(c, ui) {
    var on = S.isShortlisted(c.id);
    var roles = D.jobs.filter(function (j) { return j.co === c.id; });
    // Recent work uses the disciplines this studio actually hires for.
    var kinds = [];
    roles.forEach(function (j) { if (kinds.indexOf(j.art) === -1) kinds.push(j.art); });
    ['brand', 'editorial'].forEach(function (k) { if (kinds.length < 3 && kinds.indexOf(k) === -1) kinds.push(k); });
    var mainKind = kinds[0] || 'brand';
    var work = c.clients.concat(['Studio experiments']).slice(0, 4).map(function (name, i) {
      var kind = kinds[i % kinds.length];
      return '<figure><div class="frame">' + A.art(kind, c.brand, c.id + name) + '</div><figcaption>' + esc(name) + '</figcaption></figure>';
    }).join('');
    return '<section class="view ' + (ui.enter || '') + '" aria-label="' + esc(c.name) + '"><div class="scroll">' +
      '<div class="hero" style="height:210px">' + A.art(mainKind, c.brand, c.id + 'hero') +
        '<div class="hero-bar"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button><button class="icon-btn" data-act="share" aria-label="Share">' + I.share + '</button></div></div>' +
      '<div class="sheet-body" style="padding-bottom:40px">' +
        '<div class="col g12"><div style="margin-top:-56px">' + '<span style="display:inline-flex;border:5px solid var(--bg);border-radius:26px;box-shadow:var(--shadow-md)">' + A.mark(c, 72) + '</span></div>' +
          '<div class="col g4"><h1 class="h1 row g6">' + esc(c.name) + verified(c) + '</h1><p class="small muted">' + esc(c.sector) + ' · ' + esc(c.location) + '</p>' +
          '<p class="caption num">' + esc(c.size) + ' · Founded ' + c.founded + '</p></div></div>' +
        '<div class="stats num"><div><b>' + fmt(c.shortlisted + (on ? 1 : 0)) + '</b><span class="caption">shortlisted</span></div><div><b>' + roles.length + '</b><span class="caption">open roles</span></div><div><b>' + esc(c.reply) + '</b><span class="caption">avg reply</span></div></div>' +
        '<div class="col g8"><button class="btn btn-block ' + (on ? 'btn-outline' : 'btn-ink') + '" data-act="shortlist" data-id="' + c.id + '" aria-pressed="' + on + '">' + (on ? I.check + 'Shortlisted' : I.plus + 'Shortlist this studio') + '</button>' +
          '<p class="caption" style="text-align:center">Jobs from shortlisted studios come first in your deck.</p></div>' +
        '<div class="section"><p class="eyebrow">Ethos</p><p class="big-quote">' + esc(c.ethos) + '</p></div>' +
        '<div class="section"><h2 class="h3">Recent work</h2><div class="gallery">' + work + '</div></div>' +
        '<div class="section"><h2 class="h3">The team</h2><div class="team-row">' + c.team.map(function (p) {
          return '<div class="person-card"><span class="avatar" style="background:' + c.brand.bg + ';color:' + c.brand.ink + '">' + esc(initials(p[0])) + '</span><span><span class="h4" style="display:block">' + esc(p[0]) + '</span><span class="caption">' + esc(p[1]) + '</span></span></div>';
        }).join('') + '</div></div>' +
        '<div class="section"><h2 class="h3">Open roles</h2>' + roles.map(function (j) {
          var a = S.get().applied[j.id];
          var status = a ? '<span class="pill ' + (a.standout ? 'pill-gold' : 'pill-mint') + '">' + (a.standout ? 'Standout' : 'Applied') + '</span>' : S.isPassed(j.id) ? '<span class="pill pill-grey">Passed</span>' : '<span class="pill pill-mint num">' + j.match + '%</span>';
          return '<button class="row-link" data-act="job" data-id="' + j.id + '"><span class="thumb">' + jobArt(j) + '</span><span class="grow"><span class="h4" style="display:block">' + esc(j.title) + '</span>' +
            '<span class="caption num">' + esc(j.salary) + ' · ' + esc(j.mode) + '</span></span>' + status + '</button>';
        }).join('') + '</div>' +
      '</div></div></section>';
  }

  /* ---------- Feed ---------- */
  function feed(ui) {
    var st = S.get();
    var stories = '<button class="story" data-act="tab" data-id="profile"><span class="ring seen"><span class="inner">' + A.art(D.me.work[0].art, D.me.work[0].brand, 'me-story') + '</span></span>Your work</button>' +
      D.people.map(function (p, i) {
        var post = D.posts.filter(function (x) { return x.who === p.id && x.art; })[0];
        var art = post ? A.art(post.art, post.brand, p.id) : '<span class="avatar" style="width:100%;height:100%;background:' + p.color + '">' + esc(p.initials) + '</span>';
        return '<button class="story" data-act="person" data-id="' + p.id + '"><span class="ring"><span class="inner">' + art + '</span></span><span class="ellipsis" style="max-width:66px">' + esc(p.name.split(' ')[0]) + '</span></button>';
      }).join('');

    var posts = D.posts.map(function (p) {
      var liked = !!st.liked[p.id], head, media = '';
      if (p.kind === 'company') {
        var c = D.company(p.co);
        head = A.mark(c, 40) + '<div class="grow"><p class="h4 row g4">' + esc(c.name) + verified(c) + '</p><p class="caption">' + esc(p.meta) + '</p></div>';
        if (p.art) media = '<div class="media">' + A.art(p.art, c.brand, p.id) + '</div>';
      } else {
        var who = D.person(p.who);
        head = '<span class="avatar" style="background:' + who.color + '">' + esc(who.initials) + '</span><div class="grow"><p class="h4">' + esc(who.name) + '</p><p class="caption">' + esc(who.role) + ' · ' + esc(p.meta) + '</p></div>';
        if (p.art) media = '<div class="media">' + A.art(p.art, p.brand, p.id) + '</div>';
      }
      var job = p.job ? D.job(p.job) : null;
      var vouched = !!st.liked['v' + p.id];
      return '<article class="post"><div class="row g10">' + head + '</div>' +
        (p.milestone ? '<div class="milestone">' + ico(I.sparkle) + esc(p.milestone) + '</div>' : '') +
        media + '<p class="body">' + esc(p.text) + '</p>' +
        (job ? '<button class="job-attach" data-act="job" data-id="' + job.id + '"><span class="thumb" style="width:48px;height:48px">' + jobArt(job) + '</span>' +
          '<span class="grow"><span class="h4" style="display:block">' + esc(job.title) + '</span><span class="caption num">' + esc(job.salary) + ' · ' + esc(job.loc) + '</span></span><span class="ico mint">' + I.arrowUR + '</span></button>' : '') +
        '<div class="post-actions num">' +
          '<button data-act="like" data-id="' + p.id + '" aria-pressed="' + liked + '" aria-label="Like">' + ico(liked ? I.heartFill : I.heart) + (p.likes + (liked ? 1 : 0)) + '</button>' +
          '<button aria-label="Comments">' + ico(I.comment) + p.comments + '</button>' +
          (p.vouch ? '<button class="vouch" data-act="like" data-id="v' + p.id + '" aria-pressed="' + vouched + '">' + (vouched ? 'Vouched for ' : 'Vouch for ') + esc(p.vouch) + '</button>' : '') +
        '</div></article>';
    });

    var suggest = '<div class="post"><div class="row between"><p class="h4">People you may know</p><span class="caption">From your course and studios</span></div>' +
      D.people.slice(1, 5).map(function (p) {
        var on = st.acquaintances.indexOf(p.id) !== -1;
        return '<div class="row g10"><span class="avatar" style="background:' + p.color + '">' + esc(p.initials) + '</span>' +
          '<div class="grow"><p class="h4 ellipsis">' + esc(p.name) + '</p><p class="caption ellipsis">' + esc(p.role) + ' · ' + p.mutual + ' mutual</p></div>' +
          '<button class="btn btn-xs ' + (on ? 'btn-outline' : 'btn-ink') + '" data-act="acq" data-id="' + p.id + '" aria-pressed="' + on + '">' + (on ? 'Added' : 'Add') + '</button></div>';
      }).join('') + '<p class="caption">Add someone as an acquaintance. When they add you back, you become associates.</p></div>';
    posts.splice(2, 0, suggest);

    return '<section class="view ' + (ui.enter || '') + '" aria-label="Network"><div class="scroll"><div class="pad top-space col g16 tab-space">' +
      '<div class="row between"><h1 class="h1">Network</h1>' +
        '<button class="icon-btn" data-act="compose" aria-label="New post">' + I.plus + '</button></div>' +
      '<div class="stories">' + stories + '</div>' +
      posts.join('') +
      '</div></div></section>' + tabbar('feed');
  }

  /* ---------- Applied ---------- */
  function appliedView(ui) {
    var apps = S.appliedList(), saved = S.savedList(), st = S.get();
    var tab = ui.appliedTab || 'applied';
    var standouts = apps.filter(function (x) { return x.info.standout; }).length;
    var inner;
    if (tab === 'saved') {
      inner = saved.length ? saved.map(function (j) {
        var c = co(j);
        return '<button class="row-link" data-act="job" data-id="' + j.id + '"><span class="thumb">' + jobArt(j) + '</span><span class="grow"><span class="h4 ellipsis" style="display:block">' + esc(j.title) + '</span>' +
          '<span class="caption ellipsis" style="display:block">' + esc(c.name) + ' · ' + esc(j.salary) + '</span></span><span class="pill pill-mint num">' + j.match + '%</span></button>';
      }).join('') : '<div class="empty"><div class="art-blob">' + A.art('editorial', D.company('quill').brand, 'saved-empty') + '</div><h2 class="h3">Nothing saved yet</h2><p class="body muted">Tap the bookmark on any card to keep it for later.</p></div>';
    } else if (!apps.length) {
      inner = '<div class="empty"><div class="art-blob">' + A.art('brand', D.company('northpaw').brand, 'applied-empty') + '</div>' +
        '<h2 class="h3">No applications yet</h2><p class="body muted">Read a listing to the end to unlock Apply, or send a Standout to jump the queue.</p>' +
        '<button class="btn btn-ink" data-act="tab" data-id="discover">Start swiping</button></div>';
    } else {
      inner = apps.map(function (x) {
        var j = x.job, c = co(j);
        return '<button class="app-card' + (x.info.standout ? ' standout' : '') + '" data-act="job" data-id="' + j.id + '">' +
          '<span class="row g12"><span class="thumb" style="width:52px;height:52px">' + jobArt(j) + '</span><span class="grow"><span class="h4 ellipsis" style="display:block">' + esc(j.title) + '</span>' +
          '<span class="caption ellipsis" style="display:block">' + esc(c.name) + ' · ' + esc(j.loc) + '</span></span>' +
          (x.info.standout ? '<span class="pill pill-gold">' + ico(I.star, 'ico-sm') + 'Standout</span>' : '') + '</span>' +
          (x.info.standout && x.info.msg ? '<span class="msg-quote">“' + esc(x.info.msg) + '”</span>' : '') +
          '<span class="timeline">' + S.STAGES.map(function (s, i) {
            return '<span class="step' + (i < x.stage ? ' done' : i === x.stage ? ' now' : '') + '"><span class="bar"></span><span>' + s + '</span></span>';
          }).join('') + '</span></button>';
      }).join('');
    }
    return '<section class="view ' + (ui.enter || '') + '" aria-label="Applied"><div class="scroll"><div class="pad top-space col g16 tab-space">' +
      '<div class="col g4"><p class="eyebrow num">' + apps.length + ' sent · ' + standouts + ' Standout' + (standouts === 1 ? '' : 's') + '</p><h1 class="h1">Your applications</h1></div>' +
      '<div class="segmented" role="group" aria-label="Show"><button data-act="applied-tab" data-id="applied" aria-pressed="' + (tab === 'applied') + '">Applied <span class="num">' + apps.length + '</span></button>' +
        '<button data-act="applied-tab" data-id="saved" aria-pressed="' + (tab === 'saved') + '">Saved <span class="num">' + saved.length + '</span></button></div>' +
      inner +
      (tab === 'applied' && apps.length ? '<p class="caption" style="text-align:center">Applications move along as employers review them. Standouts get seen first.</p>' : '') +
      (st.passed.length ? '<button class="link muted" data-act="unpass">Bring back ' + st.passed.length + ' passed role' + (st.passed.length === 1 ? '' : 's') + '</button>' : '') +
      '</div></div></section>' + tabbar('applied');
  }

  /* ---------- Profile ---------- */
  function profileView(ui) {
    var m = D.me, st = S.get(), w0 = m.work[0];
    var slots = '';
    for (var i = 0; i < S.STANDOUTS_PER_WEEK; i++) slots += '<span class="' + (i < st.standoutsLeft ? '' : 'used') + '">' + I.star + '</span>';
    return '<section class="view ' + (ui.enter || '') + '" aria-label="Your profile"><div class="scroll">' +
      '<div class="banner">' + A.art(w0.art, w0.brand, 'banner') +
        '<div class="hero-bar" style="position:absolute;top:max(14px, env(safe-area-inset-top));left:16px;right:16px;display:flex;justify-content:space-between">' + '<span class="pill pill-glass" style="padding:6px 12px">' + B.logo(18, 16) + '</span>' +
        '<button class="icon-btn" data-act="share" aria-label="Share profile">' + I.share + '</button></div></div>' +
      '<div class="pad col g20 tab-space" style="margin-top:-48px;position:relative">' +
        '<div class="row between" style="align-items:flex-end"><span class="me-avatar">' + esc(m.initials) + '</span>' +
          '<div class="row g16 num" style="padding-bottom:6px"><div class="col"><b class="h3">' + m.associates + '</b><span class="caption">associates</span></div>' +
          '<div class="col"><b class="h3">' + fmt(m.acquaintances + st.acquaintances.length) + '</b><span class="caption">acquaintances</span></div></div></div>' +
        '<div class="col g6"><h1 class="h1">' + esc(m.name) + '</h1><p class="label mint">' + esc(m.role) + '</p>' +
          '<p class="caption row g4">' + ico(I.pin, 'ico-sm') + esc(m.location) + ' · ' + esc(m.education) + '</p>' +
          '<p class="body" style="margin-top:4px">' + esc(m.bio) + '</p></div>' +
        '<div class="row g8"><button class="btn btn-ink btn-sm grow" data-act="compose">Edit profile</button><button class="btn btn-ghost btn-sm grow" data-act="share">View CV</button></div>' +
        '<div class="so-panel"><div class="star-slots on-dark">' + slots + '</div>' +
          '<div class="grow"><p class="h4">' + st.standoutsLeft + ' of ' + S.STANDOUTS_PER_WEEK + ' Standouts left</p><p class="caption">They refill every Monday.</p></div></div>' +
        '<div class="quote"><p class="eyebrow" style="margin-bottom:6px">How I work</p><p class="body" style="color:var(--ink)">' + esc(m.howIWork) + '</p></div>' +
        '<div class="section"><div class="row between"><h2 class="h3">Vouched skills</h2><span class="caption">by associates</span></div><div class="row g6 wrap">' +
          m.vouches.map(function (v) { return '<span class="tag match num">' + esc(v[0]) + ' <b>' + v[1] + '</b></span>'; }).join('') + '</div></div>' +
        '<div class="section"><div class="row between"><h2 class="h3">Work</h2><span class="caption num">' + m.work.length + ' projects</span></div><div class="work-grid">' +
          m.work.map(function (w, i) { return '<figure>' + A.art(w.art, w.brand, 'work' + i) + '<figcaption><span class="pill pill-glass">' + esc(w.title) + '</span></figcaption></figure>'; }).join('') + '</div></div>' +
        '<button class="row-link" data-act="employer"><span class="thumb" style="background:var(--mint-tint);display:flex;align-items:center;justify-content:center;color:var(--mint-text)"><span class="ico" style="width:24px;height:24px">' + I.eye + '</span></span>' +
          '<span class="grow"><span class="h4" style="display:block">See the employer view</span><span class="caption">How your applications look to a recruiter</span></span>' + I.chev + '</button>' +
        '<button class="link muted" data-act="reset" style="align-self:center">Reset demo</button>' +
      '</div></div></section>' + tabbar('profile');
  }

  /* ---------- Employer preview ---------- */
  function employerView(ui) {
    var apps = S.appliedList();
    var job = apps.length ? apps[0].job : D.job('j01');
    var c = co(job), mine = S.get().applied[job.id];
    var people = D.applicants.slice();
    if (mine) people.push({ initials: D.me.initials, name: D.me.name, role: D.me.role + ' · ' + D.me.location, match: job.match, standout: mine.standout, msg: mine.msg, me: true });
    var standouts = people.filter(function (p) { return p.standout; }).sort(function (a, b) { return (b.me ? 1 : 0) - (a.me ? 1 : 0) || b.match - a.match; });
    var rest = people.filter(function (p) { return !p.standout; }).sort(function (a, b) { return b.match - a.match; });
    function row(p, gold) {
      var you = p.me ? ' <span class="pill pill-mint">You</span>' : '';
      if (gold) {
        return '<div class="app-card standout"><span class="row g10"><span class="avatar" style="background:var(--ink);color:var(--mint)">' + esc(p.initials) + '</span>' +
          '<span class="grow"><span class="h4 row g6">' + esc(p.name) + you + '</span><span class="caption">' + esc(p.role) + '</span></span><span class="h4 mint num">' + p.match + '%</span></span>' +
          '<span class="msg-quote">“' + esc(p.msg || '') + '”</span>' +
          '<span class="row g8"><span class="btn btn-ink btn-xs">View profile</span><span class="btn btn-ghost btn-xs">Reply</span></span></div>';
      }
      return '<div class="row-link"><span class="avatar" style="background:var(--chip);color:var(--ink)">' + esc(p.initials) + '</span>' +
        '<span class="grow"><span class="h4 row g6">' + esc(p.name) + you + '</span><span class="caption">' + esc(p.role) + '</span></span><span class="label mint num">' + p.match + '%</span></div>';
    }
    return '<section class="view ' + (ui.enter || '') + '" aria-label="Employer view"><div class="scroll"><div class="pad top-space col g16" style="padding-bottom:30px">' +
      '<div class="row g10"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button><span class="pill pill-dark">Recruiter view</span></div>' +
      '<div class="row g12">' + A.mark(c, 48) + '<div class="grow"><p class="caption">' + esc(c.name) + '</p><h1 class="h2">' + esc(job.title) + '</h1></div></div>' +
      '<div class="stats num"><div><b>' + (job.applicants + (mine ? 1 : 0)) + '</b><span class="caption">applicants</span></div><div><b>' + standouts.length + '</b><span class="caption">Standouts</span></div><div><b>' + esc(job.closes) + '</b><span class="caption">closes</span></div></div>' +
      (mine ? '' : '<p class="small muted">You haven’t applied to anything yet, so this shows a sample role. Apply or send a Standout, then come back.</p>') +
      '<p class="eyebrow row g4" style="color:var(--ink)">' + ico(I.star, 'ico-sm') + 'Standouts, pinned first</p>' + standouts.map(function (p) { return row(p, true); }).join('') +
      '<p class="eyebrow" style="margin-top:6px">Everyone else, by match</p>' + rest.map(function (p) { return row(p, false); }).join('') +
      '</div></div></section>';
  }

  /* ---------- Standout sheet ---------- */
  function standoutSheet(job, sh) {
    var c = co(job), left = S.get().standoutsLeft, inner;
    if (sh.sent) {
      var sparks = '';
      for (var i = 0; i < 10; i++) sparks += '<i style="--a:' + (i * 36) + 'deg;animation-delay:' + (0.1 + (i % 3) * 0.04) + 's;background:' + (i % 2 ? 'var(--ink)' : 'var(--mint)') + '"></i>';
      inner = '<div class="col g12" style="align-items:center;text-align:center;padding:8px 0 4px">' +
        '<div class="burst">' + sparks + '<span class="core">' + I.star + '</span></div>' +
        '<h2 class="h1">You stood out</h2><p class="body">' + esc(c.name) + ' will see your application before anyone else’s. We’ll tell you the moment they reply.</p>' +
        '<button class="btn btn-ink btn-block" data-act="close-sheet-home">Keep swiping</button>' +
        '<button class="link" data-act="go-applied">See your applications</button></div>';
    } else if (left <= 0) {
      inner = '<div class="col g12" style="align-items:center;text-align:center;padding:8px 0 4px"><span class="star-hero" style="background:var(--chip)">' + I.star + '</span>' +
        '<h2 class="h2">You’re out of Standouts</h2><p class="body">They refill every Monday, which keeps each one special. You can still apply normally once you’ve read the listing.</p>' +
        '<button class="btn btn-ghost btn-block" data-act="close-sheet">Got it</button></div>';
    } else {
      var slots = '';
      for (var k = 0; k < S.STANDOUTS_PER_WEEK; k++) slots += '<span class="' + (k < left ? '' : 'used') + '">' + I.star + '</span>';
      inner = '<div class="row g14"><span class="star-hero">' + I.star + '</span><div class="grow"><h2 class="h2">Send a Standout</h2><p class="caption ellipsis">' + esc(job.title) + ' · ' + esc(c.name) + '</p></div></div>' +
        '<p class="body">Skip the queue: your application lands at the top of their list, with a note straight to ' + esc(c.team[0][0].split(' ')[0]) + ', their ' + esc(c.team[0][1].toLowerCase()) + '.</p>' +
        '<div class="field"><label class="h4" for="so-msg">Why you, in a few lines</label>' +
          '<div class="prompts" role="group" aria-label="Ideas"><button data-act="prompt" data-id="0">Mention a project</button><button data-act="prompt" data-id="1">Why this studio</button><button data-act="prompt" data-id="2">When you can start</button></div>' +
          '<textarea id="so-msg" rows="4" maxlength="300" placeholder="I’ve been designing labels for a local brewery and love how you approach small-batch brands…">' + esc(sh.msg || '') + '</textarea>' +
          '<div class="row between"><span id="so-err" class="' + (sh.error ? 'error' : 'caption') + '">' + (sh.error ? 'Write a short message first' : 'Sent with your profile and work') + '</span><span id="so-count" class="caption num">' + (sh.msg || '').length + '/300</span></div></div>' +
        '<div class="so-panel" style="padding:12px 14px"><div class="star-slots on-dark">' + slots + '</div><span class="label">' + left + ' of ' + S.STANDOUTS_PER_WEEK + ' left this week</span></div>' +
        '<button class="btn btn-gold btn-block" data-act="send-standout" data-id="' + job.id + '">' + I.star + 'Send Standout</button>' +
        '<button class="link muted" data-act="close-sheet" style="align-self:center">Not now</button>';
    }
    return '<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Send a Standout"><div class="grabber"></div>' + inner + '</div>';
  }

  /* ---------- Filter sheet ---------- */
  function filterSheet() {
    var f = S.get().filters, O = D.filterOptions, n = S.deck().length;
    var groups = [['cat', 'Discipline'], ['type', 'Contract'], ['mode', 'Where you work']];
    return '<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Filter roles"><div class="grabber"></div>' +
      '<div class="row between"><h2 class="h2">Filter roles</h2><button class="link muted" data-act="clear-filters">Clear all</button></div>' +
      groups.map(function (g) {
        return '<div class="fgroup"><p class="h4">' + g[1] + '</p><div class="opts" role="group" aria-label="' + g[1] + '">' + O[g[0]].map(function (o) {
          return '<button class="chip" data-act="fsel" data-id="' + g[0] + '|' + esc(o) + '" aria-pressed="' + (f[g[0]] === o) + '">' + esc(o) + '</button>';
        }).join('') + '</div></div>';
      }).join('') +
      '<button class="btn btn-ink btn-block num" data-act="close-sheet"' + (n ? '' : ' style="background:var(--chip);color:var(--muted)"') + '>' + (n ? 'Show ' + n + ' role' + (n === 1 ? '' : 's') : 'No roles match yet') + '</button></div>';
  }

  /* ---------- Splash ---------- */
  function splash() {
    return '<div class="splash" id="splash" data-act="skip-splash">' + B.spinningMark(176) +
      '<div class="word">' + B.wordmark(80, 'word-anim') + '</div>' +
      '<p class="tagline">Swipe into work.</p>' +
      '<div class="load" role="progressbar" aria-label="Loading"><span></span></div>' +
      '<button class="skip" data-act="skip-splash">Skip</button></div>';
  }

  window.VIEWS = {
    esc: esc, discover: discover, jobView: jobView, companyView: companyView, feed: feed,
    appliedView: appliedView, profileView: profileView, employerView: employerView, standoutSheet: standoutSheet, filterSheet: filterSheet, splash: splash,
  };
})();
