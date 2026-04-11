import { readFileSync } from 'fs'

const files = [
  'apps/showcase/src/.context.json',
  'apps/showcase/src/app/.context.json',
  'apps/showcase/src/components/ui/.context.json',
  'apps/showcase/src/data/.context.json',
  'apps/showcase/src/lib/.context.json',
  'apps/showcase/src/routes/.context.json',
  'apps/showcase/src/server/.context.json',
  'apps/showcase/src/stores/.context.json',
  'packages/core/src/engine/.context.json',
  'packages/core/src/engine/context/.context.json',
  'packages/core/src/engine/helpers/.context.json',
  'packages/core/src/engine/renderers/.context.json',
  'packages/core/src/engine/types/.context.json',
  'packages/core/src/engine/validators/.context.json',
  'packages/core/src/primitives/.context.json',
]

let found = false
for (const f of files) {
  try {
    const d = JSON.parse(readFileSync(f, 'utf8'))
    if (d.purpose && d.purpose.includes('|')) {
      console.log('PIPE FOUND in:', f, '-- purpose:', d.purpose)
      found = true
    }
  } catch (e) {}
}
if (!found) console.log('No pipe characters found in any purpose field.')