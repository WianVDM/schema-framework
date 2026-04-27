import type { ChartSchema } from "./chart-schema";
import type { FormSchema } from "./form-schema";
import type { GridSchema } from "./grid-schema";
import type { LayoutSchema } from "./layout-schema";
import type { TabSchema } from "./tab-schema";
import type { TreeGridSchema } from "./tree-grid-schema";
import type { TreeSchema } from "./tree-schema";
import type { WizardSchema } from "./wizard-schema";

/** Discriminated union for layout region content */
export type ContentSchema =
	| { readonly type: "form"; readonly schema: FormSchema }
	| { readonly type: "grid"; readonly schema: GridSchema }
	| { readonly type: "wizard"; readonly schema: WizardSchema }
	| { readonly type: "tabs"; readonly schema: TabSchema }
	| { readonly type: "layout"; readonly schema: LayoutSchema }
	| { readonly type: "tree"; readonly schema: TreeSchema }
	| { readonly type: "chart"; readonly schema: ChartSchema }
	| { readonly type: "treeGrid"; readonly schema: TreeGridSchema }
	| {
			readonly type: "custom";
			readonly componentKey: string;
			readonly props?: Readonly<Record<string, unknown>>;
	  };
