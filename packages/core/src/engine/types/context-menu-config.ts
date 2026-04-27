import type { ContextMenuItem } from "./context-menu-item";
import type { ReadonlyDeep } from "./readonly-deep";

/** Context menu configuration — shared by Tree, Grid, and other components */
export interface ContextMenuConfig {
	readonly items: ReadonlyArray<ReadonlyDeep<ContextMenuItem>>;
}
