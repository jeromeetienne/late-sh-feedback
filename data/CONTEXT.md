# Directory Context: `/data`

## Purpose
Holds the small data files of this project. There is no local copy of `mpiorowski/late-sh`'s feedback text files — they are read straight from GitHub, pinned to one commit at a time, whenever a skill needs them.

## Key Exports & Entry Points
- `identity/`: Hand-maintained mapping from the nicknames used in late.sh to the people behind them. See `identity/CONTEXT.md`.
- `ingestion/`: Tracks which commit of "late-sh" was last read when publishing GitHub issues. See `ingestion/CONTEXT.md`.

## Local Rules & Boundaries
- Curated files are hand-maintained and no script may overwrite them. This applies to `identity/`, and each such folder must say so in its own `CONTEXT.md`.
- `ingestion/` is a second case: hand-initialized once, then maintained by the `/update-late-sh-issues` skill, not by a person.
