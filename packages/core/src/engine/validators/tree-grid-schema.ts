import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

/** NOTE: Inline column schema to avoid circular dependency with grid validator */
const gridColumnSchema = z.object({
	key: z.string().min(1, "Column key is required"),
	label: z.string().min(1, "Column label is required"),
	width: z.union([z.string(), z.number()]).optional(),
	sortable: z.boolean().optional(),
	visible: z.boolean().optional(),
	frozen: z.boolean().optional(),
	align: z.enum(["left", "center", "right"]).optional(),
});

const treeGridRowSchema: z.ZodType = z.lazy(() =>
	z
		.object({
			id: z.string().min(1, "Row ID is required"),
			children: z.array(treeGridRowSchema).optional(),
			expanded: z.boolean().optional(),
		})
		.catchall(z.unknown()),
);

export const treeGridSchemaValidator = z
	.object({
		columns: z
			.array(gridColumnSchema)
			.min(1, "TreeGrid must have at least one column"),
		rows: z
			.array(treeGridRowSchema)
			.min(1, "TreeGrid must have at least one row"),
		indentWidth: z.number().int().min(0).optional(),
		showLines: z.boolean().optional(),
		defaultExpandLevel: z.number().int().min(0).optional(),
		title: z.string().optional(),
		description: z.string().optional(),
		rowHeight: z.number().int().min(1).optional(),
	})
	.strict();

export function validateTreeGridSchema(data: unknown): ValidationResult {
	const result = treeGridSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
