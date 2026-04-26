// Layer 2: Engine — Schema types, validators, context, and renderers

export {
	CustomComponentProvider,
	useCustomComponents,
} from "./context/custom-component-context";
export {
	LayoutPrimitivesProvider,
	useLayoutPrimitives,
} from "./context/layout-primitives-context";
// Context
export {
	PrimitivesProvider,
	usePrimitives,
} from "./context/primitives-context";
export {
	applyResponsiveClasses,
	asDataKey,
	deepFreeze,
	isCustomContent,
	isFormContent,
	isGridContent,
	isLayoutContent,
	isTabsContent,
	isWizardContent,
} from "./helpers";
// Helpers
export { resolveMessage } from "./helpers/i18n";
// Renderers
export { ContentRenderer } from "./renderers/content-renderer";
export { FieldRenderer } from "./renderers/field-renderer";
export { GridColumnHeader } from "./renderers/grid-column-header";
export { GridPagination } from "./renderers/grid-pagination";
export { GridToolbar } from "./renderers/grid-toolbar";
export { SchemaDashboard } from "./renderers/schema-dashboard";
export { SchemaForm } from "./renderers/schema-form";
export { SchemaGrid } from "./renderers/schema-grid";
export { SchemaLayout } from "./renderers/schema-layout";
export { SchemaPanel } from "./renderers/schema-panel";
export { SchemaWizard } from "./renderers/schema-wizard";
export { StackLayoutRenderer } from "./renderers/stack-layout";
export { ThemeProvider } from "./renderers/theme-provider";
export { useTheme } from "./renderers/use-theme";
// Types (one-export-per-file via barrel)
export type {
	// Layout types
	BorderPosition,
	Brand,
	CellValueRenderer,
	ColumnFilterConfig,
	ConditionOperator,
	ContentRendererProps,
	ContentSchema,
	CustomComponentRegistry,
	DashboardPanel,
	DashboardRendererProps,
	DashboardSchema,
	DataKey,
	DatePickerConfig,
	DeepFrozen,
	FieldCondition,
	FieldId,
	FieldRendererProps,
	FieldSchema,
	FieldType,
	FileUploadConfig,
	FormSchema,
	FormSubmitHandler,
	GridColumnSchema,
	GridSchema,
	I18nConfig,
	LayoutPrimitiveComponents,
	LayoutRegion,
	LayoutRendererProps,
	LayoutSchema,
	LayoutType,
	MultiSelectConfig,
	PaginationConfig,
	PrimitiveComponents,
	ReadonlyDeep,
	ResponsiveConfig,
	ReviewStepConfig,
	RuntimeValidationRule,
	SchemaFormProps,
	SchemaGridProps,
	SchemaWizardProps,
	SelectionStore,
	SelectOption,
	ServerPaginationConfig,
	StackConfig,
	StatusConfig,
	StepIndicatorProps,
	TabItem,
	TabSchema,
	TabsRendererProps,
	ThemeConfig,
	ValidationRule,
	ValidationType,
	WizardNavigationConfig,
	WizardSchema,
	WizardStep,
} from "./types";
export type { ValidationResult } from "./validators";
// Validators (one-export-per-file via barrel)
export {
	BORDER_DEFAULT_SIZES,
	borderLayoutSchema,
	evaluateCondition,
	fieldSchemaValidator,
	formSchemaValidator,
	gridColumnSchemaValidator,
	gridSchemaValidator,
	validateBorderLayout,
	validateContentSchema,
	validateDashboardSchema,
	validateFieldSchema,
	validateFieldValue,
	validateFormSchema,
	validateGridSchema,
	validateLayoutSchema,
	// Layout validators
	validateResponsiveConfig,
	validateStackLayout,
	validateTabSchema,
	validateWizardSchema,
	wizardSchemaValidator,
} from "./validators";
