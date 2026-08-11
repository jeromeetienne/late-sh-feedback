# Directory Context: `/data/ingestion`

## Purpose
Tracks which commit of `mpiorowski/late-sh` was last read when turning `data/feedback/bugs.txt` and `data/feedback/suggestions.txt` into GitHub issues. See `../../docs/ingestion_process.md` for the full process.

## Key Exports & Entry Points
- `state.yaml`: One field, `lastIngestedCommit`, the commit hash the last ingestion read the feedback files at.

## Local Rules & Boundaries
- Hand-initialized once by the first ingestion (the `/backfill-late-sh-issues` skill), then rewritten only by the `/update-late-sh-issues` skill, after a person confirms a publish. Do not hand-edit `state.yaml` once an update has run.
