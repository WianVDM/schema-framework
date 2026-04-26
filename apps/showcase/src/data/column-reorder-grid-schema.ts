import type { GridSchema } from "@my-framework/core";
import { asDataKey, deepFreeze } from "@my-framework/core";

export const columnReorderGridSchema = deepFreeze<GridSchema>({
	title: "Column Reordering",
	description:
		"Drag column headers to reorder. Enable columnReorder in the schema.",
	dataKey: asDataKey("id"),
	columnReorder: true,
	filterable: true,
	striped: true,
	bordered: true,
	columns: [
		{
			key: "id",
			label: "ID",
			type: "text",
			sortable: true,
			width: "80px",
		},
		{
			key: "name",
			label: "Name",
			type: "text",
			sortable: true,
			filterable: true,
		},
		{
			key: "email",
			label: "Email",
			type: "text",
			sortable: true,
			filterable: true,
		},
		{
			key: "department",
			label: "Department",
			type: "text",
			sortable: true,
			filterable: true,
		},
		{
			key: "role",
			label: "Role",
			type: "text",
			sortable: true,
		},
		{
			key: "status",
			label: "Status",
			type: "status",
			statusConfig: {
				variants: {
					active: {
						label: "Active",
						className: "bg-green-100 text-green-800 border-green-300",
					},
					inactive: {
						label: "Inactive",
						className: "bg-gray-100 text-gray-800 border-gray-300",
					},
					pending: {
						label: "Pending",
						className: "bg-yellow-100 text-yellow-800 border-yellow-300",
					},
				},
			},
		},
	],
});
