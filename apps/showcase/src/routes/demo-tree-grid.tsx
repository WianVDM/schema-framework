import { SchemaTreeGrid } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { FILE_TREE_GRID_SCHEMA } from "../data/tree-grid-schema";

export const Route = createFileRoute("/demo-tree-grid")({
	component: DemoTreeGridRoute,
});

function DemoTreeGridRoute() {
	return (
		<div className="max-w-3xl mx-auto space-y-4">
			<div>
				<h2 className="text-xl font-bold">SchemaTreeGrid Demo</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Hybrid tree + grid with expandable rows and column-based layout.
				</p>
			</div>

			<div className="border rounded-lg p-4">
				<SchemaTreeGrid schema={FILE_TREE_GRID_SCHEMA} />
			</div>
		</div>
	);
}
