function getAthleteMetrics(athlete) {
  const metricDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const activeWeek = athlete && athlete.activeWeekId
    ? (athlete.plans || []).find(function (week) { return week.id === athlete.activeWeekId; })
    : null;

  const activeWeekLogs = ((athlete && athlete.dailyCompletions) || []).filter(function (log) {
    return log.weekId === (activeWeek && activeWeek.id);
  });

  const completedDays = new Set(activeWeekLogs.map(function (log) { return log.day; }));
  const completionPercent = activeWeek ? Math.round((completedDays.size / 7) * 100) : 0;

  let currentStreak = 0;
  for (let i = metricDays.length - 1; i >= 0; i -= 1) {
    if (completedDays.has(metricDays[i])) currentStreak += 1;
    else if (currentStreak > 0) break;
  }

  const lastVelo = athlete && athlete.veloLog && athlete.veloLog.length ? athlete.veloLog[0] : null;
  const latestAssessment = athlete && athlete.assessments && athlete.assessments.length ? athlete.assessments[0] : null;

  return {
    activeWeek: activeWeek,
    completionPercent: completionPercent,
    currentStreak: currentStreak,
    lastVelo: lastVelo,
    latestAssessment: latestAssessment
  };
}

function getMockAthleteTimeline(athlete) {
  const veloLog = (athlete && athlete.veloLog) || [];
  const dailyCompletions = (athlete && athlete.dailyCompletions) || [];
  const coachNotes = (athlete && athlete.coachNotes) || "";
  const currentVelo = athlete && athlete.currentVelo;
  const athleteName = (athlete && athlete.name) || "Athlete";

  return [
    {
      id: "timeline-1",
      date: "Today",
      readiness: 87,
      soreness: 2,
      throwingStatus: "Medium Intent",
      velocity: (veloLog[0] && veloLog[0].velo) || currentVelo || "--",
      armCareComplete: Boolean(dailyCompletions[0] && dailyCompletions[0].completed),
      coachNote: coachNotes || athleteName + " should stay smooth early, then build intent after the arm feels hot.",
      hasVideo: false
    },
    {
      id: "timeline-2",
      date: "Yesterday",
      readiness: 74,
      soreness: 4,
      throwingStatus: "Recovery Throw",
      velocity: (veloLog[1] && veloLog[1].velo) || "--",
      armCareComplete: true,
      coachNote: "Recovery quality looked solid. Keep the front side calm and avoid rushing tempo.",
      hasVideo: true
    },
    {
      id: "timeline-3",
      date: "2 Days Ago",
      readiness: 91,
      soreness: 1,
      throwingStatus: "Bullpen",
      velocity: (veloLog[2] && veloLog[2].velo) || currentVelo || "--",
      armCareComplete: true,
      coachNote: "Best day of the week. Direction and timing were much cleaner into foot strike.",
      hasVideo: false
    }
  ];
}

function aceFixLogoPaths() {
  var images = document.querySelectorAll('img[src="/ace-logo.png"], img[src="ace-logo.png"]');
  images.forEach(function (img) {
    img.src = "/ace-logo.svg";
    img.style.objectFit = "contain";
  });

  var icons = document.querySelectorAll('link[href="/ace-logo.png"], link[href="ace-logo.png"]');
  icons.forEach(function (link) {
    link.href = "/ace-logo.svg";
  });
}

