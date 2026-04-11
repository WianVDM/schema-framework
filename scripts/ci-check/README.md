# CI Check Script (`preflight`)

Local CI validation that mirrors the GitHub Actions pipeline defined in `.github/workflows/ci.yml`.

## What It Does

Runs the same turbo pipeline steps as CI, in order:

1. **Typecheck** — `pnpm run typecheck`
2. **Build** — `pnpm run build`
3. **Lint** — `pnpm run lint`

If any step fails, subsequent steps are skipped and the script exits with code `1`.

## Usage

```bash
pnpm preflight
```

Run this before pushing to catch CI failures locally. Exit code `0` means all checks passed.

## When to Run

- Before pushing a feature branch to GitHub
- After making changes to `packages/core/src/` or `apps/showcase/src/`
- As a final verification step before creating a PR