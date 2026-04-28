import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";



const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dayTypes = ["Throw Day", "Bullpen Day", "Recovery Day", "Lift Day", "Off / Mobility"];
const throwingTypes = ["Off", "Recovery Throw", "Light Catch", "Long Toss", "Medium Intent", "High Intent", "Bullpen"];

const assessmentSections = [
  { title: "Athlete Profile", type: "profile" },
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
  video: "Video placeholder",
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
  video: "Video placeholder",
}));

export default function AceCoachAppPreview() {
  const [session, setSession] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
 

  const signUpCoach = async () => {
    console.log("SIGNUP CLICKED");

    const { data, error } = await supabase.auth.signUp({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setSaveStatus(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        role: "coach",
        full_name: loginEmail,
      });
    }

    setSaveStatus("Coach account created. Check email if confirmation is required.");
  };

  const loginCoach = async () => {
  console.log("LOGIN CLICKED");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    console.log("LOGIN RESPONSE:", data, error);

    if (error) {
      alert("LOGIN ERROR: " + error.message);
      setSaveStatus(error.message);
      return;
    }

    alert("LOGIN SUCCESS");
    setSaveStatus("Logged in.");
  } catch (err) {
    console.log("CRASH:", err);
    alert("CRASH: " + err.message);
  }
};

  const logoutCoach = async () => {
    await supabase.auth.signOut();
    setSaveStatus("Logged out.");
  };

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => listener.subscription.unsubscribe();
}, []);


  useEffect(() => {
    async function test() {
      const { data, error } = await supabase.from("athletes").select("*");
      console.log("SUPABASE:", data, error);
    }

    test();
  }, []);


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
  const createEmptyPlan = () =>
    Object.fromEntries(days.map((d) => [d, { type: "Throw Day", throwing: "Light Catch", throwingDetails: "", drills: [], arm: [], notes: "" }]));

  const [athletes, setAthletes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ace-athletes") || "[]");
    } catch {
      return [];
    }
  });
  const [activeAthleteId, setActiveAthleteId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ace-active-athlete") || "null");
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(emptyProfile);
  const [newAthleteProfile, setNewAthleteProfile] = useState(emptyProfile);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
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
  const [templates, setTemplates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ace-templates") || "[]");
    } catch {
      return [];
    }
  });
  const [templateName, setTemplateName] = useState("Velocity Template");

  const activeAthlete = athletes.find((a) => a.id === activeAthleteId) || null;
  const unlocked = primaryIssues.length > 0;
  const issueTags = useMemo(() => [...primaryIssues, ...secondaryIssues], [primaryIssues, secondaryIssues]);

  const sorenessToMuscleTags = {
    "Front Shoulder": ["Pec Minor", "Pec Major", "Anterior Shoulder", "Subscapularis"],
    "Back Shoulder": ["Posterior Cuff", "Infraspinatus", "Teres Minor", "Rear Delt"],
    "Elbow / Biceps": ["Biceps", "Anterior Elbow", "Brachialis"],
    Forearm: ["Forearm", "Wrist Flexors", "Wrist Extensors", "Pronator Teres", "Supinator"],
    "Lat / Triceps": ["Lat", "Lats", "Triceps Long Head", "Teres Major"],
    "Neck / Trap": ["Upper Trap", "Levator Scapulae", "Neck"],
    "Scap / Upper Back": ["Low Trap", "Mid Trap", "Rhomboids", "Scap Stabilizers", "Serratus Anterior"],
  };

  useEffect(() => {
    localStorage.setItem("ace-athletes", JSON.stringify(athletes));
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem("ace-active-athlete", JSON.stringify(activeAthleteId));
  }, [activeAthleteId]);

  useEffect(() => {
    localStorage.setItem("ace-templates", JSON.stringify(templates));
  }, [templates]);

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
  }, [activeAthleteId]);

  const recommendedDrills = useMemo(() => {
    const matches = drills.filter((d) => d.fixes.some((f) => issueTags.includes(f)));
    return matches.length ? matches : drills;
  }, [issueTags]);

  const recommendedArmCare = useMemo(() => {
    if (!primarySoreness.length) return armCare;
    const targetMuscles = primarySoreness.flatMap((s) => sorenessToMuscleTags[s] || []);
    const matches = armCare.filter((a) =>
      a.muscleTags.some((m) =>
        targetMuscles.some((target) =>
          m.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(m.toLowerCase())
        )
      )
    );
    return matches.length ? matches : armCare;
  }, [primarySoreness]);

  const toggle = (value, list, setList) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const resetCurrentWork = () => {
    setPrimaryIssues([]);
    setSecondaryIssues([]);
    setAthleteType([]);
    setPrimarySoreness([]);
    setSelectedDrills([]);
    setSelectedArm([]);
    setPlan(createEmptyPlan());
    setWeekName("Week 1");
    setSaveStatus("Current assessment and weekly plan reset.");
  };

 const saveAthlete = async () => {
  if (!newAthleteProfile.name.trim()) return;

  const newAthlete = {
    id: Date.now(),
    ...newAthleteProfile,
    assessments: [],
    plans: [],
    activeWeekId: null,
    veloLog: newAthleteProfile.currentVelo
      ? [{ date: new Date().toLocaleDateString(), velo: newAthleteProfile.currentVelo }]
      : [],
  };

  setAthletes((prev) => [...prev, newAthlete]);
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

    if (error) {
      console.log("SAVE ERROR:", error.message);
      setSaveStatus(`Created locally, but database save failed: ${error.message}`);
    } else {
      console.log("ATHLETE SAVED");
      setSaveStatus(`Created and saved athlete: ${newAthlete.name}.`);
    }
  }
};

  const selectAthlete = (athleteId) => {
    setActiveAthleteId(athleteId);
    setViewingWeek(null);
    setShowAddAthlete(false);
    resetCurrentWork();
  };

  const saveAssessmentToAthlete = () => {
    if (!activeAthlete || primaryIssues.length === 0) return;
    const assessment = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      primaryIssues,
      secondaryIssues,
      athleteType,
      primarySoreness,
    };
    setAthletes((prev) =>
      prev.map((a) => (a.id === activeAthlete.id ? { ...a, assessments: [assessment, ...a.assessments] } : a))
    );
    setSaveStatus(`Assessment saved for ${activeAthlete.name}.`);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      setSaveStatus("Name your template before saving.");
      return;
    }
    const newTemplate = {
      id: Date.now(),
      name: templateName,
      createdAt: new Date().toLocaleDateString(),
      plan: JSON.parse(JSON.stringify(plan)),
      tags: [...primaryIssues, ...primarySoreness],
      price: "",
      description: "",
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setSaveStatus(`Saved template: ${newTemplate.name}.`);
  };

  const loadTemplate = (template) => {
    setPlan(JSON.parse(JSON.stringify(template.plan)));
    setWeekName(template.name);
    setSaveStatus(`Loaded template: ${template.name}. Adjust it before saving to athlete.`);
    setActiveStep(5);
  };

  const deleteTemplate = (templateId) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    setSaveStatus("Template deleted.");
  };

  const addDailyCompletion = (athleteId, weekId, day, completion) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const dailyCompletions = a.dailyCompletions || [];
        const filtered = dailyCompletions.filter(
          (log) => !(log.weekId === weekId && log.day === day)
        );
        return {
          ...a,
          dailyCompletions: [
            {
              id: Date.now(),
              weekId,
              day,
              date: new Date().toLocaleDateString(),
              ...completion,
            },
            ...filtered,
          ],
        };
      })
    );
    setSaveStatus("Daily work marked complete.");
  };

  const addVeloEntry = (athleteId, entry) => {
    setAthletes((prev) =>
      prev.map((a) =>
        a.id === athleteId
          ? { ...a, veloLog: [{ id: Date.now(), ...entry }, ...(a.veloLog || [])] }
          : a
      )
    );
    setSaveStatus("Velo entry added.");
  };

  const updateAthleteNotes = (athleteId, field, value) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === athleteId ? { ...a, [field]: value } : a))
    );
  };

  const saveWeekToAthlete = () => {
    if (!activeAthlete) {
      setSaveStatus("Create or select an athlete before saving.");
      return;
    }
   const savedWeek = {
  id: Date.now(),
  weekName: weekName || `Week ${activeAthlete.plans.length + 1}`,
  phase,
  createdAt: new Date().toLocaleDateString(),
  plan: JSON.parse(JSON.stringify(plan)),
};
    setAthletes((prev) =>
      prev.map((a) =>
        a.id === activeAthlete.id ? { ...a, activeWeekId: savedWeek.id, plans: [savedWeek, ...a.plans] } : a
      )
    );
    setSaveStatus(`Saved ${savedWeek.weekName} to ${activeAthlete.name}.`);
    setActiveStep(1);
  };

  const setActiveWeek = (weekId) => {
    if (!activeAthlete) return;
    setAthletes((prev) => prev.map((a) => (a.id === activeAthlete.id ? { ...a, activeWeekId: weekId } : a)));
    setSaveStatus("Active week updated.");
  };

  const openSavedWeek = (week) => setViewingWeek(week);

  const editSavedWeek = (week) => {
    setPlan(JSON.parse(JSON.stringify(week.plan)));
    setWeekName(`${week.weekName} Edit`);
    setViewingWeek(null);
    setActiveStep(5);
  };

  const duplicateLastWeek = () => {
    if (!activeAthlete || !activeAthlete.plans.length) return;
    setPlan(JSON.parse(JSON.stringify(activeAthlete.plans[0].plan)));
    setWeekName(`${activeAthlete.plans[0].weekName} Copy`);
    setActiveStep(5);
  };

  const clearCurrentPlan = () => {
    setPlan(createEmptyPlan());
    setSelectedDrills([]);
    setSelectedArm([]);
    setSaveStatus("Current plan cleared.");
  };

  const autoBuildWeek = () => {
    const throwingScheduleByPhase = {
  Build: {
    Monday: "Medium Intent",
    Tuesday: "Recovery Throw",
    Wednesday: "High Intent",
    Thursday: "Light Catch",
    Friday: "Bullpen",
    Saturday: "Recovery Throw",
    Sunday: "Off",
  },
  Strength: {
    Monday: "Light Catch",
    Tuesday: "Medium Intent",
    Wednesday: "Recovery Throw",
    Thursday: "High Intent",
    Friday: "Recovery Throw",
    Saturday: "Bullpen",
    Sunday: "Off",
  },
  Maintain: {
    Monday: "Light Catch",
    Tuesday: "Medium Intent",
    Wednesday: "Recovery Throw",
    Thursday: "Light Catch",
    Friday: "Bullpen",
    Saturday: "Recovery Throw",
    Sunday: "Off",
  },
  Deload: {
    Monday: "Recovery Throw",
    Tuesday: "Off",
    Wednesday: "Light Catch",
    Thursday: "Recovery Throw",
    Friday: "Light Catch",
    Saturday: "Off",
    Sunday: "Off",
  },
};

const throwingSchedule =
  throwingScheduleByPhase[phase] || throwingScheduleByPhase.Build;
    const phaseDrillTypes = {
  Build: ["Awareness", "Movement", "Constraint"],
  Strength: ["Constraint", "Dynamic", "Power"],
  Maintain: ["Dynamic", "Integration", "Game Transfer"],
  Deload: ["Awareness", "Control", "Movement"],
};

const activePhaseTypes = phaseDrillTypes[phase] || phaseDrillTypes.Build;

const primaryMatched = drills.filter(
  (d) =>
    d.fixes.some((f) => primaryIssues.includes(f)) &&
    activePhaseTypes.includes(d.type)
);

const secondaryMatched = drills.filter(
  (d) =>
    d.fixes.some((f) => secondaryIssues.includes(f)) &&
    activePhaseTypes.includes(d.type)
);

const phaseMatchedDrills = recommendedDrills.filter((d) =>
  activePhaseTypes.includes(d.type)
);

const fallbackMatched = phaseMatchedDrills.length ? phaseMatchedDrills : recommendedDrills;
    const pickByType = (pool, types, limit) => {
      const picked = [];
      types.forEach((type) => {
        const match = pool.find((d) => d.type === type && !picked.some((p) => p.id === d.id));
        if (match) picked.push(match);
      });
      pool.forEach((d) => {
        if (picked.length < limit && !picked.some((p) => p.id === d.id)) picked.push(d);
      });
      return picked.slice(0, limit);
    };

    const primaryPool = selectedDrills.length
      ? selectedDrills
      : primaryMatched.length
        ? primaryMatched
        : fallbackMatched;

    const secondaryPool = secondaryMatched.length ? secondaryMatched : fallbackMatched;

    const awarenessDrills = pickByType(primaryPool, ["Awareness", "Control"], 2);
    const constraintDrills = pickByType(primaryPool, ["Constraint"], 2);
    const dynamicDrills = pickByType([...primaryPool, ...secondaryPool], ["Movement", "Dynamic", "Power"], 3);
    const transferDrills = pickByType([...primaryPool, ...secondaryPool], ["Integration", "Game Transfer"], 2);

    const mainDrills = [
      ...awarenessDrills,
      ...constraintDrills,
      ...dynamicDrills,
      ...transferDrills,
    ].filter((drill, index, arr) => arr.findIndex((d) => d.id === drill.id) === index);

    const armPool = selectedArm.length ? selectedArm : recommendedArmCare;
    const preThrow = armPool.filter((a) => a.block === "Pre-Throw");
    const postThrow = armPool.filter((a) => a.block === "Post-Throw");
    const recovery = armPool.filter((a) => a.block === "Recovery Day");
    const medium = armPool.filter((a) => a.block === "Medium Intent Day");
    const intense = armPool.filter((a) => a.block === "Intense Throwing Day");

    const safeSlice = (arr, start, end, backup = []) => {
      const section = arr.slice(start, end);
      return section.length ? section : backup.slice(start, end);
    };

    const built = createEmptyPlan();

    built.Monday = {
      type: "Throw Day",
      throwing: throwingSchedule.Monday,
      throwingDetails: "Light catch. Coach sets distance and volume.",
      drills: [...safeSlice(awarenessDrills, 0, 1, mainDrills), ...safeSlice(constraintDrills, 0, 1, mainDrills)],
      arm: [...safeSlice(preThrow, 0, 3, armCare), ...safeSlice(postThrow, 0, 1, armCare)],
      notes: "Movement focus: clean up the primary issue before adding intent. Prioritize feel, control, and repeatability.",
    };

    built.Tuesday = {
      type: "Recovery Day",
     throwing: throwingSchedule.Tuesday,
      throwingDetails: "Low stress recovery throw. Keep it easy and smooth.",
      drills: safeSlice(awarenessDrills, 1, 2, mainDrills),
      arm: safeSlice(recovery, 0, 6, armCare),
      notes: "Recovery emphasis. Build up the soreness / weak area without adding throwing stress.",
    };

    built.Wednesday = {
      type: "Medium Intent Day",
      throwing: throwingSchedule.Wednesday,
      throwingDetails: "Controlled intensity throwing. Coach sets distance, volume, and intent.",
      drills: [...safeSlice(constraintDrills, 1, 2, mainDrills), ...safeSlice(dynamicDrills, 0, 2, mainDrills)],
      arm: [...safeSlice(preThrow, 3, 5, armCare), ...safeSlice(medium, 0, 4, armCare)],
      notes: "Medium intent build day. Blend the mechanical focus with rhythm and athletic movement.",
    };

    built.Thursday = {
      type: "Off / Mobility",
      throwing: throwingSchedule.Thursday,
      throwingDetails: "No throwing. Mobility and recovery only.",
      drills: [],
      arm: safeSlice(recovery, 6, 12, armCare),
      notes: "Restore range, reduce tension, and prepare for the higher intent day.",
    };

    built.Friday = {
      type: "Bullpen Day",
      throwing: throwingSchedule.Friday,
      throwingDetails: "Bullpen day. Coach sets pitch count, intent, and focus.",
      drills: [...safeSlice(dynamicDrills, 0, 1, mainDrills), ...safeSlice(transferDrills, 0, 2, mainDrills)],
      arm: [...safeSlice(preThrow, 0, 3, armCare), ...safeSlice(intense, 0, 3, armCare), ...safeSlice(postThrow, 0, 2, armCare)],
      notes: "Transfer day. Bring the week’s focus to the mound. Compete while keeping the movement goal clear.",
    };

    built.Saturday = {
      type: "Recovery Day",
      throwing: throwingSchedule.Saturday,
      throwingDetails: "Light recovery catch. Coach sets distance and volume.",
      drills: [],
      arm: safeSlice(recovery, 0, 6, armCare),
      notes: "Post-bullpen recovery. Keep this low stress and focus on restoring the arm.",
    };

    built.Sunday = {
      type: "Off / Mobility",
     throwing: throwingSchedule.Sunday,
      throwingDetails: "No throwing unless coach adds optional light catch.",
      drills: [],
      arm: safeSlice(recovery, 12, 16, armCare),
      notes: "Optional reset day. Use only what the athlete needs based on soreness and workload.",
    };

    setPlan(built);
    setSaveStatus("Smart auto-build complete. This is a coach suggestion only — adjust anything manually before saving.");
    setActiveStep(5);
  };

  const assignToDay = (day, item, kind) => {
    setPlan((p) => ({
      ...p,
      [day]: {
        ...p[day],
        [kind]: p[day][kind].some((x) => x.id === item.id) ? p[day][kind] : [...p[day][kind], item],
      },
    }));
  };

  const removeFromDay = (day, id, kind) => {
    setPlan((p) => ({
      ...p,
      [day]: { ...p[day], [kind]: p[day][kind].filter((x) => x.id !== id) },
    }));
  };

  const onDragStart = (e, item, kind) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ item, kind }));
  };

  const onDrop = (e, day) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const data = JSON.parse(raw);
    assignToDay(day, data.item, data.kind);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.05]">
       <header className="mb-6 border-b border-red-700/50 pb-5">
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shadow-red-950/30 flex items-center justify-center">
        <img
          src="/ace-logo.png"
          alt="ACE logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
          {appMode === "coach" ? "ACE Coach Console" : "ACE Athlete Portal"}
        </h1>
        <p className="text-zinc-400">
          {appMode === "coach"
            ? "Manage athletes → assess → prescribe → save weekly plans"
            : "Today’s work → completion → velo tracking"}
        </p>
      </div>
    </div>

    {appMode === "coach" ? (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-400">
        Coach View
      </div>
    ) : (
      <button
        onClick={() => {
          setAppMode("coach");
          setPreviewAthleteId(null);
        }}
        className="bg-white text-black rounded-2xl px-4 py-3 text-sm font-black"
      >
        Back to Coach View
      </button>
    )}
  </div>
