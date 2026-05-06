import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dayTypes = ["Throw Day", "Bullpen Day", "Recovery Day", "Lift Day", "Off / Mobility"];
const throwingTypes = ["Off", "Recovery Throw", "Light Catch", "Long Toss", "Medium Intent", "High Intent", "Bullpen"];

const emptyProfile = {
  name: "",
  age: "",
  level: "",
  hand: "",
  goals: "",
  currentVelo: "",
  targetVelo: "",
  soreness: "",
};

const assessmentSections = [
  { title: "Setup", tags: ["Poor Setup", "Balance Issue", "Posture Issue", "Rushed Start"] },
  { title: "Rhythm", tags: ["Rushed Tempo", "No Flow", "Stuck At Leg Lift", "Robotic Delivery"] },
  { title: "Timing", tags: ["Late Arm", "Early Arm", "Poor Hip Shoulder Timing", "Poor Separation"] },
  { title: "Direction", tags: ["Poor Direction", "Spinning Off", "Falling Glove Side", "Drifting"] },
  { title: "Back Leg", tags: ["Back Leg Collapse", "Pushes Instead Of Moves", "Straight Leg Stiffness", "Poor Back Side Load"] },
  { title: "Front Side", tags: ["Opening Early", "Glove Pull", "Poor Lead Leg Block", "Soft Front Leg", "Landing Open"] },
  { title: "Arm Action", tags: ["Muscling Arm", "Long Arm Path", "Short Forced Arm", "Restricted Arm", "Late Arm"] },
  { title: "Release / Command", tags: ["Arm-Side Miss", "Glove-Side Miss", "Missing Up", "Missing Down", "Poor Repeatability", "Command Issue"] },
  { title: "Athlete Type", tags: ["High Effort Thrower", "Low Intent Mover", "Strong But Inefficient", "Young Developing Athlete", "Unstable Mover"] },
];

const drills = [
  drill("Load & Lift Drill", 1, "Back Leg", "Awareness", ["Back Leg Collapse", "Poor Back Side Load", "Balance Issue"], "Low", "Dry Work", "2–3 x 5", "Feel the back side load without dropping early."),
  drill("Peak Lift Holds", 1, "Setup", "Awareness", ["Balance Issue", "Posture Issue", "Poor Setup"], "Low", "Dry Work", "3 x 5 sec", "Own the position before moving."),
  drill("Slow Motion Delivery", 1, "Timing", "Awareness", ["Rushed Tempo", "Poor Hip Shoulder Timing", "Poor Repeatability"], "Low", "Dry Work / Flat Ground", "2 x 4", "Move at 50% and find where the pattern breaks."),
  drill("Step Back Drill", 2, "Direction", "Movement", ["Back Leg Collapse", "Poor Direction", "Rushed Tempo"], "Medium", "Flat Ground", "2–3 x 5 throws", "Create rhythm and move forward instead of down."),
  drill("Rocker Step Drill", 2, "Rhythm", "Movement", ["No Flow", "Rushed Tempo", "Poor Direction"], "Medium", "Flat Ground", "2 x 6 throws", "Feel forward move without rushing."),
  drill("Walking Windup", 2, "Rhythm", "Movement", ["Robotic Delivery", "No Flow", "Low Intent Mover"], "Medium", "Flat Ground", "2 x 5 throws", "Add natural athletic movement."),
  drill("Wall Back Leg Drill", 3, "Back Leg", "Constraint", ["Back Leg Collapse", "Posture Issue", "Poor Back Side Load"], "Low", "Dry Work", "2 x 5", "Use the wall to prevent early collapse."),
  drill("Box Stride Drill", 3, "Lead Leg Block", "Constraint", ["Poor Lead Leg Block", "Soft Front Leg", "Poor Direction"], "Medium", "Flat Ground", "2 x 5", "Move into the front side without drifting."),
  drill("Stride Direction Line Drill", 3, "Direction", "Constraint", ["Poor Direction", "Landing Open", "Spinning Off"], "Medium", "Flat Ground", "2 x 6", "Stay on the line into foot strike."),
  drill("Separation Step Drill", 2, "Timing", "Movement", ["Poor Separation", "Opening Early", "Late Arm"], "Medium", "Flat Ground", "2 x 5", "Feel hips move while shoulders stay closed."),
  drill("Closed Front Side Throwing", 4, "Front Side", "Integration", ["Opening Early", "Glove Pull", "Arm-Side Miss"], "Medium", "Flat Ground", "2 x 6", "Throw while holding the front side longer."),
  drill("Step-Behind Throws", 4, "Energy Transfer", "Dynamic", ["Muscling Arm", "Low Intent Mover", "No Flow"], "High", "Flat Ground", "2 x 5", "Let momentum create arm speed."),
  drill("Momentum Throws", 4, "Energy Transfer", "Dynamic", ["Muscling Arm", "Using Lower Half Incorrectly", "Low Intent Mover"], "High", "Flat Ground", "2 x 5", "Let the body create the arm speed."),
  drill("Target Box Drill", 1, "Command", "Awareness", ["Command Issue", "Arm-Side Miss", "Glove-Side Miss"], "Low-Medium", "Flat Ground", "2 x 8", "Define the target window."),
  drill("Count-Based Bullpen", 5, "Game IQ", "Game Transfer", ["Command Issue", "Game Feel", "Poor Repeatability"], "Medium-High", "Mound", "3–5 counts", "Apply command inside game counts."),
];

