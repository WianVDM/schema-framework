import type { FormSchema } from "@my-framework/core";
import { createServerFn } from "@tanstack/react-start";
import { supportTicketFormSchema } from "../data/support-ticket-form-schema";
import { toSerializable } from "../lib/to-serializable";

export const getSupportTicketFormSchema = createServerFn({
	method: "GET",
}).handler(async (): Promise<FormSchema> => {
	return toSerializable(supportTicketFormSchema);
});
