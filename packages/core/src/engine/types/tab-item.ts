import type { ContentSchema } from "./content-schema";

/** Single tab definition within a TabSchema */
export interface TabItem {
	readonly id: string;
	readonly label: string;
	readonly icon?: string;
	readonly disabled?: boolean;
	readonly content: ContentSchema;
	readonly className?: string;
}
