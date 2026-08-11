# Directory Context: `/docs`

## Purpose
Written analyses and design notes about the `bugs.txt` and `suggestions.txt` feedback held in the `mpiorowski/late-sh` GitHub repository. Documents only — no source code.

## Key Exports & Entry Points
- `first_analysis.md`: Deep analysis of `bugs.txt` and `suggestions.txt`, listing what is good and what is not so good in them.
- `ingestion_process.md`: The process that turns the feedback files into GitHub issues, run by the `/backfill-late-sh-issues` and `/update-late-sh-issues` skills in `.claude/skills`.

## Local Rules & Boundaries
- Every measurement written in a document must be reproducible from `bugs.txt` and `suggestions.txt` in the `mpiorowski/late-sh` GitHub repository, pinned to a named commit, and every example must name the timestamp and the author of the entry it comes from.
- Do not wrap markdown lines at 80 columns — write each paragraph as a single long line.