function aceMarkComingSoonButtons() {
  var buttons = Array.from(document.querySelectorAll("button"));
  buttons.forEach(function (button) {
    var label = (button.textContent || "").trim().toLowerCase();
    if (!label) return;

    var isComingSoon =
      label.indexOf("upload") !== -1 ||
      label.indexOf("add coach breakdown") !== -1 ||
      label.indexOf("forgot password") !== -1;

    if (!isComingSoon) return;

    if (button.disabled) button.disabled = false;
    if (button.dataset.aceComingSoonReady === "true") return;
    button.dataset.aceComingSoonReady = "true";
    button.title = "Coming soon";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var notice = document.getElementById("ace-coming-soon-notice");
      if (!notice) {
        notice = document.createElement("div");
        notice.id = "ace-coming-soon-notice";
        notice.style.position = "fixed";
        notice.style.left = "50%";
        notice.style.bottom = "24px";
        notice.style.transform = "translateX(-50%)";
        notice.style.zIndex = "9999";
        notice.style.background = "#09090b";
        notice.style.color = "white";
        notice.style.border = "1px solid #3f3f46";
        notice.style.borderRadius = "14px";
        notice.style.padding = "12px 16px";
        notice.style.fontFamily = "system-ui, sans-serif";
        notice.style.boxShadow = "0 18px 45px rgba(0,0,0,.35)";
        document.body.appendChild(notice);
      }
      notice.textContent = "Coming soon";
      window.clearTimeout(window.aceComingSoonNoticeTimer);
      window.aceComingSoonNoticeTimer = window.setTimeout(function () {
        if (notice && notice.parentNode) notice.parentNode.removeChild(notice);
      }, 1800);
    });
  });
}

