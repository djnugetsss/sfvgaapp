# SFVGA Community App

iOS-first Expo app for the San Fernando Valley Gujarati Association.

**Phase 1:** foundation, design system, animated tab navigation.
**Phase 2:** typed async data layer, React Query caching, real 2026 seed content.
**Phase 3 (this release):** the Home screen and the Events calendar + agenda,
plus event detail. Youth and More still show their Phase 1 empty states.

## Running on iOS

```bash
npm install
npm run ios          # boots a simulator and opens the app
```

Or start the dev server and choose a target:

```bash
npm start            # then press `i` for iOS
```

On a physical device, install **Expo Go (SDK 57)** and scan the QR code. The
simulator needs Expo Go 57 as well — the CLI offers to install it on first run.

```bash
npm run typecheck    # tsc --noEmit, strict
```

## Architecture

```
app/                      Expo Router routes (file-based)
  _layout.tsx             Root: gesture handler, safe area, fonts, theme
  (tabs)/_layout.tsx      Tab navigator using the custom tab bar
  (tabs)/*.tsx            The five tab screens
  +not-found.tsx          404 route
components/
  navigation/             AnimatedTabBar
  ui/                     ScreenScaffold, EmptyState, Rule
theme/                    tokens.ts, ThemeProvider.tsx, index.ts (barrel)
hooks/                    useReducedMotion, useAppFonts
constants/                navigation.ts (tab config), content.ts (screen chrome)
types/                    content.ts (domain), navigation.ts, index.ts (barrel)
services/
  ContentRepository.ts    The interface — the seam the app is built against
  JsonContentRepository.ts  Bundled-JSON implementation
  repository.ts           FIRESTORE SWAP POINT — the single binding
  parsers.ts              Runtime validation at the data edge
  queries.ts              Typed React Query hooks + query keys
  queryClient.ts          Offline-friendly client config
  seed/                   events, board, announcements, youth, resources JSON
  index.ts                Barrel — screens import from here only
assets/                   icons and splash
```

### Design system

`theme/tokens.ts` is the single source of truth. **No raw hex, font name,
spacing value, radius, or duration belongs anywhere else.** Components read
tokens through `useTheme()`.

The palette is deliberately lopsided: warm neutrals (ivory `background`, warm
near-black text, linen borders) carry roughly 90% of every screen, and the
marigold `primary` appears only as small jewelry — the accent rule above each
title, the active tab, a single link. Sienna adds occasional depth.

Type pairs Fraunces (serif, display + headings) with Inter (sans, body).
Until the fonts resolve, `createTheme(false)` serves the same scale with system
fonts, so nothing renders blank or reflows badly.

**Dark theme later:** `palette` holds raw ramps and `lightColors` is a semantic
mapping onto it. Adding dark mode means adding a `darkColors` object and a
branch in `createTheme` — no consumer changes.

### Motion

One spring config (`motion.spring`) is used app-wide, plus three durations.
Every animation consults `useReducedMotion()` and degrades to an opacity-only
or instant transition when the OS setting is on.

The tab bar's sliding pill is driven off navigation state rather than the press
handler, so deep links and programmatic navigation move it too.

## Verified on iOS

Bundled and run on an iPhone 17 Pro simulator (Expo Go, SDK 57):

- Launches with no redbox; strict `tsc --noEmit` is clean.
- All five tabs navigate; the pill indicator tracks the active tab, including
  via deep link (`exp://127.0.0.1:8081/--/events`).
- Press micro-animation and `Haptics.selectionAsync()` fire on tab change.
- Renders correctly with **Reduce Motion** enabled.

## Data layer

Screens import from `@/services` and nothing else — never a JSON file, never a
repository class. In practice they use the query hooks (`useBoardMembers()`,
`useUpcomingEvents()`, …), so caching, retries, and loading state are uniform.

### The Firestore swap point

`services/repository.ts` holds one binding, and it is the only line that
changes when the app moves off bundled JSON:

```ts
export const contentRepository: ContentRepository = new JsonContentRepository();
```

A future implementation plugs in by satisfying the same interface:

```ts
export const contentRepository: ContentRepository =
  new FirestoreContentRepository(firestoreInstance);
```

Nothing else moves — not the domain types, not the query hooks, not a single
screen. That holds because the domain types are already storage-shaped:

- `id` is a stable string slug that doubles as a Firestore document ID.
- Every date is an ISO-8601 **string**, never a `Date` and never a `Timestamp`.
- Absent values are explicit `null`, never `undefined` and never omitted, so a
  record round-trips through JSON and Firestore identically.
- Every repository method is already `async`, so no caller assumes synchrony.

The one obligation on a new implementation is the **ordering contract**
documented on `ContentRepository`: events ascending by `startDate`, board by
`roleOrder`, announcements pinned-first then newest. A Firestore backend should
satisfy those with server-side `orderBy` rather than re-sorting on the client.

`services/parsers.ts` is the validation edge. Raw JSON types a category as
`string`, not `'cultural' | 'social' | …`, so a cast would be a lie — these
parsers check at runtime and throw `ContentParseError` on bad data. That same
boundary validates Firestore documents later, and failures surface through the
rejected-promise path React Query already handles.

### Event time-status is derived, never stored

`utils/eventStatus.ts` classifies each event as `'past' | 'today' | 'upcoming'`
at runtime from `endDate ?? startDate`. It is **not** in the JSON: a stored
flag is wrong the moment the clock passes it, whereas a derived one is correct
by construction with no migration.

