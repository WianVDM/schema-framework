import type { ReadonlyDeep } from "./readonly-deep";

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

/** Deep-immutable axis configuration */
export type ReadonlyChartAxis = ReadonlyDeep<ChartAxis>;
