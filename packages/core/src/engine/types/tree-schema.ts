import type { DataKey } from "./branded";
import type { ContextMenuConfig } from "./context-menu-config";

/** Selection mode for tree nodes */
export type TreeSelectionMode = "single" | "multi" | "checkbox";

/** Configuration for tree node selection behavior */
export interface TreeSelectionConfig {
	readonly mode: TreeSelectionMode;
	/** NOTE: When true in checkbox mode, selecting parent selects all children */
	readonly cascade?: boolean;
}

/** Configuration for lazy loading tree nodes */
export interface TreeLazyConfig {
	/** Node attribute that triggers child loading */
	readonly loadTrigger: "expand" | "click";
	/** Minimum depth before lazy loading activates */
	readonly minDepth?: number;
}

/** Configuration for drag-and-drop node reordering */
export interface TreeDndConfig {
	readonly enabled: true;
	/** Allow dropping between nodes (reorder) vs only on nodes (nesting) */
	readonly dropBetween?: boolean;
	/** Restrict DnD to same parent only */
	readonly restrictToParent?: boolean;
}

/** Custom icon mapping for tree node states */
export interface TreeIcons {
	readonly expand?: string;
	readonly collapse?: string;
	readonly leaf?: string;
	readonly loading?: string;
	readonly folder?: string;
	readonly folderOpen?: string;
}

/** Tree node data structure */
export interface TreeNode {
	readonly id: string;
	readonly label: string;
	readonly children?: readonly TreeNode[];
	readonly icon?: string;
	readonly expanded?: boolean;
	readonly selected?: boolean;
	readonly disabled?: boolean;
	readonly loading?: boolean;
	readonly leaf?: boolean;
	readonly data?: Readonly<Record<string, unknown>>;
}

/** Schema definition for a tree panel component */
export interface TreeSchema {
	/** Tree data — flat or nested nodes */
	readonly nodes: readonly TreeNode[];
	/** Data key for identifying tree nodes */
	readonly dataKey: DataKey;
	/** Selection configuration */
	readonly selection?: TreeSelectionConfig;
	/** Lazy loading configuration */
	readonly lazy?: TreeLazyConfig;
	/** Drag-and-drop configuration */
	readonly dnd?: TreeDndConfig;
	/** Custom icons */
	readonly icons?: TreeIcons;
	/** Context menu configuration */
	readonly contextMenu?: ContextMenuConfig;
	/** Lines connecting parent-child nodes */
	readonly showLines?: boolean;
	/** Default expand level (0 = all collapsed, -1 = all expanded) */
	readonly defaultExpandLevel?: number;
	/** Title displayed above the tree */
	readonly title?: string;
}
