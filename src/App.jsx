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

const baseDrills = [
  ["Load & Lift Drill", 1, "Back Leg", "Awareness", ["Back Leg Collapse", "Poor Back Side Load", "Balance Issue"], "Low", "Dry Work", "2–3 x 5", "Feel the back side load without dropping early."],
  ["Peak Lift Holds", 1, "Setup", "Awareness", ["Balance Issue", "Posture Issue", "Poor Setup"], "Low", "Dry Work", "3 x 5 sec", "Own the position before moving."],
  ["Slow Motion Delivery", 1, "Timing", "Awareness", ["Rushed Tempo", "Poor Hip Shoulder Timing", "Poor Repeatability"], "Low", "Dry Work / Flat Ground", "2 x 4", "Move at 50% and find where the pattern breaks."],
  ["Single-Leg Balance Holds", 1, "Setup", "Control", ["Balance Issue", "Unstable Mover", "Posture Issue"], "Low", "Dry Work", "2 x 20 sec", "Build stability before adding intent."],
  ["Split Stance Holds", 1, "Lower Half", "Control", ["Poor Direction", "Back Leg Collapse", "Soft Front Leg"], "Low", "Dry Work", "2 x 20 sec", "Feel the body stacked between both legs."],
  ["Step Back Drill", 2, "Direction", "Movement", ["Back Leg Collapse", "Poor Direction", "Rushed Tempo"], "Medium", "Flat Ground", "2–3 x 5 throws", "Create rhythm and move forward instead of down."],
  ["Rocker Step Drill", 2, "Rhythm", "Movement", ["No Flow", "Rushed Tempo", "Poor Direction"], "Medium", "Flat Ground", "2 x 6 throws", "Feel forward move without rushing."],
  ["Walking Windup", 2, "Rhythm", "Movement", ["Robotic Delivery", "No Flow", "Low Intent Mover"], "Medium", "Flat Ground", "2 x 5 throws", "Add natural athletic movement."],
  ["Toe Tap Load Drill", 2, "Back Leg", "Rhythm", ["Poor Back Side Load", "Rushed Tempo", "Back Leg Collapse"], "Low-Medium", "Dry Work / Flat Ground", "2 x 5", "Use the toe tap to feel rhythm into the back side."],
  ["Glide Step Drill", 2, "Lower Half", "Movement", ["Pushes Instead Of Moves", "Poor Direction", "Drifting"], "Medium", "Flat Ground", "2 x 5", "Move forward smoothly without a hard drop."],
  ["Wall Back Leg Drill", 3, "Back Leg", "Constraint", ["Back Leg Collapse", "Posture Issue", "Poor Back Side Load"], "Low", "Dry Work", "2 x 5", "Use the wall to prevent early collapse."],
  ["Towel Under Heel", 3, "Back Leg", "Constraint", ["Back Leg Collapse", "Poor Back Side Load", "Ground Contact"], "Low", "Dry Work", "2 x 5", "Feel how the back foot interacts with the ground."],
  ["Box Stride Drill", 3, "Lead Leg Block", "Constraint", ["Poor Lead Leg Block", "Soft Front Leg", "Poor Direction"], "Medium", "Flat Ground", "2 x 5", "Move into the front side without drifting."],
  ["Slope Direction Drill", 3, "Direction", "Constraint", ["Poor Direction", "Spinning Off", "Drifting"], "Medium", "Mound / Slope", "2 x 5", "Let the slope expose direction leaks."],
  ["Stick Landing Drill", 3, "Repeatability", "Constraint", ["Poor Repeatability", "Soft Front Leg", "Landing Open"], "Medium", "Flat Ground", "2 x 5", "Own the finish position after the throw."],
  ["Step-Behind Throws", 4, "Energy Transfer", "Dynamic", ["Muscling Arm", "Low Intent Mover", "No Flow"], "High", "Flat Ground", "2 x 5", "Let momentum create arm speed."],
  ["Shuffle Throws", 4, "Rhythm", "Dynamic", ["No Flow", "Muscling Arm", "Rushed Tempo"], "Medium-High", "Flat Ground", "2 x 5", "Create rhythm without forcing the arm."],
  ["Walk-In Throws", 4, "Tempo", "Dynamic", ["Low Intent Mover", "No Flow", "Poor Direction"], "Medium-High", "Flat Ground", "2 x 5", "Build speed naturally before release."],
  ["Hop To Throw", 4, "Lower Half", "Dynamic", ["Using Lower Half Incorrectly", "Low Intent Mover", "Poor Direction"], "High", "Flat Ground", "2 x 4", "Add athletic intent into the lower half."],
  ["Med Ball Linear Throws", 4, "Power", "Power", ["Using Lower Half Incorrectly", "Poor Direction", "Energy Transfer"], "Medium-High", "Med Ball", "3 x 5", "Train force to move through the target."],
  ["Mirror Closed Holds", 1, "Front Side", "Awareness", ["Opening Early", "Glove Pull", "Landing Open"], "Low", "Dry Work", "2 x 5 holds", "Feel closed before moving."],
  ["Pause At Peak Lift", 1, "Timing", "Awareness", ["Rushed Tempo", "Opening Early", "Balance Issue"], "Low", "Dry Work", "2 x 5", "Control the top before you go."],
  ["Glove Side Awareness Drill", 1, "Front Side", "Awareness", ["Glove Pull", "Opening Early", "Arm-Side Miss"], "Low", "Dry Work", "2 x 6", "Feel the glove stabilize instead of yank."],
  ["Walk-Through Closed Drill", 2, "Front Side", "Movement", ["Opening Early", "Poor Direction", "Arm-Side Miss"], "Medium", "Flat Ground", "2 x 5", "Move forward while staying closed longer."],
  ["Glove Side Resistance Band", 2, "Front Side", "Constraint", ["Glove Pull", "Opening Early", "Poor Separation"], "Low-Medium", "Band", "2 x 8", "Build awareness of front side control."],
  ["Separation Step Drill", 2, "Timing", "Movement", ["Poor Separation", "Opening Early", "Late Arm"], "Medium", "Flat Ground", "2 x 5", "Feel hips move while shoulders stay closed."],
  ["Towel Under Arm Drill", 3, "Front Side", "Constraint", ["Glove Pull", "Opening Early", "Arm-Side Miss"], "Low-Medium", "Dry Work", "2 x 5", "Keep the glove side connected longer."],
  ["Wall Stay Closed Drill", 3, "Front Side", "Constraint", ["Opening Early", "Poor Direction", "Landing Open"], "Low", "Dry Work", "2 x 5", "Use the wall to feel delayed rotation."],
  ["Stride Direction Line Drill", 3, "Direction", "Constraint", ["Poor Direction", "Landing Open", "Spinning Off"], "Medium", "Flat Ground", "2 x 6", "Stay on the line into foot strike."],
  ["Separation Throws", 4, "Timing", "Dynamic", ["Poor Separation", "Opening Early", "Poor Hip Shoulder Timing"], "Medium-High", "Flat Ground", "2 x 5", "Create tension before rotation."],
  ["Closed Front Side Throwing", 4, "Front Side", "Integration", ["Opening Early", "Glove Pull", "Arm-Side Miss"], "Medium", "Flat Ground", "2 x 6", "Throw while holding the front side longer."],
  ["Med Ball Separation Throws", 4, "Front Side", "Power", ["Poor Separation", "Opening Early", "Energy Transfer"], "Medium-High", "Med Ball", "3 x 5", "Train separation and rotation power."],
  ["Delayed Rotation Bullpen", 5, "Mound", "Integration", ["Opening Early", "Arm-Side Miss", "Poor Hip Shoulder Timing"], "Medium-High", "Mound", "12–18 pitches", "Transfer delayed rotation to mound work."],
  ["Target + Timing Throwing", 5, "Command", "Game Transfer", ["Command Issue", "Arm-Side Miss", "Poor Repeatability"], "Medium", "Flat Ground / Mound", "10–15 throws", "Pair timing with target execution."],
  ["Arm Swing No Ball", 1, "Arm Action", "Awareness", ["Muscling Arm", "Restricted Arm", "Short Forced Arm"], "Low", "Dry Work", "2 x 8", "Let the arm swing without tension."],
  ["Connection Ball Drill", 1, "Arm Action", "Awareness", ["Long Arm Path", "Restricted Arm", "Muscling Arm"], "Low", "Plyo Ball", "2 x 6", "Feel connected arm movement."],
  ["Mirror Arm Path", 1, "Arm Action", "Awareness", ["Long Arm Path", "Short Forced Arm", "Late Arm"], "Low", "Dry Work", "2 x 6", "See the arm path before throwing."],
  ["Rocker Throws", 2, "Arm Action", "Movement", ["Muscling Arm", "No Flow", "Restricted Arm"], "Medium", "Flat Ground", "2 x 6", "Let the arm work with body rhythm."],
  ["Pivot Pickoffs", 2, "Arm Action", "Movement", ["Late Arm", "Muscling Arm", "Short Forced Arm"], "Medium", "Flat Ground", "2 x 6", "Get the arm up on time from a simple move."],
  ["Short Arm Path Throws", 2, "Arm Action", "Movement", ["Long Arm Path", "Late Arm", "Poor Repeatability"], "Medium", "Flat Ground", "2 x 5", "Clean up excessive length in the arm path."],
  ["Step-Behind Loose Arm", 3, "Arm Action", "Dynamic", ["Muscling Arm", "Restricted Arm", "Low Intent Mover"], "High", "Flat Ground", "2 x 5", "Use momentum to loosen the arm."],
  ["Shuffle Loose Arm", 3, "Arm Action", "Dynamic", ["Muscling Arm", "No Flow", "Rushed Tempo"], "Medium-High", "Flat Ground", "2 x 5", "Match arm swing with body flow."],
  ["Constraint Ball Throwing", 3, "Arm Action", "Constraint", ["Muscling Arm", "Restricted Arm", "Late Arm"], "Medium", "Plyo Ball", "2 x 6", "Use implement feedback to change arm feel."],
  ["Plyo Catch & Release", 4, "Arm Action", "Dynamic", ["Late Arm", "Muscling Arm", "Arm Speed"], "Medium-High", "Plyo Ball", "2 x 6", "Train quick arm action without forcing."],
  ["Momentum Throws", 4, "Energy Transfer", "Dynamic", ["Muscling Arm", "Using Lower Half Incorrectly", "Low Intent Mover"], "High", "Flat Ground", "2 x 5", "Let the body create the arm speed."],
  ["Target Box Drill", 1, "Command", "Awareness", ["Command Issue", "Arm-Side Miss", "Glove-Side Miss"], "Low-Medium", "Flat Ground", "2 x 8", "Define the target window."],
  ["Glove Side Target Drill", 2, "Command", "Movement", ["Arm-Side Miss", "Opening Early", "Poor Direction"], "Medium", "Flat Ground", "2 x 6", "Train glove-side execution."],
  ["Line Drill", 2, "Direction", "Constraint", ["Poor Direction", "Spinning Off", "Arm-Side Miss"], "Medium", "Flat Ground", "2 x 6", "Move straight down the line."],
  ["Closed Direction Throws", 3, "Direction", "Constraint", ["Opening Early", "Arm-Side Miss", "Poor Direction"], "Medium", "Flat Ground", "2 x 6", "Stay closed and move through target."],
  ["Step Over Line Drill", 3, "Direction", "Constraint", ["Falling Glove Side", "Spinning Off", "Poor Direction"], "Medium", "Flat Ground", "2 x 5", "Force the stride to work over the line."],
  ["Catcher Focus Throws", 4, "Command", "Integration", ["Command Issue", "Poor Repeatability", "Rushed Tempo"], "Medium", "Flat Ground / Mound", "10 throws", "Keep focus external on the catcher."],
  ["Count-Based Bullpen", 5, "Game IQ", "Game Transfer", ["Command Issue", "Game Feel", "Poor Repeatability"], "Medium-High", "Mound", "3–5 counts", "Apply command inside game counts."],
  ["Competitive Sequences", 5, "Game IQ", "Game Transfer", ["Game Feel", "Execution", "Command Issue"], "Medium-High", "Mound", "3 simulated ABs", "Pitch with sequencing and purpose."],
  ["Slow To Fast Drill", 2, "Tempo", "Movement", ["Rushed Tempo", "No Flow", "Late Arm"], "Medium", "Flat Ground", "2 x 5", "Build tempo gradually."],
  ["Tempo Ladder Drill", 3, "Tempo", "Constraint", ["Rushed Tempo", "Inconsistent Tempo", "Poor Repeatability"], "Medium", "Flat Ground", "3 tempos x 3", "Find the best rhythm."],
  ["Pause Go Drill", 2, "Timing", "Awareness", ["Stuck At Leg Lift", "Rushed Tempo", "Late Arm"], "Low-Medium", "Dry Work / Flat", "2 x 5", "Pause, then move with intent."],
  ["Rhythm Step Drill", 2, "Rhythm", "Movement", ["No Flow", "Robotic Delivery", "Rushed Tempo"], "Medium", "Flat Ground", "2 x 6", "Use a step to create natural rhythm."],
  ["Metronome Throws", 3, "Tempo", "Constraint", ["Rushed Tempo", "Inconsistent Tempo", "Poor Repeatability"], "Low-Medium", "Flat Ground", "2 x 6", "Match movement to a consistent tempo."],
  ["Flow Throws", 4, "Rhythm", "Dynamic", ["No Flow", "Muscling Arm", "Robotic Delivery"], "Medium", "Flat Ground", "2 x 6", "Prioritize smooth connected motion."],
  ["Continuous Motion Drill", 4, "Rhythm", "Dynamic", ["Stuck At Leg Lift", "No Flow", "Rushed Tempo"], "Medium", "Flat Ground", "2 x 5", "Remove pauses and keep movement alive."],
];

