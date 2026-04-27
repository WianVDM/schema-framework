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
