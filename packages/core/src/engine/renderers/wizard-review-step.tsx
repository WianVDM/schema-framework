import { usePrimitives } from "../context/primitives-context";
import { isFieldVisible } from "../helpers/is-field-visible";
import type { FieldSchema, SelectOption } from "../types";

interface WizardReviewStepProps {
	readonly steps: readonly {
		readonly title: string;
		readonly description?: string;
		readonly schema: { readonly fields: readonly FieldSchema[] };
	}[];
	readonly values: Record<string, unknown>;
	readonly onEditStep: (stepIndex: number) => void;
	readonly editable: boolean;
}

export function WizardReviewStep({
	steps,
	values,
	onEditStep,
	editable,
}: WizardReviewStepProps) {
	const { Button } = usePrimitives();

	return (
		<div className="space-y-6">
			{steps.map((step, stepIndex) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: steps are static wizard steps — index is stable
				<div key={stepIndex} className="border rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<div>
							<h3 className="font-semibold text-lg">{step.title}</h3>
							{step.description && (
								<p className="text-sm text-muted-foreground">
									{step.description}
								</p>
							)}
						</div>
						{editable && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => onEditStep(stepIndex)}
							>
								Edit
							</Button>
						)}
					</div>
					<dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
						{step.schema.fields
							.filter((field) => isFieldVisible(field, values))
							.map((field) => {
								const fieldValue = values[field.name];
								const displayValue = formatDisplayValue(fieldValue, field);
								return (
									<div key={field.name}>
										<dt className="text-sm font-medium text-muted-foreground">
											{field.label}
										</dt>
										<dd className="text-sm mt-0.5">{displayValue}</dd>
									</div>
								);
							})}
					</dl>
				</div>
			))}
		</div>
	);
}

function formatDisplayValue(value: unknown, field: FieldSchema): string {
	if (value === undefined || value === null || value === "") return "—";
	if (field.type === "checkbox") return value ? "Yes" : "No";

	if (field.type === "select") {
		return resolveOptionLabel(value, field.options) ?? String(value);
	}

	if (field.type === "multiselect" && Array.isArray(value)) {
		if (value.length === 0) return "—";
		const options = field.multiSelectConfig?.options;
		return value
			.map((v) => resolveOptionLabel(v, options) ?? String(v))
			.join(", ");
	}

	if (Array.isArray(value)) {
		if (value.length === 0) return "—";
		return value.map((v) => String(v)).join(", ");
	}
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	return String(value);
}

function resolveOptionLabel(
	value: unknown,
	options?: readonly (string | SelectOption)[],
): string | undefined {
	if (!options) return undefined;
	const normalized = options.map((opt) =>
		typeof opt === "string" ? { label: opt, value: opt } : opt,
	);
	const match = normalized.find((opt) => opt.value === value);
	return match?.label;
}
