(function () {
  var SUPABASE_URL = "https://rpkqljzkkjvidukurnhy.supabase.co";
  var SUPABASE_KEY = "sb_publishable_WoYTSQg-Wkb6eY53zWFXVQ_N5__7xar";
  var AUTH_KEY = "sb-rpkqljzkkjvidukurnhy-auth-token";
  var ATHLETES_KEY = "ace-athletes";
  var syncTimer = null;
  var originalSetItem = window.localStorage && window.localStorage.setItem;

  function safeJson(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function getAuth() {
    var auth = safeJson(window.localStorage.getItem(AUTH_KEY), null);
    if (!auth || !auth.access_token || !auth.user || !auth.user.id) return null;
    return auth;
  }

  function headers(auth, extra) {
    return Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + auth.access_token,
      "Content-Type": "application/json"
    }, extra || {});
  }

  function athleteFromRow(row) {
    var data = row && row.data && typeof row.data === "object" ? row.data : null;
    if (data && data.name) return data;

    return {
      id: row.id,
      name: row.name || "",
      age: row.age || "",
      level: row.level || "",
      hand: row.hand || "",
      goals: row.goals || "",
      currentVelo: row.current_velo || "",
      targetVelo: row.target_velo || "",
      soreness: row.soreness || "",
      assessments: [],
      plans: [],
      activeWeekId: null,
      dailyCompletions: [],
      coachNotes: "",
      veloLog: row.current_velo ? [{ id: Date.now(), date: new Date().toLocaleDateString(), velo: row.current_velo, note: "Starting velo" }] : []
    };
  }

  function payloadFromAthlete(athlete, auth, existingRows) {
    var existing = (existingRows || []).find(function (row) {
      var dataId = row && row.data && row.data.id;
      return String(row.id) === String(athlete.id) || String(dataId) === String(athlete.id);
    });

    if (!existing) {
      existing = (existingRows || []).find(function (row) {
        return (row.name || "") === (athlete.name || "") &&
          String(row.age || "") === String(athlete.age || "") &&
          String(row.current_velo || "") === String(athlete.currentVelo || "");
      });
    }

    var rowId = existing ? existing.id : String(athlete.id || Date.now());

    return {
      id: String(rowId),
      coach_id: auth.user.id,
      name: athlete.name || "Untitled Athlete",
      age: athlete.age || null,
      level: athlete.level || null,
      hand: athlete.hand || null,
      goals: athlete.goals || null,
      current_velo: athlete.currentVelo || null,
      target_velo: athlete.targetVelo || null,
      soreness: athlete.soreness || null,
      data: athlete,
      updated_at: new Date().toISOString()
    };
  }

  async function fetchRows(auth) {
    var response = await fetch(SUPABASE_URL + "/rest/v1/athletes?select=*&order=updated_at.desc", {
      method: "GET",
      headers: headers(auth)
    });
    if (!response.ok) throw new Error("Athlete load failed");
    return response.json();
  }

  async function syncAthletesNow() {
    var auth = getAuth();
    if (!auth) return;

    var athletes = safeJson(window.localStorage.getItem(ATHLETES_KEY), []);
    if (!Array.isArray(athletes)) return;

    try {
      var existingRows = await fetchRows(auth).catch(function () { return []; });
      var payload = athletes
        .filter(function (athlete) { return athlete && athlete.name; })
        .map(function (athlete) { return payloadFromAthlete(athlete, auth, existingRows); });

      if (!payload.length) return;

      await fetch(SUPABASE_URL + "/rest/v1/athletes", {
        method: "POST",
        headers: headers(auth, { Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn("ACE athlete Supabase sync skipped:", error && error.message ? error.message : error);
    }
  }

  function scheduleSync() {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncAthletesNow, 900);
  }

  function hydrateAthletesSync() {
    var auth = getAuth();
    if (!auth) return;

    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", SUPABASE_URL + "/rest/v1/athletes?select=*&order=updated_at.desc", false);
      xhr.setRequestHeader("apikey", SUPABASE_KEY);
      xhr.setRequestHeader("Authorization", "Bearer " + auth.access_token);
      xhr.send(null);

      if (xhr.status >= 200 && xhr.status < 300) {
        var rows = safeJson(xhr.responseText, []);
        if (Array.isArray(rows) && rows.length) {
          var athletes = rows.map(athleteFromRow).filter(function (athlete) { return athlete && athlete.name; });
          if (athletes.length) {
            originalSetItem.call(window.localStorage, ATHLETES_KEY, JSON.stringify(athletes));
          }
        }
      }
    } catch (error) {
      console.warn("ACE athlete Supabase hydrate skipped:", error && error.message ? error.message : error);
    }
  }

  if (window.localStorage && originalSetItem) {
    window.localStorage.setItem = function (key, value) {
      var result = originalSetItem.apply(this, arguments);
      if (key === ATHLETES_KEY) scheduleSync();
      return result;
    };
  }

  hydrateAthletesSync();

  window.addEventListener("focus", function () {
    scheduleSync();
  });
})();
