import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

const realtimeDisabledSchema = z
	.object({
		enabled: z.literal(false),
	})
	.strict();

const realtimeEnabledSchema = z
	.object({
		enabled: z.literal(true),
		strategy: z.enum(["polling", "websocket", "sse"]).optional(),
		intervalMs: z.number().int().positive().optional(),
		pauseOnHidden: z.boolean().optional(),
		staleThresholdMs: z.number().int().positive().optional(),
		endpoint: z.string().url().optional(),
	})
	.strict();

export const realtimeConfigValidator = z
	.discriminatedUnion("enabled", [
		realtimeDisabledSchema,
		realtimeEnabledSchema,
	])
	.superRefine((data, ctx) => {
		// NOTE: Validate strategy-specific requirements when enabled
		if (data.enabled !== true) return;

		if (data.strategy === "polling" && data.intervalMs === undefined) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "intervalMs is required when strategy is 'polling'",
				path: ["intervalMs"],
			});
		}
		if (
			(data.strategy === "websocket" || data.strategy === "sse") &&
			data.endpoint === undefined
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `endpoint is required when strategy is '${data.strategy}'`,
				path: ["endpoint"],
			});
		}
	});

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
