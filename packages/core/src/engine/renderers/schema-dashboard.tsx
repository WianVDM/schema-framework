import { type ReactNode, useCallback, useState } from "react";
import type { DashboardRendererProps } from "../types/dashboard-renderer-props";
import type { DashboardSchema } from "../types/dashboard-schema";
import { SchemaLayout } from "./schema-layout";

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
	readonly onRegionResize?: import("../types/region-resize-handler").RegionResizeHandler;
	readonly onPanelCollapse?: import("../types/panel-collapse-handler").PanelCollapseHandler;
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
	readonly onRegionResize?: import("../types/region-resize-handler").RegionResizeHandler;
	readonly onPanelCollapse?: import("../types/panel-collapse-handler").PanelCollapseHandler;
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

/** Tabbed panel switching — shows one panel at a time */
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
	readonly onRegionResize?: import("../types/region-resize-handler").RegionResizeHandler;
	readonly onPanelCollapse?: import("../types/panel-collapse-handler").PanelCollapseHandler;
}): ReactNode {
	const activePanel = schema.panels.find((p) => p.id === activeTabId);

	return (
		<div className="flex flex-col flex-1 min-h-0">
			<div className="flex border-b">
				{schema.panels.map((panel) => (
					<button
						key={panel.id}
						type="button"
						onClick={() => onTabChange(panel.id)}
						className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
							panel.id === activeTabId
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						{panel.title ?? panel.id}
					</button>
				))}
			</div>
			<div className="flex-1 min-h-0">
				{activePanel && (
					<SchemaLayout
						schema={activePanel.layout}
						onRegionResize={onRegionResize}
						onPanelCollapse={onPanelCollapse}
					/>
				)}
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
	readonly onRegionResize?: import("../types/region-resize-handler").RegionResizeHandler;
	readonly onPanelCollapse?: import("../types/panel-collapse-handler").PanelCollapseHandler;
}): ReactNode {
	// NOTE: For border panelLayout, the first panel's layout is rendered as the main dashboard layout.
	// This is a simple approach — a more advanced version would combine all panel layouts into one border layout.
	const primaryPanel = schema.panels[0];

	if (!primaryPanel) return null;

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
