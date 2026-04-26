import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeConfig } from "../types/realtime-config";

interface RealtimeState<T> {
	/** Current data */
	readonly data: T;
	/** Whether a refresh is in progress */
	readonly isLoading: boolean;
	/** Timestamp of last successful refresh */
	readonly lastRefreshed: number | null;
	/** Manual refresh trigger */
	readonly refresh: () => void;
}

/**
 * Hook for real-time polling of data sources.
 * Handles interval-based refresh, tab visibility pausing, and stale detection.
 */
export function useRealtime<T>(
	initialData: T,
	config: RealtimeConfig,
	fetcher: () => Promise<T>,
): RealtimeState<T> {
	const [data, setData] = useState<T>(initialData);
	const [isLoading, setIsLoading] = useState(false);
	const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		try {
			const fresh = await fetcher();
			setData(fresh);
			setLastRefreshed(Date.now());
		} catch {
			// NOTE: Silently ignore fetch errors — data retains last known good state
		} finally {
			setIsLoading(false);
		}
	}, [fetcher]);

	// NOTE: Set up polling interval when enabled
	useEffect(() => {
		if (!config.enabled) {
			return;
		}

		intervalRef.current = setInterval(refresh, config.intervalMs);

		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [config.enabled, config.intervalMs, refresh]);

	// NOTE: Pause polling when tab is hidden (if configured)
	useEffect(() => {
		if (!config.enabled || !config.pauseOnHidden) {
			return;
		}

		const handleVisibility = () => {
			if (document.hidden) {
				if (intervalRef.current !== null) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			} else {
				refresh();
				intervalRef.current = setInterval(refresh, config.intervalMs);
			}
		};

		document.addEventListener("visibilitychange", handleVisibility);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [config.enabled, config.intervalMs, config.pauseOnHidden, refresh]);

	return { data, isLoading, lastRefreshed, refresh };
}
