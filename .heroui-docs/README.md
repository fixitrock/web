# HeroUI AI Context

This folder stores the HeroUI AI resources that back this repo's agent context.

Included:

- React v3 `llms.txt`, `llms-full.txt`, `llms-components.txt`, and `llms-patterns.txt`
- Combined React + Native `llms` files
- Upstream HeroUI `CLAUDE.md`
- Upstream HeroUI skill sources for `heroui-react`, `heroui-native`, and `heroui-migration`

Refresh everything from the official sources:

```bash
pnpm sync:heroui-context
```

Primary sources:

- `https://heroui.com/react/llms.txt`
- `https://heroui.com/react/llms-full.txt`
- `https://heroui.com/llms-full.txt`
- `https://heroui.com/docs/react/getting-started/mcp-server`
- `https://heroui.com/docs/react/getting-started/agent-skills`
- `https://heroui.com/docs/react/getting-started/agents-md`

The download manifest is written to `.heroui-docs/manifest.json`.
