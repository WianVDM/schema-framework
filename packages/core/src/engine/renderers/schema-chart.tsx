import { type ReactNode, useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { ChartSchema } from "../types/chart-schema";
import type { ChartSeries } from "../types/chart-series";
import type { SchemaChartProps } from "../types/schema-chart-props";
import { useTheme } from "./use-theme";

/** NOTE: Default color palette for chart series without explicit colors */
const DEFAULT_COLORS = [
	"#3b82f6",
	"#ef4444",
	"#22c55e",
	"#f59e0b",
	"#8b5cf6",
	"#06b6d4",
	"#ec4899",
	"#14b8a6",
] as const;

/** Resolves a color for a series by index, preferring series color then palette */
function resolveColor(
	series: ChartSeries,
	index: number,
	palette: readonly string[],
): string {
	return series.color ?? palette[index % palette.length];
}

/** NOTE: Type-safe wrapper for Recharts onClick handlers — normalises varied event payloads */
function createSeriesClickHandler(
	onDataClick:
		| ((
				dataPoint: Readonly<Record<string, unknown>>,
				seriesIndex: number,
		  ) => void)
		| undefined,
	seriesIndex: number,
): ((data: unknown) => void) | undefined {
	if (onDataClick === undefined) return undefined;
	return (data: unknown) => {
		if (data != null && typeof data === "object") {
			onDataClick(data as Record<string, unknown>, seriesIndex);
		}
	};
}

/** Schema-driven chart component backed by Recharts */
export function SchemaChart({
	schema,
	onDataClick,
}: SchemaChartProps): ReactNode {
	const theme = useTheme();

	// NOTE: Merge theme chart colors with defaults — theme overrides first entries; guard against empty array
	const colors = useMemo(
		() =>
			theme.chartColors && theme.chartColors.length > 0
				? theme.chartColors
				: DEFAULT_COLORS,
		[theme.chartColors],
	);

	return (
		<div
			className="schema-chart"
			data-testid="schema-chart"
			style={{
				width: schema.width ?? "100%",
				height: schema.height ?? "300px",
			}}
		>
			{schema.title && (
				<h3 className="text-lg font-semibold mb-2">{schema.title}</h3>
			)}
			{schema.responsive ? (
				<ResponsiveContainer width="100%" height="100%">
					{renderChart(schema, onDataClick, colors)}
				</ResponsiveContainer>
			) : (
				renderChart(schema, onDataClick, colors)
			)}
		</div>
	);
}

/** Renders the appropriate chart type based on schema.chartType */
function renderChart(
	schema: ChartSchema,
	onDataClick:
		| ((
				dataPoint: Readonly<Record<string, unknown>>,
				seriesIndex: number,
		  ) => void)
		| undefined,
	colors: readonly string[],
): ReactNode {
	const gridConfig = schema.grid;
	const showGrid =
		gridConfig?.horizontal || gridConfig?.vertical || !gridConfig;

	const sharedProps = {
		data: schema.data as Record<string, unknown>[],
	};

	switch (schema.chartType) {
		case "bar":
			return (
				<BarChart {...sharedProps}>
					{showGrid && (
						<CartesianGrid
							strokeDasharray={gridConfig?.strokeDasharray ?? "3 3"}
							vertical={gridConfig?.vertical ?? false}
							horizontal={gridConfig?.horizontal ?? true}
						/>
					)}
					<XAxis
						dataKey={schema.xAxis?.dataKey}
						hide={!schema.xAxis?.visible}
						label={
							schema.xAxis?.label
								? { value: schema.xAxis.label, position: "insideBottom" }
								: undefined
						}
					/>
					<YAxis
						hide={!schema.yAxis?.visible}
						allowDecimals={schema.yAxis?.allowDecimals}
						label={
							schema.yAxis?.label
								? {
										value: schema.yAxis.label,
										angle: -90,
										position: "insideLeft",
									}
								: undefined
						}
					/>
					{schema.tooltip?.enabled !== false && (
						<Tooltip shared={schema.tooltip?.shared} />
					)}
					{schema.legend?.visible !== false && <Legend />}
					{schema.series.map((s, i) => (
						<Bar
							key={s.dataKey}
							dataKey={s.dataKey}
							name={s.name ?? s.dataKey}
							fill={resolveColor(s, i, colors)}
							stackId={s.stackId}
							onClick={createSeriesClickHandler(onDataClick, i)}
						/>
					))}
				</BarChart>
			);

		case "line":
			return (
				<LineChart {...sharedProps}>
					{showGrid && (
						<CartesianGrid
							strokeDasharray={gridConfig?.strokeDasharray ?? "3 3"}
							vertical={gridConfig?.vertical ?? false}
							horizontal={gridConfig?.horizontal ?? true}
						/>
					)}
					<XAxis
						dataKey={schema.xAxis?.dataKey}
						hide={!schema.xAxis?.visible}
					/>
					<YAxis hide={!schema.yAxis?.visible} />
					{schema.tooltip?.enabled !== false && (
						<Tooltip shared={schema.tooltip?.shared} />
					)}
					{schema.legend?.visible !== false && <Legend />}
					{schema.series.map((s, i) => (
						<Line
							key={s.dataKey}
							type="monotone"
							dataKey={s.dataKey}
							name={s.name ?? s.dataKey}
							stroke={resolveColor(s, i, colors)}
							onClick={createSeriesClickHandler(onDataClick, i)}
						/>
					))}
				</LineChart>
			);

		case "area":
			return (
				<AreaChart {...sharedProps}>
					{showGrid && (
						<CartesianGrid
							strokeDasharray={gridConfig?.strokeDasharray ?? "3 3"}
							vertical={gridConfig?.vertical ?? false}
							horizontal={gridConfig?.horizontal ?? true}
						/>
					)}
					<XAxis
						dataKey={schema.xAxis?.dataKey}
						hide={!schema.xAxis?.visible}
					/>
					<YAxis hide={!schema.yAxis?.visible} />
					{schema.tooltip?.enabled !== false && (
						<Tooltip shared={schema.tooltip?.shared} />
					)}
					{schema.legend?.visible !== false && <Legend />}
					{schema.series.map((s, i) => (
						<Area
							key={s.dataKey}
							type="monotone"
							dataKey={s.dataKey}
							name={s.name ?? s.dataKey}
							fill={resolveColor(s, i, colors)}
							stroke={resolveColor(s, i, colors)}
							stackId={s.stackId}
							onClick={createSeriesClickHandler(onDataClick, i)}
						/>
					))}
				</AreaChart>
			);

		case "scatter":
			return (
				<ScatterChart>
					{showGrid && (
						<CartesianGrid
							strokeDasharray={gridConfig?.strokeDasharray ?? "3 3"}
						/>
					)}
					<XAxis
						dataKey={schema.series[0]?.dataKey ?? "x"}
						hide={!schema.xAxis?.visible}
					/>
					<YAxis
						dataKey={schema.series[1]?.dataKey ?? "y"}
						hide={!schema.yAxis?.visible}
					/>
					{schema.tooltip?.enabled !== false && <Tooltip />}
					{schema.legend?.visible !== false && <Legend />}
					{schema.series.map((s, i) => (
						<Scatter
							key={s.dataKey}
							name={s.name ?? s.dataKey}
							data={schema.data as Record<string, unknown>[]}
							fill={resolveColor(s, i, colors)}
							onClick={createSeriesClickHandler(onDataClick, i)}
						/>
					))}
				</ScatterChart>
			);

		case "pie": {
			const firstSeries: ChartSeries | undefined = schema.series[0];
			return (
				<PieChart>
					{schema.tooltip?.enabled !== false && <Tooltip />}
					{schema.legend?.visible !== false && <Legend />}
					<Pie
						data={schema.data as Record<string, unknown>[]}
						dataKey={firstSeries?.dataKey ?? "value"}
						nameKey={schema.xAxis?.dataKey ?? "name"}
						cx="50%"
						cy="50%"
						outerRadius={80}
						onClick={
							createSeriesClickHandler(onDataClick, 0) as (
								data: unknown,
								index: number,
								e: React.MouseEvent,
							) => void
						}
					>
						{schema.data.map((entry, i) => (
							<Cell
								key={`cell-${String(entry[schema.xAxis?.dataKey ?? "name"] ?? i)}`}
								fill={firstSeries?.color ?? colors[i % colors.length]}
							/>
						))}
					</Pie>
				</PieChart>
			);
		}

		case "doughnut": {
			const doughSeries: ChartSeries | undefined = schema.series[0];
			return (
				<PieChart>
					{schema.tooltip?.enabled !== false && <Tooltip />}
					{schema.legend?.visible !== false && <Legend />}
					<Pie
						data={schema.data as Record<string, unknown>[]}
						dataKey={doughSeries?.dataKey ?? "value"}
						nameKey={schema.xAxis?.dataKey ?? "name"}
						cx="50%"
						cy="50%"
						innerRadius={50}
						outerRadius={80}
						onClick={
							createSeriesClickHandler(onDataClick, 0) as (
								data: unknown,
								index: number,
								e: React.MouseEvent,
							) => void
						}
					>
						{schema.data.map((entry, i) => (
							<Cell
								key={`cell-${String(entry[schema.xAxis?.dataKey ?? "name"] ?? i)}`}
								fill={doughSeries?.color ?? colors[i % colors.length]}
							/>
						))}
					</Pie>
				</PieChart>
			);
		}

		default:
			return (
				<p className="text-sm text-muted-foreground">
					Unsupported chart type: {schema.chartType}
				</p>
			);
	}
}
