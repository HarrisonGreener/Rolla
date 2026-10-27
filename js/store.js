/* App state, saved to localStorage so the demo survives a refresh. */
(function () {
  var KEY = 'rolla-demo-v3';
  var STANDOUTS_PER_WEEK = 3;
  var D = window.ROLLA;

  function fresh() {
    return {
      passed: [],          // job ids swiped left
      applied: {},         // jobId -> { at, standout, msg }
      read: {},            // jobId -> true once the full listing has been read
      saved: [],           // job ids saved for later
      standoutsLeft: STANDOUTS_PER_WEEK,
      shortlisted: ['northpaw'],
      acquaintances: [],
      liked: {},
      filters: { cat: 'Any', type: 'Any', mode: 'Any' },
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw), base = fresh();
        for (var k in base) if (!(k in s)) s[k] = base[k];
        return s;
      }
    } catch (e) { /* storage unavailable: run in memory */ }
    return fresh();
  }

  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  function toggleIn(list, v) { var i = list.indexOf(v); if (i === -1) list.push(v); else list.splice(i, 1); }

  // Demo application progress: applications move along over the following minutes,
  // faster for Standouts, so the Applied tab feels alive.
  var STAGES = ['Sent', 'Viewed', 'Shortlisted', 'Interview'];
  function stageOf(job, info) {
    var secs = (Date.now() - info.at) / 1000;
    if (info.standout) return secs > 90 ? 3 : secs > 30 ? 2 : secs > 8 ? 1 : 0;
    if (job.match >= 85) return secs > 120 ? 2 : secs > 25 ? 1 : 0;
    return secs > 45 ? 1 : 0;
  }

  var store = {
    STANDOUTS_PER_WEEK: STANDOUTS_PER_WEEK,
    STAGES: STAGES,
    get: function () { return state; },
    save: save,
    reset: function () { state = fresh(); save(); },

    isApplied: function (id) { return !!state.applied[id]; },
    isPassed: function (id) { return state.passed.indexOf(id) !== -1; },
    isRead: function (id) { return !!state.read[id]; },
    isSaved: function (id) { return state.saved.indexOf(id) !== -1; },
    isShortlisted: function (cid) { return state.shortlisted.indexOf(cid) !== -1; },

    markRead: function (id) { if (!state.read[id]) { state.read[id] = true; save(); } },
    pass: function (id) { if (!store.isPassed(id)) state.passed.push(id); save(); },
    unpass: function (id) { state.passed = state.passed.filter(function (x) { return x !== id; }); save(); },
    apply: function (id) { state.applied[id] = { at: Date.now(), standout: false }; state.saved = state.saved.filter(function (x) { return x !== id; }); save(); },
    standout: function (id, msg) {
      if (state.standoutsLeft <= 0) return false;
      state.standoutsLeft -= 1;
      state.applied[id] = { at: Date.now(), standout: true, msg: msg };
      state.saved = state.saved.filter(function (x) { return x !== id; });
      save();
      return true;
    },
    withdraw: function (id) {
      var a = state.applied[id];
      if (a && a.standout) state.standoutsLeft = Math.min(STANDOUTS_PER_WEEK, state.standoutsLeft + 1);
      delete state.applied[id];
      save();
    },
    unpassAll: function () { state.passed = []; save(); },
    toggleSave: function (id) { toggleIn(state.saved, id); save(); },
    toggleShortlist: function (cid) { toggleIn(state.shortlisted, cid); save(); },
    toggleAcquaintance: function (pid) { toggleIn(state.acquaintances, pid); save(); },
    toggleLike: function (pid) { state.liked[pid] = !state.liked[pid]; save(); },
    setFilter: function (key, val) { state.filters[key] = val; save(); },
    clearFilters: function () { state.filters = { cat: 'Any', type: 'Any', mode: 'Any' }; save(); },
    activeFilters: function () { var f = state.filters; return ['cat', 'type', 'mode'].filter(function (k) { return f[k] !== 'Any'; }).map(function (k) { return f[k]; }); },

    /* Jobs still to swipe, after filters. Shortlisted studios come first, then best match. */
    deck: function () {
      return D.jobs.filter(function (j) {
        var f = state.filters;
        return !store.isPassed(j.id) && !store.isApplied(j.id) &&
          (f.cat === 'Any' || j.cat === f.cat) && (f.type === 'Any' || j.type === f.type) && (f.mode === 'Any' || j.mode === f.mode);
      }).sort(function (a, b) {
        var sa = store.isShortlisted(a.co) ? 1 : 0, sb = store.isShortlisted(b.co) ? 1 : 0;
        if (sa !== sb) return sb - sa;
        return b.match - a.match;
      });
    },
    appliedList: function () {
      return Object.keys(state.applied).map(function (id) {
        var job = D.job(id);
        return job ? { job: job, info: state.applied[id], stage: stageOf(job, state.applied[id]) } : null;
      }).filter(Boolean).sort(function (a, b) {
        if (a.info.standout !== b.info.standout) return a.info.standout ? -1 : 1;
        return b.info.at - a.info.at;
      });
    },
    savedList: function () { return state.saved.map(D.job).filter(function (j) { return j && !store.isApplied(j.id); }); },
  };

  window.STORE = store;
})();
