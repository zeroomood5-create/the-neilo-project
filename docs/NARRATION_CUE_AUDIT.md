# NEILO · Recording sheet and audio audit
Language: English (US). Player names remain local and displayed; they are not sent to a speech service. The editor may replace any line below by cue ID without relying on the wording of the entire screen. Technical actions, counters, credits roll and long source text do not need a voice for every character on screen.

| Where | Narrator | Trigger / repeat | What changed |
|---|---|---|---|
| Opening, harness and descent | Mission Commander / capsule, supplied James | Auto with scene; pause and mute controls | Character-specific track retained, not the NEILO voice. |
| Where you are: three story recap cards | Michael | Each card; Hear again | Replaced unrecorded commander/device synthesis with a dedicated clip per story beat. |
| Robot discovery, wake-up and first signal | Michael | Auto with cinematic | Discovery had been intentionally silent in v8; now narrated. No original Valf VO used in this sequence. |
| Interactive tutorial | Michael | Auto at walk/find/help stages; repeat | Replay follows the current guide stage, not stale status from the previous stage. |
| Window, awake robot, console and interior panels | Michael | Visit, Help and Hear a short guide as applicable | Panel guide now uses a short identified recording, not an attempted reading of a concatenated title, labels and buttons. |
| Mentor archive / crew radio | James | On receipt or Play recording | Uses supplied English character performance. Entering the archive had wrongly asked NEILO to speak the entire specialist quote. |
| Wiring, water, calibration, transmission | Michael | Opening or feedback/guide controls according to station | Real narration for alignment and transmission; shared slots, volts of a real device and game budget must not be confused. |
| Science: water, power, garden, field notes | Michael | Intro, each illustration, transfer question, repeat, choice feedback | Each scripted page selects its exact cue by mission and page; it no longer depends on a keyword match. Questions include both options in the recording. Optional journal review reuses the same cues. |
| Growing workshop | Michael | Help, hear guide; four automatic/replayable science cards | Help follows crop and stage. Four original recorded science cards retained. |
| Field notes | Michael | Phase guide, Hear again, Help | The spoken guide uses the active job, including the dash and the relay. |
| Airlock demo ending | Michael | Chapter finale | Base restored, next exploration teased. This is the demo endpoint. |
| Dynamic play | Michael cue when matched; text otherwise | Resource counters, journal, custom name, freely composed state | A spoken summary may be shorter than the caption. Never use OS speech for a missing recording. Muting, navigating or hiding the tab cancels the current line. |

**Recording scripts:** [original 38 robot cues](../production/MICHAEL_ROBOT_MANIFEST.json), [4 greenhouse discoveries](../production/MICHAEL_GARDEN_SCIENCE.json), [additional English recording sheet](../production/PHASE_ONE_NARRATION.json), [supplied crew and historical voices](../dist/voice-lines.json). These manifests distinguish new synthetic speech from existing crew performances. Optional archive metadata may include historical voice assets that do not play in the current journey. A child’s personal name is visual, not synthesized.

**Rebuild:** run `node scripts/build-phase-narration.mjs`, then use the project’s installed Kokoro Python to run `scripts/build-phase-narration.py`. All generated additions use local am_michael, speed 0.96, Kokoro 1.0 INT8; recorded files are normalized and encoded via FFmpeg. No external child voice, account, API key, or uploaded portrait was needed. A new recording must correspond to a stable cue in the manifest. `dist/michael-phase*.json` contains actual encoded hashes and recorded duration. The archive of earlier voices is retained in source for reproducibility.

**QA:** `tests/phase-narration.mjs` plays the real intro recap and each mission-science narration (actual Audio playback, not just 200 responses), checks that wrong answers cannot advance, decodes the installed Michael media and tests that the resolver maps scripts back to the expected cues. `tests/michael-game.mjs` covers previous tutorial and garden voice regressions.
