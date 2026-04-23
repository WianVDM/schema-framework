import { z } from "zod";
import { formSchemaValidator } from "./form-schema";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue, i18nConfigSchema } from "./shared-schemas";

const wizardNavigationConfigValidator = z
	.object({
		showStepIndicator: z.boolean().optional(),
		showPreviousButton: z.boolean().optional(),
		nextLabel: z.string().optional(),
		previousLabel: z.string().optional(),
		submitLabel: z.string().optional(),
	})
	.strict();

const reviewStepConfigValidator = z
	.object({
		enabled: z.literal(true),
		title: z.string().optional(),
		description: z.string().optional(),
		editable: z.boolean().optional(),
	})
	.strict();

const wizardStepValidator = z
	.object({
		title: z.string(),
		description: z.string().optional(),
		schema: formSchemaValidator,
		optional: z.boolean().optional(),
	})
	.strict();

export const wizardSchemaValidator = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		steps: z
			.array(wizardStepValidator)
			.min(1, "Wizard must have at least one step"),
		mode: z.enum(["linear", "nonlinear"]).optional(),
		validationMode: z.enum(["eager", "lazy"]).optional(),
		navigation: wizardNavigationConfigValidator.optional(),
		reviewStep: reviewStepConfigValidator.optional(),
		i18n: i18nConfigSchema.optional(),
	})
	.strict();

export function validateWizardSchema(data: unknown): ValidationResult {
	const result = wizardSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
