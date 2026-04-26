import type { ContentSchema } from "../types/content-schema";
import type { FormSchema } from "../types/form-schema";
import type { GridSchema } from "../types/grid-schema";
import type { LayoutSchema } from "../types/layout-schema";
import type { TabSchema } from "../types/tab-schema";
import type { WizardSchema } from "../types/wizard-schema";

/** Type guard: checks if ContentSchema is a form variant */
export function isFormContent(
	content: ContentSchema,
): content is ContentSchema & {
	readonly type: "form";
	readonly schema: FormSchema;
} {
	return content.type === "form";
}

/** Type guard: checks if ContentSchema is a grid variant */
export function isGridContent(
	content: ContentSchema,
): content is ContentSchema & {
	readonly type: "grid";
	readonly schema: GridSchema;
} {
	return content.type === "grid";
}

/** Type guard: checks if ContentSchema is a wizard variant */
export function isWizardContent(
	content: ContentSchema,
): content is ContentSchema & {
	readonly type: "wizard";
	readonly schema: WizardSchema;
} {
	return content.type === "wizard";
}

/** Type guard: checks if ContentSchema is a tabs variant */
export function isTabsContent(
	content: ContentSchema,
): content is ContentSchema & {
	readonly type: "tabs";
	readonly schema: TabSchema;
} {
	return content.type === "tabs";
}

/** Type guard: checks if ContentSchema is a layout variant */
export function isLayoutContent(
	content: ContentSchema,
): content is ContentSchema & {
	readonly type: "layout";
	readonly schema: LayoutSchema;
} {
	return content.type === "layout";
}

/** Type guard: checks if ContentSchema is a custom component variant */
export function isCustomContent(
	content: ContentSchema,
): content is ContentSchema & {
	readonly type: "custom";
	readonly componentKey: string;
	readonly props?: Readonly<Record<string, unknown>>;
} {
	return content.type === "custom";
}
