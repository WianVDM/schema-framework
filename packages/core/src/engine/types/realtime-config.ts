import type { RefreshStrategy } from "./refresh-strategy";

/** Configuration for real-time data updates */
export interface RealtimeConfig {
	/** Whether real-time updates are enabled */
	readonly enabled: boolean;
	/** Refresh strategy */
	readonly strategy?: RefreshStrategy;
	/** Polling interval in milliseconds */
	readonly intervalMs?: number;
	/** Whether to pause polling when the tab is hidden */
	readonly pauseOnHidden?: boolean;
	/** Threshold in milliseconds after which data is considered stale */
	readonly staleThresholdMs?: number;
	/** WebSocket or SSE endpoint URL */
	readonly endpoint?: string;
}
