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

function aceShowNotice(message) {
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
  notice.textContent = message;
  window.clearTimeout(window.aceComingSoonNoticeTimer);
  window.aceComingSoonNoticeTimer = window.setTimeout(function () {
    if (notice && notice.parentNode) notice.parentNode.removeChild(notice);
  }, 1800);
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
      aceShowNotice("Coming soon");
    });
  });
}

function aceInjectWeeklyCoachOverview() {
  if (document.getElementById("ace-weekly-coach-overview")) return;

  var weeklyHeading = Array.from(document.querySelectorAll("h2")).find(function (heading) {
    return heading.textContent && heading.textContent.trim() === "Weekly Builder";
  });

  if (!weeklyHeading) return;

  var weeklyCard = weeklyHeading.closest(".rounded-3xl");
  if (!weeklyCard || !weeklyCard.parentNode) return;

  var section = document.createElement("section");
  section.id = "ace-weekly-coach-overview";
  section.style.margin = "0 0 16px";
  section.style.border = "1px solid rgba(148,163,184,.16)";
  section.style.borderRadius = "24px";
  section.style.background = "linear-gradient(135deg, rgba(9,9,11,.94), rgba(2,6,23,.94))";
  section.style.padding = "18px";

  section.innerHTML =
    '<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:14px;">' +
      '<div>' +
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#fca5a5;font-weight:900;margin-bottom:4px;">ACE Programming View</div>' +
        '<h3 style="margin:0;color:white;font-size:20px;font-weight:900;letter-spacing:-.03em;">Weekly Development Overview</h3>' +
        '<p style="margin:6px 0 0;color:#a1a1aa;font-size:13px;line-height:1.5;max-width:680px;">Plan throwing, drills, arm care, recovery emphasis, and coach focuses from one weekly operating view. Existing builder controls stay unchanged below.</p>' +
      '</div>' +
      '<span style="height:max-content;font-size:10px;text-transform:uppercase;font-weight:900;color:#fecaca;background:rgba(127,29,29,.30);border:1px solid rgba(248,113,113,.40);border-radius:999px;padding:8px 10px;">Coach Workflow</span>' +
    '</div>' +
    '<div class="ace-weekly-overview-grid" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:14px;">' +
      '<div class="ace-weekly-stat"><span>Throwing Schedule</span><strong>Build by Day</strong></div>' +
      '<div class="ace-weekly-stat"><span>Workload</span><strong>Monitor Volume</strong></div>' +
      '<div class="ace-weekly-stat"><span>Recovery</span><strong>Arm Care Focus</strong></div>' +
      '<div class="ace-weekly-stat"><span>Assigned Work</span><strong>Drills + Care</strong></div>' +
      '<div class="ace-weekly-stat"><span>Completed Work</span><strong>Track Daily</strong></div>' +
    '</div>' +
    '<div class="ace-weekly-actions" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;">' +
      '<button type="button" data-target="throwing">Assign Throwing Days</button>' +
      '<button type="button" data-target="drills">Assign Drills</button>' +
      '<button type="button" data-target="armcare">Assign Arm Care</button>' +
      '<button type="button" data-target="notes">Add Notes / Focus</button>' +
    '</div>';

  weeklyCard.parentNode.insertBefore(section, weeklyCard.nextSibling);

  var style = document.getElementById("ace-weekly-overview-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "ace-weekly-overview-style";
    style.textContent =
      '.ace-weekly-stat{border:1px solid rgba(148,163,184,.16);background:#000;border-radius:16px;padding:12px;min-width:0}' +
      '.ace-weekly-stat span{display:block;color:#71717a;font-size:10px;text-transform:uppercase;font-weight:900;margin-bottom:4px}' +
      '.ace-weekly-stat strong{display:block;color:white;font-size:13px;line-height:1.2}' +
      '.ace-weekly-actions button{border:1px solid rgba(148,163,184,.16);background:#18181b;color:white;border-radius:14px;padding:12px;font-weight:900;font-size:12px;min-height:44px}' +
      '.ace-weekly-actions button:hover{border-color:rgba(248,113,113,.55);background:rgba(127,29,29,.25)}' +
      '@media(max-width:900px){.ace-weekly-overview-grid{grid-template-columns:1fr 1fr!important}.ace-weekly-actions{grid-template-columns:1fr!important}}';
    document.head.appendChild(style);
  }

  section.querySelectorAll("button").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = button.getAttribute("data-target");
      var targetText = target === "throwing" ? "Throwing Plan" : target === "drills" ? "Drills" : target === "armcare" ? "Arm Care" : "Focus";
      var labels = Array.from(document.querySelectorAll("div, label, h3, h4, textarea, input"));
      var found = labels.find(function (el) {
        var text = (el.placeholder || el.textContent || "").toLowerCase();
        return text.indexOf(targetText.toLowerCase()) !== -1;
      });
      if (found && found.scrollIntoView) {
        found.scrollIntoView({ behavior: "smooth", block: "center" });
        aceShowNotice("Jumped to " + targetText);
      } else {
        aceShowNotice(targetText + " is available in the weekly builder below");
      }
    });
  });
}

function aceInjectCoachStatusGuide() {
  if (document.getElementById("ace-coach-status-guide")) return;

  var athleteHeading = Array.from(document.querySelectorAll("h2")).find(function (heading) {
    var text = (heading.textContent || "").trim();
    return text && text !== "Athletes" && text !== "Weekly Builder" && text !== "Assessment";
  });

  if (!athleteHeading) return;
  var athleteCard = athleteHeading.closest(".rounded-3xl");
  if (!athleteCard || !athleteCard.parentNode) return;

  var guide = document.createElement("div");
  guide.id = "ace-coach-status-guide";
  guide.style.border = "1px solid rgba(148,163,184,.16)";
  guide.style.borderRadius = "22px";
  guide.style.background = "rgba(9,9,11,.90)";
  guide.style.padding = "14px";
  guide.style.marginTop = "12px";
  guide.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;" class="ace-coach-status-grid">' +
      '<div class="ace-weekly-stat"><span>Status</span><strong>Check active week</strong></div>' +
      '<div class="ace-weekly-stat"><span>Soreness</span><strong>Watch recovery needs</strong></div>' +
      '<div class="ace-weekly-stat"><span>Incomplete</span><strong>Review daily logs</strong></div>' +
      '<div class="ace-weekly-stat"><span>Focus</span><strong>Notes + assessments</strong></div>' +
    '</div>';

  athleteCard.appendChild(guide);

  var style = document.getElementById("ace-coach-status-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "ace-coach-status-style";
    style.textContent = '@media(max-width:900px){.ace-coach-status-grid{grid-template-columns:1fr 1fr!important}}';
    document.head.appendChild(style);
  }
}

function aceStartupEnhancements() {
  aceFixLogoPaths();
  aceMarkComingSoonButtons();
  aceInjectWeeklyCoachOverview();
  aceInjectCoachStatusGuide();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aceStartupEnhancements);
} else {
  aceStartupEnhancements();
}

var aceEnhancementQueued = false;
var aceEnhancementObserver = new MutationObserver(function () {
  if (aceEnhancementQueued) return;
  aceEnhancementQueued = true;
  window.setTimeout(function () {
    aceEnhancementQueued = false;
    aceStartupEnhancements();
  }, 650);
});

aceEnhancementObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
