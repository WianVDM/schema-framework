import { z } from "zod";
import type { ValidationResult } from "./shared-schemas";
import { formatZodIssue } from "./shared-schemas";

const chartDataPointSchema = z.record(
	z.union([z.string(), z.number(), z.boolean(), z.undefined()]),
);

const chartSeriesSchema = z
	.object({
		dataKey: z.string().min(1, "Series dataKey is required"),
		name: z.string().optional(),
		color: z.string().optional(),
		type: z
			.enum(["line", "bar", "pie", "area", "scatter", "doughnut"])
			.optional(),
		stackId: z.string().optional(),
	})
	.strict();

const chartAxisSchema = z
	.object({
		visible: z.boolean().optional(),
		label: z.string().optional(),
		dataKey: z.string().optional(),
		tickFormat: z.string().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		allowDecimals: z.boolean().optional(),
	})
	.strict();

const chartLegendSchema = z
	.object({
		visible: z.boolean().optional(),
		position: z.enum(["top", "bottom", "left", "right"]).optional(),
		align: z.enum(["left", "center", "right"]).optional(),
	})
	.strict();

const chartTooltipSchema = z
	.object({
		enabled: z.boolean().optional(),
		shared: z.boolean().optional(),
		formatter: z.string().optional(),
	})
	.strict();

const chartGridSchema = z
	.object({
		horizontal: z.boolean().optional(),
		vertical: z.boolean().optional(),
		strokeDasharray: z.string().optional(),
	})
	.strict();

export const chartSchemaValidator = z
	.object({
		chartType: z.enum(["line", "bar", "pie", "area", "scatter", "doughnut"]),
		data: z
			.array(chartDataPointSchema)
			.min(1, "Chart must have at least one data point"),
		series: z
			.array(chartSeriesSchema)
			.min(1, "Chart must have at least one series"),
		xAxis: chartAxisSchema.optional(),
		yAxis: chartAxisSchema.optional(),
		legend: chartLegendSchema.optional(),
		tooltip: chartTooltipSchema.optional(),
		grid: chartGridSchema.optional(),
		title: z.string().optional(),
		width: z.string().optional(),
		height: z.string().optional(),
		responsive: z.boolean().optional(),
	})
	.strict();

export function validateChartSchema(data: unknown): ValidationResult {
	const result = chartSchemaValidator.safeParse(data);
	if (result.success) {
		return { success: true, errors: [] };
	}
	return {
		success: false,
		errors: result.error.issues.map(formatZodIssue),
	};
}
