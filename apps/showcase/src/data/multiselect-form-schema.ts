import type { FormSchema } from "@my-framework/core";
import { deepFreeze } from "@my-framework/core";

export const multiselectFormSchema = deepFreeze<FormSchema>({
	title: "Multi-Select & Tag Input Demo",
	description:
		"Demonstrates multiselect fields with predefined options, tag creation, and selection limits.",
	fields: [
		{
			name: "programmingLanguages",
			label: "Programming Languages",
			type: "multiselect",
			required: true,
			multiSelectConfig: {
				options: [
					{ label: "TypeScript", value: "typescript" },
					{ label: "JavaScript", value: "javascript" },
					{ label: "Python", value: "python" },
					{ label: "Rust", value: "rust" },
					{ label: "Go", value: "go" },
					{ label: "Java", value: "java" },
					{ label: "C#", value: "csharp" },
					{ label: "C++", value: "cpp" },
					{ label: "Ruby", value: "ruby" },
					{ label: "PHP", value: "php" },
					{ label: "Swift", value: "swift" },
					{ label: "Kotlin", value: "kotlin" },
				],
				placeholder: "Select languages...",
			},
		},
		{
			name: "skills",
			label: "Skills (max 5)",
			type: "multiselect",
			multiSelectConfig: {
				options: [
					{ label: "Frontend", value: "frontend" },
					{ label: "Backend", value: "backend" },
					{ label: "DevOps", value: "devops" },
					{ label: "Mobile", value: "mobile" },
					{ label: "Data Science", value: "data-science" },
					{ label: "Machine Learning", value: "ml" },
					{ label: "Security", value: "security" },
					{ label: "Testing", value: "testing" },
				],
				maxSelections: 5,
				placeholder: "Choose up to 5 skills...",
			},
		},
		{
			name: "tags",
			label: "Custom Tags",
			type: "multiselect",
			multiSelectConfig: {
				options: [],
				creatable: true,
				placeholder: "Type and press Enter to add custom tags...",
			},
		},
		{
			name: "preferredTools",
			label: "Preferred Tools",
			type: "multiselect",
			defaultValue: ["vscode", "git"],
			multiSelectConfig: {
				options: [
					{ label: "VS Code", value: "vscode" },
					{ label: "WebStorm", value: "webstorm" },
					{ label: "Vim/Neovim", value: "vim" },
					{ label: "Git", value: "git" },
					{ label: "Docker", value: "docker" },
					{ label: "Figma", value: "figma" },
				],
				creatable: true,
				placeholder: "Select or type to add tools...",
			},
		},
	],
});
