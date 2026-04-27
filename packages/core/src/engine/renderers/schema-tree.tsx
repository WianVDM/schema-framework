import type { DragEndEvent } from "@dnd-kit/core";
import {
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import { useRealtime } from "../helpers/use-realtime";
import type { SchemaTreeProps } from "../types/schema-tree-props";
import type { TreeDndConfig, TreeNode } from "../types/tree-schema";

/** Schema-driven tree component */
export function SchemaTree({
	schema,
	onLoadChildren,
	onSelectionChange,
	onExpandChange,
	onContextAction,
	onNodeReorder,
	onDataStale,
	onDataRefresh: _onDataRefresh,
}: SchemaTreeProps): ReactNode {
	// NOTE: Use useRealtime hook when realtime config is present
	const isRealtimeEnabled = schema.realtime?.enabled === true;

	const realtimeFetcher = useCallback(async () => {
		// NOTE: Return current nodes as placeholder — actual refresh is driven by onDataRefresh callback
		return schema.nodes;
	}, [schema.nodes]);

	const realtimeState = useRealtime<readonly TreeNode[]>(
		schema.nodes,
		schema.realtime ?? { enabled: false, intervalMs: 30_000 },
		realtimeFetcher,
	);

	// NOTE: Track stale state based on lastRefreshed from useRealtime
	const [isStale, setIsStale] = useState(false);

	useEffect(() => {
		if (!isRealtimeEnabled || !onDataStale) return;

		const threshold = schema.realtime?.staleThresholdMs ?? 30_000;
		const lastRefresh = realtimeState.lastRefreshed;

		if (lastRefresh !== null) {
			const elapsed = Date.now() - lastRefresh;
			if (elapsed >= threshold) {
				setIsStale(true);
				onDataStale();
			} else {
				setIsStale(false);
				const remaining = threshold - elapsed;
				const timer = setTimeout(() => {
					setIsStale(true);
					onDataStale();
				}, remaining);
				return () => clearTimeout(timer);
			}
		}
		return undefined;
	}, [
		isRealtimeEnabled,
		schema.realtime?.staleThresholdMs,
		realtimeState.lastRefreshed,
		onDataStale,
	]);

	// NOTE: Notify consumer when realtime data refreshes
	useEffect(() => {
		if (
			isRealtimeEnabled &&
			realtimeState.lastRefreshed !== null &&
			_onDataRefresh
		) {
			_onDataRefresh(realtimeState.data);
		}
	}, [
		isRealtimeEnabled,
		realtimeState.lastRefreshed,
		realtimeState.data,
		_onDataRefresh,
	]);

	// NOTE: Use realtime data when available, otherwise fall back to schema nodes
	const effectiveNodes = isRealtimeEnabled ? realtimeState.data : schema.nodes;

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

	// NOTE: Flatten visible node IDs for SortableContext
	const flatIds = useCallback(
		(nodes: readonly TreeNode[]): string[] => {
			const ids: string[] = [];
			function walk(list: readonly TreeNode[]): void {
				for (const n of list) {
					ids.push(n.id);
					if (expandedIds.has(n.id) && n.children) {
						walk(n.children);
					}
				}
			}
			walk(nodes);
			return ids;
		},
		[expandedIds],
	);

	const visibleIds = flatIds(effectiveNodes);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	);

	const handleDndEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id || !onNodeReorder) return;
			// NOTE: Default to "after" position — consumers can refine via the callback
			onNodeReorder(String(active.id), String(over.id), "after");
		},
		[onNodeReorder],
	);

	const dndEnabled = schema.dnd?.enabled === true;

	const treeContent = (
		<div
			className="space-y-0.5"
			role="tree"
			aria-label={schema.title ?? "Tree"}
		>
			<ul>
				{effectiveNodes.map((node) => (
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
						dnd={schema.dnd}
					/>
				))}
			</ul>
		</div>
	);

	return (
		<div className="schema-tree" data-testid="schema-tree">
			{schema.title && (
				<h3 className="text-lg font-semibold mb-2">{schema.title}</h3>
			)}
			{schema.realtime?.enabled && isStale && (
				<div className="text-xs text-yellow-600 flex items-center gap-1 mb-2">
					<span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
					Tree data may be stale
				</div>
			)}
			{dndEnabled ? (
				<DndContext sensors={sensors} onDragEnd={handleDndEnd}>
					<SortableContext
						items={visibleIds}
						strategy={verticalListSortingStrategy}
					>
						{treeContent}
					</SortableContext>
				</DndContext>
			) : (
				treeContent
			)}
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
	readonly dnd?: TreeDndConfig;
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
	dnd,
}: TreeNodeItemProps): ReactNode {
	const hasChildren = (node.children?.length ?? 0) > 0;
	const isExpanded = expandedIds.has(node.id);
	const isLeaf = node.leaf ?? (!hasChildren && !onLoadChildren);

	const sortable = useSortable({ id: node.id, disabled: !dnd?.enabled });
	const isDragging = sortable.isDragging;

	const dragStyle = dnd?.enabled
		? {
				transform: CSS.Transform.toString(sortable.transform),
				transition: sortable.transition,
				opacity: isDragging ? 0.5 : 1,
			}
		: undefined;

	const setNodeRef = dnd?.enabled ? sortable.setNodeRef : undefined;
	const dragAttributes = dnd?.enabled ? sortable.attributes : undefined;
	const dragListeners = dnd?.enabled ? sortable.listeners : undefined;

	const handleClick = () => {
		if (!isLeaf) {
			onToggle(node.id);
		}
	};

	const handleCheckboxChange = () => {
		// NOTE: Toggle selection — delegate merge logic to consumer via onSelectionChange
		const isSelected = node.selected === true;
		onSelectionChange?.(isSelected ? [] : [node.id], isSelected ? [] : [node]);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		// NOTE: Context menu rendering is handled by the consumer via onContextAction
		onContextAction?.("rightClick", node);
	};

	return (
		<li
			ref={setNodeRef}
			role="treeitem"
			aria-expanded={isLeaf ? undefined : isExpanded}
			tabIndex={0}
			style={dragStyle}
			{...dragAttributes}
			onKeyDown={(e: KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			<button
				type="button"
				className={`flex items-center gap-1 py-1 px-2 hover:bg-accent/50 rounded cursor-pointer w-full text-left bg-transparent border-0 ${isDragging ? "ring-2 ring-primary/40" : ""}`}
				onClick={handleClick}
				onContextMenu={handleContextMenu}
				style={{ paddingLeft: `${depth * (showLines ? 20 : 16)}px` }}
				{...dragListeners}
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
							dnd={dnd}
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
