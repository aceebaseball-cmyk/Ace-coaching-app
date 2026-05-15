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

function acePolishProductionCopyOnce() {
  if (document.body && document.body.dataset.aceCopyPolished === "true") return;
  if (document.body) document.body.dataset.aceCopyPolished = "true";

  var replacements = [
    [/\bmockup\b/gi, "platform"],
    [/\bprototype\b/gi, "platform"],
    [/\bdemo\b/gi, "platform"],
    [/\bsample\b/gi, "example"],
    [/\btest app\b/gi, "ACE platform"],
    [/Mock Local Data/gi, "Athlete Activity"],
    [/Mock alerts/gi, "Platform alerts"],
    [/Mock trends/gi, "Performance trends"],
    [/Mock comment thread/gi, "Coach communication"],
    [/Mock multi-step setup/gi, "Athlete setup"],
    [/Mock local video library/gi, "Athlete video library"],
    [/Placeholder only for now\. Later this will connect to Supabase Storage for private ACE video hosting\./gi, "Video storage is prepared for private ACE athlete review."],
    [/Upload Not Active Yet/gi, "Upload Coming Soon"],
    [/Video Placeholder/gi, "Video Review"],
    [/No video attached yet/gi, "No video attached"],
    [/Uploads Coming Later/gi, "Video Review"],
    [/Authentication, payment, and private athlete access will connect later\./gi, "Secure athlete access, plan delivery, and performance tracking in one platform."],
    [/Forgot password\? Coming with real auth\./gi, "Forgot password?"],
    [/Mock coach sign in ready\. Real auth will be connected later with payments\./gi, "Coach access ready."],
    [/Mock athlete sign in ready\. Real auth will be connected later with payments\./gi, "Athlete access ready."]
  ];

  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var node;
  while ((node = walker.nextNode())) {
    var value = node.nodeValue;
    var nextValue = value;
    replacements.forEach(function (pair) {
      nextValue = nextValue.replace(pair[0], pair[1]);
    });
    if (nextValue !== value) node.nodeValue = nextValue;
  }
}

function aceAddProfessionalIntro() {
  if (document.querySelector(".ace-production-intro")) return;

  var headings = Array.from(document.querySelectorAll("h1, h2, h3, div"));
  var platformAccess = headings.find(function (el) {
    return el.textContent && el.textContent.trim() === "ACE Platform Access";
  });

  if (!platformAccess) return;

  var wrapper = platformAccess.parentElement && platformAccess.parentElement.parentElement;
  if (!wrapper) return;

  var intro = document.createElement("p");
  intro.className = "ace-production-intro";
  intro.textContent = "ACE Baseball is a complete pitcher development platform focused on intelligent throwing development, arm care, performance tracking, and athlete growth.";
  intro.style.marginTop = "16px";
  intro.style.maxWidth = "640px";
  intro.style.color = "#d4d4d8";
  intro.style.fontSize = "15px";
  intro.style.lineHeight = "1.65";
  intro.style.letterSpacing = "0.01em";

  wrapper.appendChild(intro);
}

function aceApplyPolishOnce() {
  aceFixLogoPaths();
  acePolishProductionCopyOnce();
  aceAddProfessionalIntro();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aceApplyPolishOnce);
} else {
  aceApplyPolishOnce();
}

var aceLogoObserverQueued = false;
var aceLogoObserver = new MutationObserver(function () {
  if (aceLogoObserverQueued) return;
  aceLogoObserverQueued = true;
  window.setTimeout(function () {
    aceLogoObserverQueued = false;
    aceFixLogoPaths();
    aceAddProfessionalIntro();
  }, 250);
});

aceLogoObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
