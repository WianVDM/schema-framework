/**
 * NOTE: Maps an export keyword (interface, type, class, etc.) to a
 * normalized type string used in .context.json files.
 */
export function classifyExport(keyword) {
  const map = {
    interface: 'interface',
    type: 'type',
    class: 'component',
    function: 'function',
    const: 'const',
    enum: 'const',
  }
  return map[keyword] || 'const'
}