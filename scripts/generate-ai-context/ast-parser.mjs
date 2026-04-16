// NOTE: AST deep-mode parser for extracting internalRefs from TypeScript files.
// NOTE: Uses regex heuristics to find type/interface references without a full AST parser.

import { readFileSync } from 'fs'
import { options } from './constants.mjs'

/**
 * NOTE: Regex patterns for finding type references within TypeScript source code.
 * Matches type annotations, generics, extends/implements clauses, and type assertions.
 */
const TYPE_REF_PATTERNS = [
    // NOTE: Type annotations — `: TypeName`, `: TypeName[]`, `: Record<TypeName, ...>`
    /(?::\s*)([A-Z]\w+)/g,
    // NOTE: Generic parameters — `<TypeName>`, `<TypeName, OtherType>`
    /<\s*([A-Z]\w+)/g,
    // NOTE: Extends/implements clauses
    /(?:extends|implements)\s+([A-Z]\w+)/g,
    // NOTE: Type assertions — `as TypeName`
    /\bas\s+([A-Z]\w+)/g,
    // NOTE: Union/intersection members — `| TypeName` or `& TypeName`
    /[|&]\s*([A-Z]\w+)/g,
    // NOTE: Return type annotations — `): TypeName`
    /\):\s*([A-Z]\w+)/g,
    // NOTE: Parameter types in function signatures
    /\(\s*(?:\w+|\{[^}]*\}|\[[^\]]*\])?\s*:\s*([A-Z]\w+)/g,
    // NOTE: Map/Record utility type arguments
    /(?:Map|Record|Partial|Required|Readonly|Pick|Omit|Exclude|Extract)<\s*([A-Z]\w+)/g,
]

/**
 * NOTE: Built-in types and common globals to exclude from internalRefs.
 * These are not user-defined types and should not appear in references.
 */
const BUILTIN_TYPES = new Set([
    'String', 'Number', 'Boolean', 'Array', 'Object', 'Map', 'Set', 'Promise',
    'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Exclude',
    'Extract', 'ReturnType', 'Parameters', 'NonNullable', 'ReadonlyDeep',
    'DeepFrozen', 'Date', 'RegExp', 'Error', 'Symbol', 'BigInt',
    'HTMLElement', 'ReactNode', 'ReactElement', 'FC', 'PropsWithChildren',
    'ChangeEvent', 'MouseEvent', 'FormEvent', 'KeyboardEvent', 'Ref',
    'ComponentType', 'Dispatch', 'SetStateAction', 'CSSProperties',
    'JSX', 'Element', 'InputHTMLAttributes', 'HTMLAttributes',
    'Key', 'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
    'T', 'K', 'U', 'V', 'P', 'TKey', 'TValue', 'TItem',
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
        const content = readFileSync(filePath, 'utf-8')
        const refs = new Set()

        for (const pattern of TYPE_REF_PATTERNS) {
            pattern.lastIndex = 0
            let match
            while ((match = pattern.exec(content)) !== null) {
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