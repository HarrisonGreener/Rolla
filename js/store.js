/* App state, saved to localStorage so the demo survives a refresh. */
(function () {
  var KEY = 'rolla-demo-v1';
  var STANDOUTS_PER_WEEK = 3;

  function fresh() {
    return {
      passed: [],          // job ids swiped left
      applied: {},         // jobId -> { at, standout, msg }
      read: {},            // jobId -> true once the full listing has been read
      standoutsLeft: STANDOUTS_PER_WEEK,
      shortlisted: ['northpaw'],
      acquaintances: [],   // people ids you added
      liked: {},           // post id -> true
      filter: 'All',
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        var base = fresh();
        for (var k in base) if (!(k in s)) s[k] = base[k];
        return s;
      }
    } catch (e) { /* storage unavailable: run in memory */ }
    return fresh();
  }

  var state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  var D = window.ROLLA;

  var store = {
    STANDOUTS_PER_WEEK: STANDOUTS_PER_WEEK,
    get: function () { return state; },
    save: save,
    reset: function () { state = fresh(); save(); },

    isApplied: function (id) { return !!state.applied[id]; },
    isPassed: function (id) { return state.passed.indexOf(id) !== -1; },
    isRead: function (id) { return !!state.read[id]; },
    isShortlisted: function (cid) { return state.shortlisted.indexOf(cid) !== -1; },

    markRead: function (id) { if (!state.read[id]) { state.read[id] = true; save(); } },
    pass: function (id) { if (!store.isPassed(id)) state.passed.push(id); save(); },
    apply: function (id) { state.applied[id] = { at: Date.now(), standout: false }; save(); },
    standout: function (id, msg) {
      if (state.standoutsLeft <= 0) return false;
      state.standoutsLeft -= 1;
      state.applied[id] = { at: Date.now(), standout: true, msg: msg };
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
    toggleShortlist: function (cid) {
      var i = state.shortlisted.indexOf(cid);
      if (i === -1) state.shortlisted.push(cid); else state.shortlisted.splice(i, 1);
      save();
    },
    toggleAcquaintance: function (pid) {
      var i = state.acquaintances.indexOf(pid);
      if (i === -1) state.acquaintances.push(pid); else state.acquaintances.splice(i, 1);
      save();
    },
    toggleLike: function (pid) { state.liked[pid] = !state.liked[pid]; save(); },
    setFilter: function (f) { state.filter = f; save(); },

    /* Jobs still to swipe: not passed, not applied, matching the filter.
       Jobs from shortlisted companies float to the top, then by match. */
    deck: function () {
      return D.jobs.filter(function (j) {
        return !store.isPassed(j.id) && !store.isApplied(j.id) && (state.filter === 'All' || j.category === state.filter);
      }).sort(function (a, b) {
        var sa = store.isShortlisted(a.companyId) ? 1 : 0;
        var sb = store.isShortlisted(b.companyId) ? 1 : 0;
        if (sa !== sb) return sb - sa;
        return b.match - a.match;
      });
    },
    appliedList: function () {
      return Object.keys(state.applied).map(function (id) {
        return { job: D.job(id), info: state.applied[id] };
      }).filter(function (x) { return x.job; }).sort(function (a, b) {
        if (a.info.standout !== b.info.standout) return a.info.standout ? -1 : 1;
        return b.info.at - a.info.at;
      });
    },
  };

  window.STORE = store;
})();
