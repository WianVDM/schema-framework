import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

export const realtimeConfigValidator = z
	.object({
		enabled: z.boolean(),
		strategy: z.enum(["polling", "websocket", "sse"]).optional(),
		intervalMs: z.number().int().positive().optional(),
		pauseOnHidden: z.boolean().optional(),
		staleThresholdMs: z.number().int().positive().optional(),
		endpoint: z.string().url().optional(),
	})
	.strict();

export function validateRealtimeConfig(data: unknown): ValidationResult {
	const result = realtimeConfigValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
