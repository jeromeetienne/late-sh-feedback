# Directory Context: `/data/identity`

## Purpose
Maps the nicknames used in late.sh to the GitHub handle of the same person, for the highly-likely matches only. Two uses: counting the demand for a work item once per person instead of once per nickname, and knowing who can be asked for the details that a short bug report is missing.

## Key Exports & Entry Points
- `people.yaml`: One record per person, with the list of their late.sh nicknames and their GitHub handle.

## Local Rules & Boundaries
- This file is hand-maintained. It is the one exception to the rule of `../CONTEXT.md` — no skill generates or overwrites it.
- Never add a link that was guessed from the similarity of two names. Record only a link that the person made public themselves, or that a maintainer of the project confirmed.
- Only keep a link that is highly likely to be correct. When a link is only a guess, leave it out of this file rather than recording it with a low confidence.
