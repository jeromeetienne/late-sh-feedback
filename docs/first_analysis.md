# First Analysis of `data/feedback/bugs.txt` and `data/feedback/suggestions.txt`

Date of the analysis: 2026-08-11. Data as downloaded by `npm run import:feedback` from the "feedback" folder of the "mpiorowski/late-sh" GitHub repository.

## 1. Scope and method

This document is a deep analysis of the two feedback files, `data/feedback/bugs.txt` and `data/feedback/suggestions.txt`. It answers two questions: what is good in those two files, and what is not so good in those two files. It does not propose a solution — the process to digest the feedback is discussed separately.

The analysis was made by reading both files completely, and by measuring them with a small parser that splits the files on the record separator, extracts the timestamp, the author, the reply target and the body of each entry, and then counts. Every number in this document comes from that measurement, and every named example comes from a real entry that can be found in the files by its timestamp.

## 2. The file format

Both files use exactly the same format. A header line, then a sequence of entries, each entry closed by a line of 70 hyphen characters:

```
=== #<channel name> — <number> messages — last message <timestamp> UTC ===

[<timestamp> UTC] <author>[ (reply to <author>: "<first characters of the parent message>")]
[---BUG---|---SUGGESTION---] <free text, one or more lines, one or more paragraphs>
----------------------------------------------------------------------
```

The `---BUG---` marker and the `---SUGGESTION---` marker are not a separate field. They are the first characters of the body text, written by the person who reported the item, through the `/suggest` command or the equivalent bug command.

## 3. Quantitative profile

| Measure | `bugs.txt` | `suggestions.txt` |
| --- | --- | --- |
| Entries declared in the header line | 59 | 259 |
| Entries found by the parser | 59 | 259 |
| First entry | 2026-05-22 | 2026-05-18 |
| Last entry | 2026-08-05 | 2026-08-06 |
| Entries whose body starts with the marker | 56 (94.9 percent) | 247 (95.4 percent) |
| Entries that are a reply to another entry | 1 | 10 |
| Entries with more than one line of body text | 2 | 32 |
| Body length in characters, median | 97 | 100 |
| Body length in characters, longest | 346 | 1034 |
| Distinct author names | 32 | 94 |
| Author names that appear exactly once | 20 (62.5 percent) | 62 (66.0 percent) |
| Entries by the single most active author | 6, by `mat` | 44, by `mat` (17.0 percent) |
| Entries containing a hyperlink | 3 | 5 |

Distribution over time, by month, counting entries:

| Month | `bugs.txt` | `suggestions.txt` |
| --- | --- | --- |
| 2026-05 | 1 | 51 |
| 2026-06 | 18 | 71 |
| 2026-07 | 35 | 125 |
| 2026-08 | 5 | 12 |

Two remarks on this table. First, 2026-08 is a partial month, because the export stops on 2026-08-05 and 2026-08-06 — the drop is an artefact of the export, not a drop in activity. Second, 26 of the 51 entries of 2026-05 in `suggestions.txt` were written by `mat` within two seconds, at 2026-05-18 22:09:34 and 2026-05-18 22:09:35. That is a backlog that was pasted in one go, not 26 separate reports from 26 moments of use.

Excluding that backlog paste, the rate of arrival is approximately 2.9 suggestions per day and 0.8 bug reports per day. The ratio between the two files is approximately one bug report for every four suggestions.

## 4. What is good

### 4.1 The format is machine-readable, regular, and self-describing

Every entry has a header line with a timestamp and an author, and every entry is closed by an unambiguous separator line. A parser of about twenty lines of code reads both files with no special cases and no heuristics. The timestamps are written in a sortable form, they are all in Coordinated Universal Time, and they have a precision of one second, so the whole corpus can be ordered without any date parsing ambiguity.

The header line of each file declares the channel name, the number of messages and the timestamp of the last message. That declaration is an integrity check that costs nothing to use: the header of `bugs.txt` declares 59 messages and the parser finds exactly 59, the header of `suggestions.txt` declares 259 messages and the parser finds exactly 259. Both files are complete and were not truncated during the download.

### 4.2 The classification marker is present on almost every entry

The `---BUG---` marker is present on 56 of the 59 entries of `bugs.txt`, and the `---SUGGESTION---` marker is present on 247 of the 259 entries of `suggestions.txt`. That is a coverage above 94 percent in both files. The marker is therefore a reliable first filter: an entry that does not carry the marker is almost always a conversation message rather than a report, and can be set aside on that single criterion.

### 4.3 Attribution and chronology are complete

There is not a single entry without an author and without a timestamp. No field is empty, no field is malformed, and no entry is orphaned. This means that every report can be traced back to a person, that the order of arrival is fully known, and that a report can always be dated relative to a release of late.sh.