const armCare = [
  arm("Band ER at Side", "Pre-Throw", ["Posterior Cuff", "Infraspinatus", "Teres Minor"], ["External Rotation", "Shoulder Stability", "Arm Prep"], "Low", ["Band"], "2 x 12"),
  arm("90/90 Band ER", "Pre-Throw", ["Posterior Cuff", "Infraspinatus", "Teres Minor"], ["Layback Prep", "External Rotation", "Shoulder Stability"], "Low", ["Band"], "2 x 10"),
  arm("Scap Push-Up", "Pre-Throw", ["Serratus Anterior", "Scap Stabilizers"], ["Protraction", "Scap Control", "Shoulder Blade Awareness"], "Low", ["Bodyweight"], "2 x 10"),
  arm("Serratus Wall Slide", "Pre-Throw", ["Serratus Anterior", "Low Trap"], ["Upward Rotation", "Overhead Prep", "Scap Control"], "Low", ["Wall", "Band"], "2 x 8"),
  arm("Open Book", "Pre-Throw", ["Thoracic Spine", "Lats", "Pec Minor"], ["Thoracic Rotation", "Mobility", "Separation Prep"], "Low", ["Bodyweight"], "2 x 6 each"),
  arm("Wrist Pronation/Supination", "Pre-Throw", ["Pronator Teres", "Supinator", "Forearm"], ["Elbow Prep", "Forearm Control", "Grip Prep"], "Low", ["Hammer/DB"], "2 x 10 each"),
  arm("Prone YTW", "Post-Throw", ["Low Trap", "Mid Trap", "Rear Delt"], ["Scap Strength", "Posture", "Recovery"], "Low", ["Bench/Floor"], "2 x 8"),
  arm("Catch & Reverse Throw", "Post-Throw", ["Posterior Cuff", "Biceps"], ["Deceleration", "Arm Protection"], "Low-Medium", ["Partner"], "2 x 6"),
  arm("Banded ER Eccentric", "Post-Throw", ["Posterior Cuff"], ["Decel Strength", "Control"], "Low", ["Band"], "2 x 8"),
  arm("Biceps Eccentric", "Post-Throw", ["Biceps"], ["Elbow Protection", "Deceleration"], "Low-Medium", ["DB"], "2 x 8"),
  arm("T-Spine Extension Over Bench", "Recovery Day", ["Thoracic Spine"], ["Mobility", "Extension"], "Low", ["Bench"], "1 min"),
  arm("Lat Elongation w/ Lateral Flexion", "Recovery Day", ["Lats"], ["Mobility", "Lengthening"], "Low", ["Bodyweight"], "30 sec"),
  arm("Pec Myofascial Release", "Recovery Day", ["Pec Minor"], ["Soft Tissue", "Recovery"], "Low", ["Ball"], "2 min"),
  arm("Posterior Wall Angels", "Recovery Day", ["Mid Trap", "Low Trap", "Posterior Shoulder", "Thoracic Spine"], ["Posture", "Mobility", "Scap Control"], "Low", ["Wall"], "2 x 10-20"),
  arm("Tripod ER/IR Dribbles", "Medium Intent Day", ["Rotator Cuff"], ["Stability", "Coordination"], "Low", ["Ball"], "20 sec"),
  arm("Low Trap Raise Stability Ball", "Medium Intent Day", ["Low Trap"], ["Scap Strength"], "Low-Medium", ["Ball"], "2 x 12"),
  arm("Fingertip Farmer Carries", "Intense Throwing Day", ["Forearm"], ["Grip", "Stability"], "Medium", ["DB"], "45 sec"),
  arm("Forearm Plyo Drops", "Intense Throwing Day", ["Forearm"], ["Elasticity", "Decel"], "Medium", ["Ball"], "max reps"),
];

function drill(name, level, category, type, fixes, intent, environment, prescription, note) {
  return { id: `drill-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, level, category, type, fixes, intent, environment, prescription, note, video: "Video placeholder" };
}

function arm(name, block, muscleTags, functionTags, intensity, equipment, prescription) {
  return { id: `arm-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, block, muscleTags, functionTags, intensity, equipment, prescription, video: "Video placeholder" };
}

