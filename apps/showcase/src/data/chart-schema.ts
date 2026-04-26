import type { ChartSchema } from "@my-framework/core";
import { deepFreeze } from "@my-framework/core";

/** NOTE: Monthly revenue chart for demo purposes */
export const REVENUE_CHART_SCHEMA: ChartSchema = deepFreeze({
	chartType: "bar",
	title: "Monthly Revenue",
	responsive: true,
	height: "350px",
	xAxis: {
		visible: true,
		dataKey: "month",
		label: "Month",
	},
	yAxis: {
		visible: true,
		label: "Revenue ($)",
		allowDecimals: false,
	},
	legend: {
		visible: true,
		position: "top",
	},
	tooltip: {
		enabled: true,
		shared: true,
	},
	grid: {
		horizontal: true,
		vertical: false,
		strokeDasharray: "3 3",
	},
	series: [
		{ dataKey: "revenue", name: "Revenue", color: "#3b82f6" },
		{ dataKey: "expenses", name: "Expenses", color: "#ef4444" },
		{ dataKey: "profit", name: "Profit", color: "#22c55e" },
	],
	data: [
		{ month: "Jan", revenue: 4000, expenses: 2400, profit: 1600 },
		{ month: "Feb", revenue: 3000, expenses: 1398, profit: 1602 },
		{ month: "Mar", revenue: 5000, expenses: 3800, profit: 1200 },
		{ month: "Apr", revenue: 4780, expenses: 3908, profit: 872 },
		{ month: "May", revenue: 5890, expenses: 4800, profit: 1090 },
		{ month: "Jun", revenue: 6390, expenses: 3800, profit: 2590 },
	],
});
