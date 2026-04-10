# Shared Script Utilities

> **Canonical utilities** consumed by all script subsystems (`generate-ai-context`, `auto-changeset`, `compliance-check`).

Eliminates code duplication by providing a single source of truth for project constants, file helpers, and output formatting.

## Architecture

```mermaid
graph TD
    shared["scripts/shared/"]
    constants["constants.mjs<br/>(ROOT, SCAN_ROOTS, SKIP_DIRS)"]
    filehelpers["file-helpers.mjs<br/>(isSourceFile, readPackageJson)"]
    outputhelpers["output-helpers.mjs<br/>(SeverityCollector)"]

    shared --> constants
    shared --> filehelpers
    shared --> outputhelpers
```

## Module Responsibilities

| Module | Purpose | Primary Export |
|--------|---------|---------------|
| `constants.mjs` | Project root path, scan roots, skip directories | `ROOT`, `SCAN_ROOTS`, `SKIP_DIRS` |
| `file-helpers.mjs` | Source file detection, package.json reading | `isSourceFile()`, `readPackageJson()` |
| `output-helpers.mjs` | Structured report formatting with severity levels | `SeverityCollector` |

## Dependency Graph

```mermaid
graph TD
    gac["scripts/generate-ai-context/"]
    ac["scripts/auto-changeset/"]
    cc["scripts/compliance-check/"]

    gac -->|imports ROOT, SCAN_ROOTS, SKIP_DIRS| constants
    ac -->|imports ROOT, isSourceFile, readPackageJson| filehelpers
    cc -->|imports ROOT, SCAN_ROOTS, SKIP_DIRS, isSourceFile, readPackageJson, SeverityCollector| shared

    shared["scripts/shared/"]
    filehelpers["file-helpers.mjs"]
    constants["constants.mjs"]
```

## Usage

```js
import { ROOT, SCAN_ROOTS, SKIP_DIRS } from '../shared/constants.mjs'
import { isSourceFile, readPackageJson } from '../shared/file-helpers.mjs'
import { SeverityCollector } from '../shared/output-helpers.mjs'