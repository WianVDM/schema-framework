import type { GridSchema } from "@my-framework/core";
import { asDataKey, deepFreeze } from "@my-framework/core";

export const virtualGridSchema = deepFreeze<GridSchema>({
	title: "Virtual Scroll Demo",
	description:
		"10,000 rows rendered with virtual scrolling. Only visible rows are mounted in the DOM.",
	columns: [
		{ key: "id", label: "ID", type: "number", sortable: true, width: "80px" },
		{
			key: "name",
			label: "Name",
			sortable: true,
			filterable: true,
			resizable: true,
		},
		{
			key: "email",
			label: "Email",
			sortable: true,
			filterable: true,
			resizable: true,
		},
		{
			key: "role",
			label: "Role",
			type: "status",
			sortable: true,
			filterable: true,
			statusConfig: {
				variants: {
					admin: { label: "Admin", className: "bg-blue-100 text-blue-800" },
					editor: { label: "Editor", className: "bg-green-100 text-green-800" },
					viewer: { label: "Viewer", className: "bg-gray-100 text-gray-800" },
				},
			},
		},
		{
			key: "active",
			label: "Active",
			type: "boolean",
			width: "80px",
			align: "center",
		},
	],
	dataKey: asDataKey("id"),
	striped: true,
	hoverable: true,
	emptyMessage: "No data found.",
	filterable: true,
	resizable: true,
	virtualScroll: true,
});
