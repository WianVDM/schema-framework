import type { DragEndEvent } from "@dnd-kit/core";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import {
	type CellContext,
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrimitives } from "../context/primitives-context";
import { resolveMessage } from "../helpers/i18n";
import { useRealtime } from "../helpers/use-realtime";
import type {
	GridColumnSchema,
	SchemaGridProps,
	VirtualScrollConfig,
} from "../types";
import { GridColumnHeader } from "./grid-column-header";
import { GridPagination } from "./grid-pagination";
import { GridToolbar } from "./grid-toolbar";
import { SortableColumnHeader } from "./sortable-column-header";

const DEFAULT_OVERSCAN = 10;
const DEFAULT_ROW_HEIGHT = 40;
const VIRTUAL_CONTAINER_HEIGHT = 600;

function resolveVirtualScrollConfig(
	config: VirtualScrollConfig | boolean | undefined,
): VirtualScrollConfig | null {
	if (config === undefined || config === false) return null;
	if (config === true) {
		return {
			enabled: true,
			overscan: DEFAULT_OVERSCAN,
			rowHeight: DEFAULT_ROW_HEIGHT,
		};
	}
	return config;
}

type RowData = Record<string, unknown>;

export function SchemaGrid({
	schema,
	data,
	onRowClick,
	onPageChange,
	onFilterChange,
	onColumnOrderChange,
	onDataStale,
	onDataRefresh: _onDataRefresh,
}: SchemaGridProps) {
	const { Table, TableHeader, TableBody, TableRow, TableCell, Badge } =
		usePrimitives();

	// NOTE: Use useRealtime hook when realtime config is present
	const isRealtimeEnabled = schema.realtime?.enabled === true;

	const realtimeFetcher = useCallback(async () => {
		// NOTE: Return current data as placeholder — actual refresh is driven by onDataRefresh callback
		return data as RowData[];
	}, [data]);

	const realtimeState = useRealtime<RowData[]>(
		data as RowData[],
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

	// NOTE: Use realtime data when available, otherwise fall back to prop data
	const effectiveData = isRealtimeEnabled
		? realtimeState.data
		: (data as RowData[]);

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
		{},
	);
	const [columnOrder, setColumnOrder] = useState<string[]>(() =>
		schema.columns.map((c) => c.key),
	);

	// NOTE: Reconcile columnOrder when schema.columns changes (e.g. dynamic schemas).
	// Adds any new keys and removes keys no longer in the schema.
	useEffect(() => {
		const schemaKeys = schema.columns.map((c) => c.key);
		setColumnOrder((prev) => {
			const existing = prev.filter((key) => schemaKeys.includes(key));
			const added = schemaKeys.filter((key) => !prev.includes(key));
			return added.length > 0 || existing.length !== prev.length
				? [...existing, ...added]
				: prev;
		});
	}, [schema.columns]);

	const columnVisibility = useMemo(() => {
		const visibility: Record<string, boolean> = {};
		for (const col of schema.columns) {
			if (col.visible === false) {
				visibility[col.key] = false;
			}
		}
		return visibility;
	}, [schema.columns]);

	const isColumnVisible = useCallback(
		(id: string) => columnVisibility[id] !== false,
		[columnVisibility],
	);

	const isColumnReorderEnabled = schema.columnReorder === true;

	const handleDragEnd = useDragEndHandler(
		columnOrder,
		isColumnVisible,
		setColumnOrder,
		onColumnOrderChange,
	);

	const virtualConfig = resolveVirtualScrollConfig(schema.virtualScroll);
	const isVirtualScroll = virtualConfig !== null;

	const paginationConfig =
		typeof schema.pagination === "object"
			? schema.pagination
			: { pageSize: 10 };

	const isServerMode = !!schema.serverPagination;

	const columns = useMemo<ColumnDef<RowData>[]>(
		() => buildColumns(schema.columns, Badge, isServerMode),
		[schema.columns, Badge, isServerMode],
	);

	const shouldPaginate =
		!(isServerMode || isVirtualScroll) && schema.pagination !== false;

	const rowIdMapRef = useRef(new WeakMap<RowData, string>());
	const rowIdCounterRef = useRef(0);

	const getRowId = useCallback(
		(row: RowData): string =>
			resolveRowId(row, schema.dataKey, rowIdMapRef, rowIdCounterRef),
		[schema.dataKey],
	);

	// NOTE: TanStack Table requires mutable Record<string, unknown>[];
	// the data prop is typed as readonly unknown[] for caller immutability.
	// When realtime is enabled, use the hook-managed data; otherwise use prop data.
	const table = useReactTable({
		data: effectiveData,
		columns,
		state: { sorting, ...(isColumnReorderEnabled ? { columnOrder } : {}) },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		...buildRowModelOptions(shouldPaginate, isServerMode),
		initialState: {
			pagination: { pageSize: paginationConfig?.pageSize ?? 10 },
			columnVisibility,
		},
		manualPagination: isServerMode,
		getRowId,
	});

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const allRows = table.getRowModel().rows;
	const pageSize = table.getState().pagination.pageSize;
	const pageOffset = isServerMode
		? schema.serverPagination?.currentPage * pageSize
		: table.getState().pagination.pageIndex * pageSize;

	const virtualizer = useVirtualizer({
		count: allRows.length,
		getScrollElement: () => scrollContainerRef.current,
		estimateSize: () => virtualConfig?.rowHeight ?? DEFAULT_ROW_HEIGHT,
		overscan: virtualConfig?.overscan ?? DEFAULT_OVERSCAN,
	});

	const disableFilters = isServerMode && !onFilterChange;

	const handleFilterChange = useCallback(
		(columnKey: string, value: string) => {
			if (isServerMode) {
				onFilterChange?.(columnKey, value);
			}
			setColumnFilters((prev) => ({ ...prev, [columnKey]: value }));
			if (!isServerMode) {
				table.getColumn(columnKey)?.setFilterValue(value);
			}
		},
		[table, isServerMode, onFilterChange],
	);

	const borderedClasses = schema.bordered
		? "border border-border rounded-lg overflow-hidden"
		: "rounded-lg overflow-hidden";

	const rowClasses = buildRowClasses(schema.hoverable, schema.striped);
	const cellBorderClasses = schema.bordered
		? "border-r last:border-r-0 px-4 py-2"
		: "px-4 py-2";

	const emptyMessage = resolveMessage(
		"noData",
		schema.i18n,
		schema.emptyMessage ?? "No data available",
	);

	const totalRows = isServerMode
		? schema.serverPagination?.totalRecords
		: table.getFilteredRowModel().rows.length;

	const sortableColumnIds = useMemo(
		() => columnOrder.filter((id) => columnVisibility[id] !== false),
		[columnOrder, columnVisibility],
	);

	const renderHeaderRows = () =>
		table.getHeaderGroups().map((headerGroup) => (
			<TableRow key={headerGroup.id} aria-rowindex={1}>
				{headerGroup.headers.map((header) => {
					const colDef = schema.columns.find((c) => c.key === header.id);
					const headerProps = {
						header,
						column: colDef,
						filterValue: columnFilters[header.id] ?? "",
						onFilterChange: (val: string) => handleFilterChange(header.id, val),
						enableResizing: schema.resizable ?? false,
						filterDisabled: disableFilters,
					};
					if (isColumnReorderEnabled) {
						return <SortableColumnHeader key={header.id} {...headerProps} />;
					}
					return <GridColumnHeader key={header.id} {...headerProps} />;
				})}
			</TableRow>
		));

	const wrapWithDndContext = (content: React.ReactNode) => {
		if (!isColumnReorderEnabled) return content;
		return (
			<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={sortableColumnIds}>{content}</SortableContext>
			</DndContext>
		);
	};

	const renderRow = (row: Row<RowData>, rowIndex: number) => (
		<TableRow
			key={row.id}
			className={
				onRowClick
					? `${rowClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
					: rowClasses
			}
			onClick={onRowClick ? () => onRowClick(row.original, row.id) : undefined}
			onKeyDown={
				onRowClick
					? (e: React.KeyboardEvent) => {
							if (e.key === "Enter" || e.key === " ") {
								if (e.key === " ") e.preventDefault();
								onRowClick(row.original, row.id);
							}
						}
					: undefined
			}
			tabIndex={onRowClick ? 0 : undefined}
			style={onRowClick ? { cursor: "pointer" } : undefined}
			role="row"
			aria-rowindex={rowIndex + 2}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell
					key={cell.id}
					className={`text-sm ${cellBorderClasses}`}
					role="cell"
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);

	const tableProps = {
		role: "grid" as const,
		"aria-label": schema.title ?? "Data grid",
		...(totalRows == null ? {} : { "aria-rowcount": totalRows + 1 }),
	};

	const headerContent = <TableHeader>{renderHeaderRows()}</TableHeader>;

	return (
		<div className="space-y-2">
			{schema.title && <h2 className="text-xl font-bold">{schema.title}</h2>}
			{schema.realtime?.enabled && isStale && (
				<div className="text-xs text-yellow-600 flex items-center gap-1">
					<span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
					Data may be stale
				</div>
			)}
			{schema.description && (
				<p className="text-sm text-muted-foreground">{schema.description}</p>
			)}
			{schema.filterable && (
				<GridToolbar
					table={table}
					columns={schema.columns}
					i18n={schema.i18n}
					disabled={isServerMode}
				/>
			)}
			{isVirtualScroll
				? wrapWithDndContext(
						renderVirtualContent({
							scrollContainerRef,
							borderedClasses,
							virtualConfig,
							tableProps,
							Table,
							headerContent,
							TableBody,
							TableRow,
							TableCell,
							allRows,
							emptyMessage,
							virtualizer,
							pageOffset,
							schema,
							renderRow,
						}),
					)
				: wrapWithDndContext(
						renderStandardContent({
							borderedClasses,
							tableProps,
							Table,
							headerContent,
							TableBody,
							TableRow,
							TableCell,
							table,
							emptyMessage,
							pageOffset,
							schema,
							renderRow,
						}),
					)}
			{schema.pagination !== false &&
				(!!schema.serverPagination || !isVirtualScroll) && (
					<GridPagination
						table={table}
						pageSizeOptions={paginationConfig?.pageSizeOptions}
						showPageSizeSelector={paginationConfig?.showPageSizeSelector}
						i18n={schema.i18n}
						serverPagination={schema.serverPagination}
						onPageChange={onPageChange}
					/>
				)}
		</div>
	);
}

interface VirtualContentProps {
	readonly scrollContainerRef: React.RefObject<HTMLDivElement | null>;
	readonly borderedClasses: string;
	readonly virtualConfig: VirtualScrollConfig | null;
	readonly tableProps: {
		readonly role: "grid";
		readonly "aria-label": string;
		readonly "aria-rowcount"?: number;
	};
	readonly Table: React.ComponentType<Record<string, unknown>>;
	readonly headerContent: React.ReactNode;
	readonly TableBody: React.ComponentType<Record<string, unknown>>;
	readonly TableRow: React.ComponentType<Record<string, unknown>>;
	readonly TableCell: React.ComponentType<Record<string, unknown>>;
	readonly allRows: readonly Row<RowData>[];
	readonly emptyMessage: string;
	readonly virtualizer: Virtualizer<HTMLDivElement, Element>;
	readonly pageOffset: number;
	readonly schema: SchemaGridProps["schema"];
	readonly renderRow: (row: Row<RowData>, rowIndex: number) => React.ReactNode;
}

function renderVirtualContent({
	scrollContainerRef,
	borderedClasses,
	virtualConfig,
	tableProps,
	Table,
	headerContent,
	TableBody,
	TableRow,
	TableCell,
	allRows,
	emptyMessage,
	virtualizer,
	pageOffset,
	schema,
	renderRow,
}: VirtualContentProps) {
	const virtualItems = virtualizer.getVirtualItems();
	const totalSize = virtualizer.getTotalSize();
	const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
	const paddingBottom =
		virtualItems.length > 0
			? totalSize - virtualItems[virtualItems.length - 1].end
			: 0;

	if (allRows.length === 0) {
		return (
			<div
				ref={scrollContainerRef}
				className={borderedClasses}
				style={{
					overflow: "auto",
					height: `${virtualConfig?.containerHeight ?? VIRTUAL_CONTAINER_HEIGHT}px`,
				}}
			>
				<Table {...tableProps} style={{ width: "100%" }}>
					{headerContent}
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={schema.columns.length}
								className="text-center text-muted-foreground py-8"
								role="cell"
							>
								{emptyMessage}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div
			ref={scrollContainerRef}
			className={borderedClasses}
			style={{
				overflow: "auto",
				height: `${virtualConfig?.containerHeight ?? VIRTUAL_CONTAINER_HEIGHT}px`,
			}}
		>
			<Table {...tableProps} style={{ width: "100%" }}>
				{headerContent}
				<TableBody>
					{paddingTop > 0 && (
						// biome-ignore lint/a11y/noAriaHiddenOnFocusable: NOTE: Spacer row contains no focusable content — purely layout for virtual scroll padding
						<tr aria-hidden="true">
							<td
								colSpan={schema.columns.length}
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
						const row = allRows[virtualRow.index];
						return renderRow(row, pageOffset + virtualRow.index);
					})}
					{paddingBottom > 0 && (
						// biome-ignore lint/a11y/noAriaHiddenOnFocusable: NOTE: Spacer row contains no focusable content — purely layout for virtual scroll padding
						<tr aria-hidden="true">
							<td
								colSpan={schema.columns.length}
								role="presentation"
								style={{
									height: `${paddingBottom}px`,
									padding: 0,
									border: "none",
								}}
							/>
						</tr>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

interface StandardContentProps {
	readonly borderedClasses: string;
	readonly tableProps: {
		readonly role: "grid";
		readonly "aria-label": string;
		readonly "aria-rowcount"?: number;
	};
	readonly Table: React.ComponentType<Record<string, unknown>>;
	readonly headerContent: React.ReactNode;
	readonly TableBody: React.ComponentType<Record<string, unknown>>;
	readonly TableRow: React.ComponentType<Record<string, unknown>>;
	readonly TableCell: React.ComponentType<Record<string, unknown>>;
	readonly table: ReturnType<typeof useReactTable<RowData>>;
	readonly emptyMessage: string;
	readonly pageOffset: number;
	readonly schema: SchemaGridProps["schema"];
	readonly renderRow: (row: Row<RowData>, rowIndex: number) => React.ReactNode;
}

function renderStandardContent({
	borderedClasses,
	tableProps,
	Table,
	headerContent,
	TableBody,
	TableRow,
	TableCell,
	table,
	emptyMessage,
	pageOffset,
	schema,
	renderRow,
}: StandardContentProps) {
	const rows = table.getRowModel().rows;

	return (
		<div className={borderedClasses}>
			<Table {...tableProps}>
				{headerContent}
				<TableBody>
					{rows.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={schema.columns.length}
								className="text-center text-muted-foreground py-8"
								role="cell"
							>
								{emptyMessage}
							</TableCell>
						</TableRow>
					) : (
						rows.map((row, rowIndex) => renderRow(row, pageOffset + rowIndex))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

function useDragEndHandler(
	columnOrder: readonly string[],
	isColumnVisible: (id: string) => boolean,
	setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>,
	onColumnOrderChange: ((order: readonly string[]) => void) | undefined,
) {
	return useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const activeId = String(active.id);
			const overId = String(over.id);

			// NOTE: Compute reorder against visible columns only, preserving hidden column positions.
			const visibleIds = columnOrder.filter((id) => isColumnVisible(id));
			const oldVisIndex = visibleIds.indexOf(activeId);
			const newVisIndex = visibleIds.indexOf(overId);
			if (oldVisIndex === -1 || newVisIndex === -1) return;

			const reorderedVisible = arrayMove(visibleIds, oldVisIndex, newVisIndex);

			// Merge reordered visible IDs back into full columnOrder
			let visIdx = 0;
			const mergedOrder = columnOrder.map((id) =>
				isColumnVisible(id) ? reorderedVisible[visIdx++] : id,
			);

			setColumnOrder(mergedOrder);
			onColumnOrderChange?.(mergedOrder);
		},
		[onColumnOrderChange, columnOrder, isColumnVisible, setColumnOrder],
	);
}

function resolveRowId(
	row: RowData,
	dataKey: string,
	rowIdMapRef: React.RefObject<WeakMap<RowData, string> | null>,
	rowIdCounterRef: React.RefObject<number>,
): string {
	const keyValue = row[dataKey];
	if (
		keyValue != null &&
		(typeof keyValue === "string" ||
			typeof keyValue === "number" ||
			typeof keyValue === "boolean")
	) {
		return String(keyValue);
	}
	if (row.id != null) return String(row.id);
	let stableId = rowIdMapRef.current?.get(row);
	if (stableId === undefined) {
		// biome-ignore lint/style/noNonNullAssertion: rowIdCounterRef is initialized directly via useRef(0), so .current is never null
		stableId = `__row_${rowIdCounterRef.current!++}`;
		rowIdMapRef.current?.set(row, stableId);
	}
	return stableId;
}

function buildRowModelOptions(shouldPaginate: boolean, isServerMode: boolean) {
	if (shouldPaginate) {
		return {
			getPaginationRowModel: getPaginationRowModel(),
			getSortedRowModel: getSortedRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
		};
	}
	if (!isServerMode) {
		return {
			getSortedRowModel: getSortedRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
		};
	}
	return {};
}

function buildRowClasses(
	hoverable: boolean | undefined,
	striped: boolean | undefined,
): string {
	return [
		hoverable === false ? "" : "hover:bg-muted/50",
		striped ? "even:bg-muted/30" : "",
		"border-b last:border-b-0 transition-colors",
	]
		.filter(Boolean)
		.join(" ");
}

function buildColumns(
	columns: readonly GridColumnSchema[],
	Badge: React.ComponentType<Record<string, unknown>>,
	disableSort: boolean,
): ColumnDef<RowData>[] {
	return columns.map((col) => ({
		accessorKey: col.key,
		header: col.label,
		enableSorting: disableSort ? false : (col.sortable ?? false),
		enableResizing: col.resizable ?? false,
		cell: (info: CellContext<RowData, unknown>) =>
			renderCellValue(col, info.getValue(), Badge),
		size: col.width ? parseInt(col.width, 10) : undefined,
	}));
}

function renderCellValue(
	col: GridColumnSchema,
	value: unknown,
	Badge: React.ComponentType<Record<string, unknown>>,
): React.ReactNode {
	if (col.type === "status" && col.statusConfig && value != null) {
		const statusKey = String(value).toLowerCase();
		const statusDef = col.statusConfig.variants[statusKey];
		if (statusDef === undefined) {
			console.warn(
				`[SchemaGrid] No status variant found for key "${statusKey}". Available keys: ${Object.keys(col.statusConfig.variants).join(", ")}`,
			);
		}
		if (statusDef) {
			return (
				<Badge variant="outline" className={statusDef.className}>
					{statusDef.label}
				</Badge>
			);
		}
	}
	return value == null ? "" : String(value);
}
