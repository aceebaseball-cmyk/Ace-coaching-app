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
    if (button.dataset.aceComingSoonReady === "true") return;

    button.dataset.aceComingSoonReady = "true";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      aceShowNotice("Coming soon");
    });
  });
}

function aceInjectAthleteTodayFocus() {
  if (document.getElementById("ace-athlete-today-focus")) return;

  var todayHeading = Array.from(document.querySelectorAll("h2, h1, h3")).find(function (heading) {
    var text = (heading.textContent || "").trim().toLowerCase();
    return text === "today" || text.indexOf("today dashboard") !== -1;
  });

  if (!todayHeading) return;

  var todayCard = todayHeading.closest(".rounded-3xl");
  if (!todayCard || !todayCard.parentNode) return;

  var statuses = [
    "High Intent Day",
    "Build-Up Day",
    "Bullpen Day",
    "Recovery Focus",
    "Completed"
  ];

  var section = document.createElement("section");
  section.id = "ace-athlete-today-focus";
  section.style.marginBottom = "16px";
  section.style.border = "1px solid rgba(148,163,184,.16)";
  section.style.borderRadius = "24px";
  section.style.background = "linear-gradient(135deg, rgba(127,29,29,.18), rgba(2,6,23,.95))";
  section.style.padding = "18px";

  section.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:14px;">' +
      '<div>' +
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#fca5a5;font-weight:900;margin-bottom:4px;">ACE Daily Flow</div>' +
        '<h3 style="margin:0;color:white;font-size:22px;font-weight:900;letter-spacing:-.03em;">Today\'s Focus</h3>' +
        '<p style="margin:6px 0 0;color:#a1a1aa;font-size:13px;line-height:1.5;max-width:640px;">Prioritize throwing, arm care, assigned drills, recovery, and coach communication from one fast athlete workflow.</p>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">' + statuses.map(function(status){
        return '<span style="font-size:10px;text-transform:uppercase;font-weight:900;color:#fecaca;background:rgba(127,29,29,.28);border:1px solid rgba(248,113,113,.38);border-radius:999px;padding:8px 10px;white-space:nowrap;">'+status+'</span>';
      }).join('') + '</div>' +
    '</div>' +

    '<div class="ace-athlete-priority-grid" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:14px;">' +
      '<div class="ace-athlete-priority-card"><span>Throwing Plan</span><strong>Today\'s workload</strong></div>' +
      '<div class="ace-athlete-priority-card"><span>Arm Care</span><strong>Recovery priority</strong></div>' +
      '<div class="ace-athlete-priority-card"><span>Assigned Drills</span><strong>Movement focus</strong></div>' +
      '<div class="ace-athlete-priority-card"><span>Readiness</span><strong>Daily status</strong></div>' +
      '<div class="ace-athlete-priority-card"><span>Coach Notes</span><strong>Execution cue</strong></div>' +
    '</div>' +

    '<div class="ace-athlete-quick-actions" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px;">' +
      '<button type="button">Complete Throwing</button>' +
      '<button type="button">Complete Arm Care</button>' +
      '<button type="button">View Assigned Drills</button>' +
      '<button type="button">Add Daily Notes</button>' +
    '</div>' +

    '<div style="border:1px solid rgba(148,163,184,.16);background:#000;border-radius:18px;padding:14px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">' +
        '<div>' +
          '<div style="font-size:11px;text-transform:uppercase;color:#71717a;font-weight:900;">Daily Completion</div>' +
          '<div style="font-size:18px;font-weight:900;color:white;letter-spacing:-.03em;">Keep Your Streak Alive</div>' +
        '</div>' +
        '<div style="font-size:13px;color:#fca5a5;font-weight:900;">82% Complete</div>' +
      '</div>' +
      '<div style="height:12px;border-radius:999px;background:#18181b;overflow:hidden;">' +
        '<div style="width:82%;height:100%;background:linear-gradient(90deg,#ef4444,#fca5a5);border-radius:999px;"></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px;color:#71717a;font-size:12px;">' +
        '<span>Throwing ✔</span>' +
        '<span>Arm Care ✔</span>' +
        '<span>Velocity Logged</span>' +
        '<span>Daily Notes</span>' +
      '</div>' +
    '</div>';

  todayCard.parentNode.insertBefore(section, todayCard);

  var style = document.getElementById("ace-athlete-today-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "ace-athlete-today-style";
    style.textContent =
      '.ace-athlete-priority-card{border:1px solid rgba(148,163,184,.16);background:#000;border-radius:18px;padding:12px;min-width:0}' +
      '.ace-athlete-priority-card span{display:block;font-size:10px;text-transform:uppercase;color:#71717a;font-weight:900;margin-bottom:4px}' +
      '.ace-athlete-priority-card strong{display:block;color:white;font-size:13px;line-height:1.2}' +
      '.ace-athlete-quick-actions button{border:1px solid rgba(148,163,184,.16);background:#18181b;color:white;border-radius:16px;padding:14px;font-weight:900;font-size:12px;min-height:48px}' +
      '.ace-athlete-quick-actions button:hover{border-color:rgba(248,113,113,.45);background:rgba(127,29,29,.24)}' +
      '@media(max-width:900px){.ace-athlete-priority-grid{grid-template-columns:1fr 1fr!important}.ace-athlete-quick-actions{grid-template-columns:1fr 1fr!important}}' +
      '@media(max-width:640px){.ace-athlete-priority-grid,.ace-athlete-quick-actions{grid-template-columns:1fr!important}}';
    document.head.appendChild(style);
  }

  section.querySelectorAll('button').forEach(function(button){
    button.addEventListener('click', function(){
      aceShowNotice(button.textContent + ' ready');
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

  section.innerHTML = '<h3 style="margin:0;color:white;font-size:20px;font-weight:900;">Weekly Development Overview</h3>';
  weeklyCard.parentNode.insertBefore(section, weeklyCard.nextSibling);
}

function aceStartupEnhancements() {
  aceFixLogoPaths();
  aceMarkComingSoonButtons();
  aceInjectAthleteTodayFocus();
  aceInjectWeeklyCoachOverview();
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