# The ingestion process

This document describes how the raw feedback in `bugs.txt` and `suggestions.txt`, read straight from the `feedback` folder of the [mpiorowski/late-sh](https://github.com/mpiorowski/late-sh) GitHub repository, is turned into GitHub issues on [jeromeetienne/late-sh-feedback](https://github.com/jeromeetienne/late-sh-feedback). No local copy of either file is kept — every read is pinned to one commit hash of `mpiorowski/late-sh` and fetched directly with `gh`. It is the design behind two Claude Code skills, `/latesh-backfill-issues` and `/latesh-update-issues`, described in full in their own `SKILL.md` files at `.claude/skills/latesh-backfill-issues/SKILL.md` and `.claude/skills/latesh-update-issues/SKILL.md`.

There are two distinct passes over the feedback files, not one:

- **The first ingestion** (the backfill) reads the whole history of `bugs.txt` and `suggestions.txt` at once and turns it into the first set of GitHub issues. It runs once, or is re-run from scratch only if the whole issue tracker is reset.
- **Every ingestion after that** (an update) reads only the lines added to `bugs.txt` and `suggestions.txt` since the last ingestion, and either appends a report to an existing GitHub issue or opens a new one. It is meant to be re-run often, each time `mpiorowski/late-sh` merges a pull request that changes the feedback files.

Both passes share the same building blocks: a theme, a label taxonomy, a permalink scheme, an issue body template, and a rule that says a person must approve any publish or edit before it happens. Each of these is described below before the two passes themselves.

## Where the files live

`bugs.txt` and `suggestions.txt` live in the `feedback` folder of `mpiorowski/late-sh`, at [github.com/mpiorowski/late-sh/tree/main/feedback](https://github.com/mpiorowski/late-sh/tree/main/feedback). Both files are regenerated on every merged pull request of `mpiorowski/late-sh` — not on a separate schedule of their own — so fetching `main` returns whatever the most recently merged pull request left behind, and a line number read at one commit is not guaranteed to still name the same line at the next.

## What is a theme

A theme is one underlying bug or one underlying request, told by one or more chat messages, possibly weeks or months apart, possibly worded differently each time, possibly split across `bugs.txt` and `suggestions.txt`. One GitHub issue tracks exactly one theme. Grouping messages into themes is a judgment call made by reading the messages, not a keyword match — [issue #1](https://github.com/jeromeetienne/late-sh-feedback/issues/1) is an example: two reports from `bugs.txt` and one from `suggestions.txt`, worded three different ways, all describing the same nonogram puzzle generator defect.

## The label taxonomy

Every issue carries exactly one type label and exactly one area label, plus zero or one status labels.

Type, exactly one of:

- `bug` — something in late.sh does not work as intended.
- `suggestion` — a new feature or an improvement asked for by a user of late.sh.

Area, exactly one of, chosen from the `late-ssh/src/app/*` module that the theme belongs to:

- `area:games` — arcade mini-games, casino and cards, door games.
- `area:chat` — messaging, commands, mentions, reactions, moderation, polls.
- `area:directory` — room browsing, search, sort, `/join`.
- `area:audio` — radio stations, now-playing, mute and volume, YouTube, visualizer.
- `area:notifications` — the notify module.
- `area:profile` — nickname, avatar, profile modal, timezone.
- `area:theming` — color themes, TUI rendering, emoji and fonts.
- `area:terminal` — SSH auth and connection, clipboard and copy-paste, resize, keybinds.
- `area:economy` — chips, leaderboard, shop, inventory, daily quests.
- `area:voice` — voice and clubhouse modules.

Review state, added by a human, never by a skill:

- `confirmed` — a human has verified that the bug is real. An issue without `confirmed` still needs a human to look at it and decide whether it is real or should be closed. Neither `/latesh-backfill-issues` nor `/latesh-update-issues` ever adds this label — only a person reviewing the issue on GitHub does.

Proposed, not created yet: a set of `status:*` labels to record why an issue was closed (`status:fixed`, `status:declined`, `status:duplicate`, `status:stale`) and one to mark an issue as being worked on (`status:in-progress`). Neither skill uses these labels until they exist in the repository label list.

## The permalink scheme

Every quoted report links to the exact line it came from, pinned to the commit that was read, never to `main`:

```
https://github.com/mpiorowski/late-sh/blob/{commitSha}/feedback/{fileName}#L{lineNumber}
```

`{commitSha}` is the full commit hash of `mpiorowski/late-sh` that `bugs.txt` and `suggestions.txt` were read from, `{fileName}` is `bugs.txt` or `suggestions.txt`, and `{lineNumber}` is the one-based line number inside that file at that commit. As said above, both files are regenerated on every merged pull request of `mpiorowski/late-sh`, so a line number is only valid for the one commit it was read at — pinning to `main` would silently go stale or point at the wrong line as soon as the next pull request merges.

## The issue body template

A bug issue:

```markdown
This issue tracks a bug reported in the `#bugs` channel of late.sh. It is not fixed here — the fix happens in [mpiorowski/late-sh](https://github.com/mpiorowski/late-sh). Closing this issue only records that the report has been handled, one way or another.

## What is broken

{plain description of the bug, covering every symptom quoted below}

{optional paragraph naming any mpiorowski/late-sh pull request that touches the same area, and saying why it does or does not already cover this}

## What people said

- {datetime, UTC} **{nickname}**: "{content}" [link]({permalink})

Reported {N} times, from {first date} to {last date}. If you have seen this too, add a 👍 to this issue.
```

A suggestion issue uses the same shape with two words changed: "This issue tracks a suggestion collected from the `#suggestions` channel of late.sh", "## What is being asked" instead of "## What is broken", and "If you want this too, add a 👍 to this issue" instead of "If you have seen this too, add a 👍 to this issue". A theme with reports in both files, like issue #1, says "the `#bugs` and `#suggestions` channels" in the opening line instead of naming one channel.

One real example, from [issue #3](https://github.com/jeromeetienne/late-sh-feedback/issues/3):

```markdown
- 2026-07-01 22:42:00 UTC **qmay654**: "Sometimes the music randomly mutes itself even when not focused on window" [link](https://github.com/mpiorowski/late-sh/blob/2068af1ef30bdac587decd6433bf6f97bfb2ccee/feedback/bugs.txt#L83)
```

## Cross-checking mpiorowski/late-sh pull requests

Before a theme is published or updated, its candidate title and description are checked against the pull request history of `mpiorowski/late-sh`, to avoid publishing something already handled. Three outcomes matter:

- **Already fixed.** A merged pull request already does what the theme asks for, or already fixes the bug described. The theme is not published — or, for an update, the open issue that tracks it is a candidate for a human to close as `status:fixed` once that label exists.
- **Already declined.** A maintainer considered the same request and said no, in a pull request or a pull request comment. The theme is not published. This happened once already: an "add an in-app ticket system" suggestion was found to have been explicitly declined in pull request #404, so it was left out of the first six issues.
- **Partly fixed.** A merged pull request covers part of the theme but not all of it. The theme is narrowed to the part that is still open. This happened once already: [issue #4](https://github.com/jeromeetienne/late-sh-feedback/issues/4) originally asked for search and sort in the room directory, but pull request #394 had already shipped search, so the published issue asks for sorting only.

## The confirmation gate

Neither skill ever calls `gh issue create` or `gh issue edit` without a person first agreeing to it in chat. Both skills stop after drafting, show what they are about to publish or change, and wait for an explicit "yes" before touching GitHub. This is not a preference — creating or editing a GitHub issue is publishing public content, which always needs a person's go-ahead first.

## The ingestion state file

`data/ingestion/state.yaml` records the one commit that the last ingestion — first or update — read `bugs.txt` and `suggestions.txt` at:

```yaml
lastIngestedCommit: 2068af1ef30bdac587decd6433bf6f97bfb2ccee
```

This is the commit the first six issues were published from. `/latesh-update-issues` reads this file to know where to start its diff, and rewrites it, after a person confirms the publish, to the commit it just finished reading. The file is hand-initialized once by the first ingestion and machine-maintained after that — do not hand-edit it once an update has run.

## The first ingestion

Run with `/latesh-backfill-issues`. It reads the whole history of `bugs.txt` and `suggestions.txt` at one pinned commit, not only the most recent months:

1. Resolve the current commit hash of `mpiorowski/late-sh`'s `main` branch, and fetch `bugs.txt` and `suggestions.txt` at that commit directly from [github.com/mpiorowski/late-sh/tree/main/feedback](https://github.com/mpiorowski/late-sh/tree/main/feedback), without writing either to a local file.
2. Read both files in full and group every message into themes, as described above.
3. For each theme, cross-check the pull request history of `mpiorowski/late-sh` as described above, and drop or narrow themes that are already handled.
4. For each remaining theme, draft an issue body using the template above, with one type label, one area label, and no `confirmed` label.
5. Show the drafts to the person running the skill and wait for them to confirm which ones to publish.
6. Publish the confirmed drafts with `gh issue create`.
7. Write `data/ingestion/state.yaml` with the commit hash from step 1.

## Every ingestion after that

Run with `/latesh-update-issues`. It reads only what changed since `data/ingestion/state.yaml`:

1. Read `lastIngestedCommit` from `data/ingestion/state.yaml`.
2. Resolve the current commit hash of `mpiorowski/late-sh`'s `main` branch, and fetch `bugs.txt` and `suggestions.txt` at that commit directly from [github.com/mpiorowski/late-sh/tree/main/feedback](https://github.com/mpiorowski/late-sh/tree/main/feedback), without writing either to a local file.
3. Fetch `bugs.txt` and `suggestions.txt` as they read at `lastIngestedCommit`, and diff them against the content fetched in step 2, to find only the lines that were added since.
4. For each added line, decide whether it belongs to a theme already tracked by an open issue, or starts a new theme:
   - **Matches an open issue.** Append a new "What people said" bullet to that issue's body, in the format above, and update the "Reported N times, from ... to ..." line to include the new report.
   - **Matches a closed issue.** Note it for the person running the skill rather than silently reopening anything — a report against a `status:fixed` issue may be a regression, and a report against a `status:declined` or `status:stale` issue may mean it is worth raising again. Let the person decide.
   - **Matches nothing tracked yet.** Treat it as a new theme, and follow the same drafting steps as the first ingestion, from cross-checking pull requests through choosing labels.
5. Also re-check the open issues that were not touched by a new report: has a `mpiorowski/late-sh` pull request merged since the last ingestion that fixes or declines one of them? Note any candidates for the person to close.
6. Show every proposed change — new issues, appended reports, closing candidates — to the person running the skill and wait for them to confirm.
7. Apply the confirmed changes with `gh issue create` and `gh issue edit`.
8. Write `data/ingestion/state.yaml` with the commit hash from step 2.
