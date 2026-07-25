# Baby Tracker PWA — CLAUDE.md

## What this is
A dead-simple, one-handed baby feed / pee / poop logger. No ads, no subscription,
no bloat. Household members install it on their phones and it syncs through a
self-hosted PocketBase instance running on a Raspberry Pi.

Core design principle: **speed over completeness**. A parent holding a baby with
one free hand needs to log an event in 1-2 taps. Every screen should be usable
with a thumb.

## Stack
- SvelteKit + TypeScript
- Tailwind CSS
- @vite-pwa/sveltekit (installable, offline-capable)
- PocketBase JS SDK (client) talking to a self-hosted PocketBase instance on
  a Raspberry Pi (backend already exists from a prior project — reuse the pattern)
- Deploy target: Cloudflare Pages (static)

## Data model (PocketBase collections)

### `feeds`
| field   | type                        | notes                          |
|---------|-----------------------------|---------------------------------|
| date    | text, `MM/DD/YY`             | stored as text, not PB `date` type — keep formatting predictable and simple |
| time    | text, `HH:MM` 24hr           | |
| quality | select: `poor`, `normal`, `good` | default `normal` |
| created | autodate (PocketBase default) | for sort/audit only, not shown as primary field |

### `diapers`
| field   | type                                                                 | notes |
|---------|-----------------------------------------------------------------------|-------|
| date    | text, `MM/DD/YY`                                                        | |
| time    | text, `HH:MM` 24hr                                                       | |
| subtype | select: `pee`, `poop`                                                    | |
| color   | select: `yellow`, `green`, `brown`, `orange`, `black`, `red`, `white` | **only present/relevant when subtype = poop**; null/omitted for pee |
| urgent  | bool                                                                   | computed client-side: true if color is `red` or `white` — store it so the household list can visually flag it without recomputing |

No `notes`, no `amount`, no `duration`. If the user wants more fields later,
add them later — do not add them preemptively.

## UI / UX requirements

### Home screen (the only screen that matters)
Three large tap targets, thumb-reachable, roughly top-to-bottom or in a row
depending on screen size testing:
- **Feed**
- **Pee**
- **Poop**

Tapping **Feed** or **Pee** logs immediately with defaults (quality=`normal`
for feed; no color needed for pee) and current date/time — a toast/snackbar
confirms ("Feed logged 2:41 PM") with an **Undo** action (5 second window).

Tapping **Poop** opens a lightweight color picker (7 color swatches, single
tap to select and log — no confirm step needed beyond the tap itself). Red
and white are visually distinct (e.g. bordered/pulsing) since they're urgent.

A small secondary control (e.g. long-press or a tiny "adjust" affordance)
should let the user override quality/color/time *before* logging, for the
rare case they're logging retroactively — but the default path must stay
one-tap. Don't make the default path slower to accommodate the edge case.

### History view
Simple reverse-chronological list, feeds and diapers merged, grouped by day.
Each row: icon (feed/pee/poop), time, quality/color. Urgent entries
(red/white poop) visually flagged. Tap a row to edit or delete.

### Sync behavior
- Optimistic local writes: tapping a button updates the UI instantly,
  PocketBase write happens in the background.
- If offline: queue the write (simple IndexedDB or localStorage outbox),
  retry on reconnect. Use PocketBase's realtime subscription to pull in
  entries logged by other household members' devices when online.
- No auth complexity needed beyond a single shared PocketBase auth record
  per household (or a fixed API token) — this is a private family tool, not
  multi-tenant software. Don't build out a full user/permission system.

## Explicit non-goals (keep scope tight)
- No analytics/insights/charts (v1). If useful later, add as a separate
  screen — don't let it delay the core logging flow.
- No push notifications.
- No multi-baby support unless asked.
- No native app wrapper — PWA install is sufficient.

## Open questions to confirm before/while building
1. Will the Pi be reachable only on local wifi, or do we need Tailscale/VPN
   for syncing while out of the house (e.g. daycare drop-off, grandma's)?
   This affects whether the offline queue is "occasional gap" or "primary
   mode of operation."
2. Household member identity — do we care *who* logged an entry, or is it
   anonymous/shared? (Affects whether PocketBase auth is per-person or a
   single shared credential.)

## Code style / conventions
- Match existing project conventions: tight scope, reversible decisions,
  no premature abstraction.
- Keep components small and colocated with the screen they belong to.
- Favor Svelte stores over prop-drilling for the shared entry list/queue state.