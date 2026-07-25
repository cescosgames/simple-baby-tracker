# Baby Tracker

A dead-simple, one-handed feed / pee / poop logger built of of necessity.
No ads, no subscription, no analytics dashboard trying to sell you something —
just a fast way to log an event when you're running on no sleep with one thumb while holding a baby, and a clear
way to look back at the pattern later (e.g. "how has he been eating?" when the doctor asks)

**Vibe coded** this app with Claude shoutout claude 

## Tech Stack (&why)

- **SvelteKit + TypeScript** — small, fast-compiling output with little
  boilerplate. For an app that's mostly "one interactive gesture + a couple of
  lists," Svelte's reactivity (runes) maps directly onto UI state without a lot
  of ceremony.
- **Tailwind CSS v4** — utility classes keep styling colocated with markup,
  which matters here since most components (the add gesture, the color picker,
  the bottom nav) are small, self-contained, and iterated on visually many
  times in a short span.
- **@vite-pwa/sveltekit** — installable, offline-capable PWA instead of a native
  app wrapper. This is a private family tool; App Store review and native
  build tooling would be pure overhead for something one household installs
  once.
- **PocketBase** — a single self-hostable binary with a built-in JS SDK,
  realtime subscriptions, and an admin UI, matching a backend pattern already
  in use for a prior project on the same Raspberry Pi. No need to stand up a
  separate database + API server for two tiny collections.
- **Cloudflare Pages** — static hosting for the SvelteKit build; free, fast,
  and there's no server-side rendering need since all real data lives in
  PocketBase/local storage.

## Current state

The app is fully functional **local-first**: entries are logged instantly and
persisted to `localStorage` in the same shape as the planned PocketBase
collections (see `CLAUDE.md` for the schema). There is no backend wired up yet.

## PocketBase plans (not yet built)

- Stand up PocketBase on the Raspberry Pi with two collections: `feeds` and
  `diapers` (schema in `CLAUDE.md`).
- Replace the no-op `queueSync` stub in `src/lib/stores/entries.ts` with real
  PocketBase writes — the local read/write API around it won't need to change.
- Local-wifi-only for now (no Tailscale/VPN planned yet), so the offline queue
  only needs to smooth over occasional gaps (wifi drop, Pi reboot), not act as
  the primary mode of operation.
- Single shared PocketBase auth record for the household — no per-person login,
  entries aren't attributed to whoever logged them.
- Use PocketBase's realtime subscriptions so entries logged on one household
  member's phone show up on another's without a manual refresh.
- One-time decision needed whenever the Pi comes online: migrate whatever's
  already logged locally, or just start the synced log fresh from that point.

## Developing

```sh
npm install
npm run dev

# or start the server and open it in a new browser tab
npm run dev -- --open

# to test on your phone over local wifi
npm run dev -- --host
```

## Building

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> Deploy target is Cloudflare Pages (static). `@sveltejs/adapter-auto` is
> currently in use; swap in `@sveltejs/adapter-cloudflare` when wiring up
> actual deployment.
