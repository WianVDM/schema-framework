// NOTE: Changeset content generation and file writing for the auto-changeset system.

import { writeFileSync } from 'node:fs'
import { logTrace } from '../shared/output-helpers.mjs'

const SCRIPT = 'auto-changeset'

/**
 * NOTE: Extracts a verb describing the type of change from a unified diff.
 * Detects: new files (add), deleted sections (remove), modified logic (fix/update/refactor).
 * @param {string} diff - Raw unified diff output
 * @returns {string} Action verb: "Add", "Fix", "Refactor", "Update", or "Modify"
 */
function inferChangeVerb(diff) {
  if (!diff) return 'Modify'

  const lines = diff.split('\n')
  const addedLines = lines.filter(l => l.startsWith('+') && !l.startsWith('+++'))
  const removedLines = lines.filter(l => l.startsWith('-') && !l.startsWith('---'))

  // NOTE: New file — all lines are additions, no removals
  if (removedLines.length === 0 && addedLines.length > 0) return 'Add'
  // NOTE: Pure removal (deletion of functionality)
  if (addedLines.length === 0 && removedLines.length > 0) return 'Remove'

  // NOTE: Look for fix-related patterns in added lines
  const fixPatterns =
    /(?:fix|repair|correct|handle|guard|validate|sanitize|fallback|safe|null|undefined|NaN|error|issue)/i
  if (removedLines.length > 0 && addedLines.some(l => fixPatterns.test(l))) return 'Fix'

  // NOTE: Look for refactor patterns — restructure without behavior change
  const refactorPatterns =
    /(?:rename|extract|move|reorganize|restructure|simplify|clean|consolidate)/i
  if (
    addedLines.some(l => refactorPatterns.test(l)) ||
    removedLines.some(l => refactorPatterns.test(l))
  )
    return 'Refactor'

  return 'Update'
}

/**
 * NOTE: Extracts affected symbol names (functions, classes, variables) from a diff.
 * Parses hunk headers (@@ ... @@) and added/removed export lines.
 * @param {string} diff - Raw unified diff output
 * @returns {string[]} Array of symbol names found in the diff
 */