const drills = baseDrills.map((b, i) => ({
  id: `drill-${i + 1}`,
  name: b[0],
  level: b[1],
  category: b[2],
  type: b[3],
  fixes: b[4],
  intent: b[5],
  environment: b[6],
  prescription: b[7],
  note: b[8],
  videoUrl: "",
}));

const armBase = [
  ["Band ER at Side", "Pre-Throw", ["Posterior Cuff", "Infraspinatus", "Teres Minor"], ["External Rotation", "Shoulder Stability", "Arm Prep"], "Low", ["Band"], "2 x 12"],
  ["90/90 Band ER", "Pre-Throw", ["Posterior Cuff", "Infraspinatus", "Teres Minor"], ["Layback Prep", "External Rotation", "Shoulder Stability"], "Low", ["Band"], "2 x 10"],
  ["Band IR at Side", "Pre-Throw", ["Subscapularis", "Anterior Shoulder"], ["Internal Rotation", "Shoulder Prep", "Control"], "Low", ["Band"], "2 x 12"],
  ["Scap Push-Up", "Pre-Throw", ["Serratus Anterior", "Scap Stabilizers"], ["Protraction", "Scap Control", "Shoulder Blade Awareness"], "Low", ["Bodyweight"], "2 x 10"],
  ["Serratus Wall Slide", "Pre-Throw", ["Serratus Anterior", "Low Trap"], ["Upward Rotation", "Overhead Prep", "Scap Control"], "Low", ["Wall", "Band"], "2 x 8"],
  ["Foam Roller Wall Slide", "Pre-Throw", ["Serratus Anterior", "Low Trap", "Thoracic Spine"], ["Upward Rotation", "Mobility", "Scap Control"], "Low", ["Foam Roller"], "2 x 8"],
  ["Prone Y Raise", "Pre-Throw", ["Low Trap", "Mid Trap", "Posterior Shoulder"], ["Scap Upward Rotation", "Posture", "Arm Path Support"], "Low", ["Bench/Floor"], "2 x 8"],
  ["Trap 3 Raise", "Pre-Throw", ["Low Trap", "Mid Trap"], ["Scap Control", "Posture", "Overhead Prep"], "Low", ["Bench"], "2 x 8"],
  ["Open Book", "Pre-Throw", ["Thoracic Spine", "Lats", "Pec Minor"], ["Thoracic Rotation", "Mobility", "Separation Prep"], "Low", ["Bodyweight"], "2 x 6 each"],
  ["Quadruped T-Spine Rotation", "Pre-Throw", ["Thoracic Spine", "Obliques"], ["Rotation", "Mobility", "Separation Prep"], "Low", ["Bodyweight"], "2 x 6 each"],
  ["Wrist Pronation/Supination", "Pre-Throw", ["Pronator Teres", "Supinator", "Forearm"], ["Elbow Prep", "Forearm Control", "Grip Prep"], "Low", ["Hammer/DB"], "2 x 10 each"],
  ["Wrist Flexion/Extension Prep", "Pre-Throw", ["Wrist Flexors", "Wrist Extensors", "Forearm"], ["Elbow Prep", "Blood Flow", "Forearm Prep"], "Low", ["DB/Band"], "2 x 12"],
  ["Split Stance Rotations", "Pre-Throw", ["Obliques", "Thoracic Spine", "Core"], ["Rotation", "Separation Prep", "Core Control"], "Low", ["Bodyweight"], "2 x 8 each"],
  ["Dead Bug Breathing", "Pre-Throw", ["Core", "Diaphragm"], ["Core Control", "Breathing", "Positioning"], "Low", ["Bodyweight"], "2 x 6"],
  ["External Rotation + Press", "Pre-Throw", ["Posterior Cuff", "Serratus", "Low Trap"], ["External Rotation", "Overhead Prep", "Scap Control"], "Low-Medium", ["Band/DB"], "2 x 8"],
  ["Sideways Internal Rotation Press", "Pre-Throw", ["Subscapularis", "Serratus", "Core"], ["Internal Rotation", "Shoulder Prep", "Control"], "Low-Medium", ["Band"], "2 x 8"],
  ["Overhead Hands Together Press", "Pre-Throw", ["Serratus", "Low Trap", "Thoracic Spine"], ["Overhead Prep", "Scap Control", "Mobility"], "Low", ["Bodyweight/Light Ball"], "2 x 8"],
  ["T-Spine Rotations", "Pre-Throw", ["Thoracic Spine", "Obliques"], ["Rotation", "Mobility", "Separation Prep"], "Low", ["Bodyweight"], "2 x 8 each"],
  ["Prone YTW", "Post-Throw", ["Low Trap", "Mid Trap", "Rear Delt"], ["Scap Strength", "Posture", "Recovery"], "Low", ["Bench/Floor"], "2 x 8"],
  ["Catch & Reverse Throw", "Post-Throw", ["Posterior Cuff", "Biceps"], ["Deceleration", "Arm Protection"], "Low-Medium", ["Partner"], "2 x 6"],
  ["Banded ER Eccentric", "Post-Throw", ["Posterior Cuff"], ["Decel Strength", "Control"], "Low", ["Band"], "2 x 8"],
  ["Biceps Eccentric", "Post-Throw", ["Biceps"], ["Elbow Protection", "Deceleration"], "Low-Medium", ["DB"], "2 x 8"],
  ["Face Pull", "Post-Throw", ["Rear Delt", "Mid Trap"], ["Posture", "Scap Strength"], "Low-Medium", ["Band/Cable"], "2 x 12"],
  ["Band Pull Apart", "Post-Throw", ["Rear Delt", "Rhomboids"], ["Upper Back", "Posture"], "Low", ["Band"], "2 x 15"],
  ["T-Spine Extension Over Bench", "Recovery Day", ["Thoracic Spine"], ["Mobility", "Extension"], "Low", ["Bench"], "1 min"],
  ["Lat Elongation w/ Lateral Flexion", "Recovery Day", ["Lats"], ["Mobility", "Lengthening"], "Low", ["Bodyweight"], "30 sec"],
  ["Pec Myofascial Release", "Recovery Day", ["Pec Minor"], ["Soft Tissue", "Recovery"], "Low", ["Ball"], "2 min"],
  ["Rhomboid Myofascial Release", "Recovery Day", ["Rhomboids"], ["Soft Tissue", "Recovery"], "Low", ["Ball"], "2 min"],
  ["Subscap Self Release", "Recovery Day", ["Subscapularis"], ["Soft Tissue", "Mobility"], "Low", ["Manual"], "1 min"],
  ["ER End Range Lift Overs", "Recovery Day", ["Posterior Cuff"], ["End Range Control"], "Low", ["Bodyweight"], "2 x 10"],
  ["Tripod ER/IR Dribbles", "Medium Intent Day", ["Rotator Cuff"], ["Stability", "Coordination"], "Low", ["Ball"], "20 sec"],
  ["Low Trap Raise Stability Ball", "Medium Intent Day", ["Low Trap"], ["Scap Strength"], "Low-Medium", ["Ball"], "2 x 12"],
  ["Serratus Wall Slides", "Medium Intent Day", ["Serratus"], ["Upward Rotation"], "Low", ["Wall"], "2 x 15"],
  ["Reverse Bear Crawls", "Medium Intent Day", ["Scap", "Core"], ["Coordination", "Stability"], "Medium", ["Bodyweight"], "20 steps"],
  ["Fingertip Farmer Carries", "Intense Throwing Day", ["Forearm"], ["Grip", "Stability"], "Medium", ["DB"], "45 sec"],
  ["Forearm Plyo Drops", "Intense Throwing Day", ["Forearm"], ["Elasticity", "Decel"], "Medium", ["Ball"], "max reps"],
  ["90/90 to Y w/ Glove Row", "Medium Intent Day", ["Posterior Cuff", "Low Trap", "Mid Trap", "Rear Delt"], ["Scap Control", "External Rotation", "Arm Path Support"], "Medium", ["Glove", "Band/DB"], "2 x 15"],
  ["Tripod T Dribbles", "Medium Intent Day", ["Rear Delt", "Mid Trap", "Rotator Cuff"], ["Scap Stability", "Shoulder Control", "Coordination"], "Low-Medium", ["Ball"], "20 sec"],
  ["Prone Scap Angels", "Post-Throw", ["Low Trap", "Mid Trap", "Rhomboids", "Rear Delt"], ["Scap Strength", "Posture Restoration", "Shoulder Control"], "Low", ["Bodyweight"], "2 x max reps"],
  ["Posterior Wall Angels", "Recovery Day", ["Mid Trap", "Low Trap", "Posterior Shoulder", "Thoracic Spine"], ["Posture", "Mobility", "Scap Control"], "Low", ["Wall"], "2 x 10-20"],
  ["Pivot Pick Low/Mid Trap Recruitment", "Medium Intent Day", ["Low Trap", "Mid Trap", "Posterior Cuff"], ["Arm Path Support", "Scap Recruitment", "Throwing Pattern"], "Medium", ["Ball"], "2 x 15"],
  ["Split Stance T Isometrics", "Medium Intent Day", ["Mid Trap", "Rear Delt", "Rhomboids"], ["Isometric Strength", "Scap Stability", "Posture"], "Medium", ["Band/Cable"], "3 x 15 sec"],
  ["Tubing Y Walkout Eccentrics", "Intense Throwing Day", ["Low Trap", "Posterior Cuff", "Scap Stabilizers"], ["Eccentric Control", "Decel Chain", "Scap Upward Rotation"], "Medium", ["Tubing/Band"], "2 x 10 eccentrics"],
  ["Sidelying Serratus Punch w/ Stability Ball", "Medium Intent Day", ["Serratus Anterior", "Scap Stabilizers"], ["Protraction", "Scap Control", "Shoulder Blade Awareness"], "Low-Medium", ["Stability Ball"], "2 x 20"],
  ["Sidelying Serratus Isolation Slides", "Medium Intent Day", ["Serratus Anterior"], ["Upward Rotation", "Scap Control", "Isolation"], "Low", ["Slider/Towel"], "2 x 15"],
  ["Single Arm Serratus Slides", "Medium Intent Day", ["Serratus Anterior", "Low Trap"], ["Upward Rotation", "Single Arm Control", "Scap Stability"], "Low", ["Slider/Towel"], "2 x 15 each"],
  ["Split Stance Serratus Scoops", "Medium Intent Day", ["Serratus Anterior", "Low Trap", "Core"], ["Scap Upward Rotation", "Throwing Pattern", "Posture"], "Low-Medium", ["Band/Cable"], "2 x 15 slow scoops"],
  ["Back to Wall Serratus Scoops", "Medium Intent Day", ["Serratus Anterior", "Low Trap"], ["Scap Control", "Posture", "Upward Rotation"], "Low", ["Wall"], "2 x 15"],
  ["Supine Stability Ball Shoulder Circles", "Medium Intent Day", ["Rotator Cuff", "Scap Stabilizers", "Serratus"], ["Shoulder Stability", "Control", "Coordination"], "Low-Medium", ["Stability Ball"], "2 x 15 each direction"],
  ["Low Side Plank Flexion Ball Drops", "Intense Throwing Day", ["Posterior Cuff", "Serratus", "Core"], ["Deceleration", "Shoulder Stability", "Core Integration"], "Medium", ["Ball"], "3 x 30 drops"],
  ["Low Side Plank Stability Arm Bar", "Intense Throwing Day", ["Rotator Cuff", "Serratus", "Core"], ["Shoulder Stability", "Arm Bar Control", "Core Integration"], "Medium", ["Weighted Ball/DB"], "3 x 12 rotations"],
  ["Low Side Plank Shoulder Horizontal Abduction/Adduction", "Intense Throwing Day", ["Rear Delt", "Posterior Cuff", "Core"], ["Shoulder Stability", "Horizontal Control", "Decel Support"], "Medium", ["Weighted Ball"], "2 x 15"],
  ["1st and 2nd Digit/Wrist Flexion", "Intense Throwing Day", ["Finger Flexors", "Wrist Flexors", "Forearm"], ["Grip Strength", "Elbow Support", "Forearm Capacity"], "Medium", ["Band/DB"], "2 x 40"],
  ["Ulnar Deviation Isometrics", "Intense Throwing Day", ["Wrist Stabilizers", "Forearm"], ["Wrist Stability", "Elbow Support", "Isometric Strength"], "Medium", ["Band/DB"], "5 x 10 sec holds"],
  ["Kettlebell Pronation/Supination", "Intense Throwing Day", ["Pronator Teres", "Supinator", "Forearm"], ["Forearm Strength", "Elbow Support", "Rotation Control"], "Medium", ["Kettlebell"], "2 x 12 each direction"],
  ["1/2 Kneeling Forearm Dribbles", "Intense Throwing Day", ["Forearm", "Wrist Stabilizers", "Pronator/Supinator"], ["Forearm Elasticity", "Wrist Control", "Elbow Support"], "Medium", ["Ball"], "2 x 15 sec fast"],
  ["Pec Minor Release w/ Active ER", "Recovery Day", ["Pec Minor", "Anterior Shoulder"], ["Soft Tissue", "External Rotation", "Shoulder Position"], "Low", ["Ball/Wall"], "2 min"],
  ["Multi-Angle Pec Elongations", "Recovery Day", ["Pec Major", "Pec Minor", "Anterior Shoulder"], ["Mobility", "Lengthening", "Posture Restoration"], "Low", ["Wall"], "45 sec"],
  ["Single Arm Pec Stretch", "Recovery Day", ["Pec Major", "Pec Minor", "Anterior Shoulder"], ["Mobility", "Posture Restoration", "Shoulder Position"], "Low", ["Wall/Doorway"], "1 min"],
  ["Lat Foam Roll Pin and Stretch", "Recovery Day", ["Lat", "Teres Major"], ["Soft Tissue", "Mobility", "Overhead Range"], "Low", ["Foam Roller"], "2 min"],
  ["Lat/Triceps Long Head Stretch at Wall", "Recovery Day", ["Lat", "Triceps Long Head", "Teres Major"], ["Mobility", "Overhead Range", "Recovery"], "Low", ["Wall"], "45 sec"],
  ["Rotator Cuff Soft Tissue @ Wall", "Recovery Day", ["Posterior Cuff", "Infraspinatus", "Teres Minor"], ["Soft Tissue", "Recovery", "Shoulder Range"], "Low", ["Ball/Wall"], "1 min"],
  ["Infraspinatus/Teres Minor Self Mobilization", "Recovery Day", ["Infraspinatus", "Teres Minor", "Posterior Cuff"], ["Soft Tissue", "External Rotation Range", "Recovery"], "Low", ["Ball"], "2 min"],
  ["Biceps Tack and Pump", "Recovery Day", ["Biceps", "Anterior Elbow"], ["Soft Tissue", "Elbow Recovery", "Blood Flow"], "Low", ["Ball"], "2 min"],
  ["Upper Trap Stretch", "Recovery Day", ["Upper Trap", "Neck"], ["Mobility", "Recovery", "Tension Reduction"], "Low", ["Bodyweight"], "30 sec each side"],
  ["Levator Scap Elongation", "Recovery Day", ["Levator Scapulae", "Neck"], ["Mobility", "Recovery", "Scap Position"], "Low", ["Bodyweight"], "3 sec each direction"],
  ["Foam Roll Levered 90/90 to Y's", "Recovery Day", ["Thoracic Spine", "Low Trap", "Posterior Shoulder"], ["Mobility", "Scap Control", "Overhead Range"], "Low", ["Foam Roller"], "2 x 12 slides"],
  ["T-Spine Levered Extension over Foam Roll", "Recovery Day", ["Thoracic Spine"], ["Extension", "Mobility", "Recovery"], "Low", ["Foam Roller"], "1-2 min"],
  ["Thoracic Spine Windmills", "Recovery Day", ["Thoracic Spine", "Obliques"], ["Rotation", "Mobility", "Separation Prep"], "Low", ["Bodyweight"], "15 each direction"],
  ["Sidelying Pelvis/Shoulder Separations", "Recovery Day", ["Thoracic Spine", "Obliques", "Hips"], ["Separation", "Mobility", "Rotation"], "Low", ["Bodyweight"], "15 each direction"],
  ["Arm Bar Banded External Rotations Abduction", "Post-Throw", ["Posterior Cuff", "Rotator Cuff", "Scap Stabilizers"], ["External Rotation", "Shoulder Stability", "Arm Bar Control"], "Low-Medium", ["Band"], "2 x 12"],
  ["Tripod Rotations with Oscillations w/ Weighted Ball", "Intense Throwing Day", ["Rotator Cuff", "Scap Stabilizers", "Core"], ["Oscillation Control", "Shoulder Stability", "Decel Prep"], "Medium", ["Weighted Ball"], "2 x 12"],
  ["Stability Ball Rotation Dribbles", "Medium Intent Day", ["Rotator Cuff", "Scap Stabilizers"], ["Shoulder Stability", "Coordination", "Rhythm"], "Low-Medium", ["Stability Ball", "Ball"], "20 sec each direction"],
];

