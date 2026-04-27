import type { ChartSchema } from "./chart-schema";

export interface SchemaChartProps {
	readonly schema: ChartSchema;
	/** Fired when a data point is clicked */
	readonly onDataClick?: (
		dataPoint: Readonly<Record<string, unknown>>,
		seriesIndex: number,
	) => void;
}
