import { SchemaChart } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { REVENUE_CHART_SCHEMA } from "../data/chart-schema";

export const Route = createFileRoute("/demo-chart")({
	component: DemoChartRoute,
});

function DemoChartRoute() {
	const [clickedPoint, setClickedPoint] = useState<string>("");

	const handleDataClick = (
		dataPoint: Readonly<Record<string, unknown>>,
		seriesIndex: number,
	) => {
		setClickedPoint(`Series ${seriesIndex}: ${JSON.stringify(dataPoint)}`);
	};

	return (
		<div className="max-w-2xl mx-auto space-y-4">
			<div>
				<h2 className="text-xl font-bold">SchemaChart Demo</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Bar chart with multiple series, legend, tooltip, and grid lines.
				</p>
			</div>

			<div className="border rounded-lg p-4">
				<SchemaChart
					schema={REVENUE_CHART_SCHEMA}
					onDataClick={handleDataClick}
				/>
			</div>

			{clickedPoint && (
				<div className="border rounded-lg p-3 bg-muted/50">
					<p className="text-sm font-mono">{clickedPoint}</p>
				</div>
			)}
		</div>
	);
}
