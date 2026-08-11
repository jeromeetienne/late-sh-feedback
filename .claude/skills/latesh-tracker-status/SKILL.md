---
name: latesh-tracker-status
description: Generates a PNG status image of the GitHub issue tracker on jeromeetienne/late-sh-feedback — open issue counts, the bug/suggestion split, an area-by-area breakdown, human-review progress on the confirmed label, and a daily histogram of when issues were opened — commits it to data/tracker-status/, links it from README.md, and pushes the result. Never creates, edits, or closes a GitHub issue.
---

# late.sh feedback tracker status

This skill builds one PNG image that summarizes the current state of the issue tracker on `jeromeetienne/late-sh-feedback`, saves it to `data/tracker-status/dashboard.png`, makes sure `README.md` links to it, and pushes both to GitHub. It never calls `gh issue create` or `gh issue edit`, so it does not need the confirmation gate described in `docs/ingestion_process.md` — but unlike the other two skills, it does commit and push on its own, without a separate confirmation step, because the person running this skill has already asked for that to happen every time the image is regenerated.

## Arguments

This skill takes one optional argument.

- No argument: build the dashboard from the current state of the issue tracker, as described below.
- `help`: print the following and stop, without reading any issue or rendering anything.
  ```
  /latesh-tracker-status [help]

  Generates a PNG status image summarizing the GitHub issue tracker on jeromeetienne/late-sh-feedback,
  commits it to data/tracker-status/, and pushes it.

    (no argument)   Build the dashboard from the current state of the issue tracker.
    help            Show this help and do nothing else.
  ```

## Steps

### 1. Read the current issue tracker state

Fetch every open issue on `jeromeetienne/late-sh-feedback`, with its number, title, creation date, and labels:

```
gh api --paginate repos/jeromeetienne/late-sh-feedback/issues --method GET -f state=open -f per_page=100 \
  --jq '.[] | select(.pull_request == null) | {number, title, created_at, labels: [.labels[].name]}'
```

The `select(.pull_request == null)` step is needed because the GitHub issues endpoint also returns pull requests — this repository does not use pull requests, but drop them anyway in case one ever appears. Keep only open issues; closed issues are handled work and stay out of this dashboard.

### 2. Compute the numbers the dashboard needs

From the fetched list:

- `TOTAL`: the count of open issues.
- `BUG_COUNT`: the count of open issues carrying the `bug` label.
- `SUGGESTION_COUNT`: the count of open issues carrying the `suggestion` label. `BUG_COUNT + SUGGESTION_COUNT` should equal `TOTAL` — every issue carries exactly one of the two, per the label taxonomy in `docs/ingestion_process.md`.
- `CONFIRMED_COUNT`: the count of open issues carrying the `confirmed` label.
- `AREAS`: one row per area label in the taxonomy — `area:games`, `area:chat`, `area:directory`, `area:audio`, `area:notifications`, `area:profile`, `area:theming`, `area:terminal`, `area:economy`, `area:voice`, `area:pets` — each with its own open bug count and open suggestion count. Include every area even when both counts are zero. Sort the rows by total (bug count plus suggestion count) descending; break ties by the order the areas are listed above.
- `EMPTY_AREA_COUNT`: how many of the eleven areas above have a total of zero.
- `MIN_ISSUE_NUMBER`, `MAX_ISSUE_NUMBER`: the lowest and highest open issue numbers.
- `DAYS`: one entry per calendar day (UTC) that has at least one open issue, from the earliest creation date to the latest, as `[MM-DD, count]` pairs, sorted chronologically. A day with no issues created still needs an entry with count `0` if it falls between the first and last day, so the bars read as a continuous timeline.
- `FIRST_DATE`, `LAST_DATE`: the earliest and latest creation dates among open issues, as `YYYY-MM-DD`.
- `GENERATED_AT`: the current date and time in UTC, as `YYYY-MM-DD HH:MM UTC`.

### 3. Fill in the HTML template

Take the template below and substitute every `{{TOKEN}}` with the value computed in step 2. The `{{AREAS_JS}}` and `{{DAYS_JS}}` tokens are each a JavaScript array literal — build them from the `AREAS` and `DAYS` lists above, keeping the same shape as the placeholders they replace. `{{DONUT_SUGGESTION_DASHARRAY}}`, `{{DONUT_BUG_DASHARRAY}}`, `{{DONUT_BUG_ROTATE}}`, and `{{RING_DASHARRAY}}` are computed from a circle circumference of `364.42` (`2 * pi * 58`):

