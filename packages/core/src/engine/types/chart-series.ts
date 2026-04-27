import type { ChartType } from "./chart-type";

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
