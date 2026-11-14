# NEILO

[Play the completed demo chapter](https://neilo-first-signal.richhake16.chatgpt.site/?v=9) · [Submission documentation](docs/SUBMISSION_DOSSIER.md) · [Narration audit](docs/NARRATION_AUDIT.md) · [Flow story prompts](production/FLOW_ARRIVAL_RECAP.md)

Chapter one ends after the garden, rover report, repaired relay and discovery question. The finale introduces surface exploration as a future chapter. Public play needs no login or API key.

A browser adventure for ages 7–12. A child meets NEILO in a quiet Mars base, restores the first signal, plans a garden and prepares a field report with NASA/CSA sources.

Run npm start with Node.js 22 or later, then open http://localhost:4173. In PowerShell, set $env:PORT='4176' to select another port. Static hosting serves dist/. Complete First Signal to open Growing corner, then complete your chosen crop plan to open Field notes in Mission control.

## Scientific content

The garden uses approximate CSA crop times and preparation examples in a separate training simulation. Field notes render 84 archived Curiosity/RAD records from 1 January 2015. The M12 paper is a separate September 2016 study. Missing values stay unavailable. Every new mission has an explanation, a source notebook and replay.

## Documentation

- docs/TOOLS_AND_PROVENANCE.md records tools, supplied assets and AI disclosure.
- docs/NEW_DATA_REVIEW.md screens the new health proposals.
- docs/REFERENCE_PROJECT_REVIEW.md reviews Henry’s Farm Adventures.
- LEVEL_INTEGRATION_PLAN.md describes the campaign.
- data/ contains the review reports, query and source checksum.
- RELEASE_CURRENT.md records completed checks and release limits.

## Verification and optional services

Run npm test and node --test tests/campaign.test.mjs. Browser checks require Playwright and Chrome. Set PLAYWRIGHT_PACKAGE when needed. The campaign browser test uses localhost:4176 and baseline tests use localhost:4173.

Portrait generation needs OPENAI_API_KEY on the local server. The bundled teal explorer is fictional. Live likeness quality has not been evaluated. Existing recordings use supplied James/Valf clips. New explanations use device speech when no matching recording exists.

Release assembly and documentation are dated 13 November 2026, Cairo. Scientific dates and supplied-asset provenance are retained.
