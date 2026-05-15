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

function aceStartupButtonSafety() {
  aceFixLogoPaths();
  aceMarkComingSoonButtons();
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
  }, 600);
});

aceButtonObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
