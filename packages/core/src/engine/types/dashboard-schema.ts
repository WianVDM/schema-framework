import type { I18nConfig } from "./i18n-config";
import type { LayoutSchema } from "./layout-schema";

/** A single panel within a dashboard, containing its own layout */
export interface DashboardPanel {
	readonly id: string;
	readonly title?: string;
	readonly layout: LayoutSchema;
	readonly className?: string;
}

/** Top-level dashboard composition — composes multiple panels into an application shell */
export interface DashboardSchema {
	readonly title?: string;
	readonly description?: string;
	readonly panels: readonly DashboardPanel[];
	/** How multiple panels are composed: vertical stacked, tabbed, or border layout (default: "vertical") */
	readonly panelLayout?: "vertical" | "tabs" | "border";
	readonly className?: string;
	readonly i18n?: I18nConfig;
}
