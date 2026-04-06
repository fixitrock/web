# AGENTS.md

## HeroUI Context

This repo carries a local HeroUI context snapshot under `.heroui-docs/`. Read that first before large HeroUI changes.

Priority order:

1. `.heroui-docs/react/llms-full.txt` for HeroUI React v3 props, examples, patterns, and API details.
2. `.heroui-docs/all/llms-full.txt` when work also touches `heroui-native`.
3. `.heroui-docs/upstream/CLAUDE.md` for HeroUI's own agent guidance.
4. `.heroui-docs/upstream/skills/` for the official HeroUI React, Native, and migration skills.

## Repo Version Map

- `apps/web` currently uses `@heroui/react` `^2`.
- `packages/web` currently uses `@heroui/react` `^3.0.2` and `@heroui/styles` `^3.0.2`.
- `apps/mobile` currently uses `heroui-native` `^1.0.0-rc.4`.

Rules:

- Do not assume HeroUI v3 APIs when editing `apps/web` unless the task is explicitly a migration.
- Prefer the v3 docs, MCP server, and `heroui-react` skill for `packages/web`.
- Prefer the combined or native docs for `apps/mobile`.
- Use `heroui-migration` context when moving code from the v2 app to the v3 package.

## MCP

Project-scoped HeroUI MCP is configured in:

- `.codex/config.toml`
- `.mcp.json`
- `.vscode/mcp.json`

Extra editor configs are available in:

- `.cursor/mcp.json`
- `.windsurf/mcp.json`

Upstream note: the HeroUI MCP server currently supports `@heroui/react` v3 only and requires Node.js 22+.

## Skills

Official HeroUI skills were installed globally for this machine in Codex's skill directory:

- `heroui-react`
- `heroui-native`
- `heroui-migration`

Restart Codex to pick up newly installed skills.

## Refresh

Run `pnpm sync:heroui-context` from the repo root to pull the latest HeroUI LLM docs and upstream skill snapshot.
