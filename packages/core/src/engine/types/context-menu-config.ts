/** Menu item for context menus */
export interface ContextMenuItem {
	readonly label: string;
	readonly icon?: string;
	readonly disabled?: boolean;
	readonly separator?: boolean;
	readonly action: string;
}

/** Context menu configuration — shared by Tree, Grid, and other components */
export interface ContextMenuConfig {
	readonly items: readonly ContextMenuItem[];
}
