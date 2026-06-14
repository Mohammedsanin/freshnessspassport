# Freshness Passport — Interconnection Layer (v4)

Refactor `src/components/FreshnessPassport.tsx` from page-local state to a single `useReducer` source of truth, so every create/complete/filter/time action ripples across all 6 pages, both modals, drawer, and store profile in real time. Also resolves the 10 named gaps.

## 1. State + reducer (top of file)

Replace scattered `useState` with one `useReducer`:

```text
state = {
  activePage, previousPage, activeStoreFilter, storeProfileId,
  drawerBatchId, taskHighlightId,
  storeModalOpen, passportModalOpen: false | {prefilledStoreId},
  isSidebarOpen, bellOpen, storeDropdownOpen, activityLogOpen,
  tooltipsOpen: Set<string>, newPassportFlashId,
  toasts, stores, batches, tasks, activity,
  timeOffset, notificationsReadAt
}
```

Actions: `NAVIGATE`, `SET_STORE_FILTER`, `OPEN_STORE_PROFILE`, `BACK_FROM_PROFILE`, `OPEN_DRAWER`, `CLOSE_DRAWER`, `OPEN_STORE_MODAL`, `OPEN_PASSPORT_MODAL`, `CLOSE_MODALS`, `ADD_STORE`, `ADD_BATCH`, `ADD_TASK`, `UPDATE_TASK`, `ADD_ACTIVITY`, `PUSH_TOAST`, `DISMISS_TOAST`, `TOGGLE_SIDEBAR`, `TOGGLE_BELL`, `TOGGLE_TIP`, `CLEAR_FLASH`, `HIGHLIGHT_TASK`, `ADVANCE_TIME`, `RESET_TIME`, `MARK_NOTIFS_READ`, `OPEN_ACTIVITY_LOG`.

Each store/batch/task creator reducer case also pushes an activity event and any cascading task auto-generation in the same reducer to keep cascades atomic.

Pass `state` + `dispatch` down to every page as props — no per-page data hooks.

## 2. Selectors (pure functions used inline in render)

`now(state) = Date.now() + state.timeOffset`, then:
`getBatchesForStore`, `getAtRiskBatches`, `getWasteThisWeek`, `getFreshnessScore`, `getTasksForStore`, `getPendingTaskCount`, `getOverdueTasks`, `getActiveBatchCount`, `getNotifications(state)` (derived from at-risk batches, overdue tasks, temp excursions — never stored).

`computeRSL` rewritten to take `(batch, nowMs)` and is called everywhere with `now(state)` so the time-simulator ripples through every score.

## 3. Header

- Hamburger (mobile) → `TOGGLE_SIDEBAR`.
- Store dropdown (click-outside via `useRef`+`mousedown`): each store has “→ View Store Profile”; selecting an item sets `activeStoreFilter`.
- New `⏩ Simulate +1 Day` / `↺ Reset Time` pills.
- Bell: badge = notifications created after `notificationsReadAt`; click opens 280px panel listing live notifications (color-coded left border), each row navigates (drawer / actions+highlight). “Mark all as read” sets `notificationsReadAt = now`.

## 4. Breadcrumb bar (36px, below header)

Reads `activePage`, `activeStoreFilter`, `storeProfileId`, `drawerBatchId` and renders clickable segments (last segment plain text). Filter chip has an `×` that clears to `'all'`.

## 5. Pages — all consume selectors

