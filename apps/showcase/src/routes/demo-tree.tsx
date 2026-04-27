import type { TreeNode } from "@my-framework/core";
import { SchemaTree } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FILE_TREE_SCHEMA } from "../data/tree-schema";

export const Route = createFileRoute("/demo-tree")({
	component: DemoTreeRoute,
});

function DemoTreeRoute() {
	const [lastAction, setLastAction] = useState<string>("");

	const handleSelectionChange = (
		selectedIds: readonly string[],
		_nodes: readonly TreeNode[],
	) => {
		setLastAction(`Selected: ${selectedIds.join(", ")}`);
	};

	const handleExpandChange = (nodeId: string, expanded: boolean) => {
		setLastAction(`${nodeId} ${expanded ? "expanded" : "collapsed"}`);
	};

	const handleContextAction = (action: string, node: TreeNode) => {
		setLastAction(`Context "${action}" on "${node.label}"`);
	};

	return (
		<div className="max-w-md mx-auto space-y-4">
			<div>
				<h2 className="text-xl font-bold">SchemaTree Demo</h2>
				<p className="text-sm text-muted-foreground mt-1">
					File explorer tree with selection, context menu, and lazy loading
					support.
				</p>
			</div>

			<div className="border rounded-lg p-4">
				<SchemaTree
					schema={FILE_TREE_SCHEMA}
					onSelectionChange={handleSelectionChange}
					onExpandChange={handleExpandChange}
					onContextAction={handleContextAction}
				/>
			</div>

			{lastAction && (
				<div className="border rounded-lg p-3 bg-muted/50">
					<p className="text-sm font-mono">{lastAction}</p>
				</div>
			)}
		</div>
	);
}
