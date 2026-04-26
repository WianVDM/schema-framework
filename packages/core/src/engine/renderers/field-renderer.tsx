import type { AddressData } from "@primitives/address-data";
import { useEffect } from "react";
import { usePrimitives } from "../context/primitives-context";
import { DefaultFallbackComponent } from "../helpers/default-fallback-component";
import type { FieldRendererProps, SelectOption } from "../types";

export function FieldRenderer({
	schema,
	value,
	onChange,
	error,
}: FieldRendererProps) {
	const primitives = usePrimitives();

	const fieldId = `field-${schema.name}`;
	const errorId = `${fieldId}-error`;
	const descriptionId = `${fieldId}-description`;

	const describedBy =
		[error ? errorId : null, schema.description ? descriptionId : null]
			.filter(Boolean)
			.join(" ") || undefined;

	const ariaProps = {
		"aria-required": schema.required || undefined,
		"aria-invalid": error ? true : undefined,
		"aria-describedby": describedBy,
	};

	const labelElement = (
		<primitives.Label htmlFor={fieldId}>
			{schema.label}
			{schema.required && <span className="text-destructive ml-1">*</span>}
		</primitives.Label>
	);

	const errorElement = error ? (
		<p id={errorId} role="alert" className="text-sm text-destructive mt-1">
			{error}
		</p>
	) : null;

	const descriptionElement = schema.description ? (
		<p id={descriptionId} className="text-sm text-muted-foreground">
			{schema.description}
		</p>
	) : null;

	return renderFieldControl(
		schema,
		value,
		onChange,
		primitives,
		fieldId,
		labelElement,
		errorElement,
		descriptionElement,
		ariaProps,
	);
}

interface FieldControlProps {
	readonly schema: FieldRendererProps["schema"];
	readonly value: unknown;
	readonly onChange: (value: unknown) => void;
	readonly fieldId: string;
	readonly labelElement: React.ReactNode;
	readonly errorElement: React.ReactNode;
	readonly descriptionElement: React.ReactNode;
	readonly ariaProps: Record<string, unknown>;
}

function renderFieldControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	labelElement: React.ReactNode,
	errorElement: React.ReactNode,
	descriptionElement: React.ReactNode,
	ariaProps: Record<string, unknown>,
): React.ReactNode {
	const wrapper = (control: React.ReactNode) => (
		<div className="space-y-1">
			{labelElement}
			{control}
			{descriptionElement}
			{errorElement}
		</div>
	);

	switch (schema.type) {
		case "select":
			return wrapper(
				renderSelectControl(
					schema,
					value,
					onChange,
					primitives,
					fieldId,
					ariaProps,
				),
			);
		case "textarea":
			return wrapper(
				renderTextareaControl(
					schema,
					value,
					onChange,
					primitives,
					fieldId,
					ariaProps,
				),
			);
		case "checkbox":
			return renderCheckboxControl(
				schema,
				value,
				onChange,
				primitives,
				fieldId,
				labelElement,
				descriptionElement,
				errorElement,
				ariaProps,
			);
		case "file":
			return wrapper(
				renderFileControl(
					schema,
					value,
					onChange,
					primitives,
					fieldId,
					ariaProps,
				),
			);
		case "address":
			return renderAddressControl(
				schema,
				value,
				onChange,
				primitives,
				fieldId,
				labelElement,
				descriptionElement,
				errorElement,
				ariaProps,
			);
		case "date":
			return wrapper(
				renderDateControl(
					schema,
					value,
					onChange,
					primitives,
					fieldId,
					ariaProps,
				),
			);
		case "multiselect":
			return wrapper(
				renderMultiselectControl(
					schema,
					value,
					onChange,
					primitives,
					fieldId,
					ariaProps,
				),
			);
		default:
			return wrapper(
				renderInputControl(
					schema,
					value,
					onChange,
					primitives,
					fieldId,
					ariaProps,
				),
			);
	}
}

function renderSelectControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	ariaProps: Record<string, unknown>,
) {
	const options = normalizeOptions(schema.options);
	return (
		<primitives.Select
			value={value ?? ""}
			onValueChange={(val: string) => onChange(val)}
			disabled={schema.disabled}
		>
			<primitives.SelectTrigger id={fieldId} {...ariaProps}>
				<primitives.SelectValue
					placeholder={schema.placeholder ?? "Select..."}
				/>
			</primitives.SelectTrigger>
			<primitives.SelectContent>
				{options.map((opt) => (
					<primitives.SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</primitives.SelectItem>
				))}
			</primitives.SelectContent>
		</primitives.Select>
	);
}

function renderTextareaControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	ariaProps: Record<string, unknown>,
) {
	return (
		<primitives.Textarea
			id={fieldId}
			value={value ?? ""}
			onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
				onChange(e.target.value)
			}
			placeholder={schema.placeholder}
			disabled={schema.disabled}
			{...ariaProps}
		/>
	);
}

function renderCheckboxControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	labelElement: React.ReactNode,
	descriptionElement: React.ReactNode,
	errorElement: React.ReactNode,
	ariaProps: Record<string, unknown>,
) {
	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<primitives.Checkbox
					id={fieldId}
					checked={Boolean(value)}
					onCheckedChange={(checked: boolean) => onChange(checked)}
					disabled={schema.disabled}
					{...ariaProps}
				/>
				{labelElement}
			</div>
			{descriptionElement}
			{errorElement}
		</div>
	);
}

function renderFileControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	ariaProps: Record<string, unknown>,
) {
	return (
		<primitives.FileUpload
			id={fieldId}
			accept={schema.fileConfig?.accept}
			maxSize={schema.fileConfig?.maxSize}
			multiple={schema.fileConfig?.multiple}
			value={Array.isArray(value) ? (value as File[]) : []}
			onChange={(files: File[]) => onChange(files)}
			disabled={schema.disabled}
			{...ariaProps}
		/>
	);
}

function renderAddressControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	_labelElement: React.ReactNode,
	descriptionElement: React.ReactNode,
	errorElement: React.ReactNode,
	ariaProps: Record<string, unknown>,
) {
	return (
		<div className="space-y-1">
			<primitives.Label htmlFor={`${fieldId}-street`}>
				{schema.label}
				{schema.required && <span className="text-destructive ml-1">*</span>}
			</primitives.Label>
			<primitives.AddressInput
				id={fieldId}
				value={
					(value as AddressData) ?? {
						street: "",
						city: "",
						state: "",
						zip: "",
						country: "",
					}
				}
				onChange={(val: AddressData) => onChange(val)}
				disabled={schema.disabled}
				placeholder={schema.placeholder}
				{...ariaProps}
			/>
			{descriptionElement}
			{errorElement}
		</div>
	);
}

function renderDateControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	ariaProps: Record<string, unknown>,
) {
	const DatePickerComponent = primitives.DatePicker ?? DefaultFallbackComponent;
	return (
		<DatePickerComponent
			id={fieldId}
			value={typeof value === "string" ? value : ""}
			onChange={(date: string) => onChange(date)}
			disabled={schema.disabled}
			placeholder={
				schema.dateConfig?.placeholder ?? schema.placeholder ?? "Pick a date..."
			}
			formatStr={schema.dateConfig?.format}
			minDate={schema.dateConfig?.minDate}
			maxDate={schema.dateConfig?.maxDate}
			{...ariaProps}
		/>
	);
}

function renderMultiselectControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	ariaProps: Record<string, unknown>,
) {
	const TagInputComponent = primitives.TagInput ?? DefaultTagInput;
	const selectedValues = Array.isArray(value)
		? (value as readonly unknown[]).filter(
				(item): item is string => typeof item === "string",
			)
		: [];
	return (
		<TagInputComponent
			id={fieldId}
			value={selectedValues}
			onChange={(newValues: readonly string[]) => onChange(newValues)}
			options={schema.multiSelectConfig?.options}
			maxSelections={schema.multiSelectConfig?.maxSelections}
			creatable={schema.multiSelectConfig?.creatable}
			placeholder={
				schema.multiSelectConfig?.placeholder ??
				schema.placeholder ??
				"Select tags..."
			}
			disabled={schema.disabled}
			{...ariaProps}
		/>
	);
}

function renderInputControl(
	schema: FieldControlProps["schema"],
	value: unknown,
	onChange: FieldControlProps["onChange"],
	primitives: ReturnType<typeof usePrimitives>,
	fieldId: string,
	ariaProps: Record<string, unknown>,
) {
	return (
		<primitives.Input
			id={fieldId}
			type={resolveInputType(schema.type)}
			value={value ?? ""}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				const newVal =
					schema.type === "number"
						? e.target.value === ""
							? ""
							: Number(e.target.value)
						: e.target.value;
				onChange(newVal);
			}}
			placeholder={schema.placeholder}
			disabled={schema.disabled}
			{...ariaProps}
		/>
	);
}

function resolveInputType(fieldType: string): string {
	if (fieldType === "email") return "email";
	if (fieldType === "number") return "number";
	if (fieldType === "password") return "password";
	return "text";
}

function DefaultTagInput({
	placeholder,
}: { readonly placeholder?: string } & Record<string, unknown>) {
	useEffect(() => {
		console.warn(
			"TagInput primitive not provided. Pass a TagInput component via PrimitiveComponents to enable multiselect fields.",
		);
	}, []);
	return (
		<div className="flex items-center min-h-10 px-3 py-2 rounded-md border border-dashed border-muted-foreground/50 bg-muted/50 text-sm text-muted-foreground">
			{placeholder ?? "TagInput not configured"}
		</div>
	);
}

function normalizeOptions(
	options?: readonly (string | SelectOption)[],
): SelectOption[] {
	if (!options) return [];
	return options.map((opt) =>
		typeof opt === "string" ? { label: opt, value: opt } : opt,
	);
}
