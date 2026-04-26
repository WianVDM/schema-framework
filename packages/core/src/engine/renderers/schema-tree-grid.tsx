import { type ReactNode, useCallback, useState } from "react";
import type { GridColumnSchema } from "../types/grid-column-schema";
import type { SchemaTreeGridProps } from "../types/schema-tree-grid-props";
import type { TreeGridRow } from "../types/tree-grid-schema";

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
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-muted/50">
							{schema.columns.map((col) => (
								<HeaderCell key={col.key} column={col} />
							))}
						</tr>
					</thead>
					<tbody>
						{flattenRows(schema.rows, expandedIds).map(({ row, depth }) => (
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
			</div>
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
