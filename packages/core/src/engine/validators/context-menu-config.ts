import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

const contextMenuItemSchema = z.object({
	label: z.string().min(1, "Menu item label is required"),
	icon: z.string().optional(),
	disabled: z.boolean().optional(),
	separator: z.boolean().optional(),
	action: z.string().min(1, "Menu item action is required"),
});

export const contextMenuConfigValidator = z
	.object({
		items: z
			.array(contextMenuItemSchema)
			.min(1, "Context menu must have at least one item"),
	})
	.strict();

export function validateContextMenuConfig(data: unknown): ValidationResult {
	const result = contextMenuConfigValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
