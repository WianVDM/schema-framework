import {
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useState,
} from "react";
import type { SchemaTreeProps } from "../types/schema-tree-props";
import type { TreeNode } from "../types/tree-schema";

/** Schema-driven tree component */
export function SchemaTree({
	schema,
	onLoadChildren,
	onSelectionChange,
	onExpandChange,
	onContextAction,
	onNodeReorder,
}: SchemaTreeProps): ReactNode {
	const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() =>
		computeInitialExpanded(schema.nodes, schema.defaultExpandLevel),
	);

	const handleToggle = useCallback(
		(nodeId: string) => {
			setExpandedIds((prev) => {
				const next = new Set(prev);
				if (next.has(nodeId)) {
					next.delete(nodeId);
				} else {
					next.add(nodeId);
				}
				return next;
			});
			onExpandChange?.(nodeId, !expandedIds.has(nodeId));
		},
		[expandedIds, onExpandChange],
	);

	return (
		<div className="schema-tree" data-testid="schema-tree">
			{schema.title && (
				<h3 className="text-lg font-semibold mb-2">{schema.title}</h3>
			)}
			<div
				className="space-y-0.5"
				role="tree"
				aria-label={schema.title ?? "Tree"}
			>
				{schema.nodes.map((node) => (
					<TreeNodeItem
						key={node.id}
						node={node}
						depth={0}
						expandedIds={expandedIds}
						onToggle={handleToggle}
						onLoadChildren={onLoadChildren}
						onSelectionChange={onSelectionChange}
						onContextAction={onContextAction}
						onNodeReorder={onNodeReorder}
						selection={schema.selection}
						icons={schema.icons}
						showLines={schema.showLines}
					/>
				))}
			</div>
		</div>
	);
}

interface TreeNodeItemProps {
	readonly node: TreeNode;
	readonly depth: number;
	readonly expandedIds: ReadonlySet<string>;
	readonly onToggle: (nodeId: string) => void;
	readonly onLoadChildren?: (node: TreeNode) => Promise<readonly TreeNode[]>;
	readonly onSelectionChange?: (
		selectedIds: readonly string[],
		nodes: readonly TreeNode[],
	) => void;
	readonly onContextAction?: (action: string, node: TreeNode) => void;
	readonly onNodeReorder?: (
		sourceId: string,
		targetId: string,
		position: "before" | "after" | "child",
	) => void;
	readonly selection?: import("../types/tree-schema").TreeSelectionConfig;
	readonly icons?: import("../types/tree-schema").TreeIcons;
	readonly showLines?: boolean;
}

function TreeNodeItem({
	node,
	depth,
	expandedIds,
	onToggle,
	onLoadChildren,
	onSelectionChange,
	onContextAction,
	selection,
	icons,
	showLines,
}: TreeNodeItemProps): ReactNode {
	const hasChildren = (node.children?.length ?? 0) > 0;
	const isExpanded = expandedIds.has(node.id);
	const isLeaf = node.leaf ?? (!hasChildren && !onLoadChildren);

	const handleClick = () => {
		if (!isLeaf) {
			onToggle(node.id);
		}
	};

	const handleCheckboxChange = () => {
		if (selection?.mode === "checkbox" || selection?.mode === "multi") {
			onSelectionChange?.([node.id], [node]);
		} else if (selection?.mode === "single") {
			onSelectionChange?.([node.id], [node]);
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		// NOTE: Context menu rendering is handled by the consumer via onContextAction
		onContextAction?.("rightClick", node);
	};

	return (
		<li
			role="treeitem"
			aria-expanded={isLeaf ? undefined : isExpanded}
			tabIndex={0}
			onKeyDown={(e: KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			<button
				type="button"
				className="flex items-center gap-1 py-1 px-2 hover:bg-accent/50 rounded cursor-pointer w-full text-left bg-transparent border-0"
				onClick={handleClick}
				onContextMenu={handleContextMenu}
				style={{ paddingLeft: `${depth * (showLines ? 20 : 16)}px` }}
			>
				{/* Expand/collapse indicator */}
				<span className="w-4 text-center text-muted-foreground text-xs">
					{isLeaf
						? (icons?.leaf ?? "·")
						: isExpanded
							? (icons?.collapse ?? "▾")
							: (icons?.expand ?? "▸")}
				</span>

				{/* Icon */}
				{node.icon && <span className="text-sm">{node.icon}</span>}
				{!isLeaf && !node.icon && icons?.folder && (
					<span className="text-sm">
						{isExpanded ? (icons.folderOpen ?? icons.folder) : icons.folder}
					</span>
				)}

				{/* Selection control */}
				{selection && (
					<input
						type={selection.mode === "checkbox" ? "checkbox" : "radio"}
						checked={node.selected}
						onChange={handleCheckboxChange}
						className="mr-1"
						aria-label={`Select ${node.label}`}
					/>
				)}

				{/* Label */}
				<span
					className={`text-sm ${node.disabled ? "text-muted-foreground line-through" : ""}`}
				>
					{node.label}
				</span>

				{/* Loading indicator */}
				{node.loading && (
					<span className="text-xs text-muted-foreground animate-spin">⟳</span>
				)}
			</button>

			{/* Children */}
			{hasChildren && isExpanded && (
				<ul>
					{node.children?.map((child) => (
						<TreeNodeItem
							key={child.id}
							node={child}
							depth={depth + 1}
							expandedIds={expandedIds}
							onToggle={onToggle}
							onLoadChildren={onLoadChildren}
							onSelectionChange={onSelectionChange}
							onContextAction={onContextAction}
							selection={selection}
							icons={icons}
							showLines={showLines}
						/>
					))}
				</ul>
			)}
		</li>
	);
}

/** Compute initially expanded node IDs based on defaultExpandLevel */
function computeInitialExpanded(
	nodes: readonly TreeNode[],
	level: number | undefined,
): ReadonlySet<string> {
	if (level === undefined || level === 0) {
		return new Set();
	}

	const ids = new Set<string>();
	const expandToDepth = level === -1 ? Number.POSITIVE_INFINITY : level;

	function walk(nodeList: readonly TreeNode[], currentDepth: number): void {
		for (const node of nodeList) {
			if (currentDepth < expandToDepth && (node.children?.length ?? 0) > 0) {
				ids.add(node.id);
				walk(node.children ?? [], currentDepth + 1);
			}
		}
	}

	walk(nodes, 0);
	return ids;
}