function createEmptyPlan() {
  return Object.fromEntries(
    days.map((day) => [
      day,
      {
        type: "Throw Day",
        throwing: "Light Catch",
        throwingDetails: "Coach sets distance, volume, and intensity.",
        drills: [],
        arm: [],
        notes: "",
      },
    ])
  );
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function AceCoachAppPreview() {
  const [session, setSession] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [athletes, setAthletes] = useState(() => readStorage("ace-athletes", []));
  const [activeAthleteId, setActiveAthleteId] = useState(() => readStorage("ace-active-athlete", null));
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [newAthleteProfile, setNewAthleteProfile] = useState(emptyProfile);
  const [profile, setProfile] = useState(emptyProfile);

  const [primaryIssues, setPrimaryIssues] = useState([]);
  const [secondaryIssues, setSecondaryIssues] = useState([]);
  const [athleteType, setAthleteType] = useState([]);
  const [primarySoreness, setPrimarySoreness] = useState([]);

  const isAthletePortal = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "athlete";
  const portalAthleteId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("athleteId") : null;
  const [appMode, setAppMode] = useState(isAthletePortal ? "athlete" : "coach");
  const [previewAthleteId, setPreviewAthleteId] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [viewingWeek, setViewingWeek] = useState(null);

  const [selectedDrills, setSelectedDrills] = useState([]);
  const [selectedArm, setSelectedArm] = useState([]);
  const [weekName, setWeekName] = useState("Week 1");
  const [phase, setPhase] = useState("Build");
  const [plan, setPlan] = useState(() => createEmptyPlan());

  const activeAthlete = athletes.find((a) => String(a.id) === String(activeAthleteId)) || null;
  const unlocked = primaryIssues.length > 0;
  const issueTags = useMemo(() => [...primaryIssues, ...secondaryIssues], [primaryIssues, secondaryIssues]);

  const sorenessToMuscleTags = {
    "Front Shoulder": ["Pec Minor", "Pec Major", "Anterior Shoulder", "Subscapularis"],
    "Back Shoulder": ["Posterior Cuff", "Infraspinatus", "Teres Minor", "Rear Delt"],
    "Elbow / Biceps": ["Biceps", "Anterior Elbow"],
    Forearm: ["Forearm", "Wrist Flexors", "Wrist Extensors", "Pronator Teres", "Supinator"],
    "Lat / Triceps": ["Lat", "Lats", "Triceps Long Head", "Teres Major"],
    "Neck / Trap": ["Upper Trap", "Levator Scapulae", "Neck"],
    "Scap / Upper Back": ["Low Trap", "Mid Trap", "Rhomboids", "Scap Stabilizers", "Serratus Anterior"],
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => localStorage.setItem("ace-athletes", JSON.stringify(athletes)), [athletes]);
  useEffect(() => localStorage.setItem("ace-active-athlete", JSON.stringify(activeAthleteId)), [activeAthleteId]);

  useEffect(() => {
    if (!activeAthlete) return;
    setProfile({
      name: activeAthlete.name || "",
      age: activeAthlete.age || "",
      level: activeAthlete.level || "",
      hand: activeAthlete.hand || "",
      goals: activeAthlete.goals || "",
      currentVelo: activeAthlete.currentVelo || "",
      targetVelo: activeAthlete.targetVelo || "",
      soreness: activeAthlete.soreness || "",
    });
  }, [activeAthlete]);

  const recommendedDrills = useMemo(() => {
    if (!issueTags.length) return drills;
    const matches = drills.filter((d) => d.fixes.some((fix) => issueTags.includes(fix)));
    return matches.length ? matches : drills;
  }, [issueTags]);

  const recommendedArmCare = useMemo(() => {
    if (!primarySoreness.length) return armCare;
    const targetMuscles = primarySoreness.flatMap((s) => sorenessToMuscleTags[s] || []);
    const matches = armCare.filter((a) =>
      a.muscleTags.some((muscle) =>
        targetMuscles.some((target) =>
          muscle.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(muscle.toLowerCase())
        )
      )
    );
    return matches.length ? matches : armCare;
  }, [primarySoreness]);

  const signUpCoach = async () => {
    const { data, error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword });
    if (error) {
      setSaveStatus(error.message);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, role: "coach", full_name: loginEmail });
    }
    setSaveStatus("Coach account created. Check email if confirmation is required.");
  };

  const loginCoach = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setSaveStatus(error ? error.message : "Logged in.");
  };

  const logoutCoach = async () => {
    await supabase.auth.signOut();
    setSaveStatus("Logged out.");
  };

  const toggle = (value, list, setList) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const selectAthlete = (athleteId) => {
    setActiveAthleteId(athleteId);
    setViewingWeek(null);
    setShowAddAthlete(false);
    setActiveStep(1);
  };

  const saveAthlete = async () => {
    if (!newAthleteProfile.name.trim()) {
      setSaveStatus("Add an athlete name first.");
      return;
    }

    const newAthlete = {
      id: Date.now(),
      ...newAthleteProfile,
      assessments: [],
      plans: [],
      activeWeekId: null,
      dailyCompletions: [],
      coachNotes: "",
      veloLog: newAthleteProfile.currentVelo
        ? [{ id: Date.now(), date: new Date().toLocaleDateString(), velo: newAthleteProfile.currentVelo, note: "Starting velo" }]
        : [],
    };

    setAthletes((prev) => [newAthlete, ...prev]);
    setActiveAthleteId(newAthlete.id);
    setNewAthleteProfile(emptyProfile);
    setShowAddAthlete(false);
    setActiveStep(2);
    setSaveStatus(`Created athlete: ${newAthlete.name}.`);

    if (session?.user) {
      const { error } = await supabase.from("athletes").insert({
        coach_id: session.user.id,
        name: newAthlete.name,
        age: newAthlete.age,
        level: newAthlete.level,
        hand: newAthlete.hand,
        goals: newAthlete.goals,
        current_velo: newAthlete.currentVelo,
        target_velo: newAthlete.targetVelo,
        soreness: newAthlete.soreness,
      });
      if (error) setSaveStatus(`Created locally, but database save failed: ${error.message}`);
    }
  };

  const saveAssessmentToAthlete = () => {
    if (!activeAthlete || !primaryIssues.length) {
      setSaveStatus("Select an athlete and at least one primary issue.");
      return;
    }

    const assessment = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      profile,
      primaryIssues,
      secondaryIssues,
      athleteType,
      primarySoreness,
    };

    setAthletes((prev) =>
      prev.map((a) =>
        a.id === activeAthlete.id
          ? { ...a, assessments: [assessment, ...(a.assessments || [])] }
          : a
      )
    );

    setSaveStatus(`Assessment saved for ${activeAthlete.name}. Next: pick drills.`);
    setActiveStep(3);
  };

  const autoBuildWeek = () => {
    const pool = selectedDrills.length ? selectedDrills : recommendedDrills;
    const armPool = selectedArm.length ? selectedArm : recommendedArmCare;
    const pre = armPool.filter((item) => item.block === "Pre-Throw");
    const post = armPool.filter((item) => item.block === "Post-Throw");
    const recovery = armPool.filter((item) => item.block === "Recovery Day");
    const medium = armPool.filter((item) => item.block === "Medium Intent Day");
    const intense = armPool.filter((item) => item.block === "Intense Throwing Day");

    const built = createEmptyPlan();
    built.Monday = dayPlan("Throw Day", "Medium Intent", pool.slice(0, 2), [...pre.slice(0, 3), ...post.slice(0, 1)], "Clean movement day. Own the main mechanical focus.");
    built.Tuesday = dayPlan("Recovery Day", "Recovery Throw", pool.slice(2, 3), recovery.slice(0, 5), "Low stress recovery and arm care emphasis.");
    built.Wednesday = dayPlan("Throw Day", "High Intent", pool.slice(3, 6), [...pre.slice(2, 5), ...medium.slice(0, 3)], "Medium/high intent build day. Add athletic movement.");
    built.Thursday = dayPlan("Off / Mobility", "Off", [], recovery.slice(5, 10), "Restore range and reduce tension.");
    built.Friday = dayPlan("Bullpen Day", "Bullpen", pool.slice(6, 9), [...pre.slice(0, 3), ...intense.slice(0, 3), ...post.slice(0, 2)], "Transfer the weekly focus to the mound.");
    built.Saturday = dayPlan("Recovery Day", "Recovery Throw", [], recovery.slice(0, 5), "Post-bullpen recovery.");
    built.Sunday = dayPlan("Off / Mobility", "Off", [], recovery.slice(0, 4), "Optional reset day.");

    setPlan(built);
    setActiveStep(5);
    setSaveStatus("Smart auto-build complete. Review it before saving.");
  };

  const dayPlan = (type, throwing, dayDrills, dayArm, notes) => ({
    type,
    throwing,
    throwingDetails: throwing === "Off" ? "No throwing." : "Coach sets distance, volume, and intensity.",
    drills: dayDrills,
    arm: dayArm,
    notes,
  });

  const saveWeekToAthlete = () => {
    if (!activeAthlete) {
      setSaveStatus("Create or select an athlete before saving.");
      return;
    }
    const savedWeek = { id: Date.now(), weekName: weekName || `Week ${(activeAthlete.plans || []).length + 1}`, phase, createdAt: new Date().toLocaleDateString(), plan };
    setAthletes((prev) => prev.map((a) => (a.id === activeAthlete.id ? { ...a, activeWeekId: savedWeek.id, plans: [savedWeek, ...(a.plans || [])] } : a)));
    setSaveStatus(`Saved ${savedWeek.weekName} to ${activeAthlete.name}.`);
    setActiveStep(1);
  };

  const setActiveWeek = (weekId) => {
    if (!activeAthlete) return;
    setAthletes((prev) => prev.map((a) => (a.id === activeAthlete.id ? { ...a, activeWeekId: weekId } : a)));
    setSaveStatus("Active week updated.");
  };

  const duplicateLastWeek = () => {
    if (!activeAthlete?.plans?.length) return;
    setPlan(JSON.parse(JSON.stringify(activeAthlete.plans[0].plan)));
    setWeekName(`${activeAthlete.plans[0].weekName} Copy`);
    setActiveStep(5);
  };

  const editSavedWeek = (week) => {
    setPlan(JSON.parse(JSON.stringify(week.plan)));
    setWeekName(`${week.weekName} Edit`);
    setViewingWeek(null);
    setActiveStep(5);
  };

  const clearCurrentPlan = () => {
    setPlan(createEmptyPlan());
    setSelectedDrills([]);
    setSelectedArm([]);
    setSaveStatus("Current plan cleared.");
  };

  const updateAthleteNotes = (athleteId, field, value) => {
    setAthletes((prev) => prev.map((a) => (a.id === athleteId ? { ...a, [field]: value } : a)));
  };

  const addDailyCompletion = (athleteId, weekId, day, completion) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const filtered = (a.dailyCompletions || []).filter((log) => !(log.weekId === weekId && log.day === day));
        return { ...a, dailyCompletions: [{ id: Date.now(), weekId, day, date: new Date().toLocaleDateString(), ...completion }, ...filtered] };
      })
    );
    setSaveStatus("Daily work marked complete.");
  };

  const addVeloEntry = (athleteId, entry) => {
    setAthletes((prev) => prev.map((a) => (a.id === athleteId ? { ...a, veloLog: [{ id: Date.now(), ...entry }, ...(a.veloLog || [])] } : a)));
    setSaveStatus("Velo entry added.");
  };

  const assignToDay = (day, item, kind) => {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [kind]: prev[day][kind].some((x) => x.id === item.id) ? prev[day][kind] : [...prev[day][kind], item],
      },
    }));
  };

  const removeFromDay = (day, id, kind) => {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [kind]: prev[day][kind].filter((x) => x.id !== id) },
    }));
  };

  const onDragStart = (event, item, kind) => {
    event.dataTransfer.setData("application/json", JSON.stringify({ item, kind }));
  };

  const onDrop = (event, day) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const { item, kind } = JSON.parse(raw);
    assignToDay(day, item, kind);
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
        <img
          src="/ace-logo.png"
          alt="ACE watermark"
          className="w-[70vw] max-w-[900px] object-contain"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-6 border-b border-red-700/50 pb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shadow-red-950/30 flex items-center justify-center">
                <img src="/ace-logo.png" alt="ACE logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                  {appMode === "coach" ? "ACE Coach Console" : "ACE Athlete Portal"}
                </h1>
                <p className="text-zinc-400">
                  {appMode === "coach" ? "Manage athletes → assess → prescribe → save weekly plans" : "Today’s work → completion → velo tracking"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {appMode === "coach" ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-400">Coach View</div>
              ) : (
                <button onClick={() => { setAppMode("coach"); setPreviewAthleteId(null); }} className="bg-white text-black rounded-2xl px-4 py-3 text-sm font-black">
                  Back to Coach View
                </button>
              )}
              {session ? (
                <button onClick={logoutCoach} className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm font-black">Logout</button>
              ) : null}
            </div>
          </div>
        </header>

        {!session && appMode === "coach" && (
          <AuthBox loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} loginCoach={loginCoach} signUpCoach={signUpCoach} />
        )}

        {appMode === "coach" && (
          <nav className="grid md:grid-cols-5 gap-3 mb-6">
            {["Athletes", "Assess", "Drills", "Arm Care", "Weekly Builder"].map((label, index) => {
              const locked = index > 1 && !unlocked;
              return (
                <button key={label} disabled={locked} onClick={() => !locked && setActiveStep(index + 1)} className={`rounded-2xl border p-4 text-left ${activeStep === index + 1 ? "bg-red-700/20 border-red-600" : "bg-zinc-950 border-zinc-800"} ${locked ? "opacity-40 cursor-not-allowed" : ""}`}>
                  <div className="text-xs text-zinc-500 uppercase">Step {index + 1}</div>
                  <div className="font-black">{label}</div>
                </button>
              );
            })}
          </nav>
        )}

        {saveStatus && <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">{saveStatus}</div>}

        {appMode === "athlete" && <AthleteMode athletes={athletes} lockedAthleteId={portalAthleteId || previewAthleteId} addDailyCompletion={addDailyCompletion} addVeloEntry={addVeloEntry} />}

        {appMode === "coach" && activeStep === 1 && (
          <AthleteManager
            profile={newAthleteProfile}
            setProfile={setNewAthleteProfile}
            showAddAthlete={showAddAthlete}
            setShowAddAthlete={setShowAddAthlete}
            saveAthlete={saveAthlete}
            athletes={athletes}
            activeAthleteId={activeAthleteId}
            selectAthlete={selectAthlete}
            duplicateLastWeek={duplicateLastWeek}
            setActiveWeek={setActiveWeek}
            viewingWeek={viewingWeek}
            setViewingWeek={setViewingWeek}
            editSavedWeek={editSavedWeek}
            openAthletePreview={(athleteId) => { setPreviewAthleteId(athleteId); setAppMode("athlete"); }}
            updateAthleteNotes={updateAthleteNotes}
            setActiveStep={setActiveStep}
          />
        )}

        {appMode === "coach" && activeStep === 2 && (
          <Assessment activeAthlete={activeAthlete} profile={profile} setProfile={setProfile} primaryIssues={primaryIssues} setPrimaryIssues={setPrimaryIssues} secondaryIssues={secondaryIssues} setSecondaryIssues={setSecondaryIssues} athleteType={athleteType} setAthleteType={setAthleteType} primarySoreness={primarySoreness} setPrimarySoreness={setPrimarySoreness} toggle={toggle} saveAssessmentToAthlete={saveAssessmentToAthlete} />
        )}

        {appMode === "coach" && activeStep === 3 && <Database title="Recommended Drill Database" items={recommendedDrills} selected={selectedDrills} setSelected={setSelectedDrills} kind="drills" onDragStart={onDragStart} />}

        {appMode === "coach" && activeStep === 4 && <ArmCare items={armCare} recommendedItems={recommendedArmCare} selected={selectedArm} setSelected={setSelectedArm} onDragStart={onDragStart} />}

        {appMode === "coach" && activeStep === 5 && (
          <WeeklyBuilder activeAthlete={activeAthlete} weekName={weekName} setWeekName={setWeekName} phase={phase} setPhase={setPhase} plan={plan} setPlan={setPlan} selectedDrills={selectedDrills} selectedArm={selectedArm} recommendedDrills={recommendedDrills} recommendedArmCare={recommendedArmCare} onDragStart={onDragStart} onDrop={onDrop} removeFromDay={removeFromDay} saveWeekToAthlete={saveWeekToAthlete} autoBuildWeek={autoBuildWeek} clearCurrentPlan={clearCurrentPlan} />
        )}
      </div>
    </main>
  );
}

