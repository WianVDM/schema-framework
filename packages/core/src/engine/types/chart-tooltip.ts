/** Tooltip configuration */
export interface ChartTooltip {
	readonly enabled?: boolean;
	/** Show tooltip for each series separately */
	readonly shared?: boolean;
	/** Custom tooltip formatter function name */
	readonly formatter?: string;
}
