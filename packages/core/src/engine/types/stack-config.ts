/** Configuration for stack layout — shows one child panel at a time */
export interface StackConfig {
	/** Index of the initially visible panel (default: 0) */
	readonly defaultIndex?: number;
	/** Show previous/next navigation buttons */
	readonly showNavigation?: boolean;
	/** Enable keyboard navigation (arrow keys) */
	readonly keyboardNavigation?: boolean;
	/** Animation type for panel transitions */
	readonly animation?: "none" | "fade" | "slide";
	/** Whether panels are kept mounted when hidden (for state preservation) */
	readonly keepMounted?: boolean;
}
