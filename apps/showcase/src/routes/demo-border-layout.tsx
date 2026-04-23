import { SchemaLayout } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { borderLayoutSchema } from "../data/border-layout-schema";

export const Route = createFileRoute("/demo-border-layout")({
	component: DemoBorderLayoutRoute,
});

function DemoBorderLayoutRoute() {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl font-bold">Border Layout</h2>
				<p className="text-muted-foreground">
					Five-region border layout (N/S/E/W/C) with resizable panels and
					collapsible regions.
				</p>
			</div>
			<div className="h-[600px] border rounded-lg overflow-hidden">
				<SchemaLayout schema={borderLayoutSchema} />
			</div>
		</div>
	);
}
