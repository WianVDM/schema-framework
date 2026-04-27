import type { GridColumnSchema, TreeGridSchema } from "@my-framework/core";
import { deepFreeze } from "@my-framework/core";

const TREE_GRID_COLUMNS: readonly GridColumnSchema[] = [
	{ key: "name", label: "Name", width: "250px" },
	{ key: "type", label: "Type", width: "100px" },
	{ key: "size", label: "Size", width: "100px" },
	{ key: "modified", label: "Modified", width: "150px" },
];

/** NOTE: File system tree-grid for demo purposes */
export const FILE_TREE_GRID_SCHEMA: TreeGridSchema = deepFreeze({
	title: "File System Tree Grid",
	description: "Hybrid tree + grid showing file system data",
	columns: TREE_GRID_COLUMNS,
	defaultExpandLevel: 1,
	showLines: true,
	rows: [
		{
			id: "folder-src",
			name: "src",
			type: "folder",
			size: "—",
			modified: "2024-01-15",
			children: [
				{
					id: "folder-components",
					name: "components",
					type: "folder",
					size: "—",
					modified: "2024-01-15",
					children: [
						{
							id: "file-button",
							name: "Button.tsx",
							type: "file",
							size: "2.4 KB",
							modified: "2024-01-10",
						},
						{
							id: "file-input",
							name: "Input.tsx",
							type: "file",
							size: "1.8 KB",
							modified: "2024-01-10",
						},
						{
							id: "file-card",
							name: "Card.tsx",
							type: "file",
							size: "3.1 KB",
							modified: "2024-01-12",
						},
					],
				},
				{
					id: "folder-hooks",
					name: "hooks",
					type: "folder",
					size: "—",
					modified: "2024-01-14",
					children: [
						{
							id: "file-auth",
							name: "useAuth.ts",
							type: "file",
							size: "1.2 KB",
							modified: "2024-01-14",
						},
						{
							id: "file-theme",
							name: "useTheme.ts",
							type: "file",
							size: "0.8 KB",
							modified: "2024-01-13",
						},
					],
				},
				{
					id: "file-app",
					name: "App.tsx",
					type: "file",
					size: "4.5 KB",
					modified: "2024-01-15",
				},
				{
					id: "file-index",
					name: "index.ts",
					type: "file",
					size: "0.3 KB",
					modified: "2024-01-15",
				},
			],
		},
		{
			id: "folder-public",
			name: "public",
			type: "folder",
			size: "—",
			modified: "2024-01-05",
			children: [
				{
					id: "file-index-html",
					name: "index.html",
					type: "file",
					size: "1.1 KB",
					modified: "2024-01-05",
				},
				{
					id: "file-favicon",
					name: "favicon.ico",
					type: "file",
					size: "4.2 KB",
					modified: "2024-01-05",
				},
			],
		},
		{
			id: "file-package-json",
			name: "package.json",
			type: "file",
			size: "2.1 KB",
			modified: "2024-01-15",
		},
		{
			id: "file-readme",
			name: "README.md",
			type: "file",
			size: "5.8 KB",
			modified: "2024-01-12",
		},
	],
});