</header><header className="mb-6 border-b border-red-700/50 pb-5">
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shadow-red-950/30 flex items-center justify-center">
        <img
          src="/ace-logo.png"
          alt="ACE logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
          {appMode === "coach" ? "ACE Coach Console" : "ACE Athlete Portal"}
        </h1>
        <p className="text-zinc-400">
          {appMode === "coach"
            ? "Manage athletes → assess → prescribe → save weekly plans"
            : "Today’s work → completion → velo tracking"}
        </p>
      </div>
    </div>

    {appMode === "coach" ? (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-400">
        Coach View
      </div>
    ) : (
      <button
        onClick={() => {
          setAppMode("coach");
          setPreviewAthleteId(null);
        }}
        className="bg-white text-black rounded-2xl px-4 py-3 text-sm font-black"
      >
        Back to Coach View
      </button>
    )}
  </div>
</header>
              </button>
            )}
          </div>
        </header>

        {appMode === "coach" && (
          <nav className="grid md:grid-cols-5 gap-3 mb-6">
            {["Athletes", "Assess", "Drills", "Arm Care", "Weekly Builder"].map((label, i) => {
              const locked = i > 1 && !unlocked;
              return (
                <button
                  key={label}
                  disabled={locked}
                  onClick={() => !locked && setActiveStep(i + 1)}
                  className={`rounded-2xl border p-4 text-left ${activeStep === i + 1 ? "bg-red-700/20 border-red-600" : "bg-zinc-950 border-zinc-800"} ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <div className="text-xs text-zinc-500 uppercase">Step {i + 1}</div>
                  <div className="font-black">{label}</div>
                </button>
              );
            })}
          </nav>
        )}

        {saveStatus && <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">{saveStatus}</div>}

        {appMode === "athlete" && (
          <AthleteMode athletes={athletes} lockedAthleteId={portalAthleteId || previewAthleteId} addDailyCompletion={addDailyCompletion} addVeloEntry={addVeloEntry} />
        )}

        {appMode === "coach" && activeStep === 1 && (
          <AthleteManager
            profile={newAthleteProfile}
            setProfile={setNewAthleteProfile}
            showAddAthlete={showAddAthlete}
            setShowAddAthlete={setShowAddAthlete}
            saveAthlete={saveAthlete}
            athletes={athletes}
            activeAthleteId={activeAthleteId}
            setActiveAthleteId={selectAthlete}
            duplicateLastWeek={duplicateLastWeek}
            setActiveWeek={setActiveWeek}
            openSavedWeek={openSavedWeek}
            viewingWeek={viewingWeek}
            setViewingWeek={setViewingWeek}
            editSavedWeek={editSavedWeek}
            openAthletePreview={(athleteId) => { setPreviewAthleteId(athleteId); setAppMode("athlete"); }}
            addDailyCompletion={addDailyCompletion}
            addVeloEntry={addVeloEntry}
            updateAthleteNotes={updateAthleteNotes}
            setActiveStep={setActiveStep}
          />
        )}

        {appMode === "coach" && activeStep === 2 && (
          <Assessment
            activeAthlete={activeAthlete}
            profile={profile}
            setProfile={setProfile}
            primaryIssues={primaryIssues}
            setPrimaryIssues={setPrimaryIssues}
            secondaryIssues={secondaryIssues}
            setSecondaryIssues={setSecondaryIssues}
            athleteType={athleteType}
            setAthleteType={setAthleteType}
            primarySoreness={primarySoreness}
            setPrimarySoreness={setPrimarySoreness}
            toggle={toggle}
            saveAssessmentToAthlete={saveAssessmentToAthlete}
          />
        )}

        {appMode === "coach" && activeStep === 3 && (
          <Database title="Recommended Drill Database" items={recommendedDrills} selected={selectedDrills} setSelected={setSelectedDrills} kind="drills" onDragStart={onDragStart} />
        )}

        {appMode === "coach" && activeStep === 4 && (
          <ArmCare items={armCare} recommendedItems={recommendedArmCare} selected={selectedArm} setSelected={setSelectedArm} onDragStart={onDragStart} />
        )}

        {appMode === "coach" && activeStep === 5 && (
          <WeeklyBuilder
            activeAthlete={activeAthlete}
            weekName={weekName}
            setWeekName={setWeekName}
            plan={plan}
            setPlan={setPlan}
            selectedDrills={selectedDrills}
            selectedArm={selectedArm}
            recommendedDrills={recommendedDrills}
            recommendedArmCare={recommendedArmCare}
            onDragStart={onDragStart}
            onDrop={onDrop}
            removeFromDay={removeFromDay}
            saveWeekToAthlete={saveWeekToAthlete}
            autoBuildWeek={autoBuildWeek}
            clearCurrentPlan={clearCurrentPlan}
          />
        )}
      </div>
    </div>
  );
}

function AthleteMode({ athletes, lockedAthleteId, addDailyCompletion, addVeloEntry }) {
  const [athleteId, setAthleteId] = useState(lockedAthleteId || athletes[0]?.id || "");
  const [veloInput, setVeloInput] = useState("");
  const [note, setNote] = useState("");
  const [effort, setEffort] = useState("Normal");

  const athlete = athletes.find((a) => String(a.id) === String(athleteId));
  const activeWeek = athlete?.activeWeekId ? athlete.plans.find((p) => p.id === athlete.activeWeekId) : null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayPlan = activeWeek?.plan?.[today];
  const completedToday = athlete?.dailyCompletions?.find((log) => log.weekId === activeWeek?.id && log.day === today);
  const bestVelo = athlete?.veloLog?.length ? Math.max(...athlete.veloLog.map((v) => Number(v.velo)).filter(Boolean)) : null;
  const lastFiveVelo = (athlete?.veloLog || []).slice(0, 5);
  const preThrow = todayPlan?.arm?.filter((item) => item.block === "Pre-Throw") || [];
  const postThrow = todayPlan?.arm?.filter((item) => item.block !== "Pre-Throw") || [];

  const submitCompletion = () => {
    if (!athlete || !activeWeek) return;
    addDailyCompletion(athlete.id, activeWeek.id, today, { completed: true, effort, note });
    if (veloInput) {
      addVeloEntry(athlete.id, {
        date: new Date().toLocaleDateString(),
        velo: veloInput,
        note: note || `Logged from athlete mode on ${today}`,
        source: "Athlete Mode",
      });
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
            <p className="text-zinc-400">Only your current day, completion, and velo trend are shown.</p>
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

            {completedToday && (
              <div className="rounded-xl border border-green-800 bg-green-950/20 px-4 py-3 text-sm text-green-200">
                Today is complete · Effort: {completedToday.effort}
              </div>
            )}

            {todayPlan ? (
              <>
                <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
                  <div className="text-xs text-zinc-500 uppercase mb-3">1. Pre-Throw Activation</div>
                  {preThrow.length ? preThrow.map((item) => (
                    <div key={item.id} className="bg-black border border-zinc-800 rounded-2xl p-4 mb-3">
                      <div className="font-black">{item.name}</div>
                      <div className="text-sm text-zinc-500">{item.prescription}</div>
                    </div>
                  )) : <p className="text-zinc-500">No pre-throw activation assigned today.</p>}
                </div>

                <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
                  <div className="text-xs text-zinc-500 uppercase mb-3">2. Drill Work</div>
                  {todayPlan.drills.length ? todayPlan.drills.map((drill) => (
                    <div key={drill.id} className="bg-black border border-zinc-800 rounded-2xl p-4 mb-3">
                      <div className="font-black">{drill.name}</div>
                      <div className="text-sm text-zinc-500">{drill.prescription}</div>
                    </div>
                  )) : <p className="text-zinc-500">No drill work assigned today.</p>}
                </div>

                <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
                  <div className="text-xs text-zinc-500 uppercase mb-3">3. Throwing</div>
                  <div className="bg-black border border-red-800 rounded-2xl p-4">
                    <div className="font-black">{todayPlan.throwing || "Off"}</div>
                    <div className="text-sm text-zinc-500">{todayPlan.throwingDetails || "Coach controls exact distance, volume, and intensity details."}</div>
                  </div>
                </div>

                <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
                  <div className="text-xs text-zinc-500 uppercase mb-3">4. Post-Throw Recovery</div>
                  {postThrow.length ? postThrow.map((item) => (
                    <div key={item.id} className="bg-black border border-zinc-800 rounded-2xl p-4 mb-3">
                      <div className="font-black">{item.name}</div>
                      <div className="text-sm text-zinc-500">{item.prescription}</div>
                    </div>
                  )) : <p className="text-zinc-500">No post-throw recovery assigned today.</p>}
                </div>

                {todayPlan.notes && (
                  <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
                    <div className="text-xs text-zinc-500 uppercase mb-2">Coach Notes</div>
                    <p className="text-zinc-300">{todayPlan.notes}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 text-zinc-500">No work assigned for today.</div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <div className="font-black text-red-400 mb-3">Submit Today</div>
              <input value={veloInput} onChange={(e) => setVeloInput(e.target.value)} placeholder="Velo today (optional)" className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 mb-3" />
              <select value={effort} onChange={(e) => setEffort(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 mb-3">
                <option>Easy</option>
                <option>Normal</option>
                <option>Hard</option>
                <option>Sore / Limited</option>
              </select>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it feel?" className="w-full bg-black border border-zinc-800 rounded-xl p-3 mb-3" />
              <button onClick={submitCompletion} disabled={!activeWeek || !todayPlan} className="w-full bg-white text-black rounded-xl py-3 font-black disabled:opacity-40">Mark Complete + Save Velo</button>
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
              <div className="font-black text-red-400 mb-2">Velo Trend</div>
              <div className="text-sm text-zinc-400 mb-3">Best logged: {bestVelo ? `${bestVelo} mph` : "--"}</div>
              {lastFiveVelo.length ? lastFiveVelo.map((v) => (
                <div key={v.id || `${v.date}-${v.velo}`} className="bg-black border border-zinc-800 rounded-xl p-3 mb-2">
                  <div className="font-black">{v.velo} mph</div>
                  <div className="text-xs text-zinc-500">{v.date}</div>
                  {v.note && <div className="text-xs text-zinc-400">{v.note}</div>}
                </div>
              )) : <p className="text-zinc-500 text-sm">No velo entries yet.</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AthleteManager({ profile, setProfile, showAddAthlete, setShowAddAthlete, saveAthlete, athletes, activeAthleteId, setActiveAthleteId, duplicateLastWeek, setActiveWeek, openSavedWeek, viewingWeek, setViewingWeek, editSavedWeek, openAthletePreview, addDailyCompletion, addVeloEntry, updateAthleteNotes, setActiveStep }) {
  return (
    <section>
      <h2 className="text-2xl font-black mb-4">Athlete Manager</h2>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-black text-xl">Add Athlete</h3>
            <button onClick={() => setShowAddAthlete(!showAddAthlete)} className="bg-white text-black rounded-xl px-3 py-2 font-black text-sm">
              {showAddAthlete ? "Close" : "+ Add"}
            </button>
          </div>
          {showAddAthlete ? (
            <>
              {Object.keys(profile).map((k) => (
                <input key={k} placeholder={k.replace(/([A-Z])/g, " $1")} value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} className="w-full mb-3 bg-black border border-zinc-800 rounded-xl px-3 py-2 outline-none focus:border-red-600" />
              ))}
              <button onClick={saveAthlete} className="bg-white text-black w-full rounded-xl py-3 font-black">Save Athlete</button>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Click + Add to create a new athlete. Athlete details only show after you select an athlete from the list.</p>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl">
          <h3 className="font-black text-xl mb-3">Your Athletes</h3>
          {athletes.length === 0 && <p className="text-zinc-500">No athletes saved yet.</p>}
          {athletes.map((a) => (
            <button key={a.id} onClick={() => setActiveAthleteId(a.id)} className={`w-full text-left p-3 mb-2 rounded-xl border ${activeAthleteId === a.id ? "bg-red-700/20 border-red-600" : "bg-black border-zinc-800"}`}>
              <div className="font-black">{a.name}</div>
              <div className="text-sm text-zinc-400">{a.level || "Level"} · {a.hand || "Hand"}</div>
              <div className="text-sm text-zinc-500">Velo: {a.currentVelo || "--"} → {a.targetVelo || "--"}</div>
            </button>
          ))}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl">
          <h3 className="font-black text-xl mb-3">Saved Work</h3>
          {athletes.find((a) => a.id === activeAthleteId) ? (
            <AthleteSummary athlete={athletes.find((a) => a.id === activeAthleteId)} duplicateLastWeek={duplicateLastWeek} setActiveWeek={setActiveWeek} openSavedWeek={openSavedWeek} openAthletePreview={openAthletePreview} addVeloEntry={addVeloEntry} updateAthleteNotes={updateAthleteNotes} />
          ) : (
            <p className="text-zinc-500">Select an athlete to view saved weeks and assessment history.</p>
          )}
        </div>
      </div>
      {viewingWeek && <SavedWeekModal week={viewingWeek} onClose={() => setViewingWeek(null)} onEdit={() => editSavedWeek(viewingWeek)} />}
    </section>
  );
}

function AthleteSummary({ athlete, duplicateLastWeek, setActiveWeek, openSavedWeek, openAthletePreview, addVeloEntry, updateAthleteNotes }) {
  const activeWeek = athlete.activeWeekId ? athlete.plans.find((p) => p.id === athlete.activeWeekId) : null;
  const latestAssessment = athlete.assessments?.[0];
  const [veloInput, setVeloInput] = useState("");
  const [veloNote, setVeloNote] = useState("");

  const bestVelo = athlete.veloLog?.length
    ? Math.max(...athlete.veloLog.map((v) => Number(v.velo)).filter(Boolean))
    : null;

  const activeWeekDays = activeWeek ? Object.keys(activeWeek.plan || {}) : [];
  const weekCompletions = (athlete.dailyCompletions || []).filter(
    (log) => log.weekId === athlete.activeWeekId && log.completed
  );
  const completedDayNames = new Set(weekCompletions.map((log) => log.day));
  const completedDays = completedDayNames.size;
  const totalDays = activeWeekDays.length || 0;
  const completionRate = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  const sortedCompletions = [...(athlete.dailyCompletions || [])]
    .filter((log) => log.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  const seenDates = new Set();
  for (const log of sortedCompletions) {
    if (!seenDates.has(log.date)) {
      seenDates.add(log.date);
      streak += 1;
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const last7Completed = new Set(
    (athlete.dailyCompletions || [])
      .filter((log) => log.completed && new Date(log.date) >= sevenDaysAgo)
      .map((log) => log.date)
  ).size;

  const submitVelo = () => {
    if (!veloInput) return;
    addVeloEntry(athlete.id, {
      date: new Date().toLocaleDateString(),
      velo: veloInput,
      note: veloNote,
      source: "Coach view placeholder",
    });
    setVeloInput("");
    setVeloNote("");
  };

  return (
    <div>
      <div className="rounded-2xl bg-black border border-zinc-800 p-4 mb-4">
        <div className="text-xs text-zinc-500 uppercase">Athlete Snapshot</div>
        <div className="text-2xl font-black">{athlete.name}</div>
        <div className="text-zinc-400">{athlete.age || "--"} yrs · {athlete.level || "Level"} · {athlete.hand || "Hand"}</div>
        <div className="text-zinc-400">Goal: {athlete.goals || "--"}</div>
        <div className="text-zinc-400">Velo: {athlete.currentVelo || "--"} → {athlete.targetVelo || "--"}</div>
        <div className="text-zinc-400">Best logged: {bestVelo ? `${bestVelo} mph` : "--"}</div>
        <button onClick={() => openAthletePreview(athlete.id)} className="mt-3 w-full bg-red-700 text-white rounded-xl py-2 font-black">View as Athlete</button>
      </div>

      <div className="rounded-2xl bg-red-950/20 border border-red-800 p-4 mb-4">
        <div className="text-xs text-red-300 uppercase font-black">Current Program</div>
        {activeWeek ? (
          <button onClick={() => openSavedWeek(activeWeek)} className="text-left w-full mt-2">
            <div className="text-xl font-black">{activeWeek.weekName}</div>
            <div className="text-xs text-zinc-400">Click to view full week</div>
          </button>
        ) : (
          <p className="text-zinc-500 mt-2">No active week set.</p>
        )}
      </div>

      <div className="rounded-2xl bg-black border border-zinc-800 p-4 mb-4">
        <div className="font-black text-red-400 mb-2">Latest Assessment</div>
        {latestAssessment ? (
          <div className="text-sm text-zinc-300 space-y-1">
            <div>Primary: {latestAssessment.primaryIssues?.join(", ") || "--"}</div>
            <div>Secondary: {latestAssessment.secondaryIssues?.join(", ") || "--"}</div>
            <div>Soreness / Build-Up: {latestAssessment.primarySoreness?.join(", ") || "--"}</div>
            <div>Athlete Type: {latestAssessment.athleteType?.join(", ") || "--"}</div>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No assessment saved yet.</p>
        )}
      </div>

      <div className="rounded-2xl bg-black border border-zinc-800 p-4 mb-4">
        <div className="font-black text-red-400 mb-2">Workload / Consistency</div>
        <div className="flex justify-between text-sm text-zinc-300 mb-2">
          <span>Current Week Completion</span>
          <span className="font-black">{completionRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden mb-3">
          <div className="h-full bg-red-700" style={{ width: `${completionRate}%` }} />
        </div>
        <div className="flex justify-between text-sm text-zinc-300 mb-2">
          <span>Completed Days</span>
          <span>{completedDays}/{totalDays || 0}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-300 mb-2">
          <span>Current Streak</span>
          <span>{streak} days</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-300">
          <span>Last 7 Days</span>
          <span>{last7Completed}/7</span>
        </div>
      </div>

      <div className="rounded-2xl bg-black border border-zinc-800 p-4 mb-4">
        <div className="font-black text-red-400 mb-2">Velo Log</div>
        <div className="flex gap-2 mb-3">
          <input value={veloInput} onChange={(e) => setVeloInput(e.target.value)} placeholder="mph" className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2" />
          <input value={veloNote} onChange={(e) => setVeloNote(e.target.value)} placeholder="note" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2" />
          <button onClick={submitVelo} className="bg-white text-black rounded-xl px-3 py-2 font-black">Add</button>
        </div>
        {(!athlete.veloLog || athlete.veloLog.length === 0) && <p className="text-zinc-500 text-sm">No velo entries yet.</p>}
        {(athlete.veloLog || []).slice(0, 5).map((v) => (
          <div key={v.id || `${v.date}-${v.velo}`} className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-2 text-sm">
            <div className="font-bold">{v.velo} mph <span className="text-zinc-500 font-normal">· {v.date}</span></div>
            {v.note && <div className="text-zinc-400">{v.note}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-black border border-zinc-800 p-4 mb-4">
        <div className="font-black text-red-400 mb-2">Coach Notes</div>
        <textarea value={athlete.mechanicalNotes || ""} onChange={(e) => updateAthleteNotes(athlete.id, "mechanicalNotes", e.target.value)} placeholder="Mechanical cues..." className="w-full mb-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2" />
        <textarea value={athlete.armCareNotes || ""} onChange={(e) => updateAthleteNotes(athlete.id, "armCareNotes", e.target.value)} placeholder="Arm care notes..." className="w-full mb-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2" />
        <textarea value={athlete.generalNotes || ""} onChange={(e) => updateAthleteNotes(athlete.id, "generalNotes", e.target.value)} placeholder="General development notes..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2" />
      </div>

      <div className="mb-4">
        <div className="font-black text-red-400 mb-2">Saved Weeks</div>
        {athlete.plans.length === 0 && <p className="text-zinc-500">No plans saved yet.</p>}
        {athlete.plans.map((p) => {
          const isActive = athlete.activeWeekId === p.id;
          return (
            <div key={p.id} className={`bg-black border rounded-xl p-3 mb-2 ${isActive ? "border-red-600" : "border-zinc-800"}`}>
              <button onClick={() => openSavedWeek(p)} className="text-left w-full">
                <div className="font-bold flex items-center gap-2">{p.weekName} {isActive && <span className="text-xs text-red-400">ACTIVE</span>}</div>
                <div className="text-xs text-zinc-400">
                Phase: {p.phase || "Build"}
                </div>
                <div className="text-xs text-zinc-500">Created {p.createdAt}</div>
              </button>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setActiveWeek(p.id)} className="text-xs bg-red-700 text-white rounded-lg px-2 py-1">Set Active</button>
                <button onClick={() => openSavedWeek(p)} className="text-xs bg-zinc-800 text-white rounded-lg px-2 py-1">View</button>
              </div>
            </div>
          );
        })}
        <button onClick={duplicateLastWeek} className="mt-2 bg-white text-black rounded-xl px-4 py-2 font-black">Duplicate Last Week</button>
      </div>

      <div>
        <div className="font-black text-red-400 mb-2">Assessment History</div>
        {athlete.assessments.length === 0 && <p className="text-zinc-500">No assessments saved yet.</p>}
        {athlete.assessments.map((a) => (
          <div key={a.id} className="bg-black border border-zinc-800 rounded-xl p-3 mb-2">
            <div className="font-bold">{a.date}</div>
            <div className="text-xs text-zinc-400">Primary: {a.primaryIssues.join(", ")}</div>
            {a.primarySoreness?.length > 0 && <div className="text-xs text-zinc-400">Soreness: {a.primarySoreness.join(", ")}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedWeekModal({ week, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between gap-4 items-start mb-5">
          <div><h2 className="text-3xl font-black">{week.weekName}</h2><p className="text-red-400 font-black text-sm uppercase">
  Phase: {week.phase || "Build"}
</p><p className="text-zinc-400">Created {week.createdAt}</p></div>
          <div className="flex gap-2"><button onClick={onEdit} className="bg-white text-black rounded-xl px-4 py-2 font-black">Edit Week</button><button onClick={onClose} className="bg-zinc-800 text-white rounded-xl px-4 py-2 font-black">Close</button></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {days.map((day) => {
            const d = week.plan[day];
            const pre = d?.arm?.filter((item) => item.block === "Pre-Throw") || [];
            const post = d?.arm?.filter((item) => item.block !== "Pre-Throw") || [];
            return <div key={day} className="rounded-2xl bg-black border border-zinc-800 p-4"><div className="flex justify-between mb-3"><h3 className="text-xl font-black">{day}</h3><span className="text-xs text-red-400 font-bold">{d?.type}</span></div><div className="mb-3"><div className="text-xs text-zinc-500 uppercase mb-1">Pre-Throw Activation</div>{pre.length ? pre.map((x) => <div key={x.id} className="text-sm bg-zinc-950 border border-zinc-800 rounded-lg p-2 mb-1">{x.name}</div>) : <p className="text-zinc-600 text-sm">None</p>}</div><div className="mb-3"><div className="text-xs text-zinc-500 uppercase mb-1">Drill Work</div>{d?.drills?.length ? d.drills.map((x) => <div key={x.id} className="text-sm bg-zinc-950 border border-zinc-800 rounded-lg p-2 mb-1">{x.name}</div>) : <p className="text-zinc-600 text-sm">None</p>}</div><div className="mb-3"><div className="text-xs text-zinc-500 uppercase mb-1">Throwing</div><div className="text-sm bg-zinc-950 border border-red-900 rounded-lg p-2 mb-1">{d?.throwing || "Off"}</div>{d?.throwingDetails && <div className="text-xs text-zinc-500">{d.throwingDetails}</div>}</div><div className="mb-3"><div className="text-xs text-zinc-500 uppercase mb-1">Post-Throw Recovery</div>{post.length ? post.map((x) => <div key={x.id} className="text-sm bg-zinc-950 border border-zinc-800 rounded-lg p-2 mb-1">{x.name}</div>) : <p className="text-zinc-600 text-sm">None</p>}</div>{d?.notes && <div className="text-sm text-zinc-400 border-t border-zinc-800 pt-2">{d.notes}</div>}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

function Assessment({ activeAthlete, profile, setProfile, primaryIssues, setPrimaryIssues, secondaryIssues, setSecondaryIssues, athleteType, setAthleteType, primarySoreness, setPrimarySoreness, toggle, saveAssessmentToAthlete }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <h2 className="text-2xl font-black mb-2">Assessment</h2>
        <p className="text-zinc-400">
          {activeAthlete ? `Active athlete: ${activeAthlete.name}` : "No athlete selected. Select an athlete before saving."}
        </p>
      </div>

      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <h2 className="text-xl font-black mb-2">Assessment Checklist</h2>
        <p className="text-zinc-400 mb-4">
          Select at least one Primary Issue. Red = Primary, gray = Secondary, white = Athlete Type.
        </p>

        {assessmentSections.filter((s) => s.tags).map((s) => (
          <div key={s.title} className="mb-5">
            <h3 className="font-black text-red-400 mb-2">{s.title}</h3>
            <div className="flex flex-wrap gap-2">
              {s.tags.map((t) => {
                const isType = s.title === "Athlete Type";
                const isPrimary = primaryIssues.includes(t);
                const isSecondary = secondaryIssues.includes(t);
                const isAthleteType = athleteType.includes(t);

                return (
                  <button
                    key={t}
                    onClick={() => {
                      if (isType) return toggle(t, athleteType, setAthleteType);
                      if (isPrimary) {
                        setPrimaryIssues(primaryIssues.filter((x) => x !== t));
                        setSecondaryIssues([...secondaryIssues, t]);
                      } else if (isSecondary) {
                        setSecondaryIssues(secondaryIssues.filter((x) => x !== t));
                      } else {
                        setPrimaryIssues([...primaryIssues, t]);
                      }
                    }}
                    className={`rounded-full border px-3 py-2 text-sm ${
                      isPrimary
                        ? "bg-red-700 border-red-500"
                        : isSecondary
                        ? "bg-zinc-700 border-zinc-500"
                        : isAthleteType
                        ? "bg-white text-black border-white"
                        : "bg-black border-zinc-800"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5">
        <div className="font-black text-red-400 mb-2">Primary Soreness / Build-Up Area</div>
        <p className="text-zinc-500 text-sm mb-3">
          Select what needs the most arm-care attention this week.
        </p>

        <div className="flex flex-wrap gap-2">
          {["Front Shoulder", "Back Shoulder", "Elbow / Biceps", "Forearm", "Lat / Triceps", "Neck / Trap", "Scap / Upper Back"].map((s) => (
            <button
              key={s}
              onClick={() => toggle(s, primarySoreness, setPrimarySoreness)}
              className={`rounded-full border px-3 py-2 text-sm ${
                primarySoreness.includes(s)
                  ? "bg-red-700 border-red-500"
                  : "bg-black border-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={saveAssessmentToAthlete}
        disabled={!activeAthlete || primaryIssues.length === 0}
        className="w-full bg-red-700 text-white rounded-xl py-3 font-black disabled:opacity-40"
      >
        Save Assessment
      </button>
    </section>
  );
}

function WeeklyBuilder({ activeAthlete, weekName, setWeekName, plan, setPlan, selectedDrills, selectedArm, recommendedDrills, recommendedArmCare, onDragStart, onDrop, removeFromDay, saveWeekToAthlete, autoBuildWeek, clearCurrentPlan, phase, setPhase }) {
  return (
    <section>
      <div className="flex justify-between gap-4 flex-wrap mb-4"><div><h2 className="text-2xl font-black">Drag & Drop Weekly Builder</h2><p className="text-zinc-400">{activeAthlete ? `Saving to ${activeAthlete.name}` : "Select an athlete before saving."}</p></div><div className="flex gap-2 flex-wrap"><input value={weekName} onChange={(e) => setWeekName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-2" /><button onClick={autoBuildWeek} className="bg-red-700 text-white rounded-xl px-4 py-2 font-black">Auto Build Suggestion</button><button onClick={clearCurrentPlan} className="bg-zinc-800 text-white rounded-xl px-4 py-2 font-black">Clear</button><button onClick={saveWeekToAthlete} className="bg-white text-black rounded-xl px-4 py-2 font-black">Save Week</button></div></div>
      {!activeAthlete && <div className="mb-4 rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-200">Create or select an athlete first if you want the week to save.</div>}
      <div className="mb-4 w-full max-w-xs">
  <label className="block text-sm font-semibold mb-1 text-white">Phase</label>
  <select
    value={phase}
    onChange={(e) => setPhase(e.target.value)}
    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white"
  >
    <option>Build</option>
    <option>Strength</option>
    <option>Maintain</option>
    <option>Deload</option>
  </select>
</div>
      <div className="grid lg:grid-cols-4 gap-5"><div className="lg:col-span-1 space-y-3"><h3 className="font-black text-red-400">Selected + Recommended</h3><div className="text-xs text-zinc-500 uppercase">Selected Drills</div>{selectedDrills.map((i) => <Mini key={i.id} item={i} kind="drills" onDragStart={onDragStart} />)}<div className="text-xs text-zinc-500 uppercase pt-3">Recommended Drills</div>{recommendedDrills.slice(0, 12).map((i) => <Mini key={`rec-${i.id}`} item={i} kind="drills" onDragStart={onDragStart} />)}<div className="text-xs text-zinc-500 uppercase pt-3">Selected Arm Care</div>{selectedArm.map((i) => <Mini key={i.id} item={i} kind="arm" onDragStart={onDragStart} />)}<div className="text-xs text-zinc-500 uppercase pt-3">Recommended Arm Care</div>{recommendedArmCare.slice(0, 12).map((i) => <Mini key={`rec-arm-${i.id}`} item={i} kind="arm" onDragStart={onDragStart} />)}</div><div className="lg:col-span-3 grid md:grid-cols-2 gap-4">{days.map((day) => { const pre = plan[day].arm.filter((item) => item.block === "Pre-Throw"); const post = plan[day].arm.filter((item) => item.block !== "Pre-Throw"); return <div key={day} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, day)} className="min-h-64 rounded-3xl bg-zinc-950 border border-zinc-800 p-4"><div className="flex justify-between items-center mb-3"><h3 className="font-black text-xl">{day}</h3><select value={plan[day].type} onChange={(e) => setPlan({ ...plan, [day]: { ...plan[day], type: e.target.value } })} className="bg-black border border-zinc-700 rounded-lg p-1">{dayTypes.map((t) => <option key={t}>{t}</option>)}</select></div><Bucket label="Pre-Throw Activation" items={pre} day={day} kind="arm" remove={removeFromDay} /><Bucket label="Drill Work" items={plan[day].drills} day={day} kind="drills" remove={removeFromDay} /><div className="mb-3"><div className="text-xs text-zinc-500 uppercase mb-1">Throwing</div><select value={plan[day].throwing || "Off"} onChange={(e) => setPlan({ ...plan, [day]: { ...plan[day], throwing: e.target.value } })} className="w-full bg-black border border-zinc-700 rounded-xl p-2">{throwingTypes.map((t) => <option key={t}>{t}</option>)}</select><input value={plan[day].throwingDetails || ""} onChange={(e) => setPlan({ ...plan, [day]: { ...plan[day], throwingDetails: e.target.value } })} placeholder="Throwing details: distance, volume, focus..." className="w-full mt-2 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm" /></div><Bucket label="Post-Throw Recovery" items={post} day={day} kind="arm" remove={removeFromDay} /><textarea value={plan[day].notes} onChange={(e) => setPlan({ ...plan, [day]: { ...plan[day], notes: e.target.value } })} placeholder="Coach notes..." className="w-full mt-3 bg-black border border-zinc-800 rounded-xl p-2" /></div>; })}</div></div>
    </section>
  );
}

function Mini({ item, kind, onDragStart }) {
  return <div draggable onDragStart={(e) => onDragStart(e, item, kind)} className="rounded-xl bg-black border border-zinc-800 p-3 cursor-grab"><div className="font-bold text-sm">{item.name}</div><div className="text-xs text-zinc-500">drag to day</div></div>;
}

function Bucket({ label, items, day, kind, remove }) {
  return <div className="mb-3"><div className="text-xs text-zinc-500 uppercase mb-1">{label}</div><div className="space-y-2">{items.map((i) => <div key={i.id} className="bg-black border border-zinc-800 rounded-xl p-2 text-sm flex justify-between gap-2"><span>{i.name}</span><button onClick={() => remove(day, i.id, kind)} className="text-red-400">remove</button></div>)}</div></div>;
}

function Database({ title, items, selected, setSelected, kind, onDragStart }) {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => JSON.stringify(i).toLowerCase().includes(q.toLowerCase()));
  return <section><div className="flex justify-between gap-3 mb-4 flex-wrap"><div><h2 className="text-2xl font-black">{title}</h2><p className="text-zinc-400">{filtered.length} drills loaded · tagged by fix, type, level, intent, environment</p></div><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags..." className="bg-black border border-zinc-800 rounded-xl px-4 py-2" /></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map((d) => <article key={d.id} draggable onDragStart={(e) => onDragStart(e, d, kind)} className={`rounded-3xl border p-5 ${selected.some((x) => x.id === d.id) ? "border-red-600 bg-red-950/20" : "border-zinc-800 bg-zinc-950"}`}><div className="h-24 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 mb-3">{d.video}</div><h3 className="font-black text-lg">{d.name}</h3><div className="text-sm text-red-400">L{d.level} · {d.category} · {d.type}</div><p className="text-zinc-300 text-sm my-2">{d.note}</p><div className="text-sm font-bold mb-2">{d.prescription}</div><div className="flex flex-wrap gap-1 mb-3">{d.fixes.map((f) => <span key={f} className="text-xs border border-zinc-700 rounded-full px-2 py-1">{f}</span>)}</div><button onClick={() => setSelected(selected.some((x) => x.id === d.id) ? selected.filter((x) => x.id !== d.id) : [...selected, d])} className="w-full bg-white text-black rounded-xl py-2 font-black">{selected.some((x) => x.id === d.id) ? "Selected" : "Select"}</button></article>)}</div></section>;
}

function ArmCare({ items, recommendedItems = [], selected, setSelected, onDragStart }) {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => JSON.stringify(i).toLowerCase().includes(q.toLowerCase()));
  const pre = filtered.filter((i) => i.block === "Pre-Throw");
  const post = filtered.filter((i) => i.block === "Post-Throw");
  const other = filtered.filter((i) => !["Pre-Throw", "Post-Throw"].includes(i.block));
  return <section><div className="flex justify-between gap-3 mb-5 flex-wrap"><div><h2 className="text-2xl font-black">Arm Care Database</h2><p className="text-zinc-400">Tagged by muscle group, function, intensity, equipment, and day type</p>{recommendedItems.length > 0 && <p className="text-red-400 text-sm mt-1">{recommendedItems.length} currently recommended from assessment/soreness tags.</p>}</div><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search muscle/function/equipment..." className="bg-black border border-zinc-800 rounded-xl px-4 py-2" /></div><div className="grid xl:grid-cols-2 gap-5 mb-6"><ArmCareColumn title="Pre-Throw Activation" subtitle="Prep the throwing shoulder before throwing" items={pre} selected={selected} setSelected={setSelected} onDragStart={onDragStart} /><ArmCareColumn title="Post-Throw Recovery" subtitle="Decel, recovery, and tissue capacity after throwing" items={post} selected={selected} setSelected={setSelected} onDragStart={onDragStart} /></div><div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5"><h3 className="text-xl font-black mb-1">Day-Specific Arm Care</h3><p className="text-zinc-400 mb-4">Recovery Day, Medium Intent Day, and Intense Throwing Day options.</p><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{other.map((a) => <ArmCard key={a.id} a={a} selected={selected} setSelected={setSelected} onDragStart={onDragStart} />)}</div></div></section>;
}

function ArmCareColumn({ title, subtitle, items, selected, setSelected, onDragStart }) {
  return <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5"><div className="mb-4"><h3 className="text-xl font-black uppercase">{title}</h3><p className="text-zinc-400 text-sm">{subtitle}</p><div className="text-red-400 font-black mt-2">{items.length} exercises</div></div><div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">{items.map((a) => <ArmCard key={a.id} a={a} selected={selected} setSelected={setSelected} onDragStart={onDragStart} />)}</div></div>;
}

function ArmCard({ a, selected, setSelected, onDragStart }) {
  const isSelected = selected.some((x) => x.id === a.id);
  return <article draggable onDragStart={(e) => onDragStart(e, a, "arm")} className={`rounded-2xl border p-4 ${isSelected ? "border-red-600 bg-red-950/20" : "border-zinc-800 bg-black"}`}><div className="h-20 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 mb-3">{a.video}</div><div className="flex justify-between gap-3"><h3 className="font-black text-lg">{a.name}</h3><span className="text-xs rounded-full bg-zinc-900 border border-zinc-700 px-2 py-1 h-fit">{a.intensity}</span></div><div className="text-sm text-red-400 font-bold">{a.block}</div><div className="text-sm font-bold my-2">{a.prescription}</div><div className="mb-2"><div className="text-xs text-zinc-500 uppercase">Muscle Groups</div><div className="flex flex-wrap gap-1">{a.muscleTags.map((t) => <span key={t} className="text-xs border border-zinc-700 rounded-full px-2 py-1">{t}</span>)}</div></div><div className="mb-3"><div className="text-xs text-zinc-500 uppercase">Function</div><div className="flex flex-wrap gap-1">{a.functionTags.map((t) => <span key={t} className="text-xs border border-zinc-700 rounded-full px-2 py-1">{t}</span>)}</div></div><button onClick={() => setSelected(isSelected ? selected.filter((x) => x.id !== a.id) : [...selected, a])} className="w-full bg-white text-black rounded-xl py-2 font-black">{isSelected ? "Selected" : "Select"}</button></article>;
}
