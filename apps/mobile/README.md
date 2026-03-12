# Fix iT Rock Mobile

Expo app in `apps/mobile` for the Fix iT Rock mobile workspace.

## What is in the app

- Phone login with Supabase OTP directly in-app.
- Phone login with Firebase through a web handoff that returns a Supabase session to Expo.
- A new bottom-tab shell with `Shortcuts`, `Space`, `Orders`, and `Transactions`.
- Orders and transaction screens wired to Supabase RPCs already used by the web app.

## Commands

```bash
pnpm install
pnpm dev:mobile
pnpm android:mobile
pnpm --filter mobile check-types
pnpm --filter mobile lint
```

## Local setup

- `apps/mobile/.env` contains the Expo public keys copied from the web project.
- Firebase handoff uses `EXPO_PUBLIC_SITE_URL`, so for a real device this should point to a reachable web host or LAN URL.
- The web-side handoff route lives at `/mobile/auth/firebase`.

## Notes

- Shared mobile auth handoff route: `/mobile/auth/firebase`
- Runtime site URL comes from `EXPO_PUBLIC_SITE_URL`
