import {
	type KeyboardEvent as ReactKeyboardEvent,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { DashboardRendererProps } from "../types/dashboard-renderer-props";
import type { DashboardSchema } from "../types/dashboard-schema";
import type { PanelCollapseHandler } from "../types/panel-collapse-handler";
import type { RegionResizeHandler } from "../types/region-resize-handler";
import { SchemaLayout } from "./schema-layout";

// NOTE: Module-level flag ensures the border panel warning fires only once per session
let borderPanelWarned = false;

/** Renders a multi-panel dashboard from DashboardSchema */
export function SchemaDashboard({
	schema,
	onRegionResize,
	onPanelCollapse,
	onActivePanelChange,
}: DashboardRendererProps): ReactNode {
	const panelLayout = schema.panelLayout ?? "vertical";

	const [activeTabId, setActiveTabId] = useState<string>(
		schema.panels[0]?.id ?? "",
	);

	// NOTE: Only reset activeTabId when current selection is no longer in the panel list
	useEffect(() => {
		const panelIds = schema.panels.map((p) => p.id);
		setActiveTabId((prev) =>
			panelIds.includes(prev) ? prev : (panelIds[0] ?? ""),
		);
	}, [schema.panels]);

	const handleTabChange = useCallback(
		(panelId: string) => {
			setActiveTabId(panelId);
			onActivePanelChange?.(panelId);
		},
		[onActivePanelChange],
	);

	return (
		<div className={schema.className ?? "flex flex-col h-full w-full gap-4"}>
			{(schema.title || schema.description) && (
				<div className="px-4 pt-4">
					{schema.title && (
						<h2 className="text-2xl font-bold">{schema.title}</h2>
					)}
					{schema.description && (
						<p className="text-muted-foreground text-sm mt-1">
							{schema.description}
						</p>
					)}
				</div>
			)}

			<DashboardPanelLayout
				schema={schema}
				panelLayout={panelLayout}
				activeTabId={activeTabId}
				onTabChange={handleTabChange}
				onRegionResize={onRegionResize}
				onPanelCollapse={onPanelCollapse}
			/>
		</div>
	);
}

/** Dispatches to the correct panel composition strategy */
function DashboardPanelLayout({
	schema,
	panelLayout,
	activeTabId,
	onTabChange,
	onRegionResize,
	onPanelCollapse,
}: {
	readonly schema: DashboardSchema;
	readonly panelLayout: "vertical" | "tabs" | "border";
	readonly activeTabId: string;
	readonly onTabChange: (panelId: string) => void;
	readonly onRegionResize?: RegionResizeHandler;
	readonly onPanelCollapse?: PanelCollapseHandler;
}): ReactNode {
	switch (panelLayout) {
		case "tabs":
			return (
				<TabsPanelLayout
					schema={schema}
					activeTabId={activeTabId}
					onTabChange={onTabChange}
					onRegionResize={onRegionResize}
					onPanelCollapse={onPanelCollapse}
				/>
			);
		case "border":
			return (
				<BorderPanelLayout
					schema={schema}
					onRegionResize={onRegionResize}
					onPanelCollapse={onPanelCollapse}
				/>
			);
		default:
			return (
				<VerticalPanelLayout
					schema={schema}
					onRegionResize={onRegionResize}
					onPanelCollapse={onPanelCollapse}
				/>
			);
	}
}

/** Vertical stacking of all panels */
function VerticalPanelLayout({
	schema,
	onRegionResize,
	onPanelCollapse,
}: {
	readonly schema: DashboardSchema;
	readonly onRegionResize?: RegionResizeHandler;
	readonly onPanelCollapse?: PanelCollapseHandler;
}): ReactNode {
	return (
		<div className="flex flex-col gap-4 flex-1 min-h-0">
			{schema.panels.map((panel) => (
				<div key={panel.id} className={panel.className}>
					{panel.title && (
						<h3 className="text-lg font-semibold mb-2 px-1">{panel.title}</h3>
					)}
					<SchemaLayout
						schema={panel.layout}
						onRegionResize={onRegionResize}
						onPanelCollapse={onPanelCollapse}
					/>
				</div>
			))}
		</div>
	);
}

/** Tabbed panel switching — shows one panel at a time with full ARIA support */
function TabsPanelLayout({
	schema,
	activeTabId,
	onTabChange,
	onRegionResize,
	onPanelCollapse,
}: {
	readonly schema: DashboardSchema;
	readonly activeTabId: string;
	readonly onTabChange: (panelId: string) => void;
	readonly onRegionResize?: RegionResizeHandler;
	readonly onPanelCollapse?: PanelCollapseHandler;
}): ReactNode {
	const tabListRef = useRef<HTMLDivElement>(null);
	const activePanel = schema.panels.find((p) => p.id === activeTabId);

	const handleTabClick = useCallback(
		(e: ReactMouseEvent<HTMLButtonElement>) => {
			onTabChange(e.currentTarget.dataset.panelId ?? "");
		},
		[onTabChange],
	);

	// NOTE: Keyboard navigation for tab list — arrows move focus and activate, Home/End jump
	const handleTabKeyDown = useCallback(
		(e: ReactKeyboardEvent<HTMLButtonElement>) => {
			const tabs = schema.panels;
			const currentIndex = tabs.findIndex((p) => p.id === activeTabId);
			let nextIndex = -1;

			// NOTE: Guard against activeTabId not found — start from logical endpoint
			if (currentIndex === -1) {
				switch (e.key) {
					case "ArrowRight":
						nextIndex = 0;
						break;
					case "ArrowLeft":
						nextIndex = tabs.length - 1;
						break;
					case "Home":
						nextIndex = 0;
						break;
					case "End":
						nextIndex = tabs.length - 1;
						break;
					default:
						return;
				}
			} else {
				switch (e.key) {
					case "ArrowRight":
						nextIndex = (currentIndex + 1) % tabs.length;
						break;
					case "ArrowLeft":
						nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
						break;
					case "Home":
						nextIndex = 0;
						break;
					case "End":
						nextIndex = tabs.length - 1;
						break;
					default:
						return;
				}
			}

			e.preventDefault();
			const nextPanel = tabs[nextIndex];
			if (nextPanel) {
				onTabChange(nextPanel.id);
				// NOTE: Focus the newly active tab button
				const tabButtons =
					tabListRef.current?.querySelectorAll<HTMLButtonElement>(
						'[role="tab"]',
					);
				tabButtons?.[nextIndex]?.focus();
			}
		},
		[schema.panels, activeTabId, onTabChange],
	);

	return (
		<div className="flex flex-col flex-1 min-h-0">
			{/* NOTE: Tab list with ARIA role and keyboard navigation */}
			<div
				ref={tabListRef}
				role="tablist"
				aria-label="Dashboard panels"
				className="flex border-b"
			>
				{schema.panels.map((panel) => {
					const isActive = panel.id === activeTabId;
					const panelId = `panel-${panel.id}`;
					const tabId = `tab-${panel.id}`;

					return (
						<button
							key={panel.id}
							id={tabId}
							type="button"
							role="tab"
							aria-selected={isActive}
							aria-controls={panelId}
							tabIndex={isActive ? 0 : -1}
							data-panel-id={panel.id}
							onClick={handleTabClick}
							onKeyDown={handleTabKeyDown}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								isActive
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							{panel.title ?? panel.id}
						</button>
					);
				})}
			</div>
			<div className="flex-1 min-h-0">
				{activePanel ? (
					<div
						id={`panel-${activePanel.id}`}
						role="tabpanel"
						aria-labelledby={`tab-${activePanel.id}`}
						className="h-full"
					>
						<SchemaLayout
							schema={activePanel.layout}
							onRegionResize={onRegionResize}
							onPanelCollapse={onPanelCollapse}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}

/** Border layout panel composition — renders all panels in border layout */
function BorderPanelLayout({
	schema,
	onRegionResize,
	onPanelCollapse,
}: {
	readonly schema: DashboardSchema;
	readonly onRegionResize?: RegionResizeHandler;
	readonly onPanelCollapse?: PanelCollapseHandler;
}): ReactNode {
	// NOTE: For border panelLayout, the first panel's layout is rendered as the main dashboard layout.
	// This is a simple approach — a more advanced version would combine all panel layouts into one border layout.
	const primaryPanel = schema.panels[0];

	if (primaryPanel === undefined) return null;

	// NOTE: Once-only warning — border layout only renders the first panel (minifiers strip console.warn in production)
	if (schema.panels.length > 1 && !borderPanelWarned) {
		borderPanelWarned = true;
		console.warn(
			"BorderPanelLayout only renders the first panel. Additional panels (%d) will be ignored.",
			schema.panels.length - 1,
		);
	}

	return (
		<div className="flex-1 min-h-0">
			<SchemaLayout
				schema={primaryPanel.layout}
				onRegionResize={onRegionResize}
				onPanelCollapse={onPanelCollapse}
			/>
		</div>
	);
}
