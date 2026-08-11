# Directory Context: `/`

## Purpose
Root of the late-sh-feedback project. Sorts out bugs and suggestions from the late.sh feedback stored in the "late-sh" GitHub repository.

## Key Exports & Entry Points
- `data/`: Hand-maintained and machine-maintained project data, no downloaded copy of the feedback files. See `data/CONTEXT.md`.
- `docs/ingestion_process.md`: The process that turns `mpiorowski/late-sh`'s feedback files into GitHub issues on `jeromeetienne/late-sh-feedback`, reading them straight from GitHub each time.
- `.claude/skills/`: The `/latesh-backfill-issues` and `/latesh-update-issues` Claude Code skills that carry out that process. See `.claude/skills/CONTEXT.md`.

## Local Rules & Boundaries
- This project has no `package.json` and no source code to build or run — `bugs.txt` and `suggestions.txt` are read directly from the `mpiorowski/late-sh` GitHub repository with `gh`, never downloaded into a local file.
