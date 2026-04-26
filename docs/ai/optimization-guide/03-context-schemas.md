# Module 03: Context Schemas

> NOTE: JSON Schema definitions for all generated files. Each schema validates a specific context file type.

## context-schema.json — Per-directory context

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Directory Context",
  "type": "object",
  "required": ["$schema", "layer", "purpose", "language", "files"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "layer": { "type": "integer", "minimum": 1 },
    "purpose": { "type": "string", "maxLength": 200 },
    "language": { "type": "string", "enum": ["csharp", "typescript", "python", "java", "go", "rust", "mixed"] },
    "files": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["export", "type", "desc"],
        "additionalProperties": false,
        "properties": {
          "export": { "type": "string" },
          "type": { "type": "string", "enum": ["interface", "type", "function", "const", "component", "class", "enum", "record", "re-export"] },
          "desc": { "type": "string", "maxLength": 60 },
          "deprecated": { "type": "boolean", "default": false },
          "tests": { "type": "string" },
          "internalRefs": {
            "type": "array",
            "items": { "type": "string" },
            "description": "AST-level: types/interfaces referenced within this file (optional deep mode)"
          }
        }
      }
    },
    "rels": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["path"],
          "additionalProperties": false,
          "properties": {
            "path": { "type": "string" },
            "confidence": { "type": "string", "enum": ["explicit", "inferred"], "default": "explicit" }
          }
        }
      }
    },
    "extDeps": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["path"],
          "additionalProperties": false,
          "properties": {
            "path": { "type": "string" },
            "confidence": { "type": "string", "enum": ["explicit", "inferred"], "default": "explicit" }
          }
        }
      }
    }
  }
}
```

## impact-graph-schema.json — Reverse dependency lookup

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Change Impact Graph",
  "type": "object",
  "required": ["$schema", "generatedAt", "impacts"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "generatedAt": { "type": "string", "format": "date-time" },
    "impacts": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["consumedBy"],
        "additionalProperties": false,
        "properties": {
          "consumedBy": { "type": "array", "items": { "type": "string" } },
          "consumerCount": { "type": "integer" },
          "layerSpan": { "type": "array", "items": { "type": "integer" } }
        }
      }
    }
  }
}
```

## core-abstractions-schema.json — God nodes

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Core Abstractions",
  "type": "object",
  "required": ["$schema", "generatedAt", "abstractions"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "generatedAt": { "type": "string", "format": "date-time" },
    "abstractions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["export", "file", "consumedBy", "consumerCount", "layerSpan"],
        "additionalProperties": false,
        "properties": {
          "export": { "type": "string" },
          "file": { "type": "string" },
          "consumedBy": { "type": "array", "items": { "type": "string" } },
          "consumerCount": { "type": "integer" },
          "layerSpan": { "type": "array", "items": { "type": "integer" } }
        }
      }
    }
  }
}
```

## insights-schema.json — Surprising connections + warnings

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Architectural Insights",
  "type": "object",
  "required": ["$schema", "generatedAt", "insights"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "generatedAt": { "type": "string", "format": "date-time" },
    "insights": {
      "type": "object",
      "required": ["crossLayerDeps", "highImpactFiles", "circularWarnings"],
      "additionalProperties": false,
      "properties": {
        "crossLayerDeps": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["source", "target", "sourceLayer", "targetLayer"],
            "properties": {
              "source": { "type": "string" },
              "target": { "type": "string" },
              "sourceLayer": { "type": "integer" },
              "targetLayer": { "type": "integer" },
              "note": { "type": "string" }
            }
          }
        },
        "highImpactFiles": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["file", "consumerCount", "layerSpan"],
            "properties": {
              "file": { "type": "string" },
              "consumerCount": { "type": "integer" },
              "layerSpan": { "type": "array", "items": { "type": "integer" } }
            }
          }
        },
        "circularWarnings": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["cycle"],
            "properties": {
              "cycle": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    }
  }
}
```

## community-map-schema.json — Directory clusters

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Community Map",
  "type": "object",
  "required": ["$schema", "generatedAt", "communities"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "generatedAt": { "type": "string", "format": "date-time" },
    "communities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["label", "directories", "sharedDeps"],
        "additionalProperties": false,
        "properties": {
          "label": { "type": "string" },
          "directories": { "type": "array", "items": { "type": "string" } },
          "sharedDeps": { "type": "array", "items": { "type": "string" } },
          "cohesionScore": { "type": "number" }
        }
      }
    }
  }
}
```

## symbol-index-manifest-schema.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Symbol Index Manifest",
  "type": "object",
  "required": ["$schema", "generatedAt", "layers"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "generatedAt": { "type": "string", "format": "date-time" },
    "layers": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["file", "symbolCount"],
        "properties": {
          "file": { "type": "string" },
          "symbolCount": { "type": "integer" },
          "description": { "type": "string" }
        }
      }
    }
  }
}
```

## symbol-index-schema.json — Per-layer

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Symbol Index (Per-Layer)",
  "type": "object",
  "required": ["$schema", "layer", "symbols"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "layer": { "type": "integer", "minimum": 1 },
    "symbols": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["file", "type", "category"],
          "additionalProperties": false,
          "properties": {
            "file": { "type": "string" },
            "type": { "type": "string", "enum": ["interface", "type", "function", "const", "component", "class", "enum", "record"] },
            "category": { "type": "string", "enum": ["entity", "service", "repository", "controller", "component", "dto", "enum", "utility", "config", "plugin"] }
          }
        }
      }
    }
  }
}
```

## flows-schema.json — Hand-crafted data flows

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "Flow Context",
  "type": "object",
  "required": ["$schema", "flows"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "flows": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["trigger", "steps"],
        "additionalProperties": false,
        "properties": {
          "trigger": { "type": "string", "maxLength": 100 },
          "steps": { "type": "array", "items": { "type": "string" } },
          "touches": { "type": "array", "items": { "type": "string" } },
          "errorPath": { "type": "string", "maxLength": 200 }
        }
      }
    }
  }
}
```

## file-placement-schema.json — Where to put new files

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "File Placement Rules",
  "type": "object",
  "required": ["$schema", "rules"],
  "additionalProperties": false,
  "properties": {
    "$schema": { "type": "string" },
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["when", "put", "file", "update"],
        "additionalProperties": false,
        "properties": {
          "when": { "type": "string" },
          "put": { "type": "string" },
          "file": { "type": "string" },
          "update": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
```

## Additional Schemas

The following follow the same pattern (`$schema` + `generatedAt` + domain-specific data):

- **directory-index-schema.json** — directory→purpose mapping
- **error-taxonomy-schema.json** — exception hierarchy
- **config-schema-schema.json** — config shape (no secrets)
- **last-diff-schema.json** — generation diff tracking (extended with `recentSessions`)