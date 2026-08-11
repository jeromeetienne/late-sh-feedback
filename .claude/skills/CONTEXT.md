# Directory Context: `/.claude/skills`

## Purpose
Claude Code skills that carry out the ingestion process described in `../../docs/ingestion_process.md` — turning `data/feedback/bugs.txt` and `data/feedback/suggestions.txt` into GitHub issues on `jeromeetienne/late-sh-feedback`.

## Key Exports & Entry Points
- `backfill-late-sh-issues/SKILL.md`: The first ingestion, reading the whole history of both feedback files. Run once.
- `update-late-sh-issues/SKILL.md`: Every ingestion after that, reading only what was added since the last one.

## Local Rules & Boundaries
- Neither skill calls `gh issue create` or `gh issue edit` without a person confirming in chat first — see the "confirmation gate" section of `../../docs/ingestion_process.md`.
