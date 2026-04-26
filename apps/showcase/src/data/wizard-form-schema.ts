import type { WizardSchema } from "@my-framework/core";
import { deepFreeze } from "@my-framework/core";

export const wizardFormSchema = deepFreeze<WizardSchema>({
	title: "Event Registration Wizard",
	description: "Register for the annual tech conference in 3 easy steps.",
	mode: "linear",
	validationMode: "eager",
	navigation: {
		showStepIndicator: true,
		showPreviousButton: true,
		nextLabel: "Continue",
		previousLabel: "Go Back",
		submitLabel: "Complete Registration",
	},
	reviewStep: {
		enabled: true,
		title: "Review Your Registration",
		description: "Please review your information before submitting.",
		editable: true,
	},
	steps: [
		{
			title: "Personal Info",
			description: "Tell us about yourself.",
			schema: {
				fields: [
					{
						name: "fullName",
						label: "Full Name",
						type: "text",
						required: true,
						placeholder: "John Doe",
					},
					{
						name: "email",
						label: "Email Address",
						type: "email",
						required: true,
						placeholder: "john@example.com",
					},
					{
						name: "phone",
						label: "Phone Number",
						type: "text",
						placeholder: "+1 (555) 000-0000",
					},
				],
			},
		},
		{
			title: "Event Preferences",
			description: "Customize your conference experience.",
			schema: {
				fields: [
					{
						name: "ticketType",
						label: "Ticket Type",
						type: "select",
						required: true,
						options: [
							{ label: "General Admission", value: "general" },
							{ label: "VIP Pass", value: "vip" },
							{ label: "Speaker Pass", value: "speaker" },
						],
					},
					{
						name: "dietaryRestrictions",
						label: "Dietary Restrictions",
						type: "textarea",
						placeholder: "Any allergies or dietary needs...",
					},
					{
						name: "workshopChoice",
						label: "Preferred Workshop",
						type: "select",
						options: [
							{ label: "React Advanced", value: "react" },
							{ label: "TypeScript Deep Dive", value: "typescript" },
							{ label: "System Design", value: "system-design" },
							{ label: "No preference", value: "none" },
						],
					},
				],
			},
		},
		{
			title: "Payment & Consent",
			description: "Finalize your registration.",
			schema: {
				fields: [
					{
						name: "paymentMethod",
						label: "Payment Method",
						type: "select",
						required: true,
						options: [
							{ label: "Credit Card", value: "credit" },
							{ label: "PayPal", value: "paypal" },
							{ label: "Invoice", value: "invoice" },
						],
					},
					{
						name: "newsletter",
						label: "Subscribe to event updates",
						type: "checkbox",
					},
					{
						name: "acceptTerms",
						label: "I agree to the terms and conditions",
						type: "checkbox",
						required: true,
					},
				],
			},
		},
	],
});
