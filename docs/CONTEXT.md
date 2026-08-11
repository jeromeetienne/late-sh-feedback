# Directory Context: `/docs`

## Purpose
Written analyses and design notes about the late.sh feedback held in `data/feedback`. Documents only — no source code.

## Key Exports & Entry Points
- `first_analysis.md`: Deep analysis of `data/feedback/bugs.txt` and `data/feedback/suggestions.txt`, listing what is good and what is not so good in them.
- `ingestion_process.md`: The process that turns the feedback files into GitHub issues, run by the `/backfill-late-sh-issues` and `/update-late-sh-issues` skills in `.claude/skills`.

## Local Rules & Boundaries
- Every measurement written in a document must be reproducible from the files in `data/feedback`, and every example must name the timestamp and the author of the entry it comes from.
- Do not wrap markdown lines at 80 columns — write each paragraph as a single long line.
