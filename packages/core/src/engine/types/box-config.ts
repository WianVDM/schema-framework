/** Configuration for hbox/vbox flex layouts */
export interface BoxConfig {
	/** Gap between children in px or CSS value */
	readonly gap?: number | string;
	/** Cross-axis alignment (align-items) */
	readonly align?: "start" | "center" | "end" | "stretch";
	/** Main-axis justification (justify-content) */
	readonly justify?:
		| "start"
		| "center"
		| "end"
		| "between"
		| "around"
		| "evenly";
	/** Whether children wrap to next line when space is insufficient */
	readonly wrap?: boolean;
	/** Padding around the box container */
	readonly padding?: number | string;
	/** Viewport width in px below which an HBox switches to VBox-style vertical stacking */
	readonly stackBelow?: number;
}
