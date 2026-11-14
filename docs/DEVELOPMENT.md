# Development guide

For public play, use https://zeroomood5-create.github.io/the-neilo-project/ . The addresses below are for development on your computer.

## Run locally

Install Node.js 22 or later, then run `npm start` from the repository root. The server prints `http://localhost:4173`. To select another local port in PowerShell:

```powershell
$env:PORT='4176'
npm start
```

Static hosts serve `dist/`. Public playback needs no key, account or Node server.

## Verify

Run `npm test` for state tests. Browser checks require Chrome and Playwright. Set `PLAYWRIGHT_PACKAGE` to a resolvable Playwright package when needed.

```powershell
$env:NEILO_TEST_URL='https://zeroomood5-create.github.io/the-neilo-project/'
node tests/guided-journey.mjs
node tests/phase-narration.mjs
```

The guided test uses a fresh browser save. [Screenshot capture](../scripts/capture-readme.mjs) restores fictional demo checkpoints.

## Audio and optional services

Kokoro instructions are in [tools/kokoro/README.md](../tools/kokoro/README.md). Models and the Python environment are excluded from Git; installed recordings are included. Missing narration does not fall back to device TTS.

The local server has an optional portrait-generation endpoint requiring a server-side `OPENAI_API_KEY`. It is not a live service on GitHub Pages, and likeness quality is not validated. Keep credentials and private child photos out of the repository.

## Publish

`scripts/publish-github.ps1` pushes `main`, then its `dist` subtree to `gh-pages` without a force push. GitHub Pages serves `gh-pages` at `/`. Keep history and backups intact. [Release records](../RELEASE_CURRENT.md) distinguish deployment from local checks.
