// NOTE: AST deep-mode parser for extracting internalRefs from TypeScript files.
// NOTE: Uses regex heuristics to find type/interface references without a full AST parser.

import { readFileSync } from 'node:fs'
import { options } from './constants.mjs'

/**
 * NOTE: Regex patterns for finding type references within TypeScript source code.
 * Matches type annotations, generics, extends/implements clauses, and type assertions.
 * NOTE: Trade-off — regex heuristics cannot fully parse TypeScript; we accept limited
 * false positives (e.g., some runtime expressions) in exchange for zero-dependency parsing.
 * Comments and string literals are pre-stripped to reduce noise.
 */
const TYPE_REF_PATTERNS = [
  // NOTE: Type annotations — `: TypeName`, `: TypeName[]`, `: Record<TypeName, ...>`
  /(?::\s*)([A-Z]\w+)/g,
  // NOTE: Generic parameters — `<TypeName>`, `<TypeName, OtherType>`
  // NOTE: Excluded bare `<` match for .tsx files to avoid JSX false positives;
  // utility type pattern below covers explicit generic contexts.
  /(?:Map|Record|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|ReadonlyDeep|Promise|Array)<\s*([A-Z]\w+)/g,
  // NOTE: Extends/implements clauses
  /(?:extends|implements)\s+([A-Z]\w+)/g,
  // NOTE: Type assertions — `as TypeName`
  /\bas\s+([A-Z]\w+)/g,
  // NOTE: Union/intersection members — `| TypeName` or `& TypeName`
  // NOTE: Requires word boundary context to avoid capturing runtime bitwise expressions
  /(?:\btype\s+\w+\s*=[^;]*|[?:]\s*)(?:[|&]\s*)([A-Z]\w+)/g,
  // NOTE: Return type annotations — `): TypeName`
  /\):\s*([A-Z]\w+)/g,
  // NOTE: Parameter types in function signatures
  /\(\s*(?:\w+|\{[^}]*\}|\[[^\]]*\])?\s*:\s*([A-Z]\w+)/g,
]

/**
 * NOTE: Strips comments and string literals from source code to prevent false matches.
 * Removes single-line (//), multi-line (/* * /), and string literals ("...", '...', `...`).
 */
function stripCommentsAndStrings(content) {
  // NOTE: Replace string literals and comments with whitespace to preserve positions
  return content
    .replace(/\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length))
    .replace(/\/\/.*$/gm, match => ' '.repeat(match.length))
    .replace(/(["'`])(?:[^\\]|\\.)*?\1/g, match => ' '.repeat(match.length))
}

/**
 * NOTE: Built-in types and common globals to exclude from internalRefs.
 * These are not user-defined types and should not appear in references.
 */
const BUILTIN_TYPES = new Set([
  // NOTE: Only capitalized built-ins that can actually match TYPE_REF_PATTERNS
  // (which requires initial [A-Z]) and have name.length > 1 (per parseInternalRefs guard).
  // Single-letter generics ('T','K','U','V','P') are excluded — too short.
  // Lowercase React hooks ('useState', etc.) are excluded — never captured by [A-Z] patterns.
  'String',
  'Number',
  'Boolean',
  'Array',
  'Object',
  'Map',
  'Set',
  'Promise',
  'Record',
  'Partial',
  'Required',
  'Readonly',
  'Pick',
  'Omit',
  'Exclude',
  'Extract',
  'ReturnType',
  'Parameters',
  'NonNullable',
  'ReadonlyDeep',
  'DeepFrozen',
  'Date',
  'RegExp',
  'Error',
  'Symbol',
  'BigInt',
  'HTMLElement',
  'ReactNode',
  'ReactElement',
  'FC',
  'PropsWithChildren',
  'ChangeEvent',
  'MouseEvent',
  'FormEvent',
  'KeyboardEvent',
  'Ref',
  'ComponentType',
  'Dispatch',
  'SetStateAction',
  'CSSProperties',
  'JSX',
  'Element',
  'InputHTMLAttributes',
  'HTMLAttributes',
  'Key',
  'TKey',
  'TValue',
  'TItem',
])

/**
 * NOTE: Extracts type/interface references from a file's source code.
 * Uses regex heuristics to find PascalCase identifiers in type positions.
 * Returns deduplicated array of referenced type names.
 *
 * @param {string} filePath — absolute path to the source file
 * @returns {string[]} — deduplicated type names referenced in the file
 */
export function parseInternalRefs(filePath) {
  if (!options.deep) return []

  try {
    const raw = readFileSync(filePath, 'utf-8')
    const content = stripCommentsAndStrings(raw)
    const refs = new Set()

    for (const pattern of TYPE_REF_PATTERNS) {
      for (const match of content.matchAll(pattern)) {
        const name = match[1]
        if (name && !BUILTIN_TYPES.has(name) && name.length > 1) {
          refs.add(name)
        }
      }
    }

    return [...refs].sort()
  } catch {
    return []
  }
}
