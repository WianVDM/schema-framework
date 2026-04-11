// NOTE: Changeset content generation and file writing for the auto-changeset system.

import { writeFileSync } from 'fs'
import { createHash } from 'crypto'

/**
 * NOTE: Generates a changeset filename and content from a list of changed files.
 * Derives a short description from file names and creates a unique ID.
 */
export function generateChangeset(files, packageName) {
  // NOTE: Guard against empty files list to prevent "Update " description
  if (files.length === 0) {
    return { filename: `auto-empty-${Date.now()}.md`, content: `---\n"${packageName}": patch\n---\nNo changes detected\n` }
  }

  const summaries = files.map(f => {
    const parts = f.replace('packages/core/src/', '').split('/')
    return parts[parts.length - 1].replace(/\.(ts|tsx)$/, '')
  })

  const uniqueSummaries = [...new Set(summaries)]
  if (uniqueSummaries.length === 0) {
    return { filename: `auto-empty-${Date.now()}.md`, content: `---\n"${packageName}": patch\n---\nNo changes detected\n` }
  }

  const description = uniqueSummaries.length <= 3
    ? `Update ${uniqueSummaries.join(', ')}`
    : `Update ${uniqueSummaries.slice(0, 3).join(', ')} and ${uniqueSummaries.length - 3} more`

  const hash = createHash('md5')
    .update(files.join(',') + Date.now())
    .digest('hex')
    .slice(0, 8)

  const frontmatter = `---\n"${packageName}": patch\n---\n`
  const body = `${description}\n`

  return { filename: `auto-${hash}.md`, content: frontmatter + body }
}

/**
 * NOTE: Writes a changeset file to disk. Returns true on success.
 */
export function writeChangeset(filePath, content) {
  try {
    writeFileSync(filePath, content, 'utf-8')
    return true
  } catch {
    return false
  }
}