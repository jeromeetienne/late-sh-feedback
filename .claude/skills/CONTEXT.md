# Directory Context: `/.claude/skills`

## Purpose
Claude Code skills that carry out the ingestion process described in `../../docs/ingestion_process.md` — turning `bugs.txt` and `suggestions.txt`, read straight from `mpiorowski/late-sh` on GitHub, into GitHub issues on `jeromeetienne/late-sh-feedback` — plus a read-only skill that reports on the resulting issue tracker.

## Key Exports & Entry Points
- `latesh-backfill-issues/SKILL.md`: The first ingestion, reading the whole history of both feedback files. Run once.
- `latesh-update-issues/SKILL.md`: Every ingestion after that, reading only what was added since the last one.
- `latesh-tracker-status/SKILL.md`: Generates a PNG status image of the current issue tracker into `../../data/tracker-status/`, links it from `../../README.md`, then commits and pushes. Never calls `gh issue create` or `gh issue edit`.

## Local Rules & Boundaries
- The two ingestion skills never call `gh issue create` or `gh issue edit` without a person confirming in chat first — see the "confirmation gate" section of `../../docs/ingestion_process.md`. `latesh-tracker-status` is exempt from that specific rule because it never touches a GitHub issue — but unlike the other two, it does commit and push on its own, without a separate confirmation step each run.
