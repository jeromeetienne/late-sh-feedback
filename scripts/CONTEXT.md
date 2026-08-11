# Directory Context: `/scripts`

## Purpose
Holds standalone TypeScript scripts for this project, run with `tsx` through `npm run` commands.

## Key Exports & Entry Points
- `import_feedback.ts`: Downloads `bugs.txt` and `suggestions.txt` from the "late-sh" GitHub repository into `../data/feedback`, run with `npm run import:feedback`.

## Local Rules & Boundaries
- Each script follows the user's global TypeScript style guide: tab indentation, an exported static class named after the file, and JSDoc on every exported type and member.
- Scripts are standalone entry points, not a library — do not import one script's class from another script or from application code.
