import type { TreeNode, TreeSchema } from "./tree-schema";

export interface SchemaTreeProps {
	readonly schema: TreeSchema;
	/** Async loader for lazy-loaded children */
	readonly onLoadChildren?: (node: TreeNode) => Promise<readonly TreeNode[]>;
	/** Fired when node selection changes */
	readonly onSelectionChange?: (
		selectedIds: readonly string[],
		nodes: readonly TreeNode[],
	) => void;
	/** Fired when a node is expanded or collapsed */
	readonly onExpandChange?: (nodeId: string, expanded: boolean) => void;
	/** Fired when a context menu item is clicked */
	readonly onContextAction?: (action: string, node: TreeNode) => void;
	/** Fired when nodes are reordered via drag-and-drop */
	readonly onNodeReorder?: (
		sourceId: string,
		targetId: string,
		position: "before" | "after" | "child",
	) => void;
	/** Fired when realtime data becomes stale */
	readonly onDataStale?: () => void;
	/** Fired when realtime data is refreshed */
	readonly onDataRefresh?: (data: unknown) => void;
}
