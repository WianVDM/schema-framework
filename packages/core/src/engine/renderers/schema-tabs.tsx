import {
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useState,
} from "react";
import { useLayoutPrimitives } from "../context/layout-primitives-context";
import type { TabItem } from "../types/tab-item";
import type { TabSchema } from "../types/tab-schema";
import type { TabsRendererProps } from "../types/tabs-renderer-props";
import { ContentRenderer } from "./content-renderer";

/** Resolves a selectable (non-disabled) tab ID from a preference list — skips disabled tabs */
function resolveSelectableTabId(
	tabs: readonly TabItem[],
	...preferences: readonly (string | undefined)[]
): string {
	for (const preferred of preferences) {
		if (preferred) {
			const match = tabs.find((t) => t.id === preferred && !t.disabled);
			if (match) return match.id;
		}
	}
	// NOTE: Fall back to first non-disabled tab
	const firstEnabled = tabs.find((t) => !t.disabled);
	return firstEnabled?.id ?? "";
}

/** Renders tabbed content from TabSchema with eager/lazy mount modes */
export function SchemaTabs({
	schema,
	onTabChange,
}: TabsRendererProps): ReactNode {
	const { Tabs, TabsList, TabsTrigger, TabsContent } = useLayoutPrimitives();
	const safeTabs = useMemo(() => schema.tabs ?? [], [schema.tabs]);

	// NOTE: Normalize mountMode — treat lazy:true as mountMode:'lazy' for backward compatibility
	const effectiveMountMode =
		schema.mountMode ?? (schema.lazy ? "lazy" : "eager");

	useEffect(() => {
		console.assert(
			!(schema.mountMode !== undefined && schema.lazy !== undefined),
			"TabSchema: both mountMode and lazy are set — mountMode takes precedence. Prefer mountMode only.",
		);
	}, [schema.mountMode, schema.lazy]);

	const [activeTab, setActiveTab] = useState(() =>
		resolveSelectableTabId(safeTabs, schema.defaultTab),
	);

	// NOTE: Reset activeTab when safeTabs or defaultTab changes and current tab is no longer valid.
	// Also notifies external consumers via onTabChange so they don't desync from programmatic resets.
	// Uses resolveSelectableTabId to skip disabled tabs in all resolution paths.
	useEffect(() => {
		const nextTab = resolveSelectableTabId(
			safeTabs,
			activeTab,
			schema.defaultTab,
		);

		if (nextTab !== activeTab) {
			setActiveTab(nextTab);
			onTabChange?.(nextTab);
		}
	}, [safeTabs, schema.defaultTab, activeTab, onTabChange]);

	const mountedTabs = useLazyTabContent(
		activeTab,
		safeTabs,
		effectiveMountMode,
	);

	// NOTE: All hooks (useCallback) must be called before any conditional returns
	const handleTabChange = useCallback(
		(tabId: string) => {
			setActiveTab(tabId);
			onTabChange?.(tabId);
		},
		[onTabChange],
	);

	// NOTE: Guard against empty tabs array — hooks must come before early returns
	if (!safeTabs.length) return null;

	// NOTE: Fallback when Tabs primitives are not injected — render plain HTML tabs
	if (!(Tabs && TabsList && TabsTrigger && TabsContent)) {
		return (
			<FallbackTabs
				schema={schema}
				activeTab={activeTab}
				onTabChange={handleTabChange}
				mountedTabs={mountedTabs}
			/>
		);
	}

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange}>
			<TabsList>
				{safeTabs.map((tab) => (
					<TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			{safeTabs.map((tab) => {
				// NOTE: Lazy mode — only render tabs that have been mounted (active + previously activated)
				if (!mountedTabs.has(tab.id)) return null;
				return (
					<TabsContent key={tab.id} value={tab.id}>
						<ContentRenderer content={tab.content} />
					</TabsContent>
				);
			})}
		</Tabs>
	);
}

/** Hook tracking which tabs have been mounted (lazy mode: active + previously mounted) */
function useLazyTabContent(
	activeTab: string,
	tabs: readonly TabItem[],
	mountMode: "eager" | "lazy",
): ReadonlySet<string> {
	// NOTE: Eager mode computed via useMemo — pure render, no side effects
	const eagerSet = useMemo(() => new Set(tabs.map((t) => t.id)), [tabs]);

	const [lazyMounted, setLazyMounted] = useState<ReadonlySet<string>>(() =>
		activeTab ? new Set([activeTab]) : new Set(),
	);

	// NOTE: Lazy mount tracking via useEffect — side effects belong in effects, not render
	useEffect(() => {
		if (mountMode === "lazy" && activeTab) {
			setLazyMounted((prev) => {
				if (prev.has(activeTab)) return prev;
				return new Set([...prev, activeTab]);
			});
		}
	}, [activeTab, mountMode]);

	// NOTE: Prune stale IDs — remove tabs no longer in the schema, reset to eager when switching
	useEffect(() => {
		if (mountMode === "eager") {
			setLazyMounted(eagerSet);
		} else {
			const currentIds = new Set(tabs.map((t) => t.id));
			setLazyMounted((prev) => {
				const pruned = new Set([...prev].filter((id) => currentIds.has(id)));
				return pruned.size === prev.size ? prev : pruned;
			});
		}
	}, [tabs, mountMode, eagerSet]);

	if (mountMode === "eager") return eagerSet;
	return lazyMounted;
}

/** WAI-ARIA keyboard navigation handler for fallback tab buttons */
function handleTabKeyDown(
	e: KeyboardEvent<HTMLButtonElement>,
	tabs: readonly TabItem[],
	activeTab: string,
	onTabChange: (tabId: string) => void,
	instanceId: string,
): void {
	const enabledTabs = tabs.filter((t) => !t.disabled);
	if (enabledTabs.length === 0) return;

	const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);
	let nextIndex = currentIndex;

	switch (e.key) {
		case "ArrowRight":
			// NOTE: If activeTab not in enabledTabs, start from first tab
			nextIndex =
				currentIndex === -1 ? 0 : (currentIndex + 1) % enabledTabs.length;
			break;
		case "ArrowLeft":
			// NOTE: If activeTab not in enabledTabs, start from last tab
			nextIndex =
				currentIndex === -1
					? enabledTabs.length - 1
					: (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
			break;
		case "Home":
			nextIndex = 0;
			break;
		case "End":
			nextIndex = enabledTabs.length - 1;
			break;
		default:
			return;
	}

	e.preventDefault();
	const nextTab = enabledTabs[nextIndex];
	if (nextTab) {
		onTabChange(nextTab.id);
		document.getElementById(`${instanceId}-tab-${nextTab.id}`)?.focus();
	}
}

/** Fallback tabs renderer when primitives are not injected */
function FallbackTabs({
	schema,
	activeTab,
	onTabChange,
	mountedTabs,
}: {
	readonly schema: TabSchema;
	readonly activeTab: string;
	readonly onTabChange: (tabId: string) => void;
	readonly mountedTabs: ReadonlySet<string>;
}): ReactNode {
	const safeTabs = schema.tabs ?? [];
	// NOTE: useId generates a stable per-instance prefix to avoid ID collisions across
	// multiple FallbackTabs instances on the same page
	const instanceId = useId();

	return (
		<div className={schema.className}>
			<div className="flex border-b" role="tablist">
				{safeTabs.map((tab) => (
					<button
						key={tab.id}
						id={`${instanceId}-tab-${tab.id}`}
						role="tab"
						type="button"
						aria-selected={activeTab === tab.id}
						aria-controls={`${instanceId}-panel-${tab.id}`}
						tabIndex={activeTab === tab.id ? 0 : -1}
						disabled={tab.disabled}
						className={`px-4 py-2 text-sm border-b-2 transition-colors ${
							activeTab === tab.id
								? "border-primary font-medium"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => onTabChange(tab.id)}
						onKeyDown={(e) =>
							handleTabKeyDown(e, safeTabs, activeTab, onTabChange, instanceId)
						}
					>
						{tab.label}
					</button>
				))}
			</div>
			{safeTabs.map((tab) => {
				if (!mountedTabs.has(tab.id)) return null;
				return (
					<div
						key={tab.id}
						id={`${instanceId}-panel-${tab.id}`}
						role="tabpanel"
						aria-labelledby={`${instanceId}-tab-${tab.id}`}
						className={tab.className}
						style={{ display: activeTab === tab.id ? undefined : "none" }}
					>
						<ContentRenderer content={tab.content} />
					</div>
				);
			})}
		</div>
	);
}
