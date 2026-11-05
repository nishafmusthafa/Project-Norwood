# Norwood HQ – Pilot Store Planner

A single-file planning app for the Norwood Pilot Store (working name TBC), 409 Herries Road, Sheffield S5 7HF. Grand opening target is 5 March 2027.

The app has no build step. It loads one library (supabase-js, from jsDelivr) for live updates. If that library can't load, the app still works and syncs every 20 seconds.

## Files
- `index.html`: the whole app (HTML, CSS and JS), with the seed data embedded.
- `data.json`: the seed data (38 tasks, team, RAID, questions, menu, KPIs, catchment, brand proposals, checklist).

On first load the app tries `./data.json`. If that fails (for example when opened via `file://`), it uses the embedded copy. After that, the shared copy in Supabase is the source of truth. The first browser to join with an empty database uploads its data as the starting point.

## Deploy to GitHub Pages
1. Create a new repository (for example `norwood-hq`) on GitHub.
2. Upload `index.html`, `data.json` and `README.md` to the repository root. You can do this on the web ("Add file → Upload files") or with git:
   ```
   git init && git add . && git commit -m "Norwood HQ"
   git branch -M main
   git remote add origin https://github.com/<you>/norwood-hq.git
   git push -u origin main
   ```
3. Go to **Settings → Pages**. Set Source to "Deploy from a branch", choose branch `main` and folder `/ (root)`, then Save.
4. After about a minute the app is live at `https://<you>.github.io/norwood-hq/`.

To run locally, open `index.html` directly. Or run `python3 -m http.server` in the folder and go to http://localhost:8000.

## Features
- **Dashboard:**
  - countdown to opening and overall % complete
  - tasks by status
  - overdue and next-7-days lists
  - critical-path progress
  - workload per owner
  - top risks
- **Tasks:**
  - table view with sorting, inline editing (name, owner, dates, status, %), filters (owner, phase, status, critical), search and a "My tasks" filter
  - Kanban view with drag and drop between columns
  - add, edit and delete tasks, with notes and comments on each task
  - a warning when a task is started or completed before its predecessors are done
- **Gantt:** SVG chart grouped by phase, with a today line, an opening line and highlighted critical-path bars. Click a bar to edit the task.
- **Calendar:** month grid of due dates.
- **Team:** each person's role and responsibilities, their tasks and progress, and an "I am…" selector (remembered in this browser) that drives "My tasks".
- **Logs:**
  - editable RAID log and open questions
  - tickable launch readiness checklist (records who ticked each item and when)
  - activity log (who and when)
- **Reference:**
  - draft menu with editable prices
  - KPI table (proposed targets)
  - catchment highlights
  - brand proposals (proposals only, not a decision)
- **Data:**
  - export and import JSON
  - export tasks as CSV
  - export deadlines as `.ics` (import into Google or Outlook Calendar)
  - reset to defaults
- Dark/light toggle, responsive layout for phones, keyboard-focus styles and ARIA labels.

## Shared, live data (Supabase)
Everyone who joins with the **team passcode** sees and edits the same plan, live.
- On first visit the app asks for the passcode and "I am". Both are remembered in that browser.
- Each task, RAID row, question, menu item, KPI, checklist item and activity entry is saved as its own row. Two people editing different things never overwrite each other. If two people edit the *same* task at once, the last save wins.
- Changes show for others within a second or two (Supabase Realtime). Every open copy also re-checks every 20 seconds and when the tab comes back into focus.
- The header shows **● Live · N online**. Hover over it to see who is online.
- **Offline:** a copy is kept in the browser and edits are queued. They sync automatically when the connection returns.
- **Sign out** of a browser: go to Data → Sharing.
- Import and Reset now apply **for everyone**, so export a backup first.

### Backend details
- Supabase project `ufinmrgnqwutxwntcdvs` (org "Second Spring").
- Tables: `hq_items` (collection, id, data, updated_at, updated_by) and `hq_config` (the passcode hash).
- RLS is on with no policies, so the public key cannot read or write the tables directly. All access goes through the functions `hq_check`, `hq_pull` and `hq_push`, and each one checks the passcode.
- **Change the passcode** in the Supabase SQL editor:
  ```sql
  update public.hq_config set v = extensions.crypt('NEW-PASSCODE', extensions.gen_salt('bf', 8)) where k = 'passcode_hash';
  ```
  Each browser is then asked for the new passcode.
- Back up everything from the SQL editor with `select * from public.hq_items;`, or use Export JSON in the app.

## Caveats
- KPI targets, menu prices and brand options are drafts or proposals, not validated or decided.
- "Super Chicken" is a working menu name only.
