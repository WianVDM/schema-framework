import type { LayoutSchema } from "@my-framework/core";
import { asDataKey, deepFreeze } from "@my-framework/core";

export const borderLayoutSchema = deepFreeze<LayoutSchema>({
	type: "border",
	regions: [
		{
			id: "north-header",
			position: "north",
			title: "Dashboard Header",
			size: 15,
			collapsible: true,
			content: {
				type: "form",
				schema: {
					title: "Quick Search",
					fields: [
						{
							name: "search",
							label: "Search",
							type: "text",
							placeholder: "Search dashboard...",
						},
						{
							name: "filter",
							label: "Filter",
							type: "select",
							options: [
								{ label: "All", value: "all" },
								{ label: "Active", value: "active" },
								{ label: "Archived", value: "archived" },
							],
						},
					],
					submitLabel: "Search",
				},
			},
		},
		{
			id: "west-nav",
			position: "west",
			title: "Navigation",
			size: 20,
			collapsible: true,
			scrollable: true,
			responsive: { collapsedBelow: 768 },
			content: {
				type: "form",
				schema: {
					title: "Filters",
					fields: [
						{
							name: "status",
							label: "Status",
							type: "select",
							options: [
								{ label: "All Statuses", value: "all" },
								{ label: "Open", value: "open" },
								{ label: "Closed", value: "closed" },
							],
						},
						{
							name: "priority",
							label: "Priority",
							type: "select",
							options: [
								{ label: "Any Priority", value: "any" },
								{ label: "High", value: "high" },
								{ label: "Medium", value: "medium" },
								{ label: "Low", value: "low" },
							],
						},
						{ name: "dateFrom", label: "Date From", type: "date" },
						{ name: "dateTo", label: "Date To", type: "date" },
					],
					submitLabel: "Apply Filters",
				},
			},
		},
		{
			id: "center-main",
			position: "center",
			title: "Main Content",
			scrollable: true,
			content: {
				type: "grid",
				schema: {
					dataKey: asDataKey("id"),
					columns: [
						{ key: "id", label: "ID", sortable: true },
						{ key: "name", label: "Name", sortable: true, filterable: true },
						{ key: "status", label: "Status", sortable: true },
						{ key: "priority", label: "Priority", sortable: true },
					],
				},
			},
		},
		{
			id: "east-details",
			position: "east",
			title: "Details",
			size: 20,
			collapsible: true,
			responsive: { collapsedBelow: 768 },
			content: {
				type: "form",
				schema: {
					title: "Item Details",
					fields: [
						{ name: "itemId", label: "Item ID", type: "text" },
						{ name: "description", label: "Description", type: "textarea" },
						{ name: "assignee", label: "Assignee", type: "text" },
					],
					submitLabel: "Update",
				},
			},
		},
		{
			id: "south-footer",
			position: "south",
			title: "Activity Log",
			size: 20,
			collapsible: true,
			content: {
				type: "form",
				schema: {
					title: "Add Note",
					fields: [
						{
							name: "note",
							label: "Note",
							type: "textarea",
							placeholder: "Add a note...",
						},
					],
					submitLabel: "Add Note",
				},
			},
		},
	],
});