- `sugFrac = SUGGESTION_COUNT / TOTAL`, `bugFrac = BUG_COUNT / TOTAL`
- `{{DONUT_SUGGESTION_DASHARRAY}}` = `sugFrac * 364.42` followed by `364.42`, e.g. `"120.5 364.42"`
- `{{DONUT_BUG_DASHARRAY}}` = `bugFrac * 364.42` followed by `364.42`
- `{{DONUT_BUG_ROTATE}}` = `-90 + sugFrac * 360`
- `confirmedFrac = CONFIRMED_COUNT / TOTAL`
- `{{RING_DASHARRAY}}` = `confirmedFrac * 364.42` followed by `364.42`

Keep the `<meta charset="utf-8">` line exactly where it is, as the first line of the file. Without it, a plain local web server will not send a charset in its response headers, and the browser will misread any non-ASCII character in the page (the em dash and arrow used below) as the wrong bytes.

```html
<meta charset="utf-8">
<title>late-sh-feedback — status</title>
<style>
  :root {
    --bg: #1a1613;
    --surface: #221d18;
    --surface-2: #2b241c;
    --ink: #ede7d8;
    --muted: #9a9184;
    --accent: #d97b3f;
    --bug: #d1573f;
    --suggestion: #e0b34a;
    --line: rgba(237, 231, 216, 0.1);
    --mono: ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace;
    --sans: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }

  body {
    padding: 40px 48px 56px;
  }

  .page {
    max-width: 980px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .prompt {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  .prompt .sym { color: var(--accent); }

  h1 {
    margin: 6px 0 0;
    font-family: var(--mono);
    font-weight: 700;
    font-size: clamp(22px, 3.4vw, 32px);
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  .subhead {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 14.5px;
    line-height: 1.55;
    max-width: 62ch;
  }

  .subhead a { color: var(--ink); text-decoration-color: var(--line); }
  .subhead code { font-family: var(--mono); font-size: 0.93em; color: var(--ink); }

  .kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }

  .kpi {
    background: var(--surface);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .kpi .n {
    font-family: var(--mono);
    font-size: clamp(24px, 3.2vw, 34px);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .kpi .n.bug { color: var(--bug); }
  .kpi .n.suggestion { color: var(--suggestion); }
  .kpi .n.warn { color: var(--accent); }

  .kpi .l {
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--muted);
  }

  .panel {
    background: var(--surface);
    border: 1px solid var(--line);
    padding: 22px 24px 24px;
  }

  .panel-title {
    font-family: var(--mono);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0 0 4px;
  }

  .panel-note {
    font-size: 14px;
    color: var(--muted);
    margin: 0 0 18px;
    line-height: 1.5;
  }

  .area-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .area-row {
    display: grid;
    grid-template-columns: 170px 1fr 40px;
    align-items: center;
    gap: 12px;
  }

  .area-row.empty { opacity: 0.45; }

  .area-name {
    font-family: var(--mono);
    font-size: 14px;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .area-track {
    position: relative;
    height: 16px;
    background: var(--surface-2);
  }

  .area-seg {
    position: absolute;
    top: 0;
    height: 100%;
  }

  .area-total {
    font-family: var(--mono);
    font-size: 14px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .legend {
    display: flex;
    gap: 20px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--mono);
    font-size: 13px;
    color: var(--muted);
  }

  .swatch { width: 9px; height: 9px; display: inline-block; }

  .row3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1.3fr;
    gap: 20px;
  }

  @media (max-width: 760px) {
    .row3 { grid-template-columns: 1fr; }
    .kpis { grid-template-columns: repeat(2, 1fr); }
  }

  .donut-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .donut-center-label {
    font-family: var(--mono);
    font-size: 20px;
    font-weight: 700;
  }

  .donut-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .donut-legend-row {
    display: flex;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: 14px;
  }

  .donut-legend-row .k { display: flex; align-items: center; gap: 7px; color: var(--muted); }
  .donut-legend-row .v { font-variant-numeric: tabular-nums; }

  .ring-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .ring-caption {
    font-size: 14px;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
  }

  .hist {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 120px;
  }

  .hist-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    height: 100%;
  }

  .hist-bar {
    width: 100%;
    background: var(--accent);
    min-height: 2px;
  }

  .hist-n {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  .hist-labels {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }

  .hist-label {
    flex: 1;
    text-align: center;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }

  .foot {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--muted);
    text-align: center;
    padding-top: 8px;
  }
</style>

<div class="page">

  <header>
    <div class="prompt"><span class="sym">$</span> late-sh-feedback status --repo jeromeetienne/late-sh-feedback</div>
    <h1>Bug and suggestion tracker status</h1>
    <p class="subhead">
      {{TOTAL}} open issues on <a href="https://github.com/jeromeetienne/late-sh-feedback" target="_blank" rel="noopener">jeromeetienne/late-sh-feedback</a>,
      sorted out from the <code>#bugs</code> and <code>#suggestions</code> channels of late.sh. {{CONFIRMED_COUNT}} of them have been reviewed
      by a human and carry the <code>confirmed</code> label.
    </p>
  </header>

  <section class="kpis">
    <div class="kpi">
      <div class="n">{{TOTAL}}</div>
      <div class="l">Open issues</div>
    </div>
    <div class="kpi">
      <div class="n bug">{{BUG_COUNT}}</div>
      <div class="l">Bugs</div>
    </div>
    <div class="kpi">
      <div class="n suggestion">{{SUGGESTION_COUNT}}</div>
      <div class="l">Suggestions</div>
    </div>
    <div class="kpi">
      <div class="n warn">{{CONFIRMED_COUNT}} / {{TOTAL}}</div>
      <div class="l">Confirmed</div>
    </div>
  </section>

  <section class="panel">
    <p class="panel-title">Issues by area</p>
    <p class="panel-note">Every issue carries one area label. {{EMPTY_AREA_COUNT}} of the eleven areas have no report yet.</p>
    <div class="area-rows" id="area-rows"></div>
    <div class="legend">
      <span class="legend-item"><span class="swatch" style="background:var(--bug)"></span>bug</span>
      <span class="legend-item"><span class="swatch" style="background:var(--suggestion)"></span>suggestion</span>
    </div>
  </section>

  <section class="row3">

    <div class="panel">
      <p class="panel-title">Bug / suggestion split</p>
      <p class="panel-note">Of the {{TOTAL}} open issues.</p>
      <div class="donut-wrap">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="58" fill="none" stroke="var(--surface-2)" stroke-width="20"></circle>
          <circle id="donut-suggestion" cx="75" cy="75" r="58" fill="none" stroke="var(--suggestion)" stroke-width="20"
                  stroke-dasharray="{{DONUT_SUGGESTION_DASHARRAY}}" transform="rotate(-90 75 75)"></circle>
          <circle id="donut-bug" cx="75" cy="75" r="58" fill="none" stroke="var(--bug)" stroke-width="20"
                  stroke-dasharray="{{DONUT_BUG_DASHARRAY}}" transform="rotate({{DONUT_BUG_ROTATE}} 75 75)"></circle>
          <text x="75" y="70" text-anchor="middle" class="donut-center-label" fill="var(--ink)" font-family="var(--mono)">{{TOTAL}}</text>
          <text x="75" y="88" text-anchor="middle" fill="var(--muted)" font-family="var(--mono)" font-size="11.5">issues</text>
        </svg>
        <div class="donut-legend">
          <div class="donut-legend-row"><span class="k"><span class="swatch" style="background:var(--bug)"></span>bug</span><span class="v">{{BUG_COUNT}} · {{BUG_PERCENT}}%</span></div>
          <div class="donut-legend-row"><span class="k"><span class="swatch" style="background:var(--suggestion)"></span>suggestion</span><span class="v">{{SUGGESTION_COUNT}} · {{SUGGESTION_PERCENT}}%</span></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Human review</p>
      <p class="panel-note">Issues still waiting on confirmation.</p>
      <div class="ring-wrap">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="58" fill="none" stroke="var(--surface-2)" stroke-width="20"></circle>
          <circle cx="75" cy="75" r="58" fill="none" stroke="var(--accent)" stroke-width="20"
                  stroke-dasharray="{{RING_DASHARRAY}}" transform="rotate(-90 75 75)"></circle>
          <text x="75" y="70" text-anchor="middle" class="donut-center-label" fill="var(--ink)" font-family="var(--mono)">{{CONFIRMED_PERCENT}}%</text>
          <text x="75" y="88" text-anchor="middle" fill="var(--muted)" font-family="var(--mono)" font-size="11.5">confirmed</text>
        </svg>
        <p class="ring-caption">{{CONFIRMED_COUNT}} of {{TOTAL}} open issues carry the <code style="font-family:var(--mono)">confirmed</code> label.</p>
      </div>
    </div>

    <div class="panel">
      <p class="panel-title">Reports by day</p>
      <p class="panel-note">Issue-open date, {{FIRST_DATE}} → {{LAST_DATE}}.</p>
      <div class="hist" id="hist"></div>
      <div class="hist-labels" id="hist-labels"></div>
    </div>

  </section>

  <p class="foot">generated from jeromeetienne/late-sh-feedback issues #{{MIN_ISSUE_NUMBER}}–#{{MAX_ISSUE_NUMBER}} · {{GENERATED_AT}}</p>

</div>

<script>
  const AREAS = {{AREAS_JS}};

  const maxAreaTotal = Math.max(...AREAS.map(a => a.bug + a.sug));

  const rowsEl = document.getElementById("area-rows");
  AREAS.forEach(a => {
    const total = a.bug + a.sug;
    const row = document.createElement("div");
    row.className = "area-row" + (total === 0 ? " empty" : "");

    const bugWidth = maxAreaTotal ? (a.bug / maxAreaTotal) * 100 : 0;
    const sugWidth = maxAreaTotal ? (a.sug / maxAreaTotal) * 100 : 0;

    row.innerHTML = `
      <span class="area-name">${a.name}</span>
      <span class="area-track">
        <span class="area-seg" style="left:0; width:${bugWidth}%; background:var(--bug)"></span>
        <span class="area-seg" style="left:${bugWidth}%; width:${sugWidth}%; background:var(--suggestion)"></span>
      </span>
      <span class="area-total">${total || "–"}</span>
    `;
    rowsEl.appendChild(row);
  });

  const DAYS = {{DAYS_JS}};
  const maxDay = Math.max(...DAYS.map(d => d[1]));
  const histEl = document.getElementById("hist");
  const histLabelsEl = document.getElementById("hist-labels");
  DAYS.forEach(([label, n]) => {
    const col = document.createElement("div");
    col.className = "hist-col";
    col.innerHTML = `<span class="hist-n">${n}</span><span class="hist-bar" style="height:${maxDay ? (n / maxDay) * 88 : 0}px"></span>`;
    histEl.appendChild(col);
    const lab = document.createElement("span");
    lab.className = "hist-label";
    lab.textContent = label;
    histLabelsEl.appendChild(lab);
  });
</script>
```

