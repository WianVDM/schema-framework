import { z } from "zod";
import { contentSchemaValidator } from "./content-schema";
import { responsiveConfigValidator } from "./responsive-config";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue, i18nConfigSchema } from "./shared-schemas";

const layoutRegionValidator = z
	.object({
		id: z.string().min(1, "Region must have a non-empty id"),
		position: z.string().min(1, "Region must have a non-empty position"),
		title: z.string().optional(),
		size: z.union([z.string(), z.number()]).optional(),
		minSize: z.union([z.string(), z.number()]).optional(),
		maxSize: z.union([z.string(), z.number()]).optional(),
		collapsible: z.boolean().optional(),
		collapsed: z.boolean().optional(),
		scrollable: z.boolean().optional(),
		resizable: z.boolean().optional(),
		content: contentSchemaValidator,
		responsive: responsiveConfigValidator.optional(),
		className: z.string().optional(),
		i18n: i18nConfigSchema.optional(),
	})
	.strict();

const stackConfigValidator = z
	.object({
		defaultIndex: z.number().int().min(0).optional(),
		showNavigation: z.boolean().optional(),
		keyboardNavigation: z.boolean().optional(),
		animation: z.enum(["none", "fade", "slide"]).optional(),
		keepMounted: z.boolean().optional(),
	})
	.strict();

export const layoutSchemaValidator = z
	.object({
		type: z.enum(["border", "accordion", "card", "hbox", "vbox", "stack"]),
		regions: z
			.array(layoutRegionValidator)
			.min(1, "LayoutSchema must have at least one region"),
		accordionConfig: z
			.union([
				z
					.object({
						mode: z.enum(["single"]),
						animation: z.enum(["slide", "fade", "none"]).optional(),
						defaultOpen: z.string().optional(),
						collapsible: z.boolean().optional(),
					})
					.strict(),
				z
					.object({
						mode: z.literal("multiple"),
						animation: z.enum(["slide", "fade", "none"]).optional(),
						defaultOpen: z.array(z.string()).optional(),
					})
					.strict(),
			])
			.optional(),
		cardGridConfig: z
			.object({
				columns: z
					.union([
						z.number().int().positive().min(1),
						z
							.object({
								sm: z.number().int().positive().optional(),
								md: z.number().int().positive().optional(),
								lg: z.number().int().positive().optional(),
								xl: z.number().int().positive().optional(),
							})
							.strict(),
					])
					.optional(),
				gap: z.union([z.number().min(0), z.string()]).optional(),
				padding: z.union([z.number().min(0), z.string()]).optional(),
			})
			.strict()
			.optional(),
		boxConfig: z
			.object({
				gap: z.union([z.number().min(0), z.string()]).optional(),
				align: z.enum(["start", "center", "end", "stretch"]).optional(),
				justify: z
					.enum(["start", "center", "end", "between", "around", "evenly"])
					.optional(),
				wrap: z.boolean().optional(),
				padding: z.union([z.number().min(0), z.string()]).optional(),
				stackBelow: z.number().int().positive().optional(),
			})
			.strict()
			.optional(),
		stackConfig: stackConfigValidator.optional(),
		gap: z.number().min(0).optional(),
		padding: z
			.union([
				z.number().min(0),
				z.tuple([z.number().min(0), z.number().min(0)]),
			])
			.optional(),
		className: z.string().optional(),
		i18n: i18nConfigSchema.optional(),
	})
	.strict();

export function validateLayoutSchema(data: unknown): ValidationResult {
	const result = layoutSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