It is a *display* state, not a filter. `getEvents()` returns the whole calendar
— all 10 events, past included — and no default query drops past events, so a
member can still open Navratri in December. `getUpcomingEvents(fromISO)` and
`useNextUpcomingEvent()` are narrow accessors for Home's single "next event"
slot; the Events screen uses `useEventsWithStatus()`.

Comparisons are date-only via date-fns (`startOfDay`, `isSameDay`, `isBefore`,
`isAfter`) — no manual date math — so an event happening later today reads
`'today'`, not `'past'`, and the unfilled `startTime` markers cannot affect the
result. Multi-day events only become `'past'` once `endDate` has passed.

`useEventsWithStatus()` and `useNextUpcomingEvent()` derive through React
Query's `select`, sharing one cache entry with `useEvents()` instead of
fetching again.

**Staying correct across midnight** takes two cooperating pieces:

- `hooks/useCalendarDay.ts` holds today's date as live state (updated on
  foreground and on a one-minute tick) and keys the selectors. State is what
  actually forces a re-render — a `new Date()` read during render never would.
- `hooks/useRefreshOnForeground.ts` invalidates the events query when the app
  returns to the foreground, and when the calendar day changes while it stays
  open.

Together they close the gap where an app left open overnight would show
yesterday's past/today/upcoming classifications.

### Partially-filled content

Most event fields are still `"TODO: ..."` markers. `utils/content.ts` exports
`resolveContent()`, which returns `null` for a missing, blank, **or
placeholder** value — every optional field in the UI routes through it. A row
whose value is still a marker disappears rather than printing it, and the
component takes its designed fallback path instead:

- **Hero image** — a typographic tile with the event's initials in the serif
  face over a warm tint, plus its category. Never a broken image, never grey.
- **Description** (detail only) — "Details are still being finalised. Check
  back soon."; a detail page with no body copy would read as broken.
- **Location / time** — the row is omitted entirely.

When real values land, `resolveContent` starts returning them and the same
components render them with no other change.

### Screens

**Home** — hero header, then the Next Gathering card (`useNextUpcomingEvent`)
with a date-only countdown, the flagship strip (`useFeaturedEvent`),
announcements, and a browse-all link. If the flagship event *is* the next
gathering, only the card renders — no duplicate.

**Events** — a month calendar above a scrollable agenda, both from
`useEventsWithStatus()`. It opens on August 2026, between the completed and
upcoming halves of the year, so the default view is never empty. Marker
vocabulary is deliberately small: gold dot = upcoming or today, muted dot =
completed, gold ring = the featured event, soft gold wash = selected day, thin
outline = today. Past events are muted to 60% with a "Completed" tag and stay
fully tappable — the "This month" / "All 2026" toggle exists so the completed
half of the year is always reachable.

The calendar uses `react-native-calendars` for grid maths and swipe gestures
only; `dayComponent`, `renderHeader`, and `renderArrow` replace every pixel of
its visual language. The month title is driven by our own `visibleMonth` state,
not the date the library passes to `renderHeader` — with `enableSwipeMonths`
the library pre-renders adjacent pages and hands the header the *previous*
month, which rendered "July 2026" above an August grid.

### Seed content and TODO markers

Only data the association actually publishes is present. Nothing was invented:
no venues, no times, no descriptions. Unfilled fields carry a literal,
greppable marker rather than a plausible-looking guess:

```bash
grep -rn "TODO:" services/seed/     # 59 markers across the seed files
```

- `"TODO: fill from sourceUrl"` — event `location`, `startTime`, `endTime`,
  `description`, `heroImage`. Each event's `sourceUrl` is the page to fill from.
- `"TODO: rehost headshot"` — board `photo`. Deliberately not hotlinked to the
  Squarespace CDN.
- `"TODO: fill announcement copy"` — the seed announcement body.
- The `donation` resource points at `/membership`, the only giving link the
  association publishes today. Flagged in `JsonContentRepository`.

## Notes on the stack

- Expo SDK 57 (the current release; the brief asked for 52+), which pins
  **Reanimated 4** rather than 3. The APIs used here (`useSharedValue`,
  `useAnimatedStyle`, `withSpring`, `withTiming`) are unchanged between the
  two; Reanimated 4 builds on `react-native-worklets`, which is why
  `babel.config.js` loads `react-native-worklets/plugin` (last, as required)
  instead of `react-native-reanimated/plugin`.
- `babel-preset-expo` is a direct devDependency because SDK 57 nests it under
  `expo/node_modules`, where a root `babel.config.js` cannot resolve it.
- `.npmrc` sets `legacy-peer-deps=true`: `expo-router` pulls a `react-dom`
  newer than the `react` the SDK pins, which npm's strict resolver rejects.
  Those are web-only transitive deps and unused on iOS.
- Fonts are imported by exact subpath (`@expo-google-fonts/inter/400Regular`).
  Importing from the package root would bundle every weight and italic —
  ~11MB of TTFs instead of ~1.2MB.

## Phase 4 and later

- Phase 4: cultural motifs and pattern work. Phase 3 deliberately holds to
  neutrals plus the single gold accent.
- Phase 4+: real UI for Youth and More on top of the existing hooks
  (`useYouthItems`, `useResources`).
- Phase 5: the youth volunteer-hours model replaces `YouthItem`, which is
  deliberately minimal until then (see the TODO on the type).
