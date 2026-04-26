import type { FormSchema } from "@my-framework/core";
import { createServerFn } from "@tanstack/react-start";
import { registrationFormSchema } from "../data/registration-form-schema";
import { toSerializable } from "../lib/to-serializable";

export const getRegistrationFormSchema = createServerFn({
	method: "GET",
}).handler(async (): Promise<FormSchema> => {
	return toSerializable(registrationFormSchema);
});
