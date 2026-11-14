# Gameplay capture production

User requested clips for a teammate's 30-second voice-over, using the supplied winning-team reference as a pacing example.

Reference found at workspace `nasa demo.mp4`: 29.167 seconds, 1920×1080. A 10-frame contact sheet was inspected. Visible structure: a crop-failure problem, multiple gameplay tasks, real-world data screens, then further interaction. The reference speech was not transcribed or copied.

`capture.mjs` records real Chrome gameplay at 1920×1080 with Playwright video capture. It uses saved checkpoints, actual drag interactions, a visible cursor overlay and a fictional demo name. `TAKES.json` records source timing and checkpoint conditions. `export.py` uses FFmpeg to create silent H.264 MP4 clips and a 30-second cut. Production outputs live under `delivery/`; intermediates/reference inspection and generated videos remain local instead of being committed to GitHub.

No Flow-generated scene or mock interface stands in for gameplay. No messages were sent to the teammate; Ahmed receives the package to share.
