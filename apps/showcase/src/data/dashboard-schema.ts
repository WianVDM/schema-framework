import type { DashboardSchema } from "@my-framework/core";
import { deepFreeze } from "@my-framework/core";

export const dashboardSchema = deepFreeze<DashboardSchema>({
	title: "Application Dashboard",
	description: "Multi-panel dashboard with tabs, forms, and data views",
	panelLayout: "tabs",
	panels: [
		{
			id: "overview",
			title: "Overview",
			layout: {
				type: "vbox",
				regions: [
					{
						id: "stats-summary",
						position: "top",
						title: "Quick Stats",
						content: {
							type: "form",
							schema: {
								title: "Search Records",
								fields: [
									{
										name: "search",
										label: "Search",
										type: "text",
										placeholder: "Search records...",
									},
									{
										name: "category",
										label: "Category",
										type: "select",
										options: [
											{ label: "All", value: "all" },
											{ label: "Users", value: "users" },
											{ label: "Orders", value: "orders" },
											{ label: "Products", value: "products" },
										],
									},
								],
								submitLabel: "Search",
							},
						},
					},
					{
						id: "quick-form",
						position: "bottom",
						title: "Quick Entry",
						content: {
							type: "form",
							schema: {
								title: "Quick Entry Form",
								fields: [
									{
										name: "title",
										label: "Title",
										type: "text",
										placeholder: "Enter title...",
									},
									{
										name: "priority",
										label: "Priority",
										type: "select",
										options: [
											{ label: "Low", value: "low" },
											{ label: "Medium", value: "medium" },
											{ label: "High", value: "high" },
										],
									},
								],
								submitLabel: "Add",
							},
						},
					},
				],
				boxConfig: { gap: 16 },
			},
		},
		{
			id: "users-panel",
			title: "Users",
			layout: {
				type: "border",
				regions: [
					{
						id: "user-filters",
						position: "north",
						title: "Filters",
						size: 20,
						collapsible: true,
						content: {
							type: "form",
							schema: {
								title: "User Filters",
								fields: [
									{
										name: "role",
										label: "Role",
										type: "select",
										options: [
											{ label: "All Roles", value: "all" },
											{ label: "Admin", value: "admin" },
											{ label: "Editor", value: "editor" },
											{ label: "Viewer", value: "viewer" },
										],
									},
								],
								submitLabel: "Apply",
							},
						},
					},
					{
						id: "user-grid",
						position: "center",
						title: "User List",
						scrollable: true,
						content: {
							type: "form",
							schema: {
								title: "User Management",
								fields: [
									{ name: "name", label: "Name", type: "text" },
									{ name: "email", label: "Email", type: "email" },
								],
								submitLabel: "Save",
							},
						},
					},
				],
			},
		},
		{
			id: "settings-panel",
			title: "Settings",
			layout: {
				type: "card",
				regions: [
					{
						id: "settings-form",
						position: "card",
						title: "Dashboard Settings",
						content: {
							type: "form",
							schema: {
								title: "Preferences",
								fields: [
									{
										name: "theme",
										label: "Theme",
										type: "select",
										options: [
											{ label: "Light", value: "light" },
											{ label: "Dark", value: "dark" },
											{ label: "System", value: "system" },
										],
									},
									{
										name: "refreshRate",
										label: "Refresh Rate (seconds)",
										type: "text",
									},
									{
										name: "notifications",
										label: "Enable notifications",
										type: "checkbox",
									},
								],
								submitLabel: "Save Settings",
							},
						},
					},
				],
			},
		},
	],
});
