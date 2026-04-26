import type { GridColumnSchema } from "./grid-column-schema";

/** A row in a tree grid — supports hierarchical children */
export interface TreeGridRow {
	readonly id: string;
	/** Child rows — presence of this field makes the row expandable */
	readonly children?: readonly TreeGridRow[];
	/** Whether the row is expanded */
	readonly expanded?: boolean;
	/** Row data — keys correspond to column `key` values */
	readonly [key: string]: unknown;
}

/** Schema definition for a tree-grid (hybrid tree + grid) component */
export interface TreeGridSchema {
	/** Column definitions — reuses GridColumnSchema from the grid system */
	readonly columns: readonly GridColumnSchema[];
	/** Row data with hierarchical structure */
	readonly rows: readonly TreeGridRow[];
	/** Tree indentation width per level in pixels */
	readonly indentWidth?: number;
	/** Show tree lines connecting parent-child rows */
	readonly showLines?: boolean;
	/** Default expand level (0 = all collapsed, -1 = all expanded) */
	readonly defaultExpandLevel?: number;
	/** Title displayed above the tree-grid */
	readonly title?: string;
	/** Description displayed below the title */
	readonly description?: string;
	/** Row height in pixels for virtual scrolling */
	readonly rowHeight?: number;
}
