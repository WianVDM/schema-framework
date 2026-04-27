import type { Virtualizer } from "@tanstack/react-virtual";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import type { GridColumnSchema } from "../types/grid-column-schema";
import type { SchemaTreeGridProps } from "../types/schema-tree-grid-props";
import type { TreeGridRow } from "../types/tree-grid-row";

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_CONTAINER_HEIGHT = 600;
const OVERSCAN = 5;

/** Schema-driven tree-grid (hybrid tree + grid) component */
export function SchemaTreeGrid({
	schema,
	onExpandChange,
	onRowClick,
	/* NOTE: onLoadChildren wired but lazy loading UX deferred to v0.4.4+ */
	onLoadChildren: _onLoadChildren,
}: SchemaTreeGridProps): ReactNode {
	const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() =>
		computeInitialExpanded(schema.rows, schema.defaultExpandLevel),
	);

	const handleToggle = useCallback(
		(rowId: string) => {
			setExpandedIds((prev) => {
				const next = new Set(prev);
				if (next.has(rowId)) {
					next.delete(rowId);
				} else {
					next.add(rowId);
				}
				return next;
			});
			onExpandChange?.(rowId, !expandedIds.has(rowId));
		},
		[expandedIds, onExpandChange],
	);

	// NOTE: Flatten rows respecting expanded state — virtual scroll only renders visible slice
	const flatRows = useMemo(
		() => flattenRows(schema.rows, expandedIds),
		[schema.rows, expandedIds],
	);

	const isVirtual = schema.virtualScroll === true;
	const scrollRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: flatRows.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => schema.rowHeight ?? DEFAULT_ROW_HEIGHT,
		overscan: OVERSCAN,
	});

	const headerRow = (
		<thead>
			<tr className="border-b bg-muted/50">
				{schema.columns.map((col) => (
					<HeaderCell key={col.key} column={col} />
				))}
			</tr>
		</thead>
	);

	return (
		<div className="schema-tree-grid" data-testid="schema-tree-grid">
			{schema.title && (
				<h3 className="text-lg font-semibold mb-1">{schema.title}</h3>
			)}
			{schema.description && (
				<p className="text-sm text-muted-foreground mb-2">
					{schema.description}
				</p>
			)}
			<div className="overflow-x-auto border border-border rounded-md">
				{isVirtual ? (
					<VirtualTreeGridBody
						scrollRef={scrollRef}
						virtualizer={virtualizer}
						flatRows={flatRows}
						containerHeight={
							schema.virtualScrollHeight ?? DEFAULT_CONTAINER_HEIGHT
						}
						headerRow={headerRow}
						columns={schema.columns}
						expandedIds={expandedIds}
						onToggle={handleToggle}
						onRowClick={onRowClick}
						indentWidth={schema.indentWidth ?? 24}
						showLines={schema.showLines}
						colCount={schema.columns.length}
					/>
				) : (
					<table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
						{headerRow}
						<tbody>
							{flatRows.map(({ row, depth }) => (
								<RowRenderer
									key={row.id}
									row={row}
									depth={depth}
									columns={schema.columns}
									expandedIds={expandedIds}
									onToggle={handleToggle}
									onRowClick={onRowClick}
									indentWidth={schema.indentWidth ?? 24}
									showLines={schema.showLines}
								/>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}

/** Virtual scrolling body for the tree-grid */
function VirtualTreeGridBody({
	scrollRef,
	virtualizer,
	flatRows,
	containerHeight,
	headerRow,
	columns,
	expandedIds,
	onToggle,
	onRowClick,
	indentWidth,
	showLines,
	colCount,
}: {
	readonly scrollRef: React.RefObject<HTMLDivElement | null>;
	readonly virtualizer: Virtualizer<HTMLDivElement, Element>;
	readonly flatRows: ReadonlyArray<{
		readonly row: TreeGridRow;
		readonly depth: number;
	}>;
	readonly containerHeight: number;
	readonly headerRow: ReactNode;
	readonly columns: readonly GridColumnSchema[];
	readonly expandedIds: ReadonlySet<string>;
	readonly onToggle: (rowId: string) => void;
	readonly onRowClick?: (row: TreeGridRow, rowId: string) => void;
	readonly indentWidth: number;
	readonly showLines?: boolean;
	readonly colCount: number;
}): ReactNode {
	const virtualItems = virtualizer.getVirtualItems();
	const totalSize = virtualizer.getTotalSize();
	const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
	const paddingBottom =
		virtualItems.length > 0
			? totalSize - virtualItems[virtualItems.length - 1].end
			: 0;

	return (
		<div
			ref={scrollRef}
			style={{ overflow: "auto", height: `${containerHeight}px` }}
		>
			<table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
				{headerRow}
				<tbody>
					{paddingTop > 0 && (
						// biome-ignore lint/a11y/noAriaHiddenOnFocusable: NOTE: Spacer row for virtual scroll padding — no focusable content
						<tr aria-hidden="true">
							<td
								colSpan={colCount}
								role="presentation"
								style={{
									height: `${paddingTop}px`,
									padding: 0,
									border: "none",
								}}
							/>
						</tr>
					)}
					{virtualItems.map((virtualRow) => {
						const { row, depth } = flatRows[virtualRow.index];
						return (
							<RowRenderer
								key={row.id}
								row={row}
								depth={depth}
								columns={columns}
								expandedIds={expandedIds}
								onToggle={onToggle}
								onRowClick={onRowClick}
								indentWidth={indentWidth}
								showLines={showLines}
							/>
						);
					})}
					{paddingBottom > 0 && (
						// biome-ignore lint/a11y/noAriaHiddenOnFocusable: NOTE: Spacer row for virtual scroll padding — no focusable content
						<tr aria-hidden="true">
							<td
								colSpan={colCount}
								role="presentation"
								style={{
									height: `${paddingBottom}px`,
									padding: 0,
									border: "none",
								}}
							/>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

/** Renders a column header cell */
function HeaderCell({
	column,
}: {
	readonly column: GridColumnSchema;
}): ReactNode {
	const style = column.width
		? {
				width:
					typeof column.width === "number" ? `${column.width}px` : column.width,
			}
		: undefined;

	return (
		<th
			className={`px-3 py-2 text-left font-medium text-muted-foreground ${column.visible === false ? "hidden" : ""}`}
			style={style}
		>
			{column.label}
		</th>
	);
}

/** Renders a single tree-grid row */
function RowRenderer({
	row,
	depth,
	columns,
	expandedIds,
	onToggle,
	onRowClick,
	indentWidth,
	showLines,
}: {
	readonly row: TreeGridRow;
	readonly depth: number;
	readonly columns: readonly GridColumnSchema[];
	readonly expandedIds: ReadonlySet<string>;
	readonly onToggle: (rowId: string) => void;
	readonly onRowClick?: (row: TreeGridRow, rowId: string) => void;
	readonly indentWidth: number;
	readonly showLines?: boolean;
}): ReactNode {
	const hasChildren = (row.children?.length ?? 0) > 0;
	const isExpanded = expandedIds.has(row.id);

	const handleClick = () => {
		if (hasChildren) {
			onToggle(row.id);
		}
		onRowClick?.(row, row.id);
	};

	return (
		<tr
			className="border-b hover:bg-accent/30 cursor-pointer"
			onClick={handleClick}
		>
			{columns.map((col, colIndex) => {
				const isFirst = colIndex === 0;
				const cellValue = row[col.key];

				return (
					<td key={col.key} className="px-3 py-1.5">
						{isFirst ? (
							<span style={{ paddingLeft: `${depth * indentWidth}px` }}>
								{hasChildren && (
									<span className="inline-block w-4 text-muted-foreground text-xs">
										{isExpanded ? "▾" : "▸"}
									</span>
								)}
								{!hasChildren && (
									<span className="inline-block w-4 text-muted-foreground text-xs">
										{showLines ? "│ " : "·"}
									</span>
								)}
								<span>{String(cellValue ?? "")}</span>
							</span>
						) : (
							String(cellValue ?? "")
						)}
					</td>
				);
			})}
		</tr>
	);
}

/** Flattens hierarchical rows into a flat list with depth tracking */
function flattenRows(
	rows: readonly TreeGridRow[],
	expandedIds: ReadonlySet<string>,
	depth = 0,
): ReadonlyArray<{ readonly row: TreeGridRow; readonly depth: number }> {
	const result: Array<{ readonly row: TreeGridRow; readonly depth: number }> =
		[];

	for (const row of rows) {
		result.push({ row, depth });
		const hasChildren = (row.children?.length ?? 0) > 0;
		if (hasChildren && expandedIds.has(row.id)) {
			const childResults = flattenRows(
				row.children ?? [],
				expandedIds,
				depth + 1,
			);
			for (const child of childResults) {
				result.push(child);
			}
		}
	}

	return result;
}

/** Compute initially expanded row IDs based on defaultExpandLevel */
function computeInitialExpanded(
	rows: readonly TreeGridRow[],
	level: number | undefined,
): ReadonlySet<string> {
	if (level === undefined || level === 0) {
		return new Set();
	}

	const ids = new Set<string>();
	const expandToDepth = level === -1 ? Number.POSITIVE_INFINITY : level;

	function walk(rowList: readonly TreeGridRow[], currentDepth: number): void {
		for (const row of rowList) {
			if (currentDepth < expandToDepth && (row.children?.length ?? 0) > 0) {
				ids.add(row.id);
				walk(row.children ?? [], currentDepth + 1);
			}
		}
	}

	walk(rows, 0);
	return ids;
}