### 4.4 The reply structure survived the export

When an entry answers another entry, the header line carries the name of the author of the parent message and the first characters of the parent message, and the body repeats a shortened quotation of it. Inside a single file, that is enough to reconnect a reply to its parent by matching the author name and the beginning of the text. The eleven replies present across the two files can all be reconnected this way. Small conversations are therefore reconstructible, and the answers that the community already gave are not lost.

### 4.5 The corpus is small enough to process in full, repeatedly

The two files together are approximately 76 kilobytes and approximately 318 entries. Every single entry can be sent to a language model on its own, one call per entry, for a negligible cost, and the whole corpus can be re-processed from scratch as often as wanted. There is no need for sampling, no need for a search index, and no need for an incremental design forced by size. Any incremental design will be a choice made for cost or for stability, never a necessity imposed by volume.

### 4.6 The content itself is of high quality

The people who write in these two channels are technical, and they are specific. Several entries do more than report a problem — they carry the remedy with them:

- Monika, on 2026-06-30, gives the exact PowerShell profile function to work around the missing key path on Windows, and gives the exact path to search for an existing key.
- WinnerWind, on 2026-05-27, asks for a minesweeper that never requires guessing and gives the link to Simon Tatham's implementation, which is the reference solution to that exact problem.
- rafael, on 2026-07-24, reports a clipboard problem and then edits the same entry to add the fix, `set -g set-clipboard on` in the tmux configuration file.
- kirii.md, on 2026-07-25, writes a fully specified feature for an external text editor bound to `ctrl e`, with the setting name, the default value, the location in the settings screen, and the reason.
- zzril, on 2026-07-25, quotes the wrong help text of minesweeper and writes the corrected sentence.

An entry of that quality can be turned into a task with almost no additional work.

### 4.7 The corpus is a free compatibility matrix

Read as a whole, the bug reports describe the real environments in which late.sh runs: Apple Terminal and Kitty and Ghostty, tmux, PowerShell on Windows, NixOS, pipewire with a Bluetooth headset, an OpenSSH key that is in fact a GNU Privacy Guard subkey on a Yubikey, servers with AAAA records, terminals with fewer than 100 rows and 140 columns, and terminals where images are drawn either with Unicode characters or with the Kitty image protocol. That list was not asked for and did not cost anything to collect, and it says more about the real user base than a survey would.

### 4.8 The community triages part of the work by itself

Several entries are already answered, refuted, or marked as done inside the files themselves. On 2026-07-28 `mat` refutes the report of LordWasd about a missing final minesweeper reward, by explaining that no final reward exists. On 2026-07-23 `cws` answers preston-2 that the requested electronics channel already exists. On 2026-07-24 `Tasmania` answers "Already in PRs :)" about the room descriptions, and on 2026-07-26 `Tasmanwork` answers "Both of those are already PR's and coming shortly :)" about the audio visualiser. This human triage is a genuine asset, and it is free.

## 5. What is not so good

### 5.1 There is no stable identifier, and the obvious key collides

No entry carries an identifier. The only key that can be built from the available fields is the pair made of the timestamp and the author name, and that pair is not unique: 24 entries of `suggestions.txt` share the timestamp 2026-05-18 22:09:35 with the author `mat`, and 2 more share the timestamp 2026-05-18 22:09:34 with the same author. A key that collides 24 times cannot be used to remember a decision about an entry between two runs of any processing. An identifier derived from the content of the entry has to be introduced, and it will change whenever the exported text of an entry changes.

### 5.2 There is no status, so a finished item looks exactly like an open one

Nothing in either file says whether an item is open, fixed, refused, or already released. The clearest demonstration is the sudoku pencil marks. Four people asked for the feature — vechs on 2026-06-03, issai on 2026-06-25, mjswensen on 2026-06-26, and ronin on 2026-06-26. Then, on 2026-07-30, igi.dog wrote in `bugs.txt` that penciled numbers in sudoku do not survive a disconnection and a reconnection. That bug report only makes sense if the feature was built between those two dates. The feature was therefore delivered, and yet the four requests still sit in `suggestions.txt` looking exactly like requests that nobody has ever looked at.

The consequence is that the size of the backlog cannot be read from the files. Any count of open items taken from `suggestions.txt` is an overestimate by an unknown amount.

### 5.3 Duplication is heavy, and it is invisible to exact matching

The same need is reported several times, by different people, on different days, in different words. Not one of these groups can be found by comparing strings:

