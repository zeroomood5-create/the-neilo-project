# Mission content workflow

First Signal remains the playable baseline. Each new science mission follows this sequence.

1. Capture the source URL, passage, environment, units, observation date and limits. Distinguish measured values from fictional base quantities.
2. Define the child’s observation, at least two meaningful actions, immediate visual consequence, later consequence and recoverable mistake.
3. Implement the action through engine.js and the existing station interface. Check old saved games, repeated actions and an unsuccessful attempt.
4. Add a lesson entry in dist/lessons.js with a unique id, the successful action that completes the mission, a named recap, source, scope, three visual frames and a transfer question. Supported drawings are sun, battery, pump, route and swap. A new scientific concept needs a suitable visual implementation.
5. Trigger the lesson after successful completion. Preserve the player’s progress. Store science-ID in seen after return. The journey log exposes replay.
6. Add narration to station-voice.json when required and generate through scripts/station-voice.mjs with the selected voice. Until a matching recording exists, captions and device speech cover the lesson.
7. Verify the scientific interpretation with a team reviewer, then run the complete mission on desktop and mobile. Test mute, music preference, pause, replay and errors.

The current explanations are animated scenes rendered in the browser, with player-controlled pacing and narration where device speech is available. Current scientific background uses NASA Space Place on spacecraft energy and NASA’s Hubble electrical-power page. The Mars setting and six power slots remain fictional. The lessons are introductory educational interpretations awaiting team science review.

Photo-to-character generation remains connected to the optional local API in scripts/avatar-api.mjs. Availability depends on the server credential. The bundled teal pilot is a fictional example. Browser fixture tests demonstrate request, preview, save and reload. A live likeness has not yet been generated or evaluated.

Cutscene timing follows actual video and recorded narration endpoints. The harness scene waits for the player. If a media file fails, available media or the authored reading duration provides a fallback.
