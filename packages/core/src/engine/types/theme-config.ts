export interface ThemeConfig {
	readonly classes?: Partial<{
		readonly grid: string;
		readonly gridRow: string;
		readonly gridCell: string;
		readonly gridHeader: string;
		readonly form: string;
		readonly formField: string;
		readonly submitButton: string;
		readonly cancelButton: string;
		readonly pagination: string;
		readonly toolbar: string;
	}>;
	/** NOTE: Color palette for chart series — overrides DEFAULT_COLORS in SchemaChart */
	readonly chartColors?: readonly string[];
}
