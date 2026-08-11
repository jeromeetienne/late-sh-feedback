# late-sh-feedback

Sort out the `#bugs` and `#suggestions` feedback from late.sh.

The late.sh project lives at [github.com/mpiorowski/late-sh](https://github.com/mpiorowski/late-sh/).

## Purpose

The `#bugs` and `#suggestions` channels of late.sh collect a lot of feedback from the users of late.sh. That feedback arrives as a long flow of chat messages, one after the other. The flow is easy to write into and hard to read back. A message from three months ago looks the same as a message from yesterday. The same bug reported by five different people looks like five different bugs. Nothing says which item matters most.

The mission of late-sh-feedback is to turn that flow of chat messages into an ordered list of work items, so that the developers and the volunteers of the late.sh project can see what must be done, and in which order.

To do that, late-sh-feedback:

- Reads `bugs.txt` and `suggestions.txt` straight from the `feedback` folder of the `mpiorowski/late-sh` GitHub repository, pinned to one commit at a time — no local copy is kept.
- Groups the messages that report the same bug, or ask for the same suggestion, into a single work item.
- Gives each work item a priority, so that the most important work items are visible first.
- Keeps the result in a form that a person can read in a few minutes, without reading every message of the `#bugs` and `#suggestions` channels.

late-sh-feedback does not replace the `#bugs` and `#suggestions` channels of late.sh, and it does not answer the users of late.sh. It reads the feedback and it organizes the feedback. The late.sh project stays the place where the work is done.

## Usage

See [`docs/ingestion_process.md`](docs/ingestion_process.md) for the full process. In short, run the `/latesh-backfill-issues` Claude Code skill once to publish the first set of GitHub issues, and the `/latesh-update-issues` skill every time after that.
