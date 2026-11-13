# Guided journey — 14 November 2026

Latest direction: guide the child through chapters in order, with experimentation inside each task. This supersedes earlier proposals to allow immediate access to every station.

## Implemented locally

1. Existing opening clips followed by a three-panel, voiced story map: capsule separated, crew in orbit, emergency base systems and radio goal. Replay from “Where am I?”.
2. Action-based tutorial: reach the glowing floor circle, discover NEILO, then ask the companion for help. Merely displaying an instruction no longer completes it. A menu option skips the movement tutorial.
3. Sequential objectives: discover → power console → water → crew signal → garden → field notes. Station guards explain the next action; completed rooms remain accessible. Existing saves migrate without resetting completed work.
4. Interactive power planning: connect source and device nodes, see shared capacity and cables, test a plan, recover from overload, then change the plan for another job. Protected emergency systems remain powered. Device numbers are game balance, not NASA measurements.
5. Standby lighting and emergency floor strips before restoration; brighter state after power and contact. Existing room architecture remains illustrative and still needs the planned environmental art pass.
6. User-supplied Interstellar mix retained. Corrected music start after audio-context resume; quieter compressed mix and speech ducking retained.
7. New AI-generated battery–motor–pump illustration for the science explanation, visibly identified as illustrative art. Original agency facts, raw RAD data and source dates remain unchanged.

## Verification

- Eleven engine/campaign/progression state tests passed.
- New normal-entry browser test covers story, required physical tutorial action, early navigation guards, power overload/recovery, water, contact, garden unlock, restored save, five viewports and actual Interstellar playback.
- These are automated adult-operated checks. No claim of child comprehension or learning validation.
- Older browser scripts that target the superseded tutorial need migration before being used as current regression evidence.

## Remaining work, in order

1. Repeat an unguided playtest; observe whether the player identifies the incident, first action and next task. Adjust based on observed stalls.
2. Review scientific mission cards with the team; preserve CSA approximate growing times, simulated calendar, RAD units and missing values, and separation of 2015 measurements from the 2016 M12 study.
3. Improve the garden's tactile interaction and field-note feedback using this same observe → try → consequence → recovery pattern. Their existing playable content remains in this release.
4. Replace the story-map bridge with the requested Flow clips when delivered, using production/ONBOARDING_REVISION.md; retain the map as replay help.
5. Record the prepared James/Valf additions, align cues to returned audio, and replace browser narration where recordings match. Existing 13 supplied clips remain installed.
6. Strengthen persistent personalized reactions and evaluate a generated full-character asset pipeline. Live photo generation is still unverified and requires server configuration.
7. Finish the 30-second pitch using production/PITCH files and a capture of the actual playable build, then check all public submission links.

## Tools and provenance

JavaScript/CSS implementation assisted by Codex; Node state tests and Playwright/Chrome browser checks; image_gen for the new educational illustration; existing FFmpeg-normalized user music; Sites publishing helper and Git/GitHub for release distribution. This release does not claim new ElevenLabs recordings or new Flow video generation.

Recovery: local tag backup-before-guided-flow-20261114 and verified backups/before-guided-flow-20261114.bundle. Backups remain local. Publication status is recorded in RELEASE_CURRENT.md and workspace NEILO_HANDOFF.md after deployment.
