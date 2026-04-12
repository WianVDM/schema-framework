import type { FormSchema } from './form-schema'
import type { GridSchema } from './grid-schema'
import type { WizardSchema } from './wizard-schema'
import type { LayoutSchema } from './layout-schema'
import type { TabSchema } from './tab-schema'

/** Discriminated union for layout region content */
export type ContentSchema =
  | { readonly type: 'form'; readonly schema: FormSchema }
  | { readonly type: 'grid'; readonly schema: GridSchema }
  | { readonly type: 'wizard'; readonly schema: WizardSchema }
  | { readonly type: 'tabs'; readonly schema: TabSchema }
  | { readonly type: 'layout'; readonly schema: LayoutSchema }
  | { readonly type: 'custom'; readonly componentKey: string; readonly props?: Readonly<Record<string, unknown>> }