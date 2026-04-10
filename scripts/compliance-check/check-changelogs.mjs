// NOTE: CHANGELOG existence validation for published packages.

import { existsSync } from 'fs'
import { join } from 'path'
import { ROOT } from '../shared/constants.mjs'
import { readPackageJson } from '../shared/file-helpers.mjs'

/**
 * NOTE: Validates CHANGELOG.md existence for packages with version > 0.0.0.
 * Only published packages (version > 0.0.0) are expected to have changelogs.
 */
export function checkChangelogs(collector) {
  const packages = [
    { name: '@my-framework/core', path: join(ROOT, 'packages', 'core') },
    { name: 'showcase', path: join(ROOT, 'apps', 'showcase') },
  ]

  for (const pkg of packages) {
    const pkgJson = readPackageJson(join(pkg.path, 'package.json'))
    if (!pkgJson) continue

    if (pkgJson.version && pkgJson.version !== '0.0.0') {
      const changelogPath = join(pkg.path, 'CHANGELOG.md')
      if (!existsSync(changelogPath)) {
        collector.addViolation(`CHANGELOG.md missing for ${pkg.name}@${pkgJson.version} — this will be auto-generated when changesets/action processes pending changesets on merge to main`)
      }
    }
  }
}