# Freshness Passport — Final Build Plan (v3)

Premium single-file React SaaS prototype: 6 dashboard pages, passport drawer, full Store Profile page, Store creation + Passport creation modals, toast system. All v2 decisions stand; this revision pins down 12 previously-undefined behaviours.

## File structure (unchanged)

- `src/routes/index.tsx` — SEO `head()` + render app component.
- `src/routes/__root.tsx` — add Inter via Google Fonts `<link>` in `head()`.
- `src/components/FreshnessPassport.tsx` — entire app (~2400 lines), seed data + helpers at top.
- `bun add recharts` if missing.

Palette/typography per spec; arbitrary Tailwind values (`bg-[#1B3A6B]`, etc.) and inline styles for exact hex matches.

## Global state

`activePage`, `activeStore`, `storeProfileId`, `drawerBatchId`, `storeModalOpen`, `passportModalOpen`, `isSidebarOpen` (mobile), `isLoading` (per-page skeleton), `stores[]`, `batches[]`, `tasks[]`, `activity[]`, `toasts[]`, `tooltipsOpen: Set<string>`, `newPassportFlashId`.

## App shell

- 240px sidebar (Overview, Passports, RSL Monitor, Waste Analytics, Action Engine, Impact). Active: `#EFF6FF` bg, 3px `#2563EB` left accent.
- Header: hamburger (mobile only) + leaf logo + "Freshness Passport"; right side `+ Add Store`, store selector dropdown (DC + 5, each with "→ View Store Profile"), bell w/ `3` dot, `AV` avatar.
- Main: `#F8FAFC`, 32px padding.
- Outer wrapper `position: relative; min-height: 100vh` to anchor the absolute-positioned toast stack.

### FIX 1 — Mobile sidebar drawer
At <768px sidebar hidden; `≡` in header top-left opens it as a 240px left-slide drawer over content with `rgba(0,0,0,0.4)` overlay (clicking overlay closes). X close inside top-right. 200ms ease transform. Selecting any nav item sets `isSidebarOpen = false`. `isSidebarOpen` lives in global state.

## Reusable primitives

`Card`, `SectionHeader(title, tooltipKey)`, `StatusBadge`, `KpiCard`, `PrimaryButton`, `SecondaryButton`, `DataTable`, `Modal`, `TabPills`, `FormField`, `Input`/`Select`/`Textarea`/`RadioPills`/`CheckboxPills`/`Toggle`/`Stepper`, `Avatar`, `Toast`, `Drawer`, `FreshnessGauge` (SVG).

Form-field styling per spec (40px, `#E2E8F0` border, 8px radius, focus `#2563EB` + 3px rgba(37,99,235,.12) ring, error `#DC2626`; labels 13px/600/`#374151`; required `*`).

## Helpers (defined at top of file)

### FIX 9 — RSL calculation
```
computeRSL(batch) → { rslDays, score }
  daysSinceProduction = floor((Date.now() - productionDate)/86400000)
  tempPenalty = tempExcursion ? tempPenaltyDays : 0
  dwellPenalty = max(0, dwellDays - 2)
  rslDays = max(0, baseShelfLife - daysSinceProduction - tempPenalty - dwellPenalty)
  score   = round(rslDays / baseShelfLife * 100)

freshnessColor(score): ≥75 #16A34A, ≥45 #D97706, else #DC2626
rslToAction(days): <1 50% markdown; 1–2 front shelf + markdown;
                   2–3 FEFO; 3–5 monitor; >5 none
```
Both passport table and drawer call `computeRSL` so the values match.

### FIX 12 — nextBatchId()
Scans `batches[]` for IDs matching `#A(\d+)`, returns `#A${(max+1).padStart(2,'0')}`. Called when passport modal opens to pre-fill Batch ID; user may override.

Plus `formatGBP`, `formatDate('DD Mon YYYY')`, `formatPct(n)` (1 dp), `nextStoreId()`.

## Pages

1. **Overview** — 4 KPIs, freshness-by-store BarChart, waste-driver donut, 6-event activity feed.
2. **Product Passports** — search + 3 filter dropdowns, table, `New Passport +` top-right, drawer on "View".
3. **RSL Monitor** — 3 summary cards, 12-row urgency table with colored left-border accents + auto actions, 14-day AreaChart.
4. **Waste Analytics** — driver BarChart, category donut, 10-row incidents log, 8-week multi-line trend (dual axis).
5. **Action Engine** — 4 summary cards + 3-column Kanban (see FIX 6).
6. **Impact Report** — 4 hero metrics, 12-month ComposedChart, 6-month stacked BarChart, ESG certificate card (Export PDF / Share — see FIX 11), store league with sparklines + 🏆.

### FIX 2 — Recharts sizing
Every chart wrapped in `<ResponsiveContainer width="100%" height={H}>`:
- trend lines / area: 260; donut/pie: 240; horizontal driver bar: 220; 6-month stacked: 280; 8-week multi-line: 260; 12-month composed: 300.
- Freshness gauge is hand-rendered SVG 180×180 with `r=70`, `C = 2π·70`, `strokeDashoffset = C·(1 - score/100)`, color via `freshnessColor`.

### FIX 5 — Passport filter logic
`useMemo([batches, search, status, location, category])` returns AND-filtered list. Search matches product name, SKU, batch ID case-insensitively. Below filters: `"Showing X of Y passports"` in `#94A3B8` 13px. Zero results → empty state card: 48px package icon `#94A3B8`, heading "No passports match your filters", `Clear all filters` link in `#2563EB`.

