/** Single-mode accordion: at most one item expanded, supports collapsible toggle */
export interface SingleAccordionConfig {
	/** Discriminant — explicitly marks single-mode config */
	readonly mode: "single";
	/** Animation style for expand/collapse transitions */
	readonly animation?: "slide" | "fade" | "none";
	/** Region ID that should be expanded by default (single mode allows only one) */
	readonly defaultOpen?: string;
	/** Whether the expanded item can be collapsed back */
	readonly collapsible?: boolean;
}

/** Multiple-mode accordion: any number of items can be expanded simultaneously */
export interface MultipleAccordionConfig {
	/** Discriminant — must be 'multiple' */
	readonly mode: "multiple";
	/** Animation style for expand/collapse transitions */
	readonly animation?: "slide" | "fade" | "none";
	/** Region IDs that should be expanded by default */
	readonly defaultOpen?: readonly string[];
}

/** Configuration for accordion layout behavior — discriminated on mode field */
export type AccordionConfig = SingleAccordionConfig | MultipleAccordionConfig;
