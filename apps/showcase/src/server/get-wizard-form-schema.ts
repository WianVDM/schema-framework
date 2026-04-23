import type { WizardSchema } from "@my-framework/core";
import { createServerFn } from "@tanstack/react-start";
import { wizardFormSchema } from "../data/wizard-form-schema";
import { toSerializable } from "../lib/to-serializable";

export const getWizardFormSchema = createServerFn({ method: "GET" }).handler(
	async (): Promise<WizardSchema> => {
		return toSerializable(wizardFormSchema);
	},
);
