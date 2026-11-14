# Narration audit — 14 November 2026

| Screen / interaction | Current recording | Verification |
|---|---|---|
| Opening voyage, fault, descent, received crew message | Original supplied English crew recordings, credited to the team / ElevenLabs | Retained deliberately; their speaker is the crew |
| Three-card story recap after opening | Michael: recap-separated, recap-landed, recap-goal | Actual automatic playback and replay in browser |
| Robot discovery and wake | Michael: discover / wake | Cinematic audio paths verified |
| Movement, device help, garden actions | Original 38 Michael guidance clips | Guided browser journey and playback test |
| Four garden science cards | Four Michael WAV recordings | Both crop routes / replay and stop |
| Water, power, garden and field lesson pages | Michael lesson-*-intro / numbered frames | 46-cue supplemental library decoded and played |
| All four transfer questions and correct / retry feedback | Michael lesson-*-question / quiz-yes / quiz-retry | Wrong answer cannot continue; correct answer unlocks continuation |
| Radio connection / tuning / transmission | Michael radio-connect / radio-tune / radio-transmit | Real slider interaction plus audio cue test |
| Field-note sequence and chapter ending | Michael field-* / end-airlock | Full journey through report, resumed question and ending |
| Optional archive experts | Original supplied James performances | Retained; speaker identified as crew specialist |
| Short panel guides | Explicit prerecorded cue per panel | No whole-dialog browser TTS |

Installed scripts, durations and SHA-256 hashes: `dist/michael-voice.json`, `dist/michael-phase.json`, `dist/assets/audio/garden-michael/manifest.json`. Supplemental production script: `production/PHASE_ONE_NARRATION.json`. Kokoro generation uses local CPU inference, followed by FFmpeg loudness normalization. These are AI-generated performances, not a recording of a child or an imitation of a crew actor.

Player names remain visible in captions and the journey log. Their names are not newly synthesized. Free-form unmatched dynamic lines remain caption-only. The narration is intentionally a short spoken guide where the panel also contains optional details, source links and numeric status. Browser tests establish file availability and playback, not a human listening evaluation of every pronunciation.
