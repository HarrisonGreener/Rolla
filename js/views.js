/* Screen templates. Each returns an HTML string; app.js wires up the events through data-act attributes. */
(function () {
  var D = window.ROLLA, S = window.STORE, I = window.ICONS, B = window.BRAND;

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function initial(name) { return esc(name.charAt(0)); }
  function coLogo(c, size) {
    var st = size ? ' style="width:' + size + 'px;height:' + size + 'px;border-radius:' + Math.round(size * 0.28) + 'px;font-size:' + Math.round(size * 0.46) + 'px"' : '';
    return '<span class="co-logo"' + st + ' aria-hidden="true">' + initial(c.name) + '</span>';
  }
  function fmt(n) { return n.toLocaleString('en-GB'); }

  /* ---------- Tab bar ---------- */
  function tabbar(active) {
    var n = Object.keys(S.get().applied).length;
    var tabs = [['discover', 'Discover', I.discover], ['feed', 'Feed', I.feed], ['applied', 'Applied', I.applied], ['profile', 'Profile', I.profile]];
    return '<nav class="tabbar" aria-label="Main">' + tabs.map(function (t) {
      return '<button class="tab" data-act="tab" data-id="' + t[0] + '"' + (t[0] === active ? ' aria-current="page"' : '') + '>' + t[2] + t[1] +
        (t[0] === 'applied' && n ? '<span class="dot num">' + n + '</span>' : '') + '</button>';
    }).join('') + '</nav>';
  }

  /* ---------- Discover: the swipe deck ---------- */
  function card(job, depth) {
    var c = D.company(job.companyId);
    var read = S.isRead(job.id);
    var cls = depth === 0 ? 'card top' : 'card back-' + depth;
    return '<article class="' + cls + '" data-id="' + job.id + '"' + (depth === 0 ? ' tabindex="0" aria-label="' + esc(job.title + ' at ' + c.name + '. Tap for the full listing.') + '"' : ' aria-hidden="true"') + '>' +
      '<div class="cover" style="background:' + c.tint.bg + '">' + coLogo(c, 72) +
        '<span class="badge match num">' + job.match + '% match</span>' +
        (S.isShortlisted(c.id) ? '<span class="badge badge-mint" style="position:absolute;top:14px;left:14px">Shortlisted</span>' : '') +
      '</div>' +
      '<div class="stamp stamp-pass">PASS</div><div class="stamp stamp-apply">APPLY</div>' +
      '<div class="content">' +
        '<p class="label muted">' + esc(c.name) + ' · ' + esc(job.location) + '</p>' +
        '<h2 class="h1">' + esc(job.title) + '</h2>' +
        '<p class="label mint num">' + esc(job.salary) + ' · ' + esc(job.mode) + ' · ' + esc(job.type) + '</p>' +
        '<p class="body">' + esc(job.summary) + '</p>' +
        '<div class="tags">' + job.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<div class="lockhint">' +
          (read
            ? '<p class="label mint row gap-6" style="display:flex">' + '<span style="width:16px;height:16px;display:inline-flex">' + I.check + '</span>Listing read. Swipe right to apply</p>'
            : '<p class="label muted row gap-6" style="display:flex"><span style="width:16px;height:16px;display:inline-flex">' + I.lock + '</span>Tap to read the listing and unlock Apply</p>') +
          '<div class="progress"><span style="width:' + (read ? 100 : 6) + '%"></span></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function discover() {
    var st = S.get();
    var deck = S.deck();
    var top = deck[0];
    var chips = D.categories.map(function (c) {
      return '<button class="chip" data-act="filter" data-id="' + c + '" aria-pressed="' + (st.filter === c) + '">' + c + '</button>';
    }).join('');

    var body;
    if (!top) {
      body = '<div class="empty" style="flex:1;justify-content:center">' +
        '<h2 class="h2">' + (st.filter === 'All' ? 'You’ve seen every job' : 'No more ' + esc(st.filter.toLowerCase()) + ' jobs') + '</h2>' +
        '<p class="body muted">' + (st.filter === 'All' ? 'New roles land every morning. In the meantime you can look back at the ones you passed.' : 'Try another category, or bring back the jobs you passed.') + '</p>' +
        (st.passed.length ? '<button class="btn btn-mint" data-act="unpass">' + I.undo + 'Review passed jobs</button>' : '') +
        (st.filter !== 'All' ? '<button class="btn btn-ghost" data-act="filter" data-id="All">Show all jobs</button>' : '') +
        '</div>';
    } else {
      var cards = deck.slice(0, 3).map(function (j, i) { return card(j, i); }).reverse().join('');
      var read = S.isRead(top.id);
      body = '<div class="deck" id="deck">' + cards + '</div>' +
        '<div class="actions">' +
          '<button class="round" data-act="pass" aria-label="Pass">' + I.x + '</button>' +
          '<button class="round gold-round" data-act="standout" aria-label="Send a Standout">' + I.star + '</button>' +
          (read
            ? '<button class="round apply-round" data-act="apply" aria-label="Apply">' + I.check + '</button>'
            : '<button class="round locked" data-act="apply-locked" aria-label="Apply, locked until you read the listing" style="color:#5F5F5C">' + I.lock + '</button>') +
        '</div>' +
        '<p class="caption num" style="text-align:center;margin:2px 0 10px"><span class="gold" style="font-weight:500">' + st.standoutsLeft + ' of ' + S.STANDOUTS_PER_WEEK + ' Standouts left this week</span> · ' + deck.length + ' jobs to go</p>';
    }

    return '<section class="view" aria-label="Discover jobs">' +
      '<div class="pad top-space"><div class="topbar">' + B.logo(27, 26) +
        '<span class="caption">Manchester · 15 mi</span></div>' +
        '<div class="chips" role="group" aria-label="Job categories">' + chips + '</div></div>' +
      body + '</section>' + tabbar('discover');
  }

  /* ---------- Job listing ---------- */
  function jobView(job) {
    var c = D.company(job.companyId);
    var read = S.isRead(job.id);
    var applied = S.get().applied[job.id];
    var bar;
    if (applied) {
      bar = '<div class="grow stack gap-6">' +
        '<span class="badge ' + (applied.standout ? 'badge-gold' : 'badge-mint') + '" style="align-self:flex-start">' + (applied.standout ? I.star.replace('<svg', '<svg width="12" height="12"') + ' Standout sent' : 'Applied') + '</span>' +
        '<span class="caption">' + (applied.standout ? 'You’re at the top of their list.' : 'Your profile has been sent.') + '</span></div>' +
        '<button class="btn btn-ghost btn-sm" data-act="withdraw" data-id="' + job.id + '">Withdraw</button>';
    } else {
      bar = '<button class="round" style="width:52px;height:52px;flex:none" data-act="pass-job" data-id="' + job.id + '" aria-label="Pass">' + I.x + '</button>' +
        '<button class="btn btn-gold grow" data-act="standout" data-id="' + job.id + '">' + I.star + 'Standout</button>' +
        '<button id="apply-btn" class="btn grow ' + (read ? 'btn-mint' : 'btn-locked') + '" data-act="' + (read ? 'apply-job' : 'apply-locked') + '" data-id="' + job.id + '">' +
          (read ? 'Apply' : I.lock + 'Apply') + '</button>';
    }

    return '<section class="view" aria-label="' + esc(job.title) + '">' +
      '<div class="listing-head top-space">' +
        '<div class="backbar"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button>' +
        '<div style="flex:1;min-width:0"><p class="h3" style="font-size:16px">' + esc(job.title) + '</p><p class="caption">' + esc(c.name) + '</p></div>' +
        '<span id="read-label" class="caption" style="font-weight:500;' + (read ? 'color:#0E7052' : '') + '">' + (read ? 'Apply unlocked' : 'Read to unlock') + '</span></div>' +
        '<div class="progress" role="progressbar" aria-label="Listing read" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (read ? 100 : 0) + '"><span id="read-bar" style="width:' + (read ? 100 : 0) + '%"></span></div>' +
      '</div>' +
      '<div class="scroll" id="job-scroll" data-id="' + job.id + '"><div class="pad stack gap-20" style="padding-top:20px;padding-bottom:28px">' +
        '<div class="stack gap-8"><span class="badge badge-grey" style="align-self:flex-start">' + esc(job.category) + '</span>' +
          '<h1 class="h1">' + esc(job.title) + '</h1>' +
          '<p class="label mint num">' + esc(job.salary) + ' · ' + esc(job.mode) + ' · ' + esc(job.type) + '</p>' +
          '<p class="caption num">' + esc(job.location) + ' · ' + job.applicants + ' applicants · ' + job.match + '% match</p></div>' +
        '<div class="section"><h2 class="h2">About the role</h2><p class="body">' + esc(job.about) + '</p></div>' +
        '<div class="section"><h3 class="h3">What you’ll do</h3><ul class="list">' + job.duties.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="facts">' +
          '<div class="fact"><p class="caption">Salary</p><p class="label mint num" style="font-size:15px">' + esc(job.salary) + '</p></div>' +
          '<div class="fact"><p class="caption">Working</p><p class="label" style="font-size:15px">' + esc(job.mode) + '</p></div>' +
          '<div class="fact"><p class="caption">Contract</p><p class="label" style="font-size:15px">' + esc(job.type) + '</p></div>' +
          '<div class="fact"><p class="caption">Closes</p><p class="label num" style="font-size:15px">' + esc(job.closes) + '</p></div>' +
        '</div>' +
        '<div class="section"><h3 class="h3">What they offer</h3><ul class="list">' + job.offers.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="section"><h3 class="h3">Skills they’re after</h3><div class="row gap-6" style="flex-wrap:wrap;display:flex">' + job.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
        '<button class="row-link" data-act="company" data-id="' + c.id + '">' + coLogo(c, 44) +
          '<span class="grow"><span class="h3" style="display:block;font-size:16px">' + esc(c.name) + '</span><span class="caption" style="display:block">See their ethos, team and other roles</span></span>' + I.chev + '</button>' +
        '<p class="caption" style="text-align:center">You’ve reached the end of the listing.</p>' +
      '</div></div>' +
      '<div class="bottombar" id="job-bar">' + bar + '</div>' +
    '</section>';
  }

  /* ---------- Company profile ---------- */
  function companyView(c) {
    var on = S.isShortlisted(c.id);
    var roles = D.jobs.filter(function (j) { return j.companyId === c.id; });
    return '<section class="view" aria-label="' + esc(c.name) + '"><div class="scroll">' +
      '<div style="height:150px;background:' + c.tint.bg + ';position:relative">' +
        '<button class="icon-btn" data-act="back" aria-label="Back" style="position:absolute;top:max(20px, env(safe-area-inset-top));left:20px;border:none">' + I.back + '</button></div>' +
      '<div class="pad stack gap-16" style="margin-top:-36px;padding-bottom:28px">' +
        '<span style="border:4px solid #F7F7F5;border-radius:24px;display:inline-flex;align-self:flex-start">' + coLogo(c, 68) + '</span>' +
        '<div><h1 class="h1">' + esc(c.name) + '</h1><p class="label muted" style="margin-top:4px">' + esc(c.sector) + ' · ' + esc(c.location) + ' · ' + esc(c.size) + '</p></div>' +
        '<div class="row gap-16 num" style="display:flex;flex-wrap:wrap">' +
          '<p class="caption"><span class="h3" style="font-size:16px;color:#0E0E0E">' + fmt(c.shortlisted + (on ? 1 : 0)) + '</span> shortlisted</p>' +
          '<p class="caption"><span class="h3" style="font-size:16px;color:#0E0E0E">' + roles.length + '</span> open roles</p>' +
          '<p class="caption"><span class="h3" style="font-size:16px;color:#0E0E0E">' + esc(c.reply) + '</span> avg reply</p></div>' +
        '<button class="btn btn-block ' + (on ? 'btn-outline-mint' : 'btn-mint') + '" data-act="shortlist" data-id="' + c.id + '" aria-pressed="' + on + '">' + (on ? I.check + 'Shortlisted' : 'Shortlist this company') + '</button>' +
        '<p class="caption" style="margin-top:-8px">Shortlisted companies’ jobs appear first in your deck.</p>' +
        '<div class="section"><h2 class="h3">Our ethos</h2><p class="body">' + esc(c.ethos) + '</p></div>' +
        '<div class="section"><h2 class="h3">Open roles</h2>' + roles.map(function (j) {
          var a = S.get().applied[j.id];
          var status = a ? (a.standout ? '<span class="badge badge-gold">Standout sent</span>' : '<span class="badge badge-mint">Applied</span>') : (S.isPassed(j.id) ? '<span class="badge badge-grey">Passed</span>' : '');
          return '<button class="row-link" data-act="job" data-id="' + j.id + '"><span class="grow"><span class="h3" style="display:block;font-size:15px">' + esc(j.title) + '</span>' +
            '<span class="label mint num" style="display:block">' + esc(j.salary) + ' · ' + esc(j.mode) + '</span></span>' + status + I.chev + '</button>';
        }).join('') + '</div>' +
      '</div></div></section>';
  }

  /* ---------- Feed ---------- */
  function feed() {
    var st = S.get();
    var posts = D.posts.map(function (p) {
      var liked = !!st.liked[p.id];
      var who, avatar;
      if (p.kind === 'company') { var c = D.company(p.companyId); who = c.name; avatar = coLogo(c, 36); }
      else { who = p.author; avatar = '<span class="avatar" style="width:36px;height:36px;background:#0E0E0E;color:#fff">' + esc(p.initials) + '</span>'; }
      var job = p.jobId ? D.job(p.jobId) : null;
      return '<article class="panel stack gap-10" style="padding:0;overflow:hidden">' +
        '<div class="row gap-10" style="display:flex;padding:12px 14px 0">' + avatar + '<div style="flex:1"><p class="h3" style="font-size:15px">' + esc(who) + '</p><p class="caption">' + esc(p.meta) + '</p></div></div>' +
        (p.image ? '<div style="height:180px;background:' + p.tint.bg + ';color:' + p.tint.fg + ';display:flex;align-items:center;justify-content:center" class="label">[' + esc(p.image) + ']</div>' : '') +
        '<div class="stack gap-10" style="padding:0 14px 12px"><p class="body">' + esc(p.text) + '</p>' +
        (job ? '<button class="row-link" style="background:#ECFBF5;border-color:#ECFBF5;padding:10px 12px" data-act="job" data-id="' + job.id + '"><span class="grow label">' + esc(job.title) + ' · <span class="mint num">' + esc(job.salary) + '</span></span><span class="label mint">View role</span></button>' : '') +
        '<div class="row gap-16 caption num" style="display:flex;align-items:center">' +
          '<button class="link-btn row gap-6" style="display:flex;padding:4px 0;color:' + (liked ? '#D63B40' : '#5F5F5C') + '" data-act="like" data-id="' + p.id + '" aria-pressed="' + liked + '"><span style="width:18px;height:18px;display:inline-flex">' + (liked ? I.heartFill : I.heart) + '</span>' + (p.likes + (liked ? 1 : 0)) + '</button>' +
          '<span>' + p.comments + ' comments</span>' +
          (p.vouch ? '<span class="mint" style="font-weight:500">Vouch for ' + esc(p.vouch) + '</span>' : '') +
        '</div></div></article>';
    });
    var suggest = '<div class="panel stack gap-12"><p class="label">People you may know</p>' + D.people.map(function (p) {
      var on = st.acquaintances.indexOf(p.id) !== -1;
      return '<div class="row gap-10" style="display:flex"><span class="avatar" style="background:#EDEDEA">' + esc(p.initials) + '</span>' +
        '<div style="flex:1;min-width:0"><p class="label">' + esc(p.name) + '</p><p class="caption">' + esc(p.role) + ' · ' + p.mutual + ' mutual</p></div>' +
        '<button class="btn btn-sm ' + (on ? 'btn-outline-mint' : 'btn-mint') + '" style="height:36px;padding:0 12px;font-size:13px" data-act="acq" data-id="' + p.id + '" aria-pressed="' + on + '">' + (on ? 'Acquaintance ✓' : 'Add') + '</button></div>';
    }).join('') + '<p class="caption">Add someone as an acquaintance. When they add you back, you’re associates.</p></div>';
    posts.splice(2, 0, suggest);

    return '<section class="view" aria-label="Feed"><div class="pad top-space" style="background:#fff;border-bottom:1px solid #E6E6E3;padding-bottom:12px">' +
      '<div class="topbar"><h1 class="h1">Feed</h1></div></div>' +
      '<div class="scroll"><div class="pad stack gap-14" style="padding-top:16px;padding-bottom:24px;gap:14px">' +
        '<label class="panel row gap-10" style="display:flex;padding:10px 12px"><span class="avatar" style="background:#7EE8C3;color:#0A513C;width:34px;height:34px">' + esc(D.me.initials) + '</span>' +
        '<span class="sr-only">New post</span><input placeholder="Share some work or an update" style="flex:1;min-width:0;border:none;background:transparent;font-size:15px;outline:none"></label>' +
        posts.join('') +
      '</div></div></section>' + tabbar('feed');
  }

  /* ---------- Applied ---------- */
  function appliedView() {
    var list = S.appliedList();
    var st = S.get();
    var inner;
    if (!list.length) {
      inner = '<div class="empty"><span style="width:48px;height:48px;color:#5F5F5C;display:inline-flex">' + I.applied + '</span>' +
        '<h2 class="h2">No applications yet</h2><p class="body muted">Read a listing all the way through to unlock Apply, then swipe right.</p>' +
        '<button class="btn btn-mint" data-act="tab" data-id="discover">Start swiping</button></div>';
    } else {
      inner = list.map(function (x) {
        var j = x.job, c = D.company(j.companyId);
        return '<button class="row-link' + (x.info.standout ? ' standout-card' : '') + '" data-act="job" data-id="' + j.id + '">' + coLogo(c, 40) +
          '<span class="grow"><span class="h3" style="display:block;font-size:15px">' + esc(j.title) + '</span><span class="caption" style="display:block">' + esc(c.name) + ' · ' + esc(j.location) + '</span>' +
          (x.info.standout && x.info.msg ? '<span class="caption" style="display:block;margin-top:4px;color:#2E2E2E">“' + esc(x.info.msg) + '”</span>' : '') + '</span>' +
          (x.info.standout ? '<span class="badge badge-gold">Standout</span>' : '<span class="badge badge-mint">Sent</span>') + '</button>';
      }).join('');
    }
    return '<section class="view" aria-label="Applied"><div class="pad top-space" style="background:#fff;border-bottom:1px solid #E6E6E3;padding-bottom:12px">' +
      '<div class="topbar"><h1 class="h1">Applied</h1><span class="caption num">' + list.length + ' sent</span></div></div>' +
      '<div class="scroll"><div class="pad stack gap-10" style="padding-top:16px;padding-bottom:24px">' + inner +
        (st.passed.length ? '<button class="link-btn" data-act="unpass">Bring back ' + st.passed.length + ' passed job' + (st.passed.length === 1 ? '' : 's') + '</button>' : '') +
      '</div></div></section>' + tabbar('applied');
  }

  /* ---------- Profile ---------- */
  function profileView() {
    var m = D.me, st = S.get();
    var tints = D.tint;
    return '<section class="view" aria-label="Your profile"><div class="scroll"><div class="pad top-space stack gap-16" style="padding-bottom:28px">' +
      '<div class="topbar">' + B.logo(24, 22) + '<button class="link-btn" data-act="reset">Reset demo</button></div>' +
      '<div class="row gap-16" style="display:flex"><span class="avatar" style="width:84px;height:84px;border-radius:42px;font-size:30px;background:#7EE8C3;color:#0A513C">' + esc(m.initials) + '</span>' +
        '<div class="row gap-16 num" style="display:flex">' +
          '<div><p class="h3">' + m.associates + '</p><p class="caption">associates</p></div>' +
          '<div><p class="h3">' + fmt(m.acquaintances + st.acquaintances.length) + '</p><p class="caption">acquaintances</p></div>' +
          '<div><p class="h3">' + m.posts + '</p><p class="caption">posts</p></div></div></div>' +
      '<div><h1 class="h2">' + esc(m.name) + '</h1><p class="label mint" style="margin:2px 0 6px">' + esc(m.role) + ' · ' + esc(m.location) + '</p><p class="body">' + esc(m.bio) + '</p></div>' +
      '<div class="row gap-8" style="display:flex"><button class="btn btn-ghost btn-sm" style="flex:1">Edit profile</button><button class="btn btn-ghost btn-sm" style="flex:1">View CV</button></div>' +
      '<div class="panel row gap-12" style="display:flex;background:#FFF6DB;border-color:#FFF6DB"><span class="star-badge">' + I.star + '</span>' +
        '<div style="flex:1"><p class="label" style="color:#6B4500">' + st.standoutsLeft + ' of ' + S.STANDOUTS_PER_WEEK + ' Standouts left</p><p class="caption" style="color:#6B4500">Your Standouts refill every Monday.</p></div></div>' +
      '<div class="panel stack gap-6"><p class="caption" style="font-weight:500">Pinned · How I work</p><p class="body">' + esc(m.howIWork) + '</p></div>' +
      '<div class="stack gap-8"><p class="label muted">Vouched by associates</p><div class="row gap-6" style="display:flex;flex-wrap:wrap">' +
        m.vouches.map(function (v) { return '<span class="tag num" style="font-size:13px;padding:5px 10px">' + esc(v[0]) + ' · ' + v[1] + '</span>'; }).join('') + '</div></div>' +
      '<button class="row-link" data-act="employer"><span style="width:24px;height:24px;display:inline-flex;color:#0E7052">' + I.eye + '</span>' +
        '<span class="grow"><span class="h3" style="display:block;font-size:15px">Preview the employer view</span><span class="caption" style="display:block">See how your applications look to a recruiter</span></span>' + I.chev + '</button>' +
      '<div class="tabs-line"><span class="on">Work</span><span>Process</span><span>Updates</span></div>' +
      '<div class="grid3" style="margin:0 -20px">' + m.work.map(function (w) { var t = tints[w[1]]; return '<div class="tile" style="background:' + t.bg + ';color:' + t.fg + '">[' + esc(w[0]) + ']</div>'; }).join('') + '</div>' +
      '</div></div></section>' + tabbar('profile');
  }

  /* ---------- Employer preview ---------- */
  function employerView() {
    var list = S.appliedList();
    var job = list.length ? list[0].job : D.job('j01');
    var c = D.company(job.companyId);
    var mine = S.get().applied[job.id];
    var people = D.applicants.slice();
    if (mine) people.push({ initials: D.me.initials, name: D.me.name + ' (you)', role: D.me.role + ' · ' + D.me.location, match: job.match, standout: mine.standout, msg: mine.msg, me: true });
    var standouts = people.filter(function (p) { return p.standout; }).sort(function (a, b) { return (b.me ? 1 : 0) - (a.me ? 1 : 0) || b.match - a.match; });
    var rest = people.filter(function (p) { return !p.standout; }).sort(function (a, b) { return b.match - a.match; });

    function row(p, gold) {
      if (gold) {
        return '<div class="panel standout-card stack gap-8"><div class="row gap-10" style="display:flex"><span class="avatar" style="background:#FFF6DB;color:#6B4500">' + esc(p.initials) + '</span>' +
          '<div style="flex:1;min-width:0"><p class="h3" style="font-size:15px">' + esc(p.name) + '</p><p class="caption">' + esc(p.role) + '</p></div><span class="label mint num">' + p.match + '%</span></div>' +
          '<p class="body" style="font-size:14px;line-height:20px">' + esc(p.msg || '') + '</p></div>';
      }
      return '<div class="row gap-10" style="display:flex;padding:8px 0;border-bottom:1px solid #E6E6E3' + (p.me ? ';background:#ECFBF5;margin:0 -8px;padding:8px;border-radius:10px' : '') + '"><span class="avatar" style="background:#EDEDEA">' + esc(p.initials) + '</span>' +
        '<div style="flex:1;min-width:0"><p class="h3" style="font-size:15px">' + esc(p.name) + '</p><p class="caption">' + esc(p.role) + '</p></div><span class="label mint num">' + p.match + '%</span></div>';
    }

    return '<section class="view" aria-label="Employer view"><div class="pad top-space" style="background:#fff;border-bottom:1px solid #E6E6E3;padding-bottom:12px">' +
      '<div class="backbar"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button><p class="caption" style="font-weight:500">' + esc(c.name) + ' · Recruiter view</p></div>' +
      '<h1 class="h1" style="margin-top:10px">' + esc(job.title) + '</h1><p class="label mint num" style="margin-top:4px">' + (job.applicants + (mine ? 1 : 0)) + ' applicants · Standouts pinned first</p></div>' +
      '<div class="scroll"><div class="pad stack gap-10" style="padding-top:16px;padding-bottom:24px">' +
        (mine ? '' : '<p class="caption">You haven’t applied to anything yet, so this shows a sample role. Apply or send a Standout and come back.</p>') +
        '<p class="label gold row gap-6" style="display:flex"><span style="width:14px;height:14px;display:inline-flex">' + I.star + '</span>Standouts · ' + standouts.length + '</p>' +
        standouts.map(function (p) { return row(p, true); }).join('') +
        '<p class="label muted" style="margin-top:8px">Everyone else</p>' +
        rest.map(function (p) { return row(p, false); }).join('') +
      '</div></div></section>';
  }

  /* ---------- Standout sheet ---------- */
  function standoutSheet(job, ui) {
    var c = D.company(job.companyId);
    var left = S.get().standoutsLeft;
    var inner;
    if (ui.sent) {
      inner = '<div class="stack gap-12" style="align-items:center;text-align:center;padding:12px 0 4px">' +
        '<span class="star-badge" style="width:72px;height:72px;border-radius:36px"><span style="width:34px;height:34px;display:inline-flex">' + I.star + '</span></span>' +
        '<h2 class="h1">You stood out</h2><p class="body">' + esc(c.name) + ' will see your application first. We’ll let you know when they reply.</p>' +
        '<button class="btn btn-mint btn-block" data-act="close-sheet-home">Back to Discover</button></div>';
    } else if (left <= 0) {
      inner = '<div class="stack gap-12" style="align-items:center;text-align:center;padding:12px 0 4px">' +
        '<span class="star-badge" style="background:#EDEDEA">' + I.star + '</span>' +
        '<h2 class="h2">You’re out of Standouts</h2><p class="body">Standouts refill every Monday, so each one stays special. You can still apply normally.</p>' +
        '<button class="btn btn-ghost btn-block" data-act="close-sheet">Got it</button></div>';
    } else {
      inner = '<div class="row gap-12" style="display:flex"><span class="star-badge">' + I.star + '</span>' +
          '<div><h2 class="h2">Send a Standout</h2><p class="caption">' + esc(job.title) + ' · ' + esc(c.name) + '</p></div></div>' +
        '<p class="body">Your application goes to the top of their list, with a message straight to the hiring manager. No need to finish the listing first.</p>' +
        '<div class="field"><label class="label" for="so-msg">Why you, in a few lines</label>' +
          '<textarea id="so-msg" rows="4" maxlength="300" placeholder="I’ve been designing labels for a local brewery and love how you approach small-batch brands…">' + esc(ui.msg || '') + '</textarea>' +
          '<div class="row between" style="display:flex"><span id="so-err" class="' + (ui.error ? 'error' : 'caption') + '">' + (ui.error ? 'Write a short message first' : 'Shown alongside your profile') + '</span><span id="so-count" class="caption num">' + (ui.msg || '').length + '/300</span></div></div>' +
        '<div class="row between" style="display:flex;background:#FFF6DB;border-radius:14px;padding:12px 14px"><span class="label" style="color:#6B4500">' + left + ' of ' + S.STANDOUTS_PER_WEEK + ' Standouts left this week</span></div>' +
        '<button class="btn btn-gold btn-block" data-act="send-standout" data-id="' + job.id + '">' + I.star + 'Send Standout</button>' +
        '<button class="link-btn" data-act="close-sheet">Not now</button>';
    }
    return '<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Send a Standout"><div class="grabber"></div>' + inner + '</div>';
  }

  /* ---------- Splash ---------- */
  function splash() {
    return '<div class="splash" id="splash" data-act="skip-splash">' + B.spinningMark(150) +
      '<div class="word">' + B.wordmark(68, 'word-anim') + '</div>' +
      '<p class="tagline">Swipe into work.</p>' +
      '<button class="skip" data-act="skip-splash">Skip</button></div>';
  }

  window.VIEWS = {
    esc: esc, discover: discover, jobView: jobView, companyView: companyView, feed: feed,
    appliedView: appliedView, profileView: profileView, employerView: employerView, standoutSheet: standoutSheet, splash: splash,
  };
})();
