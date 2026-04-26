# AI Optimization Artifacts

> NOTE: This directory contains all AI-assisted development artifacts for the Schema Framework project. It is harness-agnostic — the same data works with Cline, Claude Code, Cursor, or any other AI tool.

## Directory Structure

```
.ai/
├── memory/                     # Cross-session memory store
│   ├── store.json              # Bounded memory: philosophy, decisions, session summaries
│   ├── decisions.json          # Knowledge graph triples (subject-predicate-object)
│   └── schemas/                # JSON schemas for memory artifacts
│       ├── memory-store-schema.json
│       └── decisions-schema.json
├── context/                    # Auto-generated context (do not edit manually)
│   ├── schemas/                # JSON schemas for context artifacts
│   │   ├── context-schema.json
│   │   └── token-budgets-schema.json
│   └── context-map.md          # Cross-directory dependency graph (Mermaid)
├── decisions/                  # Architectural Decision Records (ADRs)
│   └── *.md                    # ADR files with temporal YAML front-matter
├── hooks/                      # Harness-agnostic hook documentation
│   └── README.md
└── README.md                   # This file
```

## Philosophy

Seven principles govern this directory (see `docs/plans/misc/ai-memory-system-plan.md`):

1. **Pre-computed Over Retrieved** — Context is generated ahead of time, not searched at runtime
2. **Lifecycle-Scoped Injection** — Context is injected at precise hook points, not dumped wholesale
3. **Constraint Over Memory** — Rules encode constraints mechanically, not via AI recollection
4. **Harness-Agnostic Core** — All logic in `scripts/` as pure Node.js, adapters per harness
5. **Self-Healing Over Blocking** — Findings feed back to AI, never block tool calls
6. **Bounded Context Growth** — Every artifact has a token budget enforced at write time
7. **Project-Local, Zero Dependencies** — No external services, no API keys, works offline

## What Goes Here vs. `docs/`

| `.ai/` (AI tooling) | `docs/` (Project documentation) |
|----------------------|--------------------------------|
| Memory store, KG triples | Roadmap, VERSION_STATUS |
| Auto-generated context maps | Implementation plans |
| ADR files (with temporal headers) | General project docs |

## Regeneration

Run `pnpm generate-context` to regenerate auto-generated artifacts in `.ai/context/`.