const armCare = armBase.map((b, i) => ({
  id: `arm-${i + 1}`,
  name: b[0],
  block: b[1],
  muscleTags: b[2],
  functionTags: b[3],
  intensity: b[4],
  equipment: b[5],
  prescription: b[6],
  videoUrl: "",
}));

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

        {appMode === "coach" && activeStep === 3 && <>
          <Database title="Recommended Drill Database" items={recommendedDrills} selected={selectedDrills} setSelected={setSelectedDrills} kind="drills" onDragStart={onDragStart} />
          <div className="mt-5 flex justify-end">
            <button onClick={() => setActiveStep(4)} className="bg-white text-black rounded-xl px-5 py-3 font-black">
              Next → Arm Care
            </button>
          </div>
        </>}

        {appMode === "coach" && activeStep === 4 && <>
          <ArmCare items={armCare} recommendedItems={recommendedArmCare} selected={selectedArm} setSelected={setSelectedArm} onDragStart={onDragStart} />
          <div className="mt-5 flex justify-end">
            <button onClick={() => setActiveStep(5)} className="bg-white text-black rounded-xl px-5 py-3 font-black">
              Next → Weekly Builder
            </button>
          </div>
        </>}

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

function getAthleteMetrics(athlete) {
  const activeWeek = athlete?.activeWeekId
    ? (athlete.plans || []).find((week) => week.id === athlete.activeWeekId)
    : null;

  const activeWeekLogs = (athlete?.dailyCompletions || []).filter(
    (log) => log.weekId === activeWeek?.id
  );

  const completedDays = new Set(activeWeekLogs.map((log) => log.day));
  const completionPercent = activeWeek ? Math.round((completedDays.size / 7) * 100) : 0;

  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (completedDays.has(days[i])) currentStreak += 1;
    else if (currentStreak > 0) break;
  }

  const lastVelo = athlete?.veloLog?.length ? athlete.veloLog[0] : null;
  const latestAssessment = athlete?.assessments?.length ? athlete.assessments[0] : null;

  return {
    activeWeek,
    completionPercent,
    currentStreak,
    lastVelo,
    latestAssessment,
  };
}

function AthleteManager({ profile, setProfile, showAddAthlete, setShowAddAthlete, saveAthlete, athletes, activeAthleteId, selectAthlete, duplicateLastWeek, setActiveWeek, viewingWeek, setViewingWeek, editSavedWeek, openAthletePreview, updateAthleteNotes, setActiveStep }) {
  const activeAthlete = athletes.find((a) => String(a.id) === String(activeAthleteId));
  const metrics = getAthleteMetrics(activeAthlete);

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

            <div className="grid md:grid-cols-5 gap-3">
              <Stat label="Active Week" value={metrics.activeWeek?.weekName || "None"} />
              <Stat label="Completion" value={metrics.activeWeek ? `${metrics.completionPercent}%` : "--"} />
              <Stat label="Streak" value={`${metrics.currentStreak} days`} />
              <Stat label="Last Velo" value={metrics.lastVelo?.velo ? `${metrics.lastVelo.velo} mph` : "--"} />
              <Stat label="Latest Assessment" value={metrics.latestAssessment?.date || "None"} />
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
                      <button onClick={() => {
                        if (!window.confirm(`Delete ${week.weekName}?`)) return;
                        const updated = athletes.map((a) => {
                          if (a.id !== activeAthlete.id) return a;
                          return {
                            ...a,
                            plans: (a.plans || []).filter((p) => p.id !== week.id),
                            activeWeekId: a.activeWeekId === week.id ? null : a.activeWeekId,
                          };
                        });
                        localStorage.setItem("ace-athletes", JSON.stringify(updated));
                        window.location.reload();
                      }} className="bg-red-900 rounded-xl px-3 py-2 text-sm font-black">Delete</button>
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const categoryLabel = kind === "arm" ? "Block" : "Category";
  const typeLabel = kind === "arm" ? "Intensity" : "Type";

  const categories = useMemo(() => {
    const values = items.map((item) => (kind === "arm" ? item.block : item.category)).filter(Boolean);
    return ["All", ...Array.from(new Set(values))];
  }, [items, kind]);

  const types = useMemo(() => {
    const values = items.map((item) => (kind === "arm" ? item.intensity : item.type)).filter(Boolean);
    return ["All", ...Array.from(new Set(values))];
  }, [items, kind]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const categoryValue = kind === "arm" ? item.block : item.category;
      const typeValue = kind === "arm" ? item.intensity : item.type;
      const searchText = [
        item.name,
        item.category,
        item.type,
        item.block,
        item.intensity,
        item.environment,
        item.prescription,
        item.note,
        ...(item.fixes || []),
        ...(item.muscleTags || []),
        ...(item.functionTags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchText.includes(query);
      const matchesCategory = categoryFilter === "All" || categoryValue === categoryFilter;
      const matchesType = typeFilter === "All" || typeValue === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [items, search, categoryFilter, typeFilter, kind]);

  const toggleSelected = (item) =>
    setSelected(
      selected.some((x) => x.id === item.id)
        ? selected.filter((x) => x.id !== item.id)
        : [...selected, item]
    );

  return (
    <section>
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 mb-5">
        <div className="flex justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-zinc-400">Search, filter, select, or drag items into the weekly builder.</p>
          </div>
          <div className="text-sm text-zinc-400 bg-black border border-zinc-800 rounded-2xl px-4 py-3">
            Showing <span className="font-black text-white">{filteredItems.length}</span> / {items.length} · Selected <span className="font-black text-red-400">{selected.length}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${kind === "arm" ? "arm care" : "drills"}...`}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-600"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-600"
          >
            {categories.map((value) => (
              <option key={value} value={value}>{categoryLabel}: {value}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-600"
          >
            {types.map((value) => (
              <option key={value} value={value}>{typeLabel}: {value}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredItems.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selected.some((x) => x.id === item.id);
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item, kind)}
                className={`rounded-3xl bg-zinc-950 border p-4 cursor-grab transition ${isSelected ? "border-red-600 shadow-lg shadow-red-950/30" : "border-zinc-800 hover:border-zinc-600"}`}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-black">{item.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {kind === "arm"
                        ? `${item.block} · ${item.intensity}`
                        : `${item.category} · ${item.type} · ${item.environment}`}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSelected(item)}
                    className={`rounded-xl px-3 py-2 text-xs font-black ${isSelected ? "bg-red-700" : "bg-zinc-800"}`}
                  >
                    {isSelected ? "Added" : "Add"}
                  </button>
                </div>

                <p className="text-sm text-zinc-400 mt-3">
                  {item.note || (item.functionTags || []).slice(0, 3).join(" · ") || "No note added yet."}
                </p>

                <div className="flex justify-between items-center gap-3 mt-4">
                  <div className="text-xs text-red-300 font-black">{item.prescription}</div>
                  <div className="text-xs text-zinc-600">No video yet</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-8 text-center text-zinc-500">
          No results found. Clear the search or filters.
        </div>
      )}
    </section>
  );
}

function ArmCare({ items, recommendedItems, selected, setSelected, onDragStart }) {
  const shown = recommendedItems.length ? recommendedItems : items;
  return <Database title="Arm Care Database" items={shown} selected={selected} setSelected={setSelected} kind="arm" onDragStart={onDragStart} />;
}

function WeeklyBuilder({ activeAthlete, weekName, setWeekName, phase, setPhase, plan, setPlan, selectedDrills, selectedArm, recommendedDrills, recommendedArmCare, onDragStart, onDrop, removeFromDay, saveWeekToAthlete, autoBuildWeek, clearCurrentPlan }) {
  const updateDay = (day, field, value) => setPlan((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));

  const weekTotals = useMemo(() => {
    const allDays = Object.values(plan || {});
    const drillCount = allDays.reduce((total, day) => total + (day.drills?.length || 0), 0);
    const armCount = allDays.reduce((total, day) => total + (day.arm?.length || 0), 0);
    const throwingDays = allDays.filter((day) => day.throwing && day.throwing !== "Off").length;
    const bullpenDays = allDays.filter((day) => day.throwing === "Bullpen" || day.type === "Bullpen Day").length;
    return { drillCount, armCount, throwingDays, bullpenDays };
  }, [plan]);

  return (
    <section>
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 mb-5">
        <div className="flex justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-2xl font-black">Weekly Builder</h2>
            <p className="text-zinc-400">{activeAthlete ? `Saving to ${activeAthlete.name}` : "Select an athlete before saving."}</p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-black border border-zinc-800 rounded-xl px-3 py-2"><div className="text-zinc-500">Throw</div><div className="font-black text-white">{weekTotals.throwingDays}</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl px-3 py-2"><div className="text-zinc-500">Pens</div><div className="font-black text-white">{weekTotals.bullpenDays}</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl px-3 py-2"><div className="text-zinc-500">Drills</div><div className="font-black text-white">{weekTotals.drillCount}</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl px-3 py-2"><div className="text-zinc-500">Arm</div><div className="font-black text-white">{weekTotals.armCount}</div></div>
          </div>
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
          <button onClick={saveWeekToAthlete} className="bg-white text-black rounded-xl px-4 py-2 font-black">Save + Return Home</button>
          </div>
        </div>
      </section>

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
            <div key={day} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, day)} className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 min-h-96 hover:border-red-900/70 transition">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-black text-red-400">{day}</h3>
                  <p className="text-xs text-zinc-600">{dayPlan.drills.length} drills · {dayPlan.arm.length} arm care</p>
                </div>
                <span className={`text-[10px] uppercase font-black rounded-full px-2 py-1 ${dayPlan.throwing === "Off" ? "bg-zinc-800 text-zinc-400" : dayPlan.throwing === "Bullpen" ? "bg-red-700 text-white" : "bg-white text-black"}`}>
                  {dayPlan.throwing || "Off"}
                </span>
              </div>
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
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-600 transition">
      <div className="text-xs text-zinc-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-black truncate">{value}</div>
    </div>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-3xl bg-zinc-950 border border-dashed border-zinc-800 p-8 text-center">
      <div className="text-xl font-black text-white mb-2">{title}</div>
      <p className="text-zinc-500 max-w-xl mx-auto mb-4">{message}</p>
      {action}
    </div>
  );
}
