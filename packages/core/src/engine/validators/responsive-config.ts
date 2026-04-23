import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

export const responsiveConfigValidator = z
	.object({
		hiddenBelow: z.number().int().positive().optional(),
		collapsedBelow: z.number().int().positive().optional(),
		stackBelow: z.number().int().positive().optional(),
	})
	.strict();

export function validateResponsiveConfig(data: unknown): ValidationResult {
	const result = responsiveConfigValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
