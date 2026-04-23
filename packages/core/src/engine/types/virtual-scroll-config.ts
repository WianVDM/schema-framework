/** Configuration for virtual scrolling in grid components.
 *  Validated by `virtualScrollConfigSchema` in `shared-schemas.ts`. */
export interface VirtualScrollConfig {
	/** Must be `true`. Set to `false` or omit to disable virtual scrolling. */
	readonly enabled: true;
	/** Number of extra rows rendered outside the viewport. Non-negative integer (>= 0). Defaults to 10. */
	readonly overscan?: number;
	/** Fixed height in pixels for each row. Positive integer (> 0). Defaults to 40. */
	readonly rowHeight?: number;
	/** Height in pixels for the scroll container. Positive integer (> 0). Defaults to 600. */
	readonly containerHeight?: number;
}
