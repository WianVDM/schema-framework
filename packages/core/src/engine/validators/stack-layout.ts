import { z } from "zod";
import { contentSchemaValidator } from "./content-schema";
import { stackConfigValidator } from "./layout-schema";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

export const stackLayoutSchema = z
	.object({
		type: z.literal("stack"),
		regions: z
			.array(
				z.object({
					id: z.string().min(1, "Region must have a non-empty id"),
					position: z.string().min(1, "Region must have a non-empty position"),
					title: z.string().optional(),
					content: contentSchemaValidator,
				}),
			)
			.min(1, "Stack layout must have at least one region"),
		stackConfig: stackConfigValidator.optional(),
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
