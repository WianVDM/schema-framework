/** Strategy for merging refreshed data with existing data */
export type RefreshStrategy = "replace" | "merge" | "append";

/** Real-time polling configuration for data components */
export interface RealtimeConfig {
	/** Enable polling */
	readonly enabled: boolean;
	/** Polling interval in milliseconds */
	readonly intervalMs: number;
	/** How to merge refreshed data */
	readonly strategy?: RefreshStrategy;
	/** Pause polling when the page/tab is hidden */
	readonly pauseOnHidden?: boolean;
	/** Data older than this threshold (ms) is considered stale */
	readonly staleThresholdMs?: number;
}
