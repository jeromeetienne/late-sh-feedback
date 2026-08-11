# Directory Context: `/data/tracker-status`

## Purpose
Holds `dashboard.png`, a generated status image of the GitHub issue tracker on `jeromeetienne/late-sh-feedback`, linked from the "Tracker status" section of the root `README.md`.

## Key Exports & Entry Points
- `dashboard.png`: The current tracker status image — open issue counts, the bug/suggestion split, an area breakdown, human-review progress, and a daily histogram. Overwritten in full on every run of the `/latesh-tracker-status` Claude Code skill.

## Local Rules & Boundaries
- Fully machine-generated. Never hand-edit `dashboard.png` — regenerate it with `/latesh-tracker-status` instead.
- The filename stays `dashboard.png` across runs so the link from `README.md` never breaks. Git history of this file is the record of how the tracker has changed over time.
