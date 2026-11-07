# Project Norwood – Pilot Store Planner

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
   git init && git add . && git commit -m "Project Norwood"
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
- Dark/light toggle, responsive layout for phones, keyboard-focus styles and ARIA labels.

## Signing in and who can change what
Each person signs in with their **name and personal 6-digit PIN**. Nishaf gives each person their PIN privately. After 5 wrong PINs, that name is locked for 15 minutes.

| | Nishaf, Fanshad | Everyone else |
|---|---|---|
| Add, delete or reassign tasks; change phases, dependencies or project dates | ✅ | ❌ |
| Status, progress and dates on **their own** tasks | ✅ | ✅ |
| Notes on any task | ✅ | ✅ (in their own name) |
| RAID log and questions | ✅ all | ✅ edit and raise their own |
| Launch checklist, KPIs, team list, import | ✅ | ❌ |
| Menu prices | ✅ | Mammad only |
| Brand board and knowledge base | ✅ all | ✅ add; edit their own |
| Delete anything | ✅ | ❌ |

These rules are **enforced on the server** (Supabase function `hq_push2`), so they can't be bypassed from the browser. If a change isn't allowed, the app undoes it and shows the reason.

## Tabs (simplified)
| Tab | What it's for |
|---|---|
| **Home** | Countdown and progress, then **Alerts** and **Insights**, latest knowledge and industry news |
| **My work** | Each person's own tasks in order (Now, Next 30 days, Later) with one-tap **Start**, **Done**, **Blocked** and **+ Note**; team members land here after signing in |
| **Plan** | All tasks as a List, a Board (drag cards), a Timeline (Gantt) or a Calendar |
| **Risks & decisions** | RAID log, open questions, launch checklist, activity log |
| **Brand** | Brand board: positioning, customers, pillars, tone, sensory brand, palettes, type, packaging, campaigns, with image upload. **Use as app colours** restyles the app with any palette |
| **Franchise growth** | Readiness tracker (prove the pilot → manuals → protect the brand → legal offer → supply chain → recruit) and a live **unit economics model** (store profit, franchisee profit, payback, franchisor income) |
| **Knowledge** | Team-pasted reels, articles, competitor, supplier and customer notes, plus a live UK takeaway and restaurant news feed |
| **Team** | Who does what, and the access rules |
| **More** | Menu, KPIs and catchment data; backup, import, export and sharing |

### Expert content added
Added once by the first Nishaf or Fanshad sign-in. It only adds items that don't exist yet, so nothing is overwritten.

- **Project management:** a 0 Governance phase with a weekly review, Stage Gates 1–4 (site secured, design frozen, build complete, launch ready), a budget baseline with 10% contingency, insurance, utilities and waste contracts, the EPOS and delivery-app menu build, the opening stock order, a pre-opening audit and a 30/60/90-day review. Also new risks (cost overrun, delivery commission, key-person dependency) and decisions (brand gate, no franchising until 6 months on target).
- **Brand:** positioning statement, target customers, pillars, tone of voice, sensory brand (smell, sound, touch, sight, taste), the appetite palette, type pairing, packaging system, the "First 500" launch campaign, social content pillars and a brand-guidelines checklist. Also the **Super Chicken menu mock-up** and an **Outfry packaging reference**, with risk **R12**: the draft mascot closely resembles Outfry's.
- **Franchise growth:** 18 readiness items across 6 areas, including UKIPO trademark classes 29, 30 and 43, an operations manual, a training academy, a franchise solicitor, the franchise offer, approved suppliers, site criteria and a territory plan.

## Architecture
- **Front end:**
  - `index.html` is a single file with no build step. It renders each tab from one in-memory state object `S`.
  - `sw.js` shows push notifications, and `manifest.json` lets people install the app on a home screen.
  - The browser keeps a copy of the data in `localStorage`, so the app works offline.
- **Sync model:**
  - Every list item (task, risk, brand idea and so on) is its own database row keyed by `collection + _k`. Single sections (project, theme, economics) are rows in `_doc`.
  - The client compares its data with the last synced copy and sends only the changes.
  - After a pull, local edits that haven't been sent yet take priority over the server copy. Edits the server refuses are reverted.
  - Supabase Realtime tells other browsers that something changed, and every browser also re-checks every 20 seconds as a fallback.
- **Security:**
  - All tables have row-level security turned on and no policies. Every read and write goes through `SECURITY DEFINER` functions that check name and PIN (bcrypt hash, 5 attempts then a 15-minute lockout).
  - `hq_rule()` decides each change on the server, so the rules hold even if someone edits the page code.
  - PINs and the signing key for notifications (VAPID) are never in the page.
- **Server functions:**
  - `hq-news` fetches Google News headlines, filtered and cached for 30 minutes.
  - `hq-notify` checks the sender's PIN and sends web push to the rest of the team.
- **Scaling path:** when the team grows past about 20 people or the data grows a lot:
  - move images to Supabase Storage;
  - switch to Supabase Auth with personal email logins;
  - split the page into modules with a build step.

