# SFVGA Community App

iOS-first Expo app for the San Fernando Valley Gujarati Association.

**Phase 1 (this release):** foundation, design system, and animated tab
navigation. No data layer, no real content, no link-outs yet.

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
constants/                navigation.ts (tab config), content.ts (copy)
types/                    navigation.ts
services/                 empty — Phase 2 data layer lands here
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

## Phase 2 — data layer

`services/` gets a set of repository functions (`getEvents()`,
`getBoardMembers()`, …) reading from bundled JSON under `assets/data/`, with
domain types in `types/`.

The key constraint: **every repository function is `async` from day one** and
returns domain types, never raw JSON shapes. Records carry stable string `id`
fields and ISO-8601 date strings, and collections are modeled as documents in a
collection — i.e. shaped the way Firestore will want them. Screens import from
`@/services` and never touch a JSON file directly, so the later swap to
Firestore is a change confined to those modules.

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
# sfvgaapp
