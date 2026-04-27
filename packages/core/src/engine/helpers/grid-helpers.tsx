import type { CellContext, ColumnDef } from "@tanstack/react-table";
import type { GridColumnSchema, VirtualScrollConfig } from "../types";

/** NOTE: Default constants for virtual scrolling */
const DEFAULT_OVERSCAN = 10;
const DEFAULT_ROW_HEIGHT = 40;

export type RowData = Record<string, unknown>;

/** Resolves a VirtualScrollConfig from boolean or object form */
export function resolveVirtualScrollConfig(
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

/** Builds CSS classes for table rows based on hoverable/striped config */
export function buildRowClasses(
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

/** Builds TanStack Table column definitions from GridColumnSchema array */
export function buildColumns(
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

/** Renders a cell value based on column type configuration */
export function renderCellValue(
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

/** Resolves a stable row ID from data, using dataKey, id field, or generating one */
export function resolveRowId(
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
		// biome-ignore lint/style/noNonNullAssertion: NOTE: rowIdCounterRef is initialized via useRef(0), .current is never null
		stableId = `__row_${rowIdCounterRef.current!++}`;
		rowIdMapRef.current?.set(row, stableId);
	}
	return stableId;
}
