import type { FieldSchema, RuntimeValidationRule } from "../types";

export function validateFieldValue(
	value: unknown,
	field: Readonly<FieldSchema>,
): string | null {
	if (!field.validation) return null;

	for (const rule of field.validation as readonly RuntimeValidationRule[]) {
		const error = applyRule(value, rule);
		if (error != null) return error;
	}

	return null;
}

type RuleHandler = (
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
) => string | null;

function checkRequired(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (isEmpty(value)) return rule.message ?? "This field is required";
	return null;
}

function checkMin(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof value === "number" && value < (rule.value as number))
		return rule.message ?? `Value must be >= ${rule.value}`;
	return null;
}

function checkMax(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof value === "number" && value > (rule.value as number))
		return rule.message ?? `Value must be <= ${rule.value}`;
	return null;
}

function checkMinLength(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof value === "string" && value.length < (rule.value as number))
		return rule.message ?? `Length must be >= ${rule.value}`;
	return null;
}

function checkMaxLength(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof value === "string" && value.length > (rule.value as number))
		return rule.message ?? `Length must be <= ${rule.value}`;
	return null;
}

function checkPattern(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof value !== "string" || !rule.value) return null;
	try {
		const regex = new RegExp(rule.value as string);
		if (!regex.test(value))
			return rule.message ?? "Value does not match pattern";
	} catch {
		return rule.message || "Invalid pattern rule";
	}
	return null;
}

function checkEmail(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
		return rule.message ?? "Invalid email address";
	return null;
}

function checkCustom(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	if (typeof rule.validate !== "function") return null;
	try {
		return rule.validate(value);
	} catch {
		return rule.message || "Validation failed";
	}
}

const RULE_HANDLERS: Readonly<Record<string, RuleHandler>> = {
	required: checkRequired,
	min: checkMin,
	max: checkMax,
	minLength: checkMinLength,
	maxLength: checkMaxLength,
	pattern: checkPattern,
	email: checkEmail,
	custom: checkCustom,
};

function applyRule(
	value: unknown,
	rule: Readonly<RuntimeValidationRule>,
): string | null {
	const handler = RULE_HANDLERS[rule.type];
	return handler ? handler(value, rule) : null;
}

function isEmpty(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string" && value.trim() === "") return true;
	return false;
}
