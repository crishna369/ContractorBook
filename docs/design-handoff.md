# Handoff: Civil Contractor Management App — Android UI

## Overview
High-fidelity Android UI designs for a civil contractor management app, based on the attached BRD. Audience is non-technical (contractor + site supervisor), so flows are simplified for large touch targets and minimal steps. 5 screens designed: Home, Attendance (day list), Mark Attendance (worker sheet), Pay Worker, Site Expense.

## About the Design Files
The files in this bundle (`Contractor App.dc.html`, `android-frame.jsx`) are **design references built in HTML** — they show intended look, layout, and interaction, not production code. The task is to **recreate these designs natively** in whatever stack the Android app is being built with (native Android/Kotlin+Compose, React Native, Flutter, etc.) — or choose the most suitable stack if none exists yet — using that platform's own component and styling conventions, not by embedding the HTML.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy below are final; recreate pixel-accurately in the target platform's UI toolkit.

## Source of truth
`BRD - Civil Contractor Management Application V2.pdf` — full functional requirements. The 5 screens here cover a subset (Dashboard, Attendance, Worker Payment, Site Expense) the user prioritized first; remaining BRD screens (Worker list/detail, Site list/report, Client billing, Cash & Bank ledger) are not yet designed.

## Design tokens
- **Colors**: Background `#F7F5F0` (warm paper) / `#EDEAE3` (canvas). Ink `#1A1D1A`. Primary dark green `#1F3B30` (buttons, selected states), accent green `#2F7A55` (links, positive amounts), light green tint `#E8F0EA` / `#9CC2B1` / `#8FB6A4` (secondary green surfaces/text on dark). Muted text `#7C837B`, `#A09A8C`, `#6E7770`. Borders `#E5E1D8`, `#DEDACF`. Negative/warning `#B4571F`, `#C07C1E`. Neutral chip bg `#F0EDE6`.
- **Type**: Plus Jakarta Sans, weights 400–800. Headers 19–21px/800. Body 15–16px/600–700. Labels/uppercase eyebrow 12–13px/700, letter-spacing 0.08–0.14em. All rupee amounts use tabular numerals (`font-variant-numeric: tabular-nums`).
- **Radius**: cards 18–20px, chips/pills 999px (full), small tiles 14–16px.
- **Spacing**: screen padding 20px horizontal; card internal padding 14–20px; gap between stacked cards 10–14px.

## Screens

### 1. Home
- Header: business name (21px/800) + date (13px/500 muted) left; 40×40 rounded-12 avatar initials right.
- **Money in hand card**: dark green (`#1F3B30`) rounded-20 panel. Eyebrow label "MONEY IN HAND" + "Updated just now" muted-green. Two columns: Cash and Bank & UPI, each label 13px + amount 27px/800 white, divided by 1px translucent line.
- **Today's attendance card**: white card, border `#E5E1D8`, radius 20. Row: "Today's attendance" + "N left" (orange `#C07C1E`). Big number (34px/800) + "of 24 workers marked". 8px progress bar (green fill on `#EDEAE3` track). Footer row: labour cost so far + "Mark now" pill button (light green bg, green text).
- **Two stat cards side by side**: "Payable to workers" and "Pending from clients", each white/border, label 13px muted, value 22px/800, sub-label 12px muted.
- **Sites section**: "Sites" heading + "See all N" link (green). Each site card: name + net P&L (green if positive, orange/red if negative) top row; a 3-segment stacked progress bar (received/labour/expense, green/gold/grey) below; a row of 3 muted labels with amounts.
- **Bottom nav**: 4 items (Home active green, Attendance, Workers, Sites), icon placeholder + 11px label.

