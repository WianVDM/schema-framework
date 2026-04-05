---
"@my-framework/core": patch
---

Fix `DeepFrozen` and `ReadonlyDeep` types to pass branded primitives (like `DataKey`) through unchanged, preventing typecheck failures in consumers that use branded types with `deepFreeze()`