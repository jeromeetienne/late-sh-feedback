---
name: backfill-late-sh-issues
description: Runs the first ingestion of late.sh feedback, reading the whole history of bugs.txt and suggestions.txt and drafting GitHub issues on jeromeetienne/late-sh-feedback for every theme found. Use this only once, or to rebuild the tracker from scratch — for everything after the first run, use update-late-sh-issues instead.
---

# Backfill late.sh issues

Full design and rationale for every step below live in [`docs/ingestion_process.md`](../../../docs/ingestion_process.md) — read it first if anything here is unclear. This skill runs the first ingestion: the one pass that reads the whole history of `data/feedback/bugs.txt` and `data/feedback/suggestions.txt`, not only the most recent months.

Do not run this skill if `data/ingestion/state.yaml` already exists and has a `lastIngestedCommit` — that means a first ingestion already happened, and what is needed now is `/update-late-sh-issues` instead. Ask the person running this skill to confirm before continuing if that file is already present.

## Steps

1. Resolve the current commit hash of `mpiorowski/late-sh`'s `main` branch (for example with `gh api repos/mpiorowski/late-sh/commits/main --jq .sha`). Run `npm run import:feedback` to refresh `data/feedback/bugs.txt` and `data/feedback/suggestions.txt` so both match that commit.
2. Read both files in full. Group every message into themes: one theme per underlying bug or underlying request, even when it is worded differently across messages, or split across the two files. Do this by reading and judgment, not by a keyword match — see `docs/ingestion_process.md` for a worked example.
3. For each theme, cross-check the pull request history of `mpiorowski/late-sh` before drafting anything:
   - If a merged pull request already does what the theme asks, or already fixes the bug it describes, drop the theme.
   - If a maintainer already declined the same request, in a pull request or a pull request comment, drop the theme.
   - If a merged pull request covers part of the theme, narrow the theme to the part that is still open.
4. For each remaining theme, draft an issue body using the template in `docs/ingestion_process.md`:
   - Opening line naming the source channel(s) — `#bugs`, `#suggestions`, or both.
   - `## What is broken` (bug) or `## What is being asked` (suggestion).
   - `## What people said`, one bullet per report, exactly in this shape: `- {datetime, UTC} **{nickname}**: "{content}" [link]({permalink})`, with the permalink pinned to the commit resolved in step 1, in the form `https://github.com/mpiorowski/late-sh/blob/{commitSha}/feedback/{fileName}#L{lineNumber}`.
   - Closing line: `Reported {N} times, from {first date} to {last date}. If you have seen this too, add a 👍 to this issue.` (bug) or `... If you want this too, add a 👍 to this issue.` (suggestion).
   - Exactly one type label (`bug` or `suggestion`) and exactly one area label (`area:games`, `area:chat`, `area:directory`, `area:audio`, `area:notifications`, `area:profile`, `area:theming`, `area:terminal`, `area:economy`, or `area:voice`). Never add the `confirmed` label — that is added by a human reviewing the issue, never by this skill.
5. Show every draft to the person running this skill: title, labels, and full body. Wait for them to say which ones to publish. Do not call `gh issue create` before that — publishing is publishing public content, and it always needs a person's go-ahead first.
6. Publish the confirmed drafts with `gh issue create --repo jeromeetienne/late-sh-feedback`.
7. Write `data/ingestion/state.yaml` with the commit hash resolved in step 1:
   ```yaml
   lastIngestedCommit: {commitSha}
   ```
