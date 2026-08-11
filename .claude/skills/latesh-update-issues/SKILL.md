---
name: latesh-update-issues
description: Runs an incremental ingestion of late.sh feedback, diffing bugs.txt and suggestions.txt against the last commit read and either appending new reports to existing GitHub issues on jeromeetienne/late-sh-feedback or drafting new ones. Use this for every ingestion after the first — for the first one, use latesh-backfill-issues instead.
---

# Update late.sh issues

Full design and rationale for every step below live in [`docs/ingestion_process.md`](../../../docs/ingestion_process.md) — read it first if anything here is unclear. This skill runs an incremental ingestion: it reads only what was added to `bugs.txt` and `suggestions.txt`, straight from `mpiorowski/late-sh` on GitHub, since the last ingestion. No local copy of either file is written.

Do not run this skill if `data/ingestion/state.yaml` does not exist yet — that means no first ingestion has happened, and what is needed instead is `/latesh-backfill-issues`. Ask the person running this skill to confirm before continuing if that file is missing.

## Arguments

This skill takes one optional argument.

- No argument: run the incremental ingestion described below.
- `help`: print the following and stop, without reading `data/ingestion/state.yaml`, resolving any commit, or drafting anything.
  ```
  /latesh-update-issues [help]

  Runs an incremental ingestion of late.sh feedback into GitHub issues on jeromeetienne/late-sh-feedback,
  reading only what was added to bugs.txt and suggestions.txt since the last ingestion.

    (no argument)   Diff against the last ingested commit and apply confirmed changes.
    help            Show this help and do nothing else.
  ```

## Steps

1. Read `lastIngestedCommit` from `data/ingestion/state.yaml`.
2. Resolve the current commit hash of `mpiorowski/late-sh`'s `main` branch (for example with `gh api repos/mpiorowski/late-sh/commits/main --jq .sha`). If the resolved commit hash is the same as `lastIngestedCommit`, stop here and report that there is nothing new to ingest. Otherwise fetch `bugs.txt` and `suggestions.txt` at that commit from [github.com/mpiorowski/late-sh/tree/main/feedback](https://github.com/mpiorowski/late-sh/tree/main/feedback) (for example with `gh api repos/mpiorowski/late-sh/contents/feedback/{fileName}?ref={commitSha} --jq .content | base64 -d`). Do not write either file to disk — read the content directly. Both files are regenerated on every merged pull request of `mpiorowski/late-sh`, which is exactly why this skill diffs by commit instead of by a separate update schedule — see `docs/ingestion_process.md`.
3. Fetch `bugs.txt` and `suggestions.txt` as they read at `lastIngestedCommit`, the same way, and diff them against the content fetched in step 2. Keep only the lines that were added since `lastIngestedCommit` — this is the set of new reports to ingest.
4. Fetch the current list of open issues on `jeromeetienne/late-sh-feedback` (`gh issue list --repo jeromeetienne/late-sh-feedback --state open --json number,title,body,labels`) to compare new reports against.
5. For each new report, decide which of the following it is, by reading and judgment, not by a keyword match:
   - **Matches an open issue's theme.** Draft an append: a new "What people said" bullet in the same shape used by `/latesh-backfill-issues` (`- {datetime, UTC} **{nickname}**: "{content}" [link]({permalink})`, permalink pinned to the commit resolved in step 2), plus an updated "Reported N times, from ... to ..." closing line.
   - **Matches a closed issue's theme.** Do not reopen it. Note the issue number, its closing label if it has one, and the new report, for the person running this skill to decide what to do.
   - **Matches nothing tracked yet.** Treat it as a new theme. Cross-check the pull request history of `mpiorowski/late-sh` exactly as `/latesh-backfill-issues` does (drop if already fixed or already declined, narrow if partly fixed), then draft a full new issue body using the same template, with one type label and one area label, and never the `confirmed` label.
6. Separately from the new reports, check the open issues that got no new report this run: has a `mpiorowski/late-sh` pull request merged since `lastIngestedCommit` that fixes or declines one of them? Note any candidates for the person running this skill to close by hand.
7. Show every proposed change to the person running this skill — new issues to create, existing issues to append to, closing candidates to consider — and wait for them to confirm which to apply. Do not call `gh issue create` or `gh issue edit` before that — publishing or editing an issue is publishing public content, and it always needs a person's go-ahead first.
8. Apply the confirmed changes with `gh issue create --repo jeromeetienne/late-sh-feedback` for new issues and `gh issue edit --repo jeromeetienne/late-sh-feedback` for appends.
9. Write `data/ingestion/state.yaml` with the commit hash resolved in step 2:
   ```yaml
   lastIngestedCommit: {commitSha}
   ```
