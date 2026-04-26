import { SchemaLayout } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { stackLayoutSchema } from "../data/stack-layout-schema";

export const Route = createFileRoute("/demo-stack-layout")({
	component: DemoStackLayoutRoute,
});

function DemoStackLayoutRoute() {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl font-bold">Stack Layout</h2>
				<p className="text-muted-foreground">
					Stacked panel layout with prev/next navigation, keyboard support, and
					optional fade animations. Panels are visited one at a time.
				</p>
			</div>
			<div className="h-[600px] border rounded-lg overflow-hidden">
				<SchemaLayout schema={stackLayoutSchema} />
			</div>
		</div>
	);
}
