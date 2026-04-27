import { SchemaGrid, useRealtime } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { REALTIME_GRID_SCHEMA } from "../data/realtime-grid-schema";

export const Route = createFileRoute("/demo-realtime-grid")({
	component: DemoRealtimeGridRoute,
});

type MetricRow = {
	readonly id: string;
	readonly metric: string;
	readonly value: string;
	readonly status: string;
};

const STATUS_VALUES = ["healthy", "warning", "critical"] as const;

function generateMetrics(): readonly MetricRow[] {
	const metrics = [
		"CPU Usage",
		"Memory",
		"Disk I/O",
		"Network In",
		"Network Out",
		"Latency",
		"Throughput",
		"Error Rate",
	];
	return metrics.map((name, idx) => {
		const val = Math.floor(Math.random() * 100);
		const statusIdx = val > 80 ? 2 : val > 50 ? 1 : 0;
		return {
			id: String(idx + 1),
			metric: name,
			value: `${val}%`,
			status: STATUS_VALUES[statusIdx],
		};
	});
}

const REALTIME_CONFIG = {
	enabled: true,
	intervalMs: 5_000,
	staleThresholdMs: 10_000,
	strategy: "polling" as const,
	pauseOnHidden: true,
};

function DemoRealtimeGridRoute() {
	const initialData = useState(generateMetrics)[0];
	const [refreshCount, setRefreshCount] = useState(0);

	const fetcher = useCallback(() => Promise.resolve(generateMetrics()), []);

	const { data, lastRefreshed, refresh } = useRealtime<readonly MetricRow[]>(
		initialData,
		REALTIME_CONFIG,
		fetcher,
	);

	// NOTE: Track refresh count via lastRefreshed changes
	const prevRefreshed = useState(lastRefreshed);
	if (lastRefreshed !== null && lastRefreshed !== prevRefreshed[0]) {
		prevRefreshed[1](lastRefreshed);
		setRefreshCount((c) => c + 1);
	}

	return (
		<div className="max-w-3xl mx-auto space-y-4">
			<div>
				<h2 className="text-xl font-bold">Realtime Grid Demo</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Grid with automatic polling every 5 seconds. A stale indicator appears
					when data hasn't been refreshed within the threshold window.
				</p>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={refresh}
					className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground"
				>
					↻ Manual Refresh
				</button>
				<span className="text-xs text-muted-foreground">
					Refreshes: {refreshCount}
					{lastRefreshed !== null && (
						<> · Last: {new Date(lastRefreshed).toLocaleTimeString()}</>
					)}
				</span>
			</div>

			<div className="border rounded-lg p-4">
				<SchemaGrid schema={REALTIME_GRID_SCHEMA} data={data} />
			</div>
		</div>
	);
}
