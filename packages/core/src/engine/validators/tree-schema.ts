import { z } from "zod";
import type { DataKey } from "../types/branded";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

const contextMenuItemSchema = z.object({
	label: z.string().min(1, "Menu item label is required"),
	icon: z.string().optional(),
	disabled: z.boolean().optional(),
	separator: z.boolean().optional(),
	action: z.string().min(1, "Menu item action is required"),
});

const contextMenuSchema = z.object({
	items: z
		.array(contextMenuItemSchema)
		.min(1, "Context menu must have at least one item"),
});

const treeSelectionSchema = z.object({
	mode: z.enum(["single", "multi", "checkbox"]),
	cascade: z.boolean().optional(),
});

const treeLazySchema = z.object({
	loadTrigger: z.enum(["expand", "click"]),
	minDepth: z.number().int().min(0).optional(),
});

const treeDndSchema = z.object({
	enabled: z.literal(true),
	dropBetween: z.boolean().optional(),
	restrictToParent: z.boolean().optional(),
});

const treeIconsSchema = z.object({
	expand: z.string().optional(),
	collapse: z.string().optional(),
	leaf: z.string().optional(),
	loading: z.string().optional(),
	folder: z.string().optional(),
	folderOpen: z.string().optional(),
});

const treeNodeSchema: z.ZodType = z.lazy(() =>
	z.object({
		id: z.string().min(1, "Node ID is required"),
		label: z.string().min(1, "Node label is required"),
		children: z.array(treeNodeSchema).optional(),
		icon: z.string().optional(),
		expanded: z.boolean().optional(),
		selected: z.boolean().optional(),
		disabled: z.boolean().optional(),
		loading: z.boolean().optional(),
		leaf: z.boolean().optional(),
		data: z.record(z.unknown()).optional(),
	}),
);

export const treeSchemaValidator = z
	.object({
		nodes: z
			.array(treeNodeSchema)
			.min(1, "Tree must have at least one root node"),
		dataKey: z
			.string()
			.min(1, "Data key is required")
			.transform((v) => v as DataKey),
		selection: treeSelectionSchema.optional(),
		lazy: treeLazySchema.optional(),
		dnd: treeDndSchema.optional(),
		icons: treeIconsSchema.optional(),
		contextMenu: contextMenuSchema.optional(),
		showLines: z.boolean().optional(),
		defaultExpandLevel: z.number().int().optional(),
		title: z.string().optional(),
	})
	.strict();

export function validateTreeSchema(data: unknown): ValidationResult {
	const result = treeSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
