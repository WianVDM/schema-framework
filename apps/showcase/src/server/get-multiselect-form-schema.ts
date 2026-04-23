import type { FormSchema } from "@my-framework/core";
import { createServerFn } from "@tanstack/react-start";
import { multiselectFormSchema } from "../data/multiselect-form-schema";
import { toSerializable } from "../lib/to-serializable";

export const getMultiselectFormSchema = createServerFn({
	method: "GET",
}).handler(async (): Promise<FormSchema> => {
	return toSerializable(multiselectFormSchema);
});
