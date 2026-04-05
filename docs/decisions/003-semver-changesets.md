# ADR-003: SemVer + Changesets for Version Management

## Status
Accepted

## Context
The project needs a versioning strategy for the monorepo that:
- Manages versions for `packages/core` and `apps/showcase` independently
- Auto-generates changelogs
- Integrates with GitHub Actions for CI/CD
- Follows industry-standard versioning conventions
- Supports pre-release versions during the `0.x` development phase

Options considered:
1. **Manual version bumps** — edit `package.json` manually, write CHANGELOG by hand
2. **Semantic Release** — fully automated, conventional commits required
3. **Changesets** — manual changeset files, automated versioning and publishing
4. **Lerna** — monorepo-focused but heavy, declining popularity
5. **Nx** — powerful but overkill for a 2-package monorepo

## Decision
Use **Changesets** (`@changesets/cli`) with **SemVer** convention.

### Rationale
- Changesets is the industry standard for pnpm/Turborepo monorepos (used by Vercel, Svelte, Radix)
- It handles independent versioning of packages within a monorepo
- Changeset files are committed alongside code, making version changes reviewable in PRs
- It auto-generates `CHANGELOG.md` from changeset descriptions
- It integrates with GitHub Actions via `@changesets/cli` for automated releases
- It supports pre-release versions (`0.9.0-rc.1`) needed for the RC phase
- It's lightweight — no opinionated commit message format required (unlike Semantic Release)

### Version Convention
- **SemVer**: `MAJOR.MINOR.PATCH`
- **Pre-release**: `0.9.0-rc.1`, `0.9.0-rc.2`, etc.
- **`0.x.x` phase**: Breaking changes allowed freely (API not yet stable)
- **`1.x.x+` phase**: Strict SemVer guarantees

## Consequences
- Every PR that modifies `packages/core` must include a changeset file
- Developers need to run `pnpm changeset` before committing
- CHANGELOGs are auto-generated but need human review for quality
- Package versions are managed by `pnpm changeset version`, never manually edited
- The showcase app version tracks independently from the core library