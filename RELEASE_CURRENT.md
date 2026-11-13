# Current NEILO release

Assembly and verification record: 2026-11-13 23:22:19 +02:00, Africa/Cairo.

Implemented First Signal plus two garden planning rounds and a field-notes mission. The garden includes crop selection, light/water prerequisites, simulation calendar, harvest, cooking, reserve meals, replanning and saved progress. The field assignment includes robot priority, a real 84-point RAD graph, missing-data recovery, a separate M12 study, alternative report scopes and a deferred relay task.

Both additions end with named, source-linked explanations, and can be revisited through the journey log. Child-facing screens carry an AI-art indicator. Asset metadata and AI/code disclosure are in docs/.

The supplied Interstellar file was compressed before loudness adjustment to tame the middle swell, with a quiet runtime gain and further reduction during speech. Processing used FFmpeg acompressor (ratio 5, threshold 0.12), loudnorm (target -25 LUFS, LRA 5), limiter and edge fades. The original file stays intact.

Checks completed
- Ten state-transition tests, including two crop routes, idempotent harvest/report, missing data and save compatibility.
- Campaign browser completion through garden growth, reload, cooking, science and field report.
- Campaign layouts at 390×844, 844×390 and 360×640.
- All 13 supplied voice hashes and durations.

Limits
- Scientific interpretation awaits named team review. No child playtest or measured learning outcome.
- New science narration uses browser speech. No new successful ElevenLabs generation.
- Live portrait generation requires server configuration and has not been evaluated.
- Health activities from the new report are screened proposals. They are separate from the implemented garden/RAD campaign.
- Earth communication delay remains a planned extension.
- The public v5 website is a separate deployment. The current expanded release runs locally on port 4176 and is published as source files to the linked repository.

Additional baseline validation passed after integration: full First Signal journey and save/reload across five viewport sizes. The three scientific mission cards pass the structural validator and remain needs-review for named scientific sign-off.
