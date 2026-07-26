# Baby Tracker PWA — CLAUDE.md

## What this is
A dead-simple, one-handed baby feed / pee / poop logger. No ads, no subscription,
no bloat. Household members install it on their phones and it syncs through a
self-hosted PocketBase instance running on a Raspberry Pi.

Core design principle: **speed over completeness**. A parent holding a baby with
one free hand needs to log an event in a single continuous gesture, usable with
either thumb. Every screen should be usable one-handed.

## Stack
- SvelteKit + TypeScript
- Tailwind CSS v4
- @vite-pwa/sveltekit (installable, offline-capable)
- PocketBase JS SDK (client) — **not yet wired up**. Current build is
  local-first: entries persist to `localStorage` in the same shape as the
  PocketBase collections below, behind a no-op `queueSync` stub in
  `src/lib/stores/entries.ts`. When the Pi-hosted PocketBase instance exists,
  that stub gets a real body; the read/write API around it shouldn't need to
  change.
- Deploy target: Cloudflare Pages (static), via git integration
  (`@sveltejs/adapter-auto` auto-detects Cloudflare Pages at CI build time)

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

## Visual design
A soft pastel "baby" palette, defined as Tailwind theme tokens in
`src/routes/layout.css`: `baby-lavender` (#c6c3ff), `baby-mint` (#b7e8ca),
`baby-cream` (#fff7d6, the base background), `baby-blush` (#e8b3b1, used for
urgent flags and destructive actions), `baby-sky` (#c8eaff), plus `baby-ink`
(#3f3d56) for text. Feed/Pee/Poop are *not* color-coded by fluid type — the
three palette colors just rotate across the add-control zones and chart bars
for visual variety. The one deliberate exception is the poop color swatches
themselves (yellow/green/brown/orange/black/red/white), which are real
diaper colors being logged, not decorative, and are left as their true colors.
Aesthetic goal: utilitarian and clear first, with soft/rounded/comforting
touches (rounded cards, gentle copy, pop-in animations) layered on top — not
twee, not clinical.

## UI / UX requirements

### Home screen
No more "three big buttons" — the current design splits the screen:
- **Top**: a compact table of the last 10 entries (time / type / detail),
  for a quick glance right after logging. Urgent diaper rows are flagged.
  Tap a row to edit or delete (opens `EditEntryModal`).
- **Bottom**: a single raised **Add** control (`AddControl.svelte`), fixed
  and overlapping the bottom nav bar. Interaction: **press and hold** — this
  pops a 3-zone quick-select (Pee / Feed / Poop) right above the button.
  **While still holding**, drag left for Pee, right for Poop, stay centered
  for Feed (the default/most common, hence centered). Whichever zone you're
  over fills a hold-to-confirm ring (~600ms); **releasing before it fills
  cancels with nothing logged**; letting it fill logs immediately (with a
  scale-up "success pop," a mint flash, and a haptic buzz) and shows a
  toast with a 5-second **Undo**. This is one continuous gesture — no
  separate tap-to-open step, and no release-to-confirm (releasing early is
  the *cancel* action, which is intentionally the opposite of most
  tap-and-release UI, chosen so a tired thumb can't misfire by lifting off
  too soon).
  Poop is the one exception: filling the ring on the Poop zone doesn't log
  directly — it hands off to a floating color-swatch picker (`PoopPicker.svelte`)
  for the required second tap. That picker floats low on screen (thumb
  reachable, not centered/high) with urgent colors (black/red/white) on
  top and common colors (brown/yellow/green/orange) on the bottom, each row
  centered.
- Feed **quality** (poor/normal/good) is intentionally *not* part of the
  quick-add flow — it always logs as `normal` from the Add control. It's
  still editable after the fact via `EditEntryModal` if someone wants to
  correct it, but it's not worth the extra step on every single feed.
- A **last-fed-side toggle** (`LastSideToggle.svelte`) floats fixed in the
  bottom-right corner (thumb-reachable, clear of the Add control and bottom
  nav). Tap to flip between L/R. This is deliberately *not* wired into the
  feed data model or quick-add flow — it's a standalone reminder for
  breastfeeding moms ("which side did I use last?"), persisted on its own in
  `localStorage` via `src/lib/stores/breastSide.ts`, unrelated to the
  `feeds` collection.

### Bottom navigation
A floating "liquid glass" pill tab bar (`BottomNav.svelte`), inset from the
screen edges (not edge-to-edge) with two destinations, **Home** and
**History** (routes `/` and `/history`), rendered globally from the root
layout — along with the Add control and the toast — so logging works
identically from either screen. Translucent/blurred background
(`backdrop-blur`), floating a small fixed margin above the true bottom edge
via `max(0.5rem, calc(env(safe-area-inset-bottom) - 0.75rem))` — clears the
home indicator without also stacking the full safe-area inset on top as
extra lift (that stacking made the pill sit noticeably higher than intended)
— rather than sitting flush against the edge. Flush was tried first but
turned out to be fragile across iOS install modes (legacy Add-to-Home-Screen
vs. real manifest-driven PWA install produce different viewport/safe-area
math, and a fixed margin sidesteps that entirely instead of chasing exact
pixel anchoring). The
active tab is shown by a single sliding highlight panel spanning the full
left or right half of the pill (not just around the icon/label), including
the strip behind the Add control's circle — animates between halves on
navigation.

### History / Charts view
Renamed "Charts" in the UI. This is the *deliberate review* screen (e.g. for
"how has he been eating?" at a doctor visit) — explicitly **not** optimized
for quick-glance speed the way the home table is. Feed / Pee / Poop are
**three separate paginated charts**, not one merged list — swipe or tap the
‹ › arrows to flip between them, Animal-Crossing-catalog style, with a dot
page indicator. Each category page shows, top to bottom:
1. A simple **7-day bar chart** (`WeekSummary.svelte`) — one bar per day,
   height = count for that category that day, today's label bolded, a small
   blush dot flagging any day that had an urgent poop entry. Counts only, no
   quality/color breakdown in the bars — that's what the list below is for.
2. The full list of that category's entries, grouped by explicit calendar
   date (not "Today"/"Yesterday" — this view is for careful lookup, so the
   real date reads better). Urgent entries flagged. Tap a row to edit/delete.

### Settings
A gear icon (`SettingsButton.svelte`) floats fixed top-right, global from the
root layout, opening a bottom-sheet `SettingsModal.svelte`. Currently shows:
- **App version** (read straight from `package.json` via `src/lib/version.ts`,
  no separate version string to keep in sync by hand) and PWA update status,
  via `@vite-pwa/sveltekit`'s `virtual:pwa-register/svelte` (`src/lib/pwa.ts`
  wraps `useRegisterSW`, browser-guarded). If a new build's service worker is
  waiting, a badge dot appears on the gear icon and the modal offers a
  one-tap "Update available" refresh — this is the mechanism for pushing a
  new cache/version to installed phones without waiting for `autoUpdate` to
  silently catch up.
- **Household sync** section — a disabled/placeholder framework only (no
  logic yet): explains entries are on-device only for now, with a disabled
  server-address field standing in for where the PocketBase connection will
  eventually be configured, once that build-out happens (see Sync behavior
  below). Don't build this out further until the Pi-hosted PocketBase
  instance actually exists.

### Sync behavior
- Currently **local-first only**: entries write straight to `localStorage`
  via Svelte stores in `src/lib/stores/entries.ts`; there is no PocketBase
  connection yet (see Stack section above).
- Planned, once the Pi-hosted PocketBase exists: optimistic local writes as
  now, PocketBase write happens in the background through the `queueSync`
  stub. Reachability is local-wifi-only (see resolved decisions below), so
  the offline queue only needs to smooth over occasional gaps (wifi drop, Pi
  reboot), not act as the primary mode of operation. Use PocketBase's
  realtime subscription to pull in entries logged by other household
  members' devices when online.
- No auth complexity beyond a single shared PocketBase auth record per
  household (or a fixed API token) — this is a private family tool, not
  multi-tenant software. Don't build out a full user/permission system.

## Explicit non-goals (keep scope tight)
- No deep analytics/insights dashboard. The one exception, added
  deliberately: the simple 7-day count bar chart in the Charts view, because
  "how has he been eating this week" is a real recurring question (doctor
  visits) that a raw log doesn't answer quickly. Don't expand this into
  trends/averages/exports without a concrete need.
- No push notifications.
- No multi-baby support unless asked.
- No native app wrapper — PWA install is sufficient.

## Resolved decisions
1. **Pi reachability**: local wifi only (no Tailscale/VPN planned). The
   offline queue is for occasional gaps, not primary operation.
2. **Household member identity**: anonymous/shared. No per-person auth or
   "logged by" field — a single shared PocketBase credential for the
   household once that's wired up.

## Code style / conventions
- Match existing project conventions: tight scope, reversible decisions,
  no premature abstraction.
- Keep components small and colocated with the screen they belong to.
- Favor Svelte stores over prop-drilling for the shared entry list/queue state.