### FIX 6 — Action Engine state model
`task.status ∈ 'todo'|'inprogress'|'done'`. TO DO cards show `Start Task` → `inprogress`; IN PROGRESS show `Mark Complete` → `done`. Done cards: opacity .65, green check top-right, no buttons. Column counts derive from filtered tasks live. Overdue badge: any non-done task with `assignmentDate` > 2 days ago gets red `OVERDUE` pill (does not move column). No DnD.

## Passport drawer

### FIX 4 — Drawer close behaviour
- ESC key closes (useEffect adds `keydown` listener, cleanup on unmount).
- Click overlay closes.
- 250ms CSS transition on `transform: translateX(100% → 0)`.
- Body scroll locked (`document.body.style.overflow='hidden'`) while open; restored on close.
- Width 560px desktop, `calc(100vw - 40px)` mobile.

Sections: Summary grid, Temperature LineChart + threshold ReferenceLine, Movement timeline, RSL breakdown progress bar (uses `computeRSL`).

## Store Profile full-page

### FIX 3 — Back navigation
Top of page: `← Back to Dashboard` text button (`#2563EB` 13px/500). Click → `storeProfileId = null` and `activePage = 'overview'`. On open, call `window.history.pushState({storeProfileId}, '', '')`; `popstate` listener clears `storeProfileId` so browser back works.

Header card per spec (80px logo, name, ID pill, tier badge, active-since, address, manager, Edit + `+ New Passport`). "?" tooltip with the exact Store Profile copy. 4 KPI cards. 4 tabs: Overview (activity, top-3 drivers mini bar, large gauge), Products (filtered passport table + `New Passport +` pre-filled with this store), Performance (8-week line + dotted benchmark, weekly RSL table, best/worst category cards), Actions (pending + completed history + per-staff completion progress bars).

## Modals

Shared shell: `rgba(0,0,0,0.35)` overlay, 680px white card, 16px radius, 40px padding, uppercase top-left title, X close, footer (`* Required fields` left; `Cancel` + primary right). Tab pills (`#1B3A6B` active / transparent inactive); tab switching preserves state; incomplete tabs show amber dot.

### Store Profile modal
Tabs: `Store Details` / `Operations` / `Preferences`. Fields exactly per v2 spec (avatar left, fields right).

### Product Passport modal
Tabs: `Batch Details` / `Cold Chain` / `Assignment`. Live temp-range pill recomputes on every keystroke (green "Within Range" / red "⚠ Excursion Detected"). Batch ID field has `Auto-generate` link calling `nextBatchId()`. Priority radio pills color-coded when selected.

### FIX 7 — Avatar upload (both modals)
Pencil button triggers hidden `<input type="file" accept="image/*">`. On change, `FileReader.readAsDataURL` → store base64 in `formState.logoUrl`. If present render `<img style="object-fit:cover">` inside circle, else default icon (building for store, box for product). base64 persists into `stores[]` / `batches[]`.

### Validation
On Save: validate required (store: name, ID, city, manager; passport: name, SKU, batch ID, category, base shelf life). Red inline error below offending field; red banner top of modal: "Please complete N required fields"; auto-scroll to first error. On success → close → toast → list updates → in passports case, new row prepended with 3s blue-left-border flash via `newPassportFlashId` + CSS transition.

## FIX 8 — Toast stack

Container is the **last child of the app wrapper**, `position: absolute; top:0; right:0; z-index:9999` (the outer app div is `position: relative`). Each toast: white card, 4px left border (success `#16A34A` / error `#DC2626` / info `#2563EB`), 8px radius, padding 12×16, 13px, min 280 / max 360px. Newest on top. Each toast schedules its own 3s `setTimeout` removing it by id. Manual X button.

## FIX 10 — Loading skeleton

`isLoading` true for 600ms after first mount (and on page switch to a heavy page). While loading render skeleton **of the active page only** — shell stays interactive. Skeleton blocks: `bg-[#E2E8F0]` rounded rects with global `@keyframes fp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }` and `animation: fp-pulse 1.4s ease infinite` (keyframes injected once via a top-level `<style>` tag in the component). Layout mirrors real page: 4 KPI skeletons in grid, 2 chart boxes at correct heights, 6 table-row skeletons.

## FIX 11 — Impact actions

- `Export PDF`: `window.print()`. Inject a `<style>@media print { .no-print { display:none } ... }</style>`; sidebar, header, all buttons, nav get `no-print`; only ESG certificate + hero metrics render.
- `Share with Sustainability Team`: if `navigator.share` available call it with `{title, text, url: location.href}`; else `navigator.clipboard.writeText(url)` and push blue info toast "Link copied to clipboard".

## Tooltip registry

Map of feature id → spec copy (one per page + every section heading + Store Profile header). `SectionHeader` reads from it; blue `?` toggles light-blue panel (border-left 3px `#2563EB`, text `#1B3A6B`).

## Seed data (top of file)

`STORES` (DC + 5), `BATCHES` (~20 with category, location, productionDate, baseShelfLife, dwellDays, tempExcursion, tempPenaltyDays, tempHistory[]), `WASTE_INCIDENTS`, `TASKS`, `ACTIVITY`, `RSL_TREND_14D`, `WASTE_TREND_8W`, `MONTHLY_IMPACT_12M`, `INTERVENTION_STACK_6M`, `STORE_LEAGUE`.

## Out of scope

No backend, routing, auth, shadcn, Lucide (icons inline SVG / Unicode), or tests.

## Verification

Dev build succeeds → preview at 1280px and 768px → click every nav item, open passport drawer (test ESC + overlay close + body lock), open store profile (test Back button + browser back), toggle a tooltip, apply filters (test empty state), Start / Complete tasks (verify counts + overdue), open + submit both modals (validation, toast, list flash, avatar upload), Export PDF print preview, Share button toast.
