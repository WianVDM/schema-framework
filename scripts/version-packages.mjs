// NOTE: Wrapper script for changesets/action `version` input.
// NOTE: The action passes the `version` string as arguments to pnpm — not a shell.
// NOTE: Shell operators like `&&` are treated as literal arguments, causing crashes.
// NOTE: This script runs both commands in sequence as a single invocation.

import { execSync } from "node:child_process";

execSync("pnpm changeset version", { stdio: "inherit" });
execSync("node scripts/sync-version-status.mjs", { stdio: "inherit" });
