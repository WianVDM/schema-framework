/** Menu item for context menus */
export interface ContextMenuItem {
	readonly label: string;
	readonly icon?: string;
	readonly disabled?: boolean;
	readonly separator?: boolean;
	readonly action: string;
}
