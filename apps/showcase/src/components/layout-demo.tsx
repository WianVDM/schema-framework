import type { LayoutSchema } from "@my-framework/core";
import { SchemaLayout } from "@my-framework/core";
import type { ReactNode } from "react";
import { createElement, useId } from "react";

interface LayoutDemoProps {
	readonly title: string;
	readonly description: string;
	readonly schema: LayoutSchema;
	readonly headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** NOTE: Shared layout demo wrapper — renders heading, description, and SchemaLayout in a bordered container */
export function LayoutDemo({
	title,
	description,
	schema,
	headingLevel = 2,
}: LayoutDemoProps): ReactNode {
	const headingId = useId();
	const tag = `h${headingLevel}` as const;

	return (
		<section className="space-y-4" aria-labelledby={headingId}>
			<div>
				{createElement(
					tag,
					{ id: headingId, className: "text-2xl font-bold" },
					title,
				)}
				<p className="text-muted-foreground">{description}</p>
			</div>
			<div className="border rounded-lg p-4">
				<SchemaLayout schema={schema} />
			</div>
		</section>
	);
}
