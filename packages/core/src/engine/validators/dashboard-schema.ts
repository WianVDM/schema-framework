import { z } from "zod";
import { layoutSchemaValidator } from "./layout-schema";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue, i18nConfigSchema } from "./shared-schemas";

const dashboardPanelValidator = z
	.object({
		id: z.string().min(1, "DashboardPanel must have a non-empty id"),
		title: z.string().optional(),
		layout: layoutSchemaValidator,
		className: z.string().optional(),
	})
	.strict();

export const dashboardSchemaValidator = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		panels: z
			.array(dashboardPanelValidator)
			.min(1, "DashboardSchema must have at least one panel"),
		panelLayout: z.enum(["vertical", "tabs", "border"]).optional(),
		className: z.string().optional(),
		i18n: i18nConfigSchema.optional(),
	})
	.strict();

export function validateDashboardSchema(data: unknown): ValidationResult {
	const result = dashboardSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
