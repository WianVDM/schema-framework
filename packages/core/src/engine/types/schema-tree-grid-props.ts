import type { TreeGridRow, TreeGridSchema } from "./tree-grid-schema";

export interface SchemaTreeGridProps {
	readonly schema: TreeGridSchema;
	/** Fired when a row is expanded or collapsed */
	readonly onExpandChange?: (rowId: string, expanded: boolean) => void;
	/** Fired when a row is clicked */
	readonly onRowClick?: (row: TreeGridRow, rowId: string) => void;
	/** Async loader for lazy-loaded children */
	readonly onLoadChildren?: (
		row: TreeGridRow,
	) => Promise<readonly TreeGridRow[]>;
}