function aceInjectVideoLibraryFoundation() {
  if (document.getElementById("ace-video-library-foundation")) return;

  var headings = Array.from(document.querySelectorAll("h3"));
  var videoHubHeading = headings.find(function (heading) {
    return heading.textContent && heading.textContent.trim() === "Video Hub";
  });

  if (!videoHubHeading) return;

  var videoHubCard = videoHubHeading.closest(".rounded-3xl");
  if (!videoHubCard || !videoHubCard.parentNode) return;

  var categories = ["All", "Coach Videos", "Athlete Drill Videos", "Bullpens", "Game Clips", "Arm Care", "Mechanics Breakdowns"];
  var videos = [
    { title: "Weekly Coach Overview", category: "Coach Videos", tags: ["Planning", "Development"], focus: "Weekly priorities and athlete focus points", date: "This Week" },
    { title: "Separation Step Drill", category: "Athlete Drill Videos", tags: ["Drill", "Timing"], focus: "Hip and shoulder separation timing", date: "Library" },
    { title: "Bullpen Command Review", category: "Bullpens", tags: ["Bullpen", "Command"], focus: "Strike-zone execution and direction", date: "Recent" },
    { title: "Game Clip Breakdown", category: "Game Clips", tags: ["Game", "Execution"], focus: "Pitch sequencing and competitive rhythm", date: "Recent" },
    { title: "Post-Throw Recovery Block", category: "Arm Care", tags: ["Recovery", "Arm Care"], focus: "Post-throw recovery and tissue quality", date: "Library" },
    { title: "Lead Leg + Direction Breakdown", category: "Mechanics Breakdowns", tags: ["Mechanics", "Lower Half"], focus: "Lead leg block and stride direction", date: "Library" }
  ];

  var section = document.createElement("section");
  section.id = "ace-video-library-foundation";
  section.style.marginTop = "16px";
  section.style.border = "1px solid rgba(148, 163, 184, 0.16)";
  section.style.borderRadius = "24px";
  section.style.background = "rgba(9, 9, 11, 0.92)";
  section.style.padding = "20px";

  section.innerHTML =
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:16px;">' +
      '<div>' +
        '<h3 style="font-size:20px;font-weight:900;margin:0;color:white;letter-spacing:-.03em;">Video Library</h3>' +
        '<p style="margin:6px 0 0;color:#71717a;font-size:14px;line-height:1.5;">Organized video foundation for coach content, athlete drills, bullpens, game clips, arm care, and mechanics breakdowns.</p>' +
      '</div>' +
      '<span style="font-size:11px;text-transform:uppercase;font-weight:900;color:#fca5a5;background:rgba(127,29,29,.28);border:1px solid rgba(127,29,29,.65);border-radius:999px;padding:8px 10px;">Local Library</span>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:10px;margin-bottom:14px;" class="ace-video-library-controls">' +
      '<input id="ace-video-search" placeholder="Search videos..." style="background:#000;border:1px solid rgba(148,163,184,.16);border-radius:12px;color:white;padding:12px;min-height:44px;width:100%;" />' +
      '<select id="ace-video-filter" style="background:#000;border:1px solid rgba(148,163,184,.16);border-radius:12px;color:white;padding:12px;min-height:44px;width:100%;"></select>' +
    '</div>' +
    '<div id="ace-video-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;"></div>';

  videoHubCard.parentNode.insertBefore(section, videoHubCard.nextSibling);

  var select = section.querySelector("#ace-video-filter");
  categories.forEach(function (category) {
    var option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  function renderVideos() {
    var query = (section.querySelector("#ace-video-search").value || "").toLowerCase();
    var filter = select.value;
    var grid = section.querySelector("#ace-video-grid");
    var filtered = videos.filter(function (video) {
      var text = [video.title, video.category, video.focus].concat(video.tags).join(" ").toLowerCase();
      return (filter === "All" || video.category === filter) && (!query || text.indexOf(query) !== -1);
    });

    grid.innerHTML = filtered.map(function (video) {
      return '<article style="border:1px solid rgba(148,163,184,.16);border-radius:18px;background:#000;padding:12px;min-width:0;">' +
        '<div style="aspect-ratio:16/9;border-radius:14px;background:linear-gradient(135deg,#09090b,#18181b);border:1px solid rgba(148,163,184,.14);display:grid;place-items:center;margin-bottom:12px;color:#fca5a5;font-weight:900;">▶</div>' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:11px;text-transform:uppercase;color:#71717a;font-weight:800;">' + video.date + '</div>' +
            '<h4 style="margin:2px 0 0;font-size:15px;line-height:1.15;color:white;font-weight:900;">' + video.title + '</h4>' +
          '</div>' +
          '<span style="font-size:10px;text-transform:uppercase;font-weight:900;background:white;color:black;border-radius:999px;padding:5px 7px;white-space:nowrap;">' + video.category + '</span>' +
        '</div>' +
        '<p style="margin:0 0 10px;color:#a1a1aa;font-size:13px;line-height:1.45;">' + video.focus + '</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + video.tags.map(function (tag) { return '<span style="font-size:11px;color:#fecaca;background:rgba(127,29,29,.22);border:1px solid rgba(127,29,29,.55);border-radius:999px;padding:4px 7px;">' + tag + '</span>'; }).join("") + '</div>' +
      '</article>';
    }).join("");

    if (!filtered.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;border:1px solid rgba(148,163,184,.16);border-radius:18px;background:#000;padding:18px;color:#71717a;text-align:center;">No videos match this search.</div>';
    }
  }

  section.querySelector("#ace-video-search").addEventListener("input", renderVideos);
  select.addEventListener("change", renderVideos);
  renderVideos();

  var style = document.createElement("style");
  style.textContent = '@media (max-width: 900px){#ace-video-grid{grid-template-columns:1fr!important}.ace-video-library-controls{grid-template-columns:1fr!important}}';
  document.head.appendChild(style);
}

function aceStartupButtonSafety() {
  aceFixLogoPaths();
  aceMarkComingSoonButtons();
  aceInjectVideoLibraryFoundation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aceStartupButtonSafety);
} else {
  aceStartupButtonSafety();
}

var aceButtonObserverQueued = false;
var aceButtonObserver = new MutationObserver(function () {
  if (aceButtonObserverQueued) return;
  aceButtonObserverQueued = true;
  window.setTimeout(function () {
    aceButtonObserverQueued = false;
    aceFixLogoPaths();
    aceMarkComingSoonButtons();
    aceInjectVideoLibraryFoundation();
  }, 600);
});

aceButtonObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
