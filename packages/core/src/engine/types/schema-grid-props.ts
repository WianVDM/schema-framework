import type { GridSchema } from "./grid-schema";

export interface SchemaGridProps {
	readonly schema: GridSchema;
	readonly data: readonly Record<string, unknown>[];
	readonly onRowClick?: (
		row: Readonly<Record<string, unknown>>,
		rowId: string,
	) => void;
	readonly onPageChange?: (page: number, pageSize: number) => void;
	readonly onFilterChange?: (columnKey: string, value: string) => void;
	readonly onColumnOrderChange?: (columnKeys: readonly string[]) => void;
	/** Called when realtime data becomes stale according to staleThresholdMs */
	readonly onDataStale?: () => void;
	/** Called when realtime data is refreshed */
	readonly onDataRefresh?: (data: unknown) => void;
	/** External fetcher for realtime polling — when provided, useRealtime calls this instead of returning stale data */
	readonly fetchData?: () => Promise<readonly Record<string, unknown>[]>;
}
