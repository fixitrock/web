# Fixitrock Monorepo + Turborepo Setup

## Overview

This project is now structured as a **monorepo** using **Turborepo** for efficient builds, caching, and task orchestration.

## Directory Structure

```
fixitrock/
├── root/                           # Workspace root
│   ├── package.json               # Root workspace config
│   ├── turbo.json                 # Turborepo configuration
│   ├── pnpm-workspace.yaml        # pnpm workspaces config
│   ├── pnpm-lock.yaml             # Dependency lock file
│   └── .prettierrc, .npmrc, etc.  # Root configuration
│
└── packages/                       # Application packages
    └── web/                        # Main Next.js application
        ├── package.json           # Web app dependencies
        ├── next.config.ts         # Next.js configuration
        ├── tsconfig.json          # TypeScript configuration
        ├── src/                   # Source code
        ├── public/                # Static assets
        ├── scripts/               # Build scripts
        ├── supabase/              # Supabase config
        └── components.json        # Component library config
```

## Commands

All commands are run from the **root** directory:

```bash
# Development
pnpm dev          # Run dev server (Turborepo orchestrates all packages)

# Production Build
pnpm build        # Build all packages (with caching)

# Start Production
pnpm start        # Start production server

# Linting
pnpm lint         # Lint all packages

# Changelog
pnpm changelog    # Generate changelog

# Clean
pnpm clean        # Clean build artifacts and node_modules
```

## How Turborepo Works

### Task Execution

When you run `pnpm build` at the root:

1. **Turborepo** reads `turbo.json`
2. It analyzes the **task dependency graph** (`dependsOn: ["^build"]`)
3. It **caches** build outputs from previous runs
4. It **runs tasks in parallel** where possible
5. It **skips cached tasks** if nothing has changed

### Caching Strategy

- **Global dependencies**: `.env`, `.env.local` files invalidate all caches
- **Build cache**: Outputs like `.next/` and `dist/` are cached
- **Dev mode**: No caching (persistent: true)

### Adding New Packages

To add a new package (e.g., shared UI library):

```bash
mkdir -p packages/libs/ui
cd packages/libs/ui
pnpm init
```

Then add it to `pnpm-workspace.yaml` if not already covering it.

## Key Benefits

✅ **Unified dependency management** - All packages share the same node_modules  
✅ **Intelligent caching** - Only rebuild what changed  
✅ **Parallel execution** - Build multiple packages simultaneously  
✅ **Task coordination** - Handle complex build dependencies easily  
✅ **Single lock file** - Easier dependency tracking  
✅ **Code sharing** - Easy to create shared libraries (libs/)  

## File Organization

### Root Level Files
- `turbo.json` - Turborepo task definitions and caching rules
- `pnpm-workspace.yaml` - Defines monorepo packages locations
- `package.json` - Root dependencies and scripts (only turbo + dev tools)
- `pnpm-lock.yaml` - Lock file for all workspace dependencies

### Package Level Files
- `packages/web/` - Your Next.js application
- Each package has its own `package.json` with specific dependencies

## Setting Up Environment Variables

Environment variables are shared across the monorepo:

- Root `.env` - Shared across all packages
- `packages/web/.env.local` - Web-specific overrides (not tracked)

## Next Steps

### 1. Add Shared Libraries (Optional)
```bash
mkdir -p packages/libs/ui
# Create reusable UI components
```

### 2. Monitor Build Cache
```bash
# See what Turborepo has cached
ls -la node_modules/.turbo
```

### 3. Customize Turborepo Tasks
Edit `turbo.json` to add/modify task definitions based on your needs.

### 4. CI/CD Integration
Update your CI pipeline to use:
```bash
turbo build --filter=@fixitrock/web   # Build only specific package
turbo run lint --changed              # Lint only changed files
```

## Troubleshooting

### "Workspace package not found"
- Ensure `pnpm-workspace.yaml` includes the package path
- Verify package has a `package.json`

### Build cache not working
- Check `turbo.json` task definitions
- Clear cache: `pnpm clean` then rebuild

### Dependency conflicts
- Run `pnpm install` from root
- Let pnpm resolve the dependency tree

## Resources

- [Turborepo Docs](https://turbo.build)
- [pnpm Monorepo](https://pnpm.io/workspaces)
- [Next.js in Monorepo](https://nextjs.org/docs/advanced-features/multi-zones)