function AuthBox({ loginEmail, setLoginEmail, loginPassword, setLoginPassword, loginCoach, signUpCoach }) {
  return (
    <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 mb-6">
      <div className="flex justify-between gap-4 flex-wrap items-end">
        <div>
          <h2 className="text-xl font-black">Coach Login</h2>
          <p className="text-zinc-500 text-sm">Local app still works, but login saves athletes to Supabase when available.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
          <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" type="password" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
          <button onClick={loginCoach} className="bg-white text-black rounded-xl px-4 py-2 font-black">Login</button>
          <button onClick={signUpCoach} className="bg-red-700 text-white rounded-xl px-4 py-2 font-black">Sign Up</button>
        </div>
      </div>
    </section>
  );
}

function AthleteManager({ profile, setProfile, showAddAthlete, setShowAddAthlete, saveAthlete, athletes, activeAthleteId, selectAthlete, duplicateLastWeek, setActiveWeek, viewingWeek, setViewingWeek, editSavedWeek, openAthletePreview, updateAthleteNotes, setActiveStep }) {
  const activeAthlete = athletes.find((a) => String(a.id) === String(activeAthleteId));

  return (
    <section className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Athletes</h2>
            <button onClick={() => setShowAddAthlete(!showAddAthlete)} className="bg-red-700 text-white rounded-xl px-3 py-2 text-sm font-black">Add</button>
          </div>

          {showAddAthlete && (
            <div className="space-y-2 mb-4">
              <ProfileFields profile={profile} setProfile={setProfile} />
              <button onClick={saveAthlete} className="w-full bg-white text-black rounded-xl py-3 font-black">Save Athlete</button>
            </div>
          )}

          <div className="space-y-2">
            {athletes.length ? athletes.map((athlete) => (
              <button key={athlete.id} onClick={() => selectAthlete(athlete.id)} className={`w-full text-left rounded-2xl border p-4 ${String(activeAthleteId) === String(athlete.id) ? "border-red-600 bg-red-700/20" : "border-zinc-800 bg-black"}`}>
                <div className="font-black">{athlete.name}</div>
                <div className="text-xs text-zinc-500">{athlete.level || "No level"} · {athlete.hand || "No hand"}</div>
              </button>
            )) : <p className="text-zinc-500 text-sm">No athletes yet. Add one to start.</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {!activeAthlete ? (
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 text-zinc-500">Select or create an athlete.</div>
        ) : (
          <>
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <div className="flex justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-3xl font-black">{activeAthlete.name}</h2>
                  <p className="text-zinc-400">{activeAthlete.goals || "No goals added yet."}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setActiveStep(2)} className="bg-red-700 rounded-xl px-4 py-2 font-black">Assess</button>
                  <button onClick={duplicateLastWeek} className="bg-zinc-800 rounded-xl px-4 py-2 font-black">Duplicate Last Week</button>
                  <button onClick={() => openAthletePreview(activeAthlete.id)} className="bg-white text-black rounded-xl px-4 py-2 font-black">Athlete View</button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <Stat label="Current Velo" value={activeAthlete.currentVelo ? `${activeAthlete.currentVelo} mph` : "--"} />
              <Stat label="Target Velo" value={activeAthlete.targetVelo ? `${activeAthlete.targetVelo} mph` : "--"} />
              <Stat label="Plans Saved" value={(activeAthlete.plans || []).length} />
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <h3 className="font-black text-red-400 mb-3">Saved Weeks</h3>
              {(activeAthlete.plans || []).length ? activeAthlete.plans.map((week) => (
                <div key={week.id} className="bg-black border border-zinc-800 rounded-2xl p-4 mb-3">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-black">{week.weekName}</div>
                      <div className="text-xs text-zinc-500">{week.phase} · {week.createdAt}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setActiveWeek(week.id)} className="bg-red-700 rounded-xl px-3 py-2 text-sm font-black">Set Active</button>
                      <button onClick={() => setViewingWeek(viewingWeek?.id === week.id ? null : week)} className="bg-zinc-800 rounded-xl px-3 py-2 text-sm font-black">View</button>
                      <button onClick={() => editSavedWeek(week)} className="bg-white text-black rounded-xl px-3 py-2 text-sm font-black">Edit</button>
                    </div>
                  </div>
                  {viewingWeek?.id === week.id && <WeekPreview week={week} />}
                </div>
              )) : <p className="text-zinc-500 text-sm">No saved weeks yet.</p>}
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <h3 className="font-black text-red-400 mb-3">Coach Notes</h3>
              <textarea value={activeAthlete.coachNotes || ""} onChange={(e) => updateAthleteNotes(activeAthlete.id, "coachNotes", e.target.value)} placeholder="Private coach notes..." className="w-full bg-black border border-zinc-800 rounded-xl p-3 min-h-28" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ProfileFields({ profile, setProfile }) {
  const update = (field, value) => setProfile({ ...profile, [field]: value });
  return (
    <div className="grid md:grid-cols-2 gap-2">
      <input value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder="Name" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
      <input value={profile.age} onChange={(e) => update("age", e.target.value)} placeholder="Age" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
      <input value={profile.level} onChange={(e) => update("level", e.target.value)} placeholder="Level" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
      <input value={profile.hand} onChange={(e) => update("hand", e.target.value)} placeholder="Throwing Hand" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
      <input value={profile.currentVelo} onChange={(e) => update("currentVelo", e.target.value)} placeholder="Current Velo" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
      <input value={profile.targetVelo} onChange={(e) => update("targetVelo", e.target.value)} placeholder="Target Velo" className="bg-black border border-zinc-800 rounded-xl px-3 py-2" />
      <input value={profile.soreness} onChange={(e) => update("soreness", e.target.value)} placeholder="Soreness" className="bg-black border border-zinc-800 rounded-xl px-3 py-2 md:col-span-2" />
      <textarea value={profile.goals} onChange={(e) => update("goals", e.target.value)} placeholder="Goals" className="bg-black border border-zinc-800 rounded-xl p-3 md:col-span-2" />
    </div>
  );
}

function Assessment({ activeAthlete, profile, setProfile, primaryIssues, setPrimaryIssues, secondaryIssues, setSecondaryIssues, athleteType, setAthleteType, primarySoreness, setPrimarySoreness, toggle, saveAssessmentToAthlete }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <h2 className="text-2xl font-black">Assessment</h2>
        <p className="text-zinc-400">{activeAthlete ? `Building plan for ${activeAthlete.name}` : "Select an athlete first."}</p>
      </div>

      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <h3 className="font-black text-red-400 mb-3">Athlete Profile</h3>
        <ProfileFields profile={profile} setProfile={setProfile} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {assessmentSections.map((section) => (
          <div key={section.title} className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
            <h3 className="font-black text-red-400 mb-3">{section.title}</h3>
            <div className="flex flex-wrap gap-2">
              {section.tags.map((tag) => {
                const isPrimary = primaryIssues.includes(tag);
                const isSecondary = secondaryIssues.includes(tag);
                const isType = athleteType.includes(tag);
                const isAthleteTypeSection = section.title === "Athlete Type";
                return (
                  <button key={tag} onClick={() => isAthleteTypeSection ? toggle(tag, athleteType, setAthleteType) : isPrimary ? toggle(tag, primaryIssues, setPrimaryIssues) : isSecondary ? toggle(tag, secondaryIssues, setSecondaryIssues) : toggle(tag, primaryIssues, setPrimaryIssues)} className={`rounded-full border px-3 py-2 text-sm ${isPrimary ? "bg-red-700 border-red-500" : isSecondary ? "bg-zinc-700 border-zinc-500" : isType ? "bg-white text-black border-white" : "bg-black border-zinc-800"}`}>
                    {tag}
                  </button>
                );
              })}
            </div>
            {section.title !== "Athlete Type" && <p className="text-xs text-zinc-500 mt-3">Click once for primary. Click selected primary again to remove. Use secondary below if needed.</p>}
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <h3 className="font-black text-red-400 mb-3">Secondary Issues</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(assessmentSections.flatMap((s) => s.title === "Athlete Type" ? [] : s.tags))].map((tag) => (
            <button key={tag} onClick={() => toggle(tag, secondaryIssues, setSecondaryIssues)} className={`rounded-full border px-3 py-2 text-sm ${secondaryIssues.includes(tag) ? "bg-zinc-700 border-zinc-500" : "bg-black border-zinc-800"}`}>{tag}</button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <h3 className="font-black text-red-400 mb-3">Primary Soreness / Build-Up Area</h3>
        <div className="flex flex-wrap gap-2">
          {["Front Shoulder", "Back Shoulder", "Elbow / Biceps", "Forearm", "Lat / Triceps", "Neck / Trap", "Scap / Upper Back"].map((soreness) => (
            <button key={soreness} onClick={() => toggle(soreness, primarySoreness, setPrimarySoreness)} className={`rounded-full border px-3 py-2 text-sm ${primarySoreness.includes(soreness) ? "bg-red-700 border-red-500" : "bg-black border-zinc-800"}`}>{soreness}</button>
          ))}
        </div>
      </div>

      <button onClick={saveAssessmentToAthlete} disabled={!activeAthlete || !primaryIssues.length} className="w-full bg-red-700 text-white rounded-xl py-3 font-black disabled:opacity-40">Save Assessment</button>
    </section>
  );
}

function Database({ title, items, selected, setSelected, kind, onDragStart }) {
  const toggleSelected = (item) => setSelected(selected.some((x) => x.id === item.id) ? selected.filter((x) => x.id !== item.id) : [...selected, item]);

  return (
    <section>
      <div className="flex justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="text-zinc-400">Select items or drag them into the weekly builder.</p>
        </div>
        <div className="text-sm text-zinc-500">Selected: {selected.length}</div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} draggable onDragStart={(e) => onDragStart(e, item, kind)} className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 cursor-grab">
            <div className="flex justify-between gap-2">
              <div>
                <h3 className="font-black">{item.name}</h3>
                <p className="text-xs text-zinc-500">{item.category} · {item.type} · {item.environment}</p>
              </div>
              <button onClick={() => toggleSelected(item)} className={`rounded-xl px-3 py-2 text-xs font-black ${selected.some((x) => x.id === item.id) ? "bg-red-700" : "bg-zinc-800"}`}>{selected.some((x) => x.id === item.id) ? "Added" : "Add"}</button>
            </div>
            <p className="text-sm text-zinc-400 mt-3">{item.note}</p>
            <div className="text-xs text-red-300 mt-3">{item.prescription}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArmCare({ items, recommendedItems, selected, setSelected, onDragStart }) {
  const shown = recommendedItems.length ? recommendedItems : items;
  return <Database title="Arm Care Database" items={shown} selected={selected} setSelected={setSelected} kind="arm" onDragStart={onDragStart} />;
}

function WeeklyBuilder({ activeAthlete, weekName, setWeekName, phase, setPhase, plan, setPlan, selectedDrills, selectedArm, recommendedDrills, recommendedArmCare, onDragStart, onDrop, removeFromDay, saveWeekToAthlete, autoBuildWeek, clearCurrentPlan }) {
  const updateDay = (day, field, value) => setPlan((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));

  return (
    <section>
      <div className="flex justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-black">Weekly Builder</h2>
          <p className="text-zinc-400">{activeAthlete ? `Saving to ${activeAthlete.name}` : "Select an athlete before saving."}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={weekName} onChange={(e) => setWeekName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-2" />
          <select value={phase} onChange={(e) => setPhase(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-2">
            <option>Build</option>
            <option>Strength</option>
            <option>Maintain</option>
            <option>Deload</option>
          </select>
          <button onClick={autoBuildWeek} className="bg-red-700 text-white rounded-xl px-4 py-2 font-black">Auto Build</button>
          <button onClick={clearCurrentPlan} className="bg-zinc-800 text-white rounded-xl px-4 py-2 font-black">Clear</button>
          <button onClick={saveWeekToAthlete} className="bg-white text-black rounded-xl px-4 py-2 font-black">Save Week</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 mb-5">
        <MiniLibrary title="Drills" items={selectedDrills.length ? selectedDrills : recommendedDrills.slice(0, 8)} kind="drills" onDragStart={onDragStart} />
        <MiniLibrary title="Arm Care" items={selectedArm.length ? selectedArm : recommendedArmCare.slice(0, 8)} kind="arm" onDragStart={onDragStart} />
        <div className="lg:col-span-2 rounded-3xl bg-zinc-950 border border-zinc-800 p-4 text-zinc-400 text-sm">
          Drag from the lists into a day, or press Auto Build. Manual editing stays simple so the app does not break during season.
        </div>
      </div>

      <div className="grid lg:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayPlan = plan[day];
          return (
            <div key={day} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, day)} className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 min-h-96">
              <h3 className="font-black text-red-400 mb-3">{day}</h3>
              <select value={dayPlan.type} onChange={(e) => updateDay(day, "type", e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-2 py-2 mb-2 text-sm">
                {dayTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <select value={dayPlan.throwing} onChange={(e) => updateDay(day, "throwing", e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-2 py-2 mb-2 text-sm">
                {throwingTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <textarea value={dayPlan.throwingDetails} onChange={(e) => updateDay(day, "throwingDetails", e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2 mb-3 text-sm" />
              <DayItems title="Drills" items={dayPlan.drills} day={day} kind="drills" removeFromDay={removeFromDay} />
              <DayItems title="Arm" items={dayPlan.arm} day={day} kind="arm" removeFromDay={removeFromDay} />
              <textarea value={dayPlan.notes} onChange={(e) => updateDay(day, "notes", e.target.value)} placeholder="Notes" className="w-full bg-black border border-zinc-800 rounded-xl p-2 mt-3 text-sm" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniLibrary({ title, items, kind, onDragStart }) {
  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4">
      <h3 className="font-black mb-3">{title}</h3>
      <div className="space-y-2 max-h-72 overflow-auto">
        {items.map((item) => (
          <div key={item.id} draggable onDragStart={(e) => onDragStart(e, item, kind)} className="bg-black border border-zinc-800 rounded-xl p-3 text-sm cursor-grab">
            <div className="font-black">{item.name}</div>
            <div className="text-xs text-zinc-500">{item.prescription}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayItems({ title, items, day, kind, removeFromDay }) {
  return (
    <div className="mb-3">
      <div className="text-xs text-zinc-500 uppercase mb-2">{title}</div>
      {items.length ? items.map((item) => (
        <div key={item.id} className="bg-black border border-zinc-800 rounded-xl p-2 mb-2 text-sm">
          <div className="flex justify-between gap-2">
            <span className="font-semibold">{item.name}</span>
            <button onClick={() => removeFromDay(day, item.id, kind)} className="text-red-400">×</button>
          </div>
          <div className="text-xs text-zinc-500">{item.prescription}</div>
        </div>
      )) : <p className="text-xs text-zinc-600">Drop {title.toLowerCase()} here.</p>}
    </div>
  );
}

function AthleteMode({ athletes, lockedAthleteId, addDailyCompletion, addVeloEntry }) {
  const [athleteId, setAthleteId] = useState(lockedAthleteId || athletes[0]?.id || "");
  const [veloInput, setVeloInput] = useState("");
  const [note, setNote] = useState("");
  const [effort, setEffort] = useState("Normal");

  const athlete = athletes.find((a) => String(a.id) === String(athleteId));
  const activeWeek = athlete?.activeWeekId ? (athlete.plans || []).find((p) => p.id === athlete.activeWeekId) : null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayPlan = activeWeek?.plan?.[today];
  const completedToday = (athlete?.dailyCompletions || []).find((log) => log.weekId === activeWeek?.id && log.day === today);
  const bestVelo = athlete?.veloLog?.length ? Math.max(...athlete.veloLog.map((v) => Number(v.velo)).filter(Boolean)) : null;
  const lastFiveVelo = (athlete?.veloLog || []).slice(0, 5);
  const preThrow = todayPlan?.arm?.filter((item) => item.block === "Pre-Throw") || [];
  const postThrow = todayPlan?.arm?.filter((item) => item.block !== "Pre-Throw") || [];

  const submitCompletion = () => {
    if (!athlete || !activeWeek) return;
    addDailyCompletion(athlete.id, activeWeek.id, today, { completed: true, effort, note });
    if (veloInput) {
      addVeloEntry(athlete.id, { date: new Date().toLocaleDateString(), velo: veloInput, note: note || `Logged from athlete mode on ${today}`, source: "Athlete Mode" });
      setVeloInput("");
    }
    setNote("");
  };

  return (
    <section className="max-w-5xl mx-auto">
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 mb-5">
        <div className="flex justify-between gap-4 flex-wrap items-center">
          <div>
            <h2 className="text-2xl font-black">{athlete ? athlete.name : "Athlete Portal"}</h2>
            <p className="text-zinc-400">Only today’s work, completion, and velo trend are shown.</p>
          </div>
          {!lockedAthleteId && (
            <select value={athleteId} onChange={(e) => setAthleteId(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-2">
              <option value="">Select Athlete</option>
              {athletes.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {!athlete && <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 text-zinc-500">No athlete profile found for this portal.</div>}

      {athlete && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-3xl bg-red-950/20 border border-red-800 p-5">
              <div className="text-xs text-red-300 uppercase font-black">Current Week Only</div>
              <h3 className="text-3xl font-black">Today: {today}</h3>
              <p className="text-zinc-400">{activeWeek?.weekName || "No active week assigned"}</p>
            </div>

            {completedToday && <div className="rounded-xl border border-green-800 bg-green-950/20 px-4 py-3 text-sm text-green-200">Today is complete · Effort: {completedToday.effort}</div>}

            {todayPlan ? (
              <>
                <PortalBlock title="1. Pre-Throw Activation" items={preThrow} empty="No pre-throw activation assigned today." />
                <PortalBlock title="2. Drill Work" items={todayPlan.drills} empty="No drill work assigned today." />
                <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
                  <div className="text-xs text-zinc-500 uppercase mb-3">3. Throwing</div>
                  <div className="bg-black border border-red-800 rounded-2xl p-4">
                    <div className="font-black">{todayPlan.throwing || "Off"}</div>
                    <div className="text-sm text-zinc-500">{todayPlan.throwingDetails || "Coach controls exact distance, volume, and intensity details."}</div>
                  </div>
                </div>
                <PortalBlock title="4. Post-Throw Recovery" items={postThrow} empty="No post-throw recovery assigned today." />
                {todayPlan.notes && <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5"><div className="text-xs text-zinc-500 uppercase mb-2">Coach Notes</div><p className="text-zinc-300">{todayPlan.notes}</p></div>}
              </>
            ) : <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 text-zinc-500">No work assigned for today.</div>}
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <div className="font-black text-red-400 mb-3">Submit Today</div>
              <input value={veloInput} onChange={(e) => setVeloInput(e.target.value)} placeholder="Velo today (optional)" className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 mb-3" />
              <select value={effort} onChange={(e) => setEffort(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 mb-3">
                <option>Easy</option><option>Normal</option><option>Hard</option><option>Sore / Limited</option>
              </select>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it feel?" className="w-full bg-black border border-zinc-800 rounded-xl p-3 mb-3" />
              <button onClick={submitCompletion} disabled={!activeWeek || !todayPlan} className="w-full bg-white text-black rounded-xl py-3 font-black disabled:opacity-40">Mark Complete + Save Velo</button>
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <div className="font-black text-red-400 mb-2">Velo Trend</div>
              <div className="text-sm text-zinc-400 mb-3">Best logged: {bestVelo ? `${bestVelo} mph` : "--"}</div>
              {lastFiveVelo.length ? lastFiveVelo.map((v) => <div key={v.id || `${v.date}-${v.velo}`} className="bg-black border border-zinc-800 rounded-xl p-3 mb-2"><div className="font-black">{v.velo} mph</div><div className="text-xs text-zinc-500">{v.date}</div>{v.note && <div className="text-xs text-zinc-400">{v.note}</div>}</div>) : <p className="text-zinc-500 text-sm">No velo entries yet.</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PortalBlock({ title, items, empty }) {
  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
      <div className="text-xs text-zinc-500 uppercase mb-3">{title}</div>
      {items.length ? items.map((item) => <div key={item.id} className="bg-black border border-zinc-800 rounded-2xl p-4 mb-3"><div className="font-black">{item.name}</div><div className="text-sm text-zinc-500">{item.prescription}</div></div>) : <p className="text-zinc-500">{empty}</p>}
    </div>
  );
}

function WeekPreview({ week }) {
  return (
    <div className="mt-4 grid md:grid-cols-2 gap-3">
      {days.map((day) => (
        <div key={day} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
          <div className="font-black text-red-400">{day}</div>
          <div className="text-sm text-zinc-400">{week.plan?.[day]?.throwing || "Off"}</div>
          <div className="text-xs text-zinc-500">Drills: {week.plan?.[day]?.drills?.length || 0} · Arm: {week.plan?.[day]?.arm?.length || 0}</div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
      <div className="text-xs text-zinc-500 uppercase">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}
