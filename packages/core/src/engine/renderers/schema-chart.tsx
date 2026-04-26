import type { ReactNode } from "react";
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
import type { ChartSchema, ChartSeries } from "../types/chart-schema";
import type { SchemaChartProps } from "../types/schema-chart-props";

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

/** Schema-driven chart component backed by Recharts */
export function SchemaChart({
	schema,
	onDataClick,
}: SchemaChartProps): ReactNode {
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
					{renderChart(schema, onDataClick)}
				</ResponsiveContainer>
			) : (
				renderChart(schema, onDataClick)
			)}
		</div>
	);
}

/** Renders the appropriate chart type based on schema.chartType */
function renderChart(
	schema: ChartSchema,
	onDataClick?: (
		dataPoint: Readonly<Record<string, unknown>>,
		seriesIndex: number,
	) => void,
): ReactNode {
	const gridConfig = schema.grid;
	const showGrid =
		gridConfig?.horizontal || gridConfig?.vertical || !gridConfig;

	const sharedProps = {
		data: schema.data as Record<string, unknown>[],
		onClick: onDataClick
			? (payload: Record<string, unknown>) => {
					if (payload && Object.keys(payload).length > 0) {
						onDataClick(payload, 0);
					}
				}
			: undefined,
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
							fill={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
							stackId={s.stackId}
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
							stroke={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
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
							fill={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
							stroke={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
							stackId={s.stackId}
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
							fill={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
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
					>
						{schema.data.map((entry, i) => (
							<Cell
								key={`cell-${String(entry[schema.xAxis?.dataKey ?? "name"] ?? i)}`}
								fill={
									firstSeries?.color ??
									DEFAULT_COLORS[i % DEFAULT_COLORS.length]
								}
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
					>
						{schema.data.map((entry, i) => (
							<Cell
								key={`cell-${String(entry[schema.xAxis?.dataKey ?? "name"] ?? i)}`}
								fill={
									doughSeries?.color ??
									DEFAULT_COLORS[i % DEFAULT_COLORS.length]
								}
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
