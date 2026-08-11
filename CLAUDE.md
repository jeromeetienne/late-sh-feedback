# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

late-sh-feedback turns the `#bugs` and `#suggestions` chat feedback of [late.sh](https://late.sh) into an ordered list of GitHub issues on [jeromeetienne/late-sh-feedback](https://github.com/jeromeetienne/late-sh-feedback). The full mission is in [README.md](README.md).

The feedback itself, `bugs.txt` and `suggestions.txt`, is never copied into this repository. It is read directly from [github.com/mpiorowski/late-sh/tree/main/feedback](https://github.com/mpiorowski/late-sh/tree/main/feedback), pinned to a commit hash, every time it is needed. There is no `package.json`, no build step, and no local dependency to install — this project has no source code to run.

## Where to look first

- [`docs/ingestion_process.md`](docs/ingestion_process.md): the full design — themes, the label taxonomy, the permalink scheme, the issue body template, cross-checking `mpiorowski/late-sh` pull requests, the confirmation gate, and the ingestion state file. Read this before touching the ingestion process.
- [`.claude/skills/backfill-late-sh-issues/SKILL.md`](.claude/skills/backfill-late-sh-issues/SKILL.md) and [`.claude/skills/update-late-sh-issues/SKILL.md`](.claude/skills/update-late-sh-issues/SKILL.md): the two skills that carry out that process.
- Every folder under `data/` and `docs/` has its own `CONTEXT.md` describing its purpose and local rules. Read the nearest `CONTEXT.md` before editing or adding a file anywhere in this repository.

## Rules that apply everywhere in this repository

- Never call `gh issue create` or `gh issue edit` on `jeromeetienne/late-sh-feedback` without a person confirming in chat first, even mid-task. Creating or editing a GitHub issue is publishing public content — see the "confirmation gate" section of `docs/ingestion_process.md`.
- Never add the `confirmed` label to an issue. It records that a human, not a skill, has verified a bug is real.
- Never write `bugs.txt` or `suggestions.txt` to a local file. Fetch them directly from GitHub, pinned to a resolved commit hash, every time.
- Never point a permalink at `main`. `bugs.txt` and `suggestions.txt` are regenerated on every merged pull request of `mpiorowski/late-sh`, so a permalink must always be pinned to the exact commit its line number was read at.
- `data/identity/people.yaml` is hand-maintained. Never add a nickname-to-GitHub-handle link that was only guessed from the similarity of two names — only a link the person made public themselves, or that a maintainer confirmed.
- `data/ingestion/state.yaml` is hand-initialized once, then maintained only by the `/update-late-sh-issues` skill after a person confirms a publish. Do not hand-edit it once an update has run.