### 4. Write the filled HTML to the scratchpad directory

Write the substituted HTML from step 3 to a file named `latesh-tracker-status.html`, inside the scratchpad directory for the current session. This HTML file is only an intermediate — do not write it anywhere inside this repository, and do not commit it.

### 5. Render the HTML file to a PNG, straight into the repository

The Artifact tool and the sandboxed browser pane cannot screenshot a locally-written HTML file directly — neither an authenticated Artifact URL nor a bare `file://` URL produces a screenshot-able tab. The working path is to serve the file over a local HTTP server and screenshot it with a real, separately-installed browser in headless mode, writing the output directly to `data/tracker-status/dashboard.png` in this repository, overwriting whatever is there from the previous run:

1. Start a plain HTTP server bound to `127.0.0.1`, on a free port, serving the scratchpad directory — for example `python3 -m http.server {port} --bind 127.0.0.1 --directory {scratchpadDirectory}` — running in the background.
2. Render the page to a PNG file with a headless Chrome or Chromium binary already installed on the machine (for example, on macOS, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`):
   ```
   {chromeBinaryPath} --headless --disable-gpu --screenshot={repoRoot}/data/tracker-status/dashboard.png \
     --window-size=1085,1300 --hide-scrollbars http://127.0.0.1:{port}/latesh-tracker-status.html
   ```
   The window width, `1085`, is not arbitrary — it is the `.page` element's `max-width: 980px` plus its `body` padding of `48px` on each side, from the template in step 3, plus a few pixels of slack. Rendering at a much wider window (for example `1600`) leaves the page centered in a lot of empty space, which shows up as huge dead margins on both sides of the image. If the `max-width` or the horizontal `body` padding in the template ever changes, change this width to match — `980 + 2 * {horizontal padding}` plus a small margin.
3. Stop the local HTTP server.
4. Read the resulting `data/tracker-status/dashboard.png` back to confirm the four panels (KPI row, area breakdown, donut, ring, histogram) rendered correctly, every label is legible at normal size, and there is no mojibake in the em dash or arrow characters.

### 6. Make sure README.md links to the image, at the top of the file

Check `README.md` for the image link `![Bug and suggestion tracker status](data/tracker-status/dashboard.png)`. If it is missing, insert it, together with its caption, right after the introductory lines at the very top of the file — before the first `##` heading (`## Purpose`):

```markdown
![Bug and suggestion tracker status](data/tracker-status/dashboard.png)

Generated by the `/latesh-tracker-status` Claude Code skill. The image above is overwritten every time that skill runs — see the commit history of `data/tracker-status/dashboard.png` for how the tracker has changed over time.
```

If the link already exists, leave `README.md` untouched — the image path is stable, so the existing link keeps working once the file underneath it is overwritten.

### 7. Commit and push

Stage only the files this skill touched — never a broad `git add -A` — and check `git status` first to confirm nothing else unrelated is picked up:

1. `git add data/tracker-status/dashboard.png`, and `git add README.md` too if step 6 changed it.
2. Commit with a message describing the refresh, for example `Update tracker status image`.
3. Push the current branch to its remote, for example `git push`.

This is the one step in this skill that touches the real repository without a separate confirmation prompt — the person running this skill has already asked for the image to be committed and pushed automatically every time it is regenerated. It is still not the same as the confirmation gate in `docs/ingestion_process.md`, which is specifically about creating or editing GitHub issues; this skill never does either.
