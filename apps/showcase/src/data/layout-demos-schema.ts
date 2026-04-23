import type { LayoutSchema } from "@my-framework/core";
import { asDataKey, deepFreeze } from "@my-framework/core";

export const accordionLayoutSchema = deepFreeze<LayoutSchema>({
	type: "accordion",
	accordionConfig: {
		mode: "single" as const,
		collapsible: true,
		defaultOpen: "personal-info",
	},
	regions: [
		{
			id: "personal-info",
			position: "section",
			title: "Personal Information",
			content: {
				type: "form",
				schema: {
					title: "Personal Details",
					fields: [
						{
							name: "firstName",
							label: "First Name",
							type: "text",
							placeholder: "Enter first name",
						},
						{
							name: "lastName",
							label: "Last Name",
							type: "text",
							placeholder: "Enter last name",
						},
						{
							name: "email",
							label: "Email",
							type: "email",
							placeholder: "Enter email",
						},
					],
					submitLabel: "Save",
				},
			},
		},
		{
			id: "address",
			position: "section",
			title: "Address",
			content: {
				type: "form",
				schema: {
					title: "Address Details",
					fields: [
						{
							name: "street",
							label: "Street",
							type: "text",
							placeholder: "Enter street address",
						},
						{
							name: "city",
							label: "City",
							type: "text",
							placeholder: "Enter city",
						},
						{
							name: "zipCode",
							label: "Zip Code",
							type: "text",
							placeholder: "Enter zip code",
						},
					],
					submitLabel: "Save",
				},
			},
		},
		{
			id: "preferences",
			position: "section",
			title: "Preferences",
			content: {
				type: "form",
				schema: {
					title: "User Preferences",
					fields: [
						{
							name: "newsletter",
							label: "Subscribe to newsletter",
							type: "checkbox",
						},
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
					],
					submitLabel: "Save Preferences",
				},
			},
		},
	],
});

export const cardLayoutSchema = deepFreeze<LayoutSchema>({
	type: "card",
	cardGridConfig: {
		columns: { sm: 1, md: 2, lg: 3 },
		gap: "1.5rem",
	},
	regions: [
		{
			id: "card-orders",
			position: "card",
			title: "Recent Orders",
			content: {
				type: "grid",
				schema: {
					dataKey: asDataKey("id"),
					columns: [
						{ key: "id", label: "Order ID", sortable: true },
						{ key: "date", label: "Date", sortable: true },
						{ key: "total", label: "Total", sortable: true },
					],
				},
			},
		},
		{
			id: "card-profile",
			position: "card",
			title: "Profile",
			content: {
				type: "form",
				schema: {
					title: "Edit Profile",
					fields: [
						{ name: "name", label: "Name", type: "text" },
						{ name: "email", label: "Email", type: "email" },
					],
					submitLabel: "Update",
				},
			},
		},
		{
			id: "card-settings",
			position: "card",
			title: "Settings",
			content: {
				type: "form",
				schema: {
					title: "App Settings",
					fields: [
						{
							name: "notifications",
							label: "Enable notifications",
							type: "checkbox",
						},
						{
							name: "language",
							label: "Language",
							type: "select",
							options: [
								{ label: "English", value: "en" },
								{ label: "Spanish", value: "es" },
								{ label: "French", value: "fr" },
							],
						},
					],
					submitLabel: "Save",
				},
			},
		},
	],
});

export const hboxLayoutSchema = deepFreeze<LayoutSchema>({
	type: "hbox",
	boxConfig: {
		gap: "1rem",
		align: "stretch",
	},
	regions: [
		{
			id: "hbox-sidebar",
			position: "left",
			title: "Sidebar",
			size: 250,
			content: {
				type: "form",
				schema: {
					title: "Filters",
					fields: [
						{
							name: "category",
							label: "Category",
							type: "select",
							options: [
								{ label: "All", value: "all" },
								{ label: "Electronics", value: "electronics" },
								{ label: "Clothing", value: "clothing" },
							],
						},
						{
							name: "minPrice",
							label: "Min Price",
							type: "text",
							placeholder: "$0",
						},
						{
							name: "maxPrice",
							label: "Max Price",
							type: "text",
							placeholder: "$1000",
						},
					],
					submitLabel: "Apply",
				},
			},
		},
		{
			id: "hbox-main",
			position: "center",
			title: "Products",
			content: {
				type: "grid",
				schema: {
					dataKey: asDataKey("id"),
					columns: [
						{ key: "id", label: "ID", sortable: true },
						{ key: "name", label: "Product", sortable: true, filterable: true },
						{ key: "price", label: "Price", sortable: true },
						{ key: "stock", label: "Stock", sortable: true },
					],
				},
			},
		},
	],
});

export const vboxLayoutSchema = deepFreeze<LayoutSchema>({
	type: "vbox",
	boxConfig: {
		gap: "1rem",
	},
	regions: [
		{
			id: "vbox-header",
			position: "top",
			title: "Header",
			content: {
				type: "form",
				schema: {
					title: "Search",
					fields: [
						{
							name: "query",
							label: "Search",
							type: "text",
							placeholder: "Search items...",
						},
					],
					submitLabel: "Search",
				},
			},
		},
		{
			id: "vbox-content",
			position: "middle",
			title: "Results",
			content: {
				type: "grid",
				schema: {
					dataKey: asDataKey("id"),
					columns: [
						{ key: "id", label: "ID", sortable: true },
						{ key: "name", label: "Name", sortable: true, filterable: true },
						{ key: "status", label: "Status", sortable: true },
					],
				},
			},
		},
		{
			id: "vbox-footer",
			position: "bottom",
			title: "Details",
			content: {
				type: "form",
				schema: {
					title: "Quick Edit",
					fields: [
						{
							name: "notes",
							label: "Notes",
							type: "textarea",
							placeholder: "Add notes...",
						},
					],
					submitLabel: "Save",
				},
			},
		},
	],
});
