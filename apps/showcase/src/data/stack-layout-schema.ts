import type { LayoutSchema } from "@my-framework/core";
import { deepFreeze } from "@my-framework/core";

export const stackLayoutSchema = deepFreeze<LayoutSchema>({
	type: "stack",
	regions: [
		{
			id: "step-1",
			position: "0",
			title: "Personal Info",
			content: {
				type: "form",
				schema: {
					title: "Personal Information",
					fields: [
						{
							name: "fullName",
							label: "Full Name",
							type: "text",
							placeholder: "Enter your full name",
						},
						{
							name: "email",
							label: "Email",
							type: "email",
							placeholder: "you@example.com",
						},
					],
					submitLabel: "Next",
				},
			},
		},
		{
			id: "step-2",
			position: "1",
			title: "Address",
			content: {
				type: "form",
				schema: {
					title: "Address Details",
					fields: [
						{
							name: "street",
							label: "Street Address",
							type: "text",
							placeholder: "123 Main St",
						},
						{
							name: "city",
							label: "City",
							type: "text",
							placeholder: "City",
						},
						{
							name: "zipCode",
							label: "ZIP Code",
							type: "text",
							placeholder: "12345",
						},
					],
					submitLabel: "Next",
				},
			},
		},
		{
			id: "step-3",
			position: "2",
			title: "Preferences",
			content: {
				type: "form",
				schema: {
					title: "Preferences",
					fields: [
						{
							name: "newsletter",
							label: "Subscribe to newsletter",
							type: "checkbox",
						},
						{
							name: "contactMethod",
							label: "Preferred Contact Method",
							type: "select",
							options: [
								{ label: "Email", value: "email" },
								{ label: "Phone", value: "phone" },
								{ label: "Mail", value: "mail" },
							],
						},
					],
					submitLabel: "Submit",
				},
			},
		},
	],
	stackConfig: {
		showNavigation: true,
		keyboardNavigation: true,
		animation: "fade",
		keepMounted: true,
	},
});
