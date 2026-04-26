import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

const stackConfigSchema = z
	.object({
		defaultIndex: z.number().int().min(0).optional(),
		showNavigation: z.boolean().optional(),
		keyboardNavigation: z.boolean().optional(),
		animation: z.enum(["none", "fade", "slide"]).optional(),
		keepMounted: z.boolean().optional(),
	})
	.strict();

export const stackLayoutSchema = z
	.object({
		type: z.literal("stack"),
		regions: z
			.array(
				z.object({
					id: z.string().min(1, "Region must have a non-empty id"),
					position: z.string().min(1, "Region must have a non-empty position"),
					title: z.string().optional(),
					content: z.any(),
				}),
			)
			.min(1, "Stack layout must have at least one region"),
		stackConfig: stackConfigSchema.optional(),
	})
	.strict();

/** Validates stack layout regions and config */
export function validateStackLayout(data: unknown): ValidationResult {
	const result = stackLayoutSchema.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