| Theme | Entries |
| --- | --- |
| Nonogram puzzles have more than one solution and are not solvable by logic | buddi 2026-06-06 and lemoncmd 2026-06-15 in `bugs.txt`, reiwa.ca 2026-07-25 in `suggestions.txt` |
| Pencil marks and candidate marks in sudoku | vechs 2026-06-03, issai 2026-06-25, mjswensen 2026-06-26, ronin 2026-06-26 |
| Configurable keyboard bindings | mat 2026-05-18 twice, HeadedBranch 2026-05-27, ndersorn 2026-05-28, Renu 2026-06-03, cws 2026-07-07 |
| Search and sort in the room directory | mauvehed 2026-06-19, cws 2026-06-21, daniel- 2026-06-27, ardbeg 2026-07-26 |
| A description or topic per room | blap 2026-06-28, kirii.md 2026-07-24, ardbeg 2026-07-26 |
| The Everforest colour theme | crcr 2026-06-13, num-old 2026-06-25 |
| Mumble for the audio | mat 2026-05-18, WinnerWind 2026-05-26 |
| DOOM | mat 2026-05-18, Kzitold 2026-05-27 |

A person reading the file top to bottom will read the same request four times without noticing, because two months separate the first from the last.

### 5.4 The two files are not disjoint

The separation between a bug and a suggestion was made by the person who wrote the message, and it does not hold.

Bug reports were written into `suggestions.txt`: rumor on 2026-06-22 reports that the Lateania inventory does not scroll properly, which is the same defect that Ol-Aqua reports in `bugs.txt` on 2026-06-30; mhrstv on 2026-07-22 reports that the sudoku cursor cannot be seen clearly on any theme; blap on 2026-07-01 reports damage on the window border and proposes `Ctrl-L` as the remedy, so one entry holds both a defect and a feature request.

Feature requests were written into `bugs.txt`: -rudy- on 2026-07-22 asks for the YouTube queue to be deduplicated, which is a new behaviour rather than a broken one.

Support questions were written into `bugs.txt` too: ferryman on 2026-06-26 opens with "Possibly user error" and asks for advice about the bonsai hiding the music player; rafael on 2026-07-24 reports a clipboard problem that turned out to be a tmux configuration on the reporter's own machine, and wrote the solution into the same entry.

The clearest case is mhrstv on 2026-07-26: at 15:51:08 a suggestion asking to switch the audio visualiser off, and at 15:52:57, one minute and forty-nine seconds later, a bug report saying that the audio visualiser takes about four times the vertical space it needs. One person, one frustration, one minute apart, two different files.

Any processing that treats `bugs.txt` and `suggestions.txt` as two separate populations will therefore split real themes in half.

### 5.5 One backlog paste distorts every measure based on frequency

The 26 entries written by `mat` in two seconds on 2026-05-18 are a list that was prepared elsewhere and pasted. They are indistinguishable, in the file, from 26 spontaneous reports. They give `mat` 17 percent of all the suggestions, they inflate the month of 2026-05, and they put items such as DOOM, ttyquake, Mumble and a Weather panel on the same footing as a request that a dozen people made. Any priority computed from the raw counts inherits that distortion.

### 5.6 Identity is not stable, so demand cannot be counted by author

At least two people appear under two names: `Tasmania` and `Tasmanwork`, and `madkoding` and `madkodingwrk`. Several other names carry a suffix that suggests a renamed or a second account: `num-old`, `preston-2`, `njg-2`, `daniel-`, `8-prime`. Counting distinct reporters, which is the most natural way to measure how much a theme is wanted, therefore overcounts by an unknown amount.

Worse, the author field is not always the person who had the idea. Three entries of `suggestions.txt` are written by `mat` but addressed to `mat` — for example, on 2026-06-25, an entry by `mat` whose body begins with "@mat please add an option to randomly select a theme". These are relayed messages, and the real author is lost.

### 5.7 Classification by keyword does not work on this corpus

An obvious first idea is to sort the entries by searching for words. The corpus defeats it. Searching for the letters `cli` in `suggestions.txt` returns 27 matches, of which only 15 are the late.sh command line program — the others are `click`, `clicks`, `clicking`, `clickable`, `client` and `clients`. Searching for the letters `cat` returns 15 matches, of which only 5 are the cat pet — the others are `notification`, `location`, `located`, `indicator`, `indicates`, `dedicated`, `entoxicating` and `catpuccin`. Searching for the character `#` matches every mention of a channel name in a sentence that is not about channels at all.

Classification of this corpus has to be made on meaning, not on characters.

### 5.8 Spelling noise breaks the little exact matching that would otherwise work

The corpus is written by people who type fast and who are often not writing in their first language. The files contain `monogram` for nonogram, `clubhose` for clubhouse, `aqarium` for aquarium, `bonzai` for bonsai, `Solitare` for solitaire, `challanges` for challenges, `laternia` for Lateania, `rubix` for rubiks, and one entry from skel101 on 2026-07-30 that reads "a trdanig card gmae or other kind of gmae taht alowls users to trade collectibels between each ohter". The `monogram` case matters directly: reiwa.ca's long and careful report about unsolvable nonograms uses that spelling throughout, so it would be separated from the two other reports of the same defect by any lexical grouping.

