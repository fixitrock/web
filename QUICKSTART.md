# Quick Start Guide - Monorepo + Turborepo

## Project Structure

Your project is now organized as a **monorepo** with the main web app in `packages/web/`:

```
fixitrock-monorepo/
├── turbo.json                   # Turborepo configuration
├── pnpm-workspace.yaml          # Workspace definition
├── package.json                 # Root (workspace root only)
├── .npmrc, .prettierrc, etc.    # Root configs
├── packages/
│   └── web/                     # Your Next.js app
│       ├── package.json         # Web app dependencies
│       ├── next.config.ts
│       ├── src/
│       ├── public/
│       └── ...
└── libs/                        # (Optional) Shared libraries
```

## Core Commands

Run these from the **root directory**:

```bash
# Development
pnpm dev              # Start dev server with Turborepo

# Build
pnpm build            # Build with intelligent caching

# Production
pnpm start -p 8000    # Start production server

# Code Quality
pnpm lint             # Lint all packages

# Utilities
pnpm clean            # Clean build artifacts
pnpm changelog        # Generate changelog
```

## Turborepo Features Now Available

✅ **Intelligent Caching** - Only rebuild changed packages  
✅ **Parallel Execution** - Build multiple packages simultaneously  
✅ **Task Orchestration** - Automatic dependency ordering  
✅ **Monorepo Ready** - Add more packages under `packages/` anytime  

## Workflow

### Daily Development
```bash
# Start development
pnpm dev

# In another terminal, lint your code as you go
pnpm lint
```

### Before Pushing Code
```bash
# Full build and lint (validates everything)
pnpm build
pnpm lint
```

### Deploy to Production
```bash
# Clean build (fresh, cached build)
pnpm clean
pnpm build

# Start server
pnpm start
```

## Adding New Packages (Future)

When you want to add shared libraries:

```bash
# Create a shared UI library
mkdir -p packages/libs/ui
cd packages/libs/ui
pnpm init
# ... add your UI components ...

# Use in packages/web
# In packages/web/package.json:
{
  "dependencies": {
    "@fixitrock/libs-ui": "workspace:*"
  }
}
```

## Environment Variables

- Root `.env` - Shared across workspace
- `packages/web/.env.local` - App-specific (git-ignored)

## Troubleshooting

### Build fails with missing imports
- Check import paths (they may need adjustment after monorepo restructuring)
- Ensure all dependencies are in the correct `package.json`

### Turborepo cache issues
```bash
pnpm clean              # Clear all caches
pnpm install            # Reinstall
pnpm build              # Rebuild
```

### See what Turborepo cached
```bash
ls node_modules/.turbo
```

## Performance Tips

1. **Minimize `dependsOn`** in turbo.json to avoid unnecessary rebuilds
2. **Use `.gitignore`** for build outputs to reduce cache size
3. **Monitor build times** with `--verbosity=verbose` flag:
   ```bash
   pnpm build -- --verbosity=verbose
   ```

## Next Steps

1. ✅ Try running `pnpm dev` and test the development server
2. ✅ Verify CI/CD integration works with Turborepo
3. ✅ Consider creating shared packages in `packages/libs/` as needed
4. ✅ Read [MONOREPO.md](./MONOREPO.md) for detailed documentation

---

**First successful build completed!** 🎉  
Your monorepo is ready to scale.
