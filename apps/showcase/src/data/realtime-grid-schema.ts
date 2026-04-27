import { asDataKey, type GridSchema } from "@my-framework/core";

/** Grid schema demonstrating realtime polling configuration */
export const REALTIME_GRID_SCHEMA: GridSchema = {
	dataKey: asDataKey("id"),
	columns: [
		{ key: "id", label: "ID", type: "text", sortable: true, width: "80px" },
		{
			key: "metric",
			label: "Metric",
			type: "text",
			sortable: true,
		},
		{
			key: "value",
			label: "Value",
			type: "text",
			sortable: true,
		},
		{
			key: "status",
			label: "Status",
			type: "status",
			statusConfig: {
				variants: {
					healthy: {
						label: "Healthy",
						className: "bg-green-100 text-green-800",
					},
					warning: {
						label: "Warning",
						className: "bg-yellow-100 text-yellow-800",
					},
					critical: { label: "Critical", className: "bg-red-100 text-red-800" },
				},
			},
		},
	],
	realtime: {
		enabled: true,
		intervalMs: 5_000,
		staleThresholdMs: 10_000,
		strategy: "polling",
		pauseOnHidden: true,
	},
	title: "Realtime Metrics",
	description:
		"Grid with automatic polling every 5 seconds. Data becomes stale after 10s without refresh.",
	pagination: { pageSize: 5, pageSizeOptions: [5, 10, 20] },
	striped: true,
	hoverable: true,
	bordered: true,
};