function extractSymbolsFromDiff(diff) {
  if (!diff) return []

  const symbols = new Set()

  // NOTE: Extract from hunk headers — git shows @@ ... @@ funcName when available
  const hunkHeaders = diff.match(/@@ .* @@\s*(.+)/g) || []
  for (const header of hunkHeaders) {
    const funcMatch = header.match(/@@ .* @@\s+(\w+)/)
    if (funcMatch) symbols.add(funcMatch[1])
  }

  // NOTE: Extract from added export/definition lines
  const exportPattern = /^\+\s*(?:export\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/gm
  let match = exportPattern.exec(diff)
  while (match !== null) {
    symbols.add(match[1])
    match = exportPattern.exec(diff)
  }

  return [...symbols]
}

/**
 * NOTE: Generates a per-file bullet point description from diff analysis.
 * @param {string} filePath - Relative file path
 * @param {string} diff - Raw unified diff for this file
 * @returns {string} Formatted bullet point like "- **file.ts**: Fix functionA, update functionB"
 */
function describeFileChange(filePath, diff) {
  const fileName = filePath.split('/').pop()
  const verb = inferChangeVerb(diff)
  const symbols = extractSymbolsFromDiff(diff)

  if (symbols.length > 0 && symbols.length <= 4) {
    return `- **${fileName}**: ${verb} ${symbols.join(', ')}`
  }
  if (symbols.length > 4) {
    return `- **${fileName}**: ${verb} ${symbols.slice(0, 3).join(', ')} and ${symbols.length - 3} more`
  }

  // NOTE: Fallback — no symbols extracted, use verb with generic description
  const shortPath = filePath.replace('packages/core/src/', '')
  return `- **${fileName}**: ${verb.toLowerCase()} changes in ${shortPath.includes('/') ? shortPath.split('/').slice(0, -1).join('/') : 'module'}`
}

/**
 * NOTE: Extracts the directory area from a file path (e.g., "engine/validators" from
 * "packages/core/src/engine/validators/border-layout.ts").
 * @param {string} filePath - Relative file path
 * @returns {string} Area string like "engine/validators" or "root"
 */
function extractArea(filePath) {
  const stripped = filePath.replace('packages/core/src/', '')
  const parts = stripped.split('/')
  if (parts.length <= 1) return 'root'
  return parts.slice(0, -1).join('/')
}

/**
 * NOTE: Builds a human-readable slug from verb + area for the changeset filename.
 * E.g. "fix-engine-validators" instead of "auto-80173a5f".
 * @param {string} verb - Dominant change verb (lowercase)
 * @param {string[]} areas - Unique area strings
 * @returns {string} Filename-safe slug
 */
function buildSlug(verb, areas) {
  const areaPart =
    areas.length <= 2 ? areas.join('-and-') : `${areas[0]}-and-${areas.length - 1}-more`
  const normalized = `${verb}-${areaPart}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return normalized.slice(0, 60)
}

/**
 * NOTE: Generates a changeset filename and content from a list of changed files.
 * Uses git diff data to produce descriptive per-file bullet points.
 * @param {string[]} files - List of changed file paths
 * @param {string} packageName - NPM package name for frontmatter
 * @param {object} [diffProvider] - Optional diff provider (for testing). Defaults to git-operations.
 * @returns {{ filename: string, content: string }}
 */
export function generateChangeset(files, packageName, diffProvider) {
  logTrace(SCRIPT, `[STEP] generateChangeset: ${files.length} file(s), package: ${packageName}`)

  // NOTE: Guard against empty files list
  if (files.length === 0) {
    return {
      filename: `auto-empty-${Date.now()}.md`,
      content: `---\n"${packageName}": patch\n---\nNo changes detected\n`,
    }
  }

  const summaries = files.map(f => {
    const parts = f.replace('packages/core/src/', '').split('/')
    return parts[parts.length - 1].replace(/\.(ts|tsx)$/, '')
  })

  const uniqueSummaries = [...new Set(summaries)]
  if (uniqueSummaries.length === 0) {
    return {
      filename: `auto-empty-${Date.now()}.md`,
      content: `---\n"${packageName}": patch\n---\nNo changes detected\n`,
    }
  }

  // NOTE: Generate per-file bullet points from diffs when available
  const bulletPoints = []
  const verbs = []
  const fileAnalyses = []

  for (const file of files) {
    let diff = ''
    if (diffProvider?.getFileDiff) {
      diff = diffProvider.getFileDiff(file)
    }
    const bullet = describeFileChange(file, diff)
    bulletPoints.push(bullet)
    const verb = inferChangeVerb(diff)
    verbs.push(verb)
    fileAnalyses.push({
      file,
      verb,
      area: extractArea(file),
      symbols: extractSymbolsFromDiff(diff),
    })
    logTrace(
      SCRIPT,
      `[STEP] File: ${file} → verb: ${verb}, area: ${extractArea(file)}, bullet: ${bullet}`,
    )
  }

  // NOTE: Derive a summary title from the dominant verb and affected areas
  const dominantVerb = verbs.length <= 3 ? verbs.join('/') : `${verbs[0]}/${verbs[1]}/...`
  const title =
    uniqueSummaries.length <= 3
      ? `${dominantVerb} ${uniqueSummaries.join(', ')}`
      : `${dominantVerb} ${uniqueSummaries.slice(0, 3).join(', ')} and ${uniqueSummaries.length - 3} more`

  // NOTE: Build descriptive filename from verb + area instead of random hash
  const uniqueAreas = [...new Set(fileAnalyses.map(fa => fa.area))]
  const slug = buildSlug(dominantVerb.toLowerCase(), uniqueAreas)
  logTrace(SCRIPT, `[STEP] Generated slug: ${slug}`)

  // NOTE: Build structured body with affected areas section
  const areaSummary =
    uniqueAreas.length <= 3
      ? uniqueAreas.join(', ')
      : `${uniqueAreas.slice(0, 3).join(', ')} and ${uniqueAreas.length - 3} more`
  const symbolList = [...new Set(fileAnalyses.flatMap(fa => fa.symbols))]
  const affectedSymbols =
    symbolList.length > 0
      ? `\n\n**Affected symbols:** ${symbolList.length <= 6 ? symbolList.join(', ') : `${symbolList.slice(0, 6).join(', ')} and ${symbolList.length - 6} more`}`
      : ''

  const frontmatter = `---\n"${packageName}": patch\n---\n`
  const body = `${title}\n\n**Areas:** ${areaSummary}${affectedSymbols}\n\n${bulletPoints.join('\n')}\n`

  logTrace(SCRIPT, `[STEP] Generated title: ${title}`)
  logTrace(SCRIPT, `[STEP] Generated ${bulletPoints.length} bullet points`)
  logTrace(SCRIPT, `[STEP] Areas: ${areaSummary}, Symbols: ${symbolList.length}`)

  return { filename: `auto-${slug}.md`, content: frontmatter + body }
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
