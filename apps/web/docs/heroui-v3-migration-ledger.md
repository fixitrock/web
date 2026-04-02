# HeroUI v2 -> v3 Migration Ledger

Status: active cutover complete (post-cutover cleanup ongoing)
Strategy: incremental coexistence (Strategy A), then canonical v3 cutover
Scope: `apps/web`

## Foundation

- [x] Pin canonical `@heroui/react` to `3.0.0-beta.2`
- [x] Add `@heroui/styles` pinned to `3.0.0-beta.2`
- [x] Import `@heroui/styles` in global CSS
- [x] Remove v2 plugin/source wiring (`hero.ts`, `@heroui/theme` source)
- [x] Remove `HeroUIProvider` wrapper from app providers

## Migrated

- App-wide HeroUI imports migrated through `src/ui/heroui.tsx` compatibility bridge
- Legacy APIs covered in bridge: `Button`, `Card*`, `Tabs/Tab`, `Modal*`, `Listbox*`, `Navbar`, `User`, `Snippet`
- Earlier direct v3 migrations remain in-place for key files (`ui/skeleton`, showcase cards, device card, etc.)
- Overlay/state batch migrated to `useOverlayState` in active modal/drawer/popover flows
- Toast migration completed in active codepaths: `Toast.Provider` + `toast.*`
- `/pay` suspense/prerender issue fixed via server page + client child wrapped in `Suspense`
- `tsc --noEmit` and `next build` both passing locally after cutover

## Pending

- Optional hardening pass: replace bridge wrappers with pure native v3 APIs file-by-file
- Optional strictness restoration: re-enable strict `noImplicitAny` after wrapper replacement
- Remaining `classNames` cleanup in deferred files not touched in current batches

## Blocked

- No hard blockers currently.
