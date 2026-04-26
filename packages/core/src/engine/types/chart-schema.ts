/** Supported chart types */
export type ChartType =
	| "line"
	| "bar"
	| "pie"
	| "area"
	| "scatter"
	| "doughnut";

/** Data point for chart series */
export interface ChartDataPoint {
	readonly [key: string]: string | number | boolean | undefined;
}

/** A single data series in a chart */
export interface ChartSeries {
	/** Key in data objects to use for values */
	readonly dataKey: string;
	/** Display name for this series */
	readonly name?: string;
	/** CSS color for this series */
	readonly color?: string;
	/** Override chart type for this series (e.g., combo charts) */
	readonly type?: ChartType;
	/** Stack ID for stacked bar/area charts */
	readonly stackId?: string;
}

/** Axis configuration */
export interface ChartAxis {
	/** Show axis line and ticks */
	readonly visible?: boolean;
	/** Axis label */
	readonly label?: string;
	/** Data key for category axes */
	readonly dataKey?: string;
	/** Tick formatting function name */
	readonly tickFormat?: string;
	/** Minimum value */
	readonly min?: number;
	/** Maximum value */
	readonly max?: number;
	/** Allow decimal values on axis */
	readonly allowDecimals?: boolean;
}

/** Legend configuration */
export interface ChartLegend {
	readonly visible?: boolean;
	readonly position?: "top" | "bottom" | "left" | "right";
	readonly align?: "left" | "center" | "right";
}

/** Tooltip configuration */
export interface ChartTooltip {
	readonly enabled?: boolean;
	/** Show tooltip for each series separately */
	readonly shared?: boolean;
	/** Custom tooltip formatter function name */
	readonly formatter?: string;
}

/** Grid lines configuration */
export interface ChartGrid {
	readonly horizontal?: boolean;
	readonly vertical?: boolean;
	/** Dash array for grid lines */
	readonly strokeDasharray?: string;
}

/** Schema definition for a chart component */
export interface ChartSchema {
	/** Chart type */
	readonly chartType: ChartType;
	/** Data array */
	readonly data: readonly ChartDataPoint[];
	/** Series definitions */
	readonly series: readonly ChartSeries[];
	/** X-axis configuration */
	readonly xAxis?: ChartAxis;
	/** Y-axis configuration */
	readonly yAxis?: ChartAxis;
	/** Legend configuration */
	readonly legend?: ChartLegend;
	/** Tooltip configuration */
	readonly tooltip?: ChartTooltip;
	/** Grid configuration */
	readonly grid?: ChartGrid;
	/** Chart title */
	readonly title?: string;
	/** Fixed width (CSS value) */
	readonly width?: string;
	/** Fixed height (CSS value) */
	readonly height?: string;
	/** Responsive container */
	readonly responsive?: boolean;
}
