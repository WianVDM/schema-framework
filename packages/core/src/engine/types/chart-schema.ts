import type { ChartAxis } from "./chart-axis";
import type { ChartDataPoint } from "./chart-data-point";
import type { ChartGrid } from "./chart-grid";
import type { ChartLegend } from "./chart-legend";
import type { ChartSeries } from "./chart-series";
import type { ChartTooltip } from "./chart-tooltip";
import type { ChartType } from "./chart-type";
import type { ReadonlyDeep } from "./readonly-deep";

/** Schema definition for a chart component */
export interface ChartSchema {
	/** Chart type */
	readonly chartType: ChartType;
	/** Data array */
	readonly data: ReadonlyArray<ReadonlyDeep<ChartDataPoint>>;
	/** Series definitions */
	readonly series: ReadonlyArray<ReadonlyDeep<ChartSeries>>;
	/** X-axis configuration */
	readonly xAxis?: ReadonlyDeep<ChartAxis>;
	/** Y-axis configuration */
	readonly yAxis?: ReadonlyDeep<ChartAxis>;
	/** Legend configuration */
	readonly legend?: ReadonlyDeep<ChartLegend>;
	/** Tooltip configuration */
	readonly tooltip?: ReadonlyDeep<ChartTooltip>;
	/** Grid configuration */
	readonly grid?: ReadonlyDeep<ChartGrid>;
	/** Chart title */
	readonly title?: string;
	/** Fixed width (CSS value) */
	readonly width?: string;
	/** Fixed height (CSS value) */
	readonly height?: string;
	/** Responsive container */
	readonly responsive?: boolean;
}
