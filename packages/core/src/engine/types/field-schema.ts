import type { DatePickerConfig } from "./date-picker-config";
import type { FieldCondition } from "./field-condition";
import type { FieldType } from "./field-type";
import type { FileUploadConfig } from "./file-upload-config";
import type { MultiSelectConfig } from "./multi-select-config";
import type { SelectOption } from "./select-option";
import type { ValidationRule } from "./validation-rule";

export interface FieldSchema {
	readonly name: string;
	readonly label: string;
	readonly type: FieldType;
	readonly required?: boolean;
	readonly placeholder?: string;
	readonly defaultValue?: string | number | boolean | readonly string[] | null;
	readonly disabled?: boolean;
	readonly options?: readonly string[] | readonly SelectOption[];
	readonly validation?: readonly ValidationRule[];
	readonly colSpan?: number;
	readonly description?: string;
	readonly visibleWhen?: FieldCondition;
	readonly dependsOn?: readonly string[];
	readonly fileConfig?: FileUploadConfig;
	readonly dateConfig?: DatePickerConfig;
	readonly multiSelectConfig?: MultiSelectConfig;
}
