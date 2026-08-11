# Directory Context: `/`

## Purpose
Root of the late-sh-feedback project. Sorts out bugs and suggestions from the late.sh feedback stored in the "late-sh" GitHub repository.

## Key Exports & Entry Points
- `scripts/import_feedback.ts`: Downloads the feedback text files into `data/feedback`, run with `npm run import:feedback`.
- `data/`: Local copy of the downloaded feedback data. See `data/CONTEXT.md`.

## Local Rules & Boundaries
- TypeScript scripts live under `scripts/` and are run with `tsx`, following the style rules in the user's global TypeScript style guide.
- `package.json` uses `"type": "module"` — scripts must use ECMAScript Modules syntax, not CommonJS.
