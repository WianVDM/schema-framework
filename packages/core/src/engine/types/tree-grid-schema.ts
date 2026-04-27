import type { GridColumnSchema } from "./grid-column-schema";
import type { ReadonlyDeep } from "./readonly-deep";
import type { TreeGridRow } from "./tree-grid-row";

/** Schema definition for a tree-grid (hybrid tree + grid) component */
export interface TreeGridSchema {
	/** Column definitions — reuses GridColumnSchema from the grid system */
	readonly columns: ReadonlyArray<ReadonlyDeep<GridColumnSchema>>;
	/** Row data with hierarchical structure */
	readonly rows: ReadonlyArray<ReadonlyDeep<TreeGridRow>>;
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
	/** Enable virtual scrolling for large datasets — only visible rows are rendered */
	readonly virtualScroll?: boolean;
	/** Container height in pixels when virtual scrolling is enabled (default: 600) */
	readonly virtualScrollHeight?: number;
}