- **Overview**: KPI cards, freshness-by-store bar (filtered store highlighted, others 0.3 opacity), waste donut, activity feed (top 8) with “View all activity” → modal listing full `activity[]`. Each activity row with `batchId` opens drawer on click.
- **Passports**: in-page store filter is bound to `activeStoreFilter` (writes via dispatch). Search + status + category filters local. Empty state + “Clear all filters”. New row shows `fp-flash-row` class while `id === newPassportFlashId`.
- **RSL Monitor**: rows filtered + sorted by RSL asc. Each row with rsl<5 and no existing task shows `→ Create Task` button → dispatch `ADD_TASK` + activity; button swaps to `Task Created ✓`. rsl<2 also pushes red toast.
- **Waste Analytics**: batch IDs are blue links → `OPEN_DRAWER`.
- **Action Engine**: 3-col desktop / stacked-with-colored-left-border mobile. Cards filtered by store; in `'all'` mode each card shows store badge. Overdue pill auto-applied. Complete → `UPDATE_TASK done` + activity + impact metric increments handled in reducer.
- **Impact**: hero metrics + charts filter by store. League rows are blue links → `OPEN_STORE_PROFILE` (sets `previousPage='impact'`). Selected store row highlighted `#EFF6FF`. Print: `no-print` on sidebar/header/breadcrumb/buttons/league/charts; `print-only` block inside ESG card with store name + generated date.

## 6. Store Profile (full page)

- Back button → `BACK_FROM_PROFILE` restores `previousPage`.
- KPI cards are clickable → set page + filter + clear `storeProfileId`.
- Tabs: Overview / Products / Performance / Actions read from selectors filtered to `storeProfileId`. `+ New Passport` → `OPEN_PASSPORT_MODAL({prefilledStoreId})`.

## 7. Modals

Single `<Modal>` shell. Store modal `ADD_STORE` → auto `OPEN_STORE_PROFILE(newId)`. Passport modal supports `prefilledStoreId` (Assignment tab Location radio pre-selected to `store`, dropdown visible & set). Both modals validate, push toast, close, dispatch.

## 8. Drawer

Renders at app-root level (not inside Passports page) so it overlays any page. Body scroll lock while open. RSL Breakdown footer shows blue “Create Action Task →” banner (or green “already created → View in Action Engine” when task exists; click closes drawer, navigates to actions, sets `taskHighlightId`).

Temperature chart `ReferenceLine y={batch.maxTemp}` labeled `Max: {n}°C`.

## 9. Centralised ESC handler

Single app-root `useEffect` keydown listener with priority: modal → modal → drawer → bell → sidebar. Remove per-component ESC.

## 10. Gap fixes inline

- **G1**: explicit TS types (`Store`, `Batch`, `Task`, `Activity`) already exist; extend to match spec (`alertPrefs`, `rslThreshold`, etc.), default values populated.
- **G2**: `ReferenceLine y={batch.maxTemp}` with label.
- **G3**: click-outside via `useRef`+`mousedown` for store dropdown and bell panel.
- **G4**: inject `@keyframes fp-flash` + `.fp-flash-row` class; auto `CLEAR_FLASH` after 3 s.
- **G5**: Kanban grid `md:grid-cols-3` else stacked with `border-l-[3px]` per status.
- **G6**: `no-print` on shell + extras; `print-only` block inside ESG card.
- **G7**: freshness gauge — two arcs (bg + fg), clamp `score` to `[2,98]`, center `XX/100` + “Freshness Score” caption.
- **G8**: `passportModalOpen` typed `false | {prefilledStoreId}`.
- **G9**: `timeAgo(ts)` helper, seed activity timestamps as `Date.now() - offsetMs`.
- **G10**: centralised ESC stack (see §9).

## 11. Time simulation effects

`ADVANCE_TIME` reducer also scans batches: any batch crossing `rslDays < 3` for the first time without an existing task generates one and pushes activity. Batches reaching `rslDays===0` push a `waste_logged` activity event.

## 12. Verification checklist

Same as the user’s final checklist: switch store ripples 6 pages, create store→profile auto-open, create passport→flash + RSL sort + activity + auto-task if urgent, complete task→impact metrics increment, RSL `Create Task` button, drawer over analytics, KPI navigation, league link round-trip, bell live + click navigates, simulate-day cascades, breadcrumb correctness, ESC priority stack.

Out of scope: backend, routing changes, new dependencies (still recharts only).