## Expenses
- **Overview:**
  - total budget (forecast plus reserve), spent so far and left to spend;
  - a breakdown by category (spent against forecast);
  - **partner stakes:** each person's committed stake against what they've paid in, meaning their own money spent on the project plus cash paid into the business;
  - the latest spending.
- **Spending log:** everyone can **log an expense**: amount, what for, date, category, budget line, how it was paid and a receipt photo (taken with the phone camera).
  - **Own money** counts towards that person's stake. **Company account** and **Cash from takings** don't.
  - Members can edit their own entries until they're approved.
  - Nishaf and Fanshad approve, delete and log for anyone.
  - The log filters by person and category, and exports to CSV.
- **Budget:** Nishaf and Fanshad add a forecast for each work item, linked to a plan task, and see forecast, spent and left for each line. **Add a line for every phase** creates lines from the plan phases.
- **Budget reserve and stakes:** set with **Set reserve and stakes**. Home shows an alert when spending eats into the reserve or goes over budget.
- On laptops, the less-used sections (Menu, Franchise, Knowledge, Team, More) sit under **☰ More** so the header stays on one line.

## Contacts
Every stakeholder in one place: suppliers, contractors, consultants, agents, solicitors, council, landlord, utilities and more.
- **Tap to call, WhatsApp or email.** **Save to phone** downloads a contact card (.vcf).
- Search, filter by type, and export to CSV.
- Everyone can add contacts and edit their own. Nishaf and Fanshad can edit or delete any contact.

## Quotes (Expenses › Quotes)
- Keep every estimate and quotation per work item (budget line): supplier, scope, amount, VAT (ex, inc or none), quote date, valid until, payment terms or lead time, and a photo or link of the quote.
- **Compared like-for-like ex VAT**, with the cheapest marked. Expired quotes are flagged, and there's a reminder to get **three quotes** for anything over £1,000.
- **Accept** (Nishaf and Fanshad) marks the other quotes for that item as rejected and offers to set the budget forecast to the accepted price.
- The Budget table shows **Committed**: accepted quotes not yet paid.
- **Suppliers quoting** lists each supplier with its quote count and accepted value, linked to Contacts. New suppliers typed into a quote are added to Contacts automatically.

## Updates
- The app checks `version.json` when it opens, when it comes back on screen and every 2 minutes, and loads a new version automatically. It waits until any change is saved first.
- Release with `./bump-version.sh <version>`, then push. `vercel.json` turns off caching for the app files.

## To-do, reminders and calendars
- **To-do tab:** add a to-do with an optional due date and **reminder time**. Nishaf and Fanshad can assign to-dos to anyone; everyone else adds their own. Owners tick them off; only Nishaf and Fanshad can delete.
- **Push notifications:**
  - a teammate's change, including a new to-do assigned to you;
  - your reminder time;
  - **the day before** a task or to-do is due (from 08:00 UK time).
  Reminders come from the server (Supabase `pg_cron` runs the `hq-remind` function every 5 minutes), so they arrive even when the app is closed. Each person turns on 🔔 once per device.
- **My calendar:** on the To-do tab, **Get my calendar link** gives each person a private subscription feed (`hq-cal`) with their tasks, to-dos (with alerts), stage gates, soft launch and opening. You can add it to iPhone or Mac Calendar (webcal), Google Calendar (Android) or Outlook (copy the link). It updates by itself.
- **Home tiles:**
  - **Coming up:** events in the next 14 days, your to-do list and reminders.
  - **Project progress:** a status donut, time used against work done, and progress by phase.

## Live sync
- **Save changes button (top right):** changes save automatically within about a second. The button shows **Save changes (n)** while edits are waiting, **Saving…** while working and **✓ All saved** when everything is stored. Clicking it saves immediately, including a cell you are still typing in. Closing the page with unsaved changes asks you to confirm first.
- Each item is stored as its own row, so people editing different things never overwrite each other.
- Changes appear for others in about a second, and every open copy also re-checks every 20 seconds.
- Offline edits are queued and sync when the connection returns.

### Backend (Supabase project `ufinmrgnqwutxwntcdvs`)
- Tables:
  - `hq_items`: the shared data.
  - `hq_people`: names, roles and PIN hashes.
  - `hq_config`: legacy.
- RLS is on with no policies, so the public key can't read or write the tables directly.
- Access goes only through `hq_login`, `hq_pull2` and `hq_push2`.
- The edge function `hq-news` supplies the headlines.
- **Change someone's PIN:**
  `update public.hq_people set pin_hash = extensions.crypt('123456', extensions.gen_salt('bf',8)), fails = 0, locked_until = null where name = 'Malik';`
- **Add a person:**
  `insert into public.hq_people(name, role, pin_hash) values ('Name','member', extensions.crypt('123456', extensions.gen_salt('bf',8)));`
  Also add them to the team list in the app.
- **Give someone full access:**
  `update public.hq_people set role = 'admin' where name = 'Name';`
- **Back up:** `select * from public.hq_items;`, or use Export JSON in the app.

## Caveats
- KPI targets, menu prices and brand options are drafts or proposals, not validated or decided.
- "Super Chicken" is a working menu name only.
