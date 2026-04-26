import type { TreeSchema } from "@my-framework/core";
import { asDataKey, deepFreeze } from "@my-framework/core";

/** NOTE: File-system style tree for demo purposes */
export const FILE_TREE_SCHEMA: TreeSchema = deepFreeze({
	dataKey: asDataKey("id"),
	title: "File Explorer",
	defaultExpandLevel: 1,
	showLines: true,
	selection: {
		mode: "single",
	},
	contextMenu: {
		items: [
			{ label: "Open", action: "open" },
			{ label: "Rename", action: "rename" },
			{ label: "Delete", action: "delete", separator: true },
		],
	},
	icons: {
		expand: "▶",
		collapse: "▼",
		leaf: "📄",
		folder: "📁",
		folderOpen: "📂",
		loading: "⏳",
	},
	nodes: [
		{
			id: "src",
			label: "src",
			children: [
				{
					id: "src-components",
					label: "components",
					children: [
						{ id: "src-components-button", label: "Button.tsx", leaf: true },
						{ id: "src-components-input", label: "Input.tsx", leaf: true },
						{ id: "src-components-card", label: "Card.tsx", leaf: true },
					],
				},
				{
					id: "src-hooks",
					label: "hooks",
					children: [
						{ id: "src-hooks-auth", label: "useAuth.ts", leaf: true },
						{ id: "src-hooks-theme", label: "useTheme.ts", leaf: true },
					],
				},
				{
					id: "src-utils",
					label: "utils",
					children: [
						{ id: "src-utils-format", label: "format.ts", leaf: true },
						{ id: "src-utils-api", label: "api.ts", leaf: true },
					],
				},
				{ id: "src-app", label: "App.tsx", leaf: true },
				{ id: "src-index", label: "index.ts", leaf: true },
			],
		},
		{
			id: "public",
			label: "public",
			children: [
				{ id: "public-index", label: "index.html", leaf: true },
				{ id: "public-favicon", label: "favicon.ico", leaf: true },
			],
		},
		{
			id: "docs",
			label: "docs",
			children: [
				{
					id: "docs-guide",
					label: "getting-started.md",
					leaf: true,
				},
				{
					id: "docs-api",
					label: "api-reference.md",
					leaf: true,
				},
			],
		},
		{ id: "package-json", label: "package.json", leaf: true },
		{ id: "readme", label: "README.md", leaf: true },
		{ id: "tsconfig", label: "tsconfig.json", leaf: true },
	],
});