### 5.9 The median entry is one sentence, and it is not actionable as written

The median body is 97 characters in `bugs.txt` and 100 characters in `suggestions.txt`. Only 2 entries out of 59 in `bugs.txt` have more than one line. There is no field for the terminal emulator, the operating system, the version of the client, the terminal size, the way of connecting, or the steps to reproduce — and in most entries that information is not in the free text either.

The result is a set of bug reports that cannot be worked on without going back to the reporter: "C-q doesn't work?" from fellshard on 2026-07-07, "ignore command doesn't ignore dm's" from blap on 2026-06-28, "rss feed, not loading evey feed ive got" from mat on 2026-06-30, "The classical icecast doesnt work for me" from Anonym3000 on 2026-07-13. The remaining evidence, the identity of the reporter, is the only way to recover the missing context, and it decays as the weeks pass.

### 5.10 Evidence referenced in the text was lost during the export

Three entries of `bugs.txt` and five entries of `suggestions.txt` contain a hyperlink, and those hyperlinks are the only attachments that survived. Two entries show the loss directly. On 2026-06-29, WgDimension reports malformed titles in the feed reader and writes "see attached" — and there is no attachment and no link in the file, so the evidence is gone. On 2026-08-02, `mat` posted an entry into `bugs.txt` whose entire body is one link to an image and nothing else, so the content of that bug report cannot be read from the file at all.

### 5.11 The marker is inside the body, and it also appears where it is not a marker

Because the marker is the first characters of the body rather than a separate field, two problems follow. First, the body has to be cleaned before use, and the cleaning is not always trivial: kirii.md wrote `---SUGGESTION--- .` followed by a title on the next line on 2026-07-25, and `---SUGGESTION--- !` followed by a title on the next line on 2026-07-29, so a naive strip leaves a stray punctuation character as the first line. Second, the marker is quoted inside the header line of replies, because the header quotes the beginning of the parent message. Counting the lines that contain `---BUG---` in `bugs.txt` gives 57, but only 56 entries actually carry it — the extra one is a quotation inside a reply header. In `suggestions.txt` the same effect gives 255 lines for 247 entries, an overcount of 8. A count made with a simple text search is therefore wrong in both files.

### 5.12 There is no outcome, so there is no feedback loop

Nothing in the two files ever says what happened to an item. A person who reports something has no way to know whether it was seen, whether it was accepted, or whether it was built. The community noticed this by itself: on 2026-07-07, `odd` asked directly for a way to "submit, view, categorize, prioritize and more easily see progress". That absence has a cost that is not visible in the files, because it is made of the reports that people did not bother to write.

### 5.13 The export window is cut at both ends

`suggestions.txt` starts on 2026-05-18 with the backlog paste, which means that everything said before that date is absent, and that the backlog paste itself is a summary of an earlier period that cannot be examined. Both files stop on 2026-08-05 and 2026-08-06, in the middle of a week. Neither the beginning nor the end of the corpus can be used to say anything about a trend.

### 5.14 A moderation dimension exists

A small number of entries are jokes, are off topic, or are written in a way that would not be republished as they are, and at least one author name is crude. It is a small number, but any process that copies these entries into a public place — a GitHub issue, a page inside late.sh, a report — inherits the question of what to do with them, and it is better to know it now than to discover it after publication.

## 6. Summary

The two files are, as raw material, better than they look. The format is regular and complete, attribution and chronology are intact, the classification marker covers more than 94 percent of entries, the volume is small enough to process entirely and repeatedly, and the content is written by technical people who often carry their own remedy with them.

What is missing is everything that turns a stream of messages into a backlog: an identifier that does not collide, a status, a component, a severity, and a link between the entries that describe the same thing. The consequence is that the two files can be read but cannot be counted. The number of entries is not the number of problems, the number of authors is not the number of people, the separation between the two files is not the separation between defects and requests, and the arrival dates are not a trend.

Three findings matter more than the others, because they decide the shape of any process built on top of this data:

1. The unit of work is a theme, not a message. Eight duplicate groups were found by reading, none of them detectable by exact matching, and the largest holds six entries spread over seven weeks.
2. The two files must be merged before being sorted, because the split between a defect and a request was made by the reporter and is wrong often enough to matter — the same person filed the same frustration into both files within two minutes.
3. The status has to live outside these two files, because `data/feedback/bugs.txt` and `data/feedback/suggestions.txt` are regenerated by `npm run import:feedback` and must not be edited by hand.