### 2. Attendance — day list
- Header "Attendance" + site filter pill ("All sites").
- Horizontal scrollable date strip: 5 day chips (62px wide, rounded-16), today selected (dark green fill, white text), future days dashed/disabled look.
- Search bar (pill, border, placeholder "Search worker").
- **"Not marked · N" section**: worker rows — 44×44 rounded-14 initials avatar (neutral bg), name (16px/700) + role & day-rate (13px muted), trailing dark-green "Mark" pill button. "Mark all full day" link top-right of section.
- **"Marked · N" section**: worker rows show green-tinted avatar, name/role, trailing rupee total (16px/800) + day-value or status label (e.g. "1.0 day", "Savai · 1.25", "Absent" in muted grey). Split-day workers show a row of small pill chips below (one per site + fraction worked). Absent workers show ₹0 amount, no chips.

### 3. Mark attendance — bottom sheet
- Rendered as a bottom sheet over dimmed background: rounded-28 top corners, drag handle.
- Worker header: avatar, name (19px/800), rate + date subtitle.
- **Per-site card** (repeatable): eyebrow "Site N" + "Remove" link; site-name row with "Change" link; 5-column button grid — Absent / Half / Full / Savai / Dedhi, each showing the day-fraction value (0 / 0.5 / 1 / 1.25 / 1.5); selected state = dark green fill + white text, others = light grey `#F0EDE6`. Footer row: "Labour cost on this site" + live rupee value.
- Dashed "+ Add another site" row to add a second card when a worker splits his day across sites.
- Sticky footer: light-green total banner ("Total for the day" + day/site summary + big total amount) and full-width dark-green "Save attendance" button.

### 4. Pay worker
- Header with back chevron + "Pay worker" title.
- Worker card: avatar, name, "Balance payable ₹X" (orange for outstanding), "Change" link.
- **Amount entry**: dark green panel, "₹" + large amount (42px/800) with underline, quick-amount pills (₹1,000 / ₹2,000 / ₹5,000 / "Full ₹X").
- **"This money is" selector**: 3-column grid — Advance (selected, dark fill) / Salary / Extra work, each with a sub-label.
- **"Paid from" selector**: 2-column — Cash (selected, dark border) / Bank-UPI, each showing current balance.
- Detail rows list (Site / Date / Reason) in a bordered card, values right-aligned.
- Sticky footer: "Balance after this payment" live value + full-width dark-green "Save payment" button.

### 5. Site expense
- Header "Site expense" + "Cancel" link.
- Amount card: "₹" + large amount with cursor caret.
- Description card: free-text value shown large, plus quick-repeat chips of common past entries (Tea & food, Sand, Cement, Transport) — tapping one fills the field, no fixed category list.
- Site/Date detail rows.
- "Paid by" (Me / Supervisor) and "Paid from" (Cash / Bank) — two 2-option toggle groups side by side, selected = dark green fill.
- Full-width dark-green "Save expense" button.

## Interactions & behavior
- All primary actions are single full-width dark-green (`#1F3B30`) pill/rounded buttons at the bottom of the screen (thumb reach).
- Attendance status buttons and toggle groups are mutually-exclusive single-select with a clear filled/unfilled state — no checkboxes.
- Amounts recompute live as attendance status or amount entry changes (shown throughout as static values in the mock, but must be reactive in implementation).
- Worker-first attendance flow: tapping "Mark" on a worker opens the bottom sheet for that one worker/day; supports multiple site rows per worker per day.
- Hindi trade terms (Savai = 1.25×, Dedhi = 1.5×) are kept verbatim in English UI, not translated.

## Assets
No external image assets — avatars are initials-in-circle/rounded-square placeholders (generate from worker name initials). No icons beyond simple geometric placeholders in the mock; use the target platform's icon set (Material Symbols recommended for Android) for nav bar, back chevron, search, etc.

## Files
- `Contractor App.dc.html` — all 5 screens, canvas-mode HTML file. Open in a browser to view/interact.
- `android-frame.jsx` — device bezel component used only for presentation in the mock; not needed in the real app.
- `BRD - Civil Contractor Management Application V2.pdf` — original requirements doc.
