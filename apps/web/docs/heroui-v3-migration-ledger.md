# HeroUI v2 -> v3 Migration Ledger

Status: in-progress
Strategy: incremental coexistence (Strategy A)
Scope: `apps/web`

## Foundation

- [x] Add `@heroui-v3/react` alias pinned to `3.0.0-beta.2`
- [x] Add `@heroui/styles` pinned to `3.0.0-beta.2`
- [x] Import `@heroui/styles` in global CSS while keeping v2 plugin/source for coexistence
- [ ] Keep provider setup unchanged until final cutover

## Migrated

- `Skeleton`: `src/lib/icon.tsx`, `src/components/search/transactions/card.tsx`, `src/components/search/space.tsx`, `src/app/[user]/ui/tabs/activity/top.tsx`, `src/app/[user]/ui/tabs/activity/recent.tsx`, `src/app/[user]/[slug]/ui/products/skeleton.tsx`, `src/app/[user]/[slug]/ui/pos/cart/transaction/card.tsx`, `src/ui/sidebar.tsx`
- `Card`: `src/ui/skeleton.tsx`, `src/app/(app)/showcase/quotes.tsx`, `src/app/(app)/showcase/frp.tsx`, `src/app/(app)/showcase/firmware.tsx`, `src/app/scpl/page.tsx`, `src/app/pay/page.tsx`, `src/app/(space)/ui/preview/readme/components.tsx`, `src/app/(device)/ui/card.tsx`
- `Button` (simple): `src/app/(space)/ui/state.tsx`, `src/ui/titleaction.tsx`

## Pending

- Wave 2: low-risk components (`Button`, `Card`, `Skeleton`, `Tabs`, `Tooltip`, `ScrollShadow`, `Form`, `Input`, `InputOtp`)
- Wave 3: overlays/state-heavy (`Modal`, `Listbox`, `useDisclosure -> useOverlayState`)
- Wave 4: toast migration (`ToastProvider`/`addToast` -> `Toast.Provider`/`toast`)
- Wave 5: final cutover (`@heroui-v3/react` -> `@heroui/react` v3, remove v2 plugin/provider/deps)

## Blocked

- Local `next build` is blocked in this environment by Google Fonts fetch failures.
- `tsc --noEmit` should be used as the per-batch gate until build networking is available.
- `ScrollShadow` was not exported from `@heroui-v3/react@3.0.0-beta.2`; `src/ui/command.tsx` remains on v2 for now.
