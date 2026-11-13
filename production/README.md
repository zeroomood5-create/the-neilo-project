# NEILO — Production and implementation handoff

Date: 13 November 2026, Africa/Cairo.
The structure, visual redesign, motion, scientific explanations, narration and final presentation are one workstream. The production copy targets the planned redesign. The running build currently retains the garden/RAD implementation described in RELEASE_CURRENT.md.

## What to send back

1. Review JAMES_NEW_MASTER.txt and VALF_NEW_MASTER.txt. Generate each as one recording using the existing selected James and Valf voices. Read only the master text.
2. Keep roughly two seconds of silence between paragraphs. Do not read IDs, headings, instructions or file names. Avoid music, sound effects and automatic changes in speaking style.
3. Use calm, clear English with short natural sentences. Neilo is curious and friendly. James explains science without sounding urgent. Pronounce NEILO as NEE-loh. Keep the exact selected voice names/IDs in your delivery note.
4. Return the two MP3 or WAV files. If you revise wording, return the revised text as well so caption and audio match.
5. For the presentation, generate PITCH_VOICE_MASTER.txt separately with James. Its timing will be measured before the final 30-second edit.
6. Flow outputs are individual MP4 files named from FLOW_PROMPTS.md. First send SCI-POWER-A/B for style and continuity review, then produce the remaining approved shots.

The 13 imported recordings are already available. VOICE_MANIFEST.json lists those for reuse, plus 41 new lines. Do not regenerate the opening and existing specialist lines merely to complete this batch.

## File map

- JAMES_NEW_MASTER.txt contains 12 source-backed science paragraphs.
- VALF_NEW_MASTER.txt contains 29 companion/transfer-question paragraphs.
- VOICE_CUE_SHEET.md shows the order, scene and status for each new line.
- VOICE_MANIFEST.json is the machine-readable source for splitting and matching.
- FLOW_PROMPTS.md contains references, start/end composition, motion and scientific constraints for six clip types.
- PITCH_30_SECONDS.md contains the presentation script and timed shot list.
- PITCH_VOICE_MASTER.txt contains only the spoken presentation text.

New speech is divided between current-science lines matching existing explanations and redesign-target lines intended for the new interactions. The latter need implementation binding before they can play in context. Names stay in visible personal dialogue and the saved profile. A single static master recording cannot speak arbitrary future names. Personalized spoken names require a separate generation path.

## Audio import workflow

Preserve supplied masters, note their voice and date, then transcribe and align paragraphs against VOICE_MANIFEST.json. Review every boundary and listen for cut words, breath clipping, long gaps and mismatched sentences. Split to stable filenames and record duration and SHA-256. Match captions to accepted wording. Hook cues to actual game state, and test that revisiting a station does not play conflicting lines. Recorded dialogue ducks the background track. Video transitions follow media completion. Do not let an old authored timer leave dead air after the recording ends.

## Integrated delivery gates

| Gate | Output | Acceptance |
| --- | --- | --- |
| Version | One preview URL and visible build identity in the review menu | Ahmed reaches the same garden and source data from the normal entry |
| Movement | Continuous phase, smooth start/stop, stable feet and delayed companion following | Short taps, sustained movement, rapid retarget, direction change, mobile and reduced motion |
| Look | One storyboard, room composition and source/explanation style | Explorer, Neilo, trays and equipment match the established world |
| Interaction | Redesigned power task with at least two plans | Child tests a plan, sees the reason it works or fails and can recover |
| Science | Source card, explicit simplification and actual choice consequence | No invented agency measurements, missing values stay missing, source dates stay distinct |
| Voice | Two approved masters, verified splits and caption matches | Every scripted cue has one accepted recording and an identifiable trigger |
| Story film | Approved Flow clips with transition continuity | No floating explorer overlay; no generated UI or dataset text |
| Presentation | 30-second cut using real gameplay | Problem, player action, visible result, NASA/CSA role and personal experience readable at normal speed |
| Release | Tested source commit, asset metadata, public preview and submission notes | Same tested build is the one shared and demonstrated |

## Documentation at every gate

Record date/time in Cairo, decision and reason, changed files, source fact and limits, prompt/input references for generated media, voice identity, original and derived asset hashes, implementation status, tests and observed issues, deployment URL and source commit. Store approvals and unresolved questions in the build record. Keep a backup before each major gameplay or media replacement.

## Movement status in this update

The runtime now preserves walk-cycle phase across retargeting, eases walking speed toward the destination, and interpolates Neilo’s position across direction changes. This fixes concrete logic issues identified in scene.js. Frame-by-frame art alignment, gait quality and alternate suit consistency remain visual review work in the redesigned production. Existing artwork has not been regenerated by this change.

## Scientific review

The scripts reuse current lesson interpretations of NASA energy information, CSA crop examples, the archived RAD sample and the separate M12 study. The team should review any changed explanation against the sources before final audio generation. Card validation checks structure. It does not grant scientific approval.

