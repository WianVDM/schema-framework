import type { AccordionConfig } from "./accordion-config";
import type { BoxConfig } from "./box-config";
import type { CardGridConfig } from "./card-grid-config";
import type { I18nConfig } from "./i18n-config";
import type { LayoutRegion } from "./layout-region";
import type { LayoutType } from "./layout-type";

/** Top-level layout definition */
export interface LayoutSchema {
	readonly type: LayoutType;
	readonly regions: readonly LayoutRegion[];
	/** Accordion-specific configuration */
	readonly accordionConfig?: AccordionConfig;
	/** Card grid configuration */
	readonly cardGridConfig?: CardGridConfig;
	/** HBox/VBox flex configuration */
	readonly boxConfig?: BoxConfig;
	readonly gap?: number;
	readonly padding?: number | readonly [number, number];
	readonly className?: string;
	readonly i18n?: I18nConfig;
}
