import { z } from "zod";
import { chartSchemaValidator } from "./chart-schema";
import { formSchemaValidator } from "./form-schema";
import { gridSchemaValidator } from "./grid-schema";
import { layoutSchemaValidator } from "./layout-schema";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";
import { tabSchemaValidator } from "./tab-schema";
import { treeGridSchemaValidator } from "./tree-grid-schema";
import { treeSchemaValidator } from "./tree-schema";
import { wizardSchemaValidator } from "./wizard-schema";

// NOTE: Circular dependency chain: content-schema ↔ tab-schema, content-schema ↔ layout-schema.
// ES module live bindings resolve this safely when combined with z.lazy(), because
// z.lazy() defers schema evaluation to parse-time, by which point all modules are initialized.

export const contentSchemaValidator: z.ZodType = z.discriminatedUnion("type", [
	z
		.object({
			type: z.literal("form"),
			schema: formSchemaValidator,
		})
		.strict(),
	z
		.object({
			type: z.literal("grid"),
			schema: gridSchemaValidator,
		})
		.strict(),
	z
		.object({
			type: z.literal("wizard"),
			schema: wizardSchemaValidator,
		})
		.strict(),
	z
		.object({
			type: z.literal("tabs"),
			schema: z.lazy(() => tabSchemaValidator),
		})
		.strict(),
	z
		.object({
			type: z.literal("layout"),
			schema: z.lazy(() => layoutSchemaValidator),
		})
		.strict(),
	z
		.object({
			type: z.literal("tree"),
			schema: z.lazy(() => treeSchemaValidator),
		})
		.strict(),
	z
		.object({
			type: z.literal("chart"),
			schema: z.lazy(() => chartSchemaValidator),
		})
		.strict(),
	z
		.object({
			type: z.literal("treeGrid"),
			schema: z.lazy(() => treeGridSchemaValidator),
		})
		.strict(),
	z
		.object({
			type: z.literal("custom"),
			componentKey: z
				.string()
				.min(1, "Custom content must have a non-empty componentKey"),
			props: z.record(z.unknown()).optional(),
		})
		.strict(),
]);

export function validateContentSchema(data: unknown): ValidationResult {
	const result = contentSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
