import type { ReactNode } from "react";
import { useLayoutPrimitives } from "../context/layout-primitives-context";
import { useResponsiveCollapse } from "../helpers/use-responsive-collapse";
import type { BorderPosition } from "../types/border-position";
import type { LayoutRegion } from "../types/layout-region";
import type { LayoutRendererProps } from "../types/layout-renderer-props";
import { BORDER_DEFAULT_SIZES } from "../validators/border-layout";
import { AccordionLayoutRenderer } from "./accordion-layout";
import { BoxLayoutRenderer } from "./box-layout";
import { CardLayoutRenderer } from "./card-layout";
import { SchemaPanel } from "./schema-panel";

/** Main layout renderer — dispatches to layout-type-specific renderers */
export function SchemaLayout({
	schema,
	onRegionResize: _onRegionResize,
	onPanelCollapse: _onPanelCollapse,
}: LayoutRendererProps): ReactNode {
	switch (schema.type) {
		case "border":
			return (
				<BorderLayoutRenderer
					regions={schema.regions}
					onRegionResize={_onRegionResize}
					onPanelCollapse={_onPanelCollapse}
				/>
			);
		case "accordion":
			return (
				<AccordionLayoutRenderer
					regions={schema.regions}
					accordionConfig={schema.accordionConfig}
					onPanelCollapse={_onPanelCollapse}
				/>
			);
		case "card":
			return (
				<CardLayoutRenderer
					regions={schema.regions}
					cardGridConfig={schema.cardGridConfig}
				/>
			);
		case "hbox":
			return (
				<BoxLayoutRenderer
					direction="horizontal"
					regions={schema.regions}
					boxConfig={schema.boxConfig}
					onPanelCollapse={_onPanelCollapse}
				/>
			);
		case "vbox":
			return (
				<BoxLayoutRenderer
					direction="vertical"
					regions={schema.regions}
					boxConfig={schema.boxConfig}
					onPanelCollapse={_onPanelCollapse}
				/>
			);
		default:
			return (
				<ErrorPlaceholder message={`Unknown layout type: ${schema.type}`} />
			);
	}
}

/** Renders border layout with N/S/E/W/C regions using injected resizable panels */
function BorderLayoutRenderer({
	regions,
	onRegionResize,
	onPanelCollapse,
}: {
	readonly regions: readonly LayoutRegion[];
	readonly onRegionResize?: import("../types/region-resize-handler").RegionResizeHandler;
	readonly onPanelCollapse?: import("../types/panel-collapse-handler").PanelCollapseHandler;
}): ReactNode {
	const { ResizablePanelGroup, ResizablePanel, ResizableHandle } =
		useLayoutPrimitives();

	// NOTE: Runtime responsive collapse — uses matchMedia to observe viewport breakpoints
	const responsiveCollapsed = useResponsiveCollapse(regions);

	const categorized = categorizeRegions(regions);

	const isRegionCollapsed = (region: LayoutRegion): boolean =>
		region.collapsed === true || responsiveCollapsed.get(region.id) === true;

	// NOTE: Fallback when resizable primitives are not injected
	if (!(ResizablePanelGroup && ResizablePanel && ResizableHandle)) {
		return (
			<FallbackBorderLayout
				categorized={categorized}
				onPanelCollapse={onPanelCollapse}
				isRegionCollapsed={isRegionCollapsed}
			/>
		);
	}

	return (
		<div className="h-full w-full">
			<ResizablePanelGroup
				direction="vertical"
				onLayout={(sizes: number[]) => {
					if (!onRegionResize) return;
					// NOTE: Map vertical panel sizes back to visible region IDs
					const visibleVertical = [
						categorized.north,
						categorized.center,
						categorized.south,
					].filter((r) => r && !isRegionCollapsed(r));
					const sizeMap: Record<string, number> = {};
					for (let i = 0; i < visibleVertical.length; i++) {
						const region = visibleVertical[i];
						if (region) sizeMap[region.id] = sizes[i] ?? 0;
					}
					const firstRegion = visibleVertical[0];
					if (firstRegion) onRegionResize(firstRegion.id, sizeMap);
				}}
			>
				{categorized.north && !isRegionCollapsed(categorized.north) && (
					<>
						<ResizablePanel
							defaultSize={getRegionSize(categorized.north, "north")}
							minSize={extractNumericSize(categorized.north.minSize)}
							maxSize={extractNumericSize(categorized.north.maxSize)}
							collapsible={categorized.north.collapsible}
						>
							<SchemaPanel
								region={categorized.north}
								onCollapse={onPanelCollapse}
							/>
						</ResizablePanel>
						<ResizableHandle />
					</>
				)}

				<ResizablePanel
					defaultSize={getCenterSize(categorized, responsiveCollapsed)}
				>
					<ResizablePanelGroup
						direction="horizontal"
						onLayout={(sizes: number[]) => {
							if (!onRegionResize) return;
							// NOTE: Map horizontal panel sizes back to visible region IDs
							const visibleHorizontal = [
								categorized.west,
								categorized.center,
								categorized.east,
							].filter((r) => r && !isRegionCollapsed(r));
							const sizeMap: Record<string, number> = {};
							for (let i = 0; i < visibleHorizontal.length; i++) {
								const region = visibleHorizontal[i];
								if (region) sizeMap[region.id] = sizes[i] ?? 0;
							}
							const firstRegion = visibleHorizontal[0];
							if (firstRegion) onRegionResize(firstRegion.id, sizeMap);
						}}
					>
						{categorized.west && !isRegionCollapsed(categorized.west) && (
							<>
								<ResizablePanel
									defaultSize={getRegionSize(categorized.west, "west")}
									minSize={extractNumericSize(categorized.west.minSize)}
									maxSize={extractNumericSize(categorized.west.maxSize)}
									collapsible={categorized.west.collapsible}
								>
									<SchemaPanel
										region={categorized.west}
										onCollapse={onPanelCollapse}
									/>
								</ResizablePanel>
								<ResizableHandle />
							</>
						)}

						<ResizablePanel
							defaultSize={getCenterHorizontalSize(
								categorized,
								responsiveCollapsed,
							)}
						>
							<SchemaPanel
								region={categorized.center}
								onCollapse={onPanelCollapse}
							/>
						</ResizablePanel>

						{categorized.east && !isRegionCollapsed(categorized.east) && (
							<>
								<ResizableHandle />
								<ResizablePanel
									defaultSize={getRegionSize(categorized.east, "east")}
									minSize={extractNumericSize(categorized.east.minSize)}
									maxSize={extractNumericSize(categorized.east.maxSize)}
									collapsible={categorized.east.collapsible}
								>
									<SchemaPanel
										region={categorized.east}
										onCollapse={onPanelCollapse}
									/>
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				</ResizablePanel>

				{categorized.south && !isRegionCollapsed(categorized.south) && (
					<>
						<ResizableHandle />
						<ResizablePanel
							defaultSize={getRegionSize(categorized.south, "south")}
							minSize={extractNumericSize(categorized.south.minSize)}
							maxSize={extractNumericSize(categorized.south.maxSize)}
							collapsible={categorized.south.collapsible}
						>
							<SchemaPanel
								region={categorized.south}
								onCollapse={onPanelCollapse}
							/>
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</div>
	);
}

/** Categorizes regions into border positions */
function categorizeRegions(regions: readonly LayoutRegion[]): BorderRegions {
	const center = regions.find(
		(r) => (r.position as BorderPosition) === "center",
	);
	if (!center) {
		throw new Error('Border layout requires a region with position "center"');
	}

	const result: BorderRegions = { center };

	for (const region of regions) {
		const pos = region.position as BorderPosition;
		if (pos === "north") result.north = region;
		else if (pos === "south") result.south = region;
		else if (pos === "east") result.east = region;
		else if (pos === "west") result.west = region;
	}

	return result;
}

/** Safely parses a string/number size value, returning undefined on failure */
function parseNumericSize(raw: string | number): number | undefined {
	if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
	const trimmed = raw.trim();
	const parsed = Number.parseFloat(trimmed);
	return Number.isFinite(parsed) ? parsed : undefined;
}

/** Extracts numeric size from a region, falling back to position default */
function getRegionSize(region: LayoutRegion, position: BorderPosition): number {
	if (region.size !== undefined) {
		const parsed = parseNumericSize(region.size);
		if (parsed !== undefined) return parsed;
	}
	return BORDER_DEFAULT_SIZES[position];
}

/** Calculates center panel size in vertical direction, excluding collapsed regions */
function getCenterSize(
	categorized: BorderRegions,
	responsiveCollapsed: ReadonlyMap<string, boolean>,
): number {
	let used = 0;
	if (
		categorized.north &&
		categorized.north.collapsed !== true &&
		!responsiveCollapsed.get(categorized.north.id)
	) {
		used += getRegionSize(categorized.north, "north");
	}
	if (
		categorized.south &&
		categorized.south.collapsed !== true &&
		!responsiveCollapsed.get(categorized.south.id)
	) {
		used += getRegionSize(categorized.south, "south");
	}
	return Math.max(100 - used, 10);
}

/** Calculates center panel size in horizontal direction, excluding collapsed regions */
function getCenterHorizontalSize(
	categorized: BorderRegions,
	responsiveCollapsed: ReadonlyMap<string, boolean>,
): number {
	let used = 0;
	if (
		categorized.west &&
		categorized.west.collapsed !== true &&
		!responsiveCollapsed.get(categorized.west.id)
	) {
		used += getRegionSize(categorized.west, "west");
	}
	if (
		categorized.east &&
		categorized.east.collapsed !== true &&
		!responsiveCollapsed.get(categorized.east.id)
	) {
		used += getRegionSize(categorized.east, "east");
	}
	return Math.max(100 - used, 10);
}

/** Extracts numeric value from minSize/maxSize prop, returning undefined on invalid input */
function extractNumericSize(
	size: string | number | undefined,
): number | undefined {
	if (size === undefined) return undefined;
	return parseNumericSize(size);
}

/** Fallback border layout when resizable primitives are not injected */
function FallbackBorderLayout({
	categorized,
	onPanelCollapse,
	isRegionCollapsed,
}: {
	readonly categorized: BorderRegions;
	readonly onPanelCollapse?: import("../types/panel-collapse-handler").PanelCollapseHandler;
	readonly isRegionCollapsed: (region: LayoutRegion) => boolean;
}): ReactNode {
	return (
		<div className="h-full w-full flex flex-col gap-1">
			{categorized.north && !isRegionCollapsed(categorized.north) && (
				<div
					style={{ height: `${getRegionSize(categorized.north, "north")}%` }}
				>
					<SchemaPanel
						region={categorized.north}
						onCollapse={onPanelCollapse}
					/>
				</div>
			)}
			<div className="flex-1 flex flex-row gap-1 min-h-0">
				{categorized.west && !isRegionCollapsed(categorized.west) && (
					<div style={{ width: `${getRegionSize(categorized.west, "west")}%` }}>
						<SchemaPanel
							region={categorized.west}
							onCollapse={onPanelCollapse}
						/>
					</div>
				)}
				<div className="flex-1 min-w-0">
					<SchemaPanel
						region={categorized.center}
						onCollapse={onPanelCollapse}
					/>
				</div>
				{categorized.east && !isRegionCollapsed(categorized.east) && (
					<div style={{ width: `${getRegionSize(categorized.east, "east")}%` }}>
						<SchemaPanel
							region={categorized.east}
							onCollapse={onPanelCollapse}
						/>
					</div>
				)}
			</div>
			{categorized.south && !isRegionCollapsed(categorized.south) && (
				<div
					style={{ height: `${getRegionSize(categorized.south, "south")}%` }}
				>
					<SchemaPanel
						region={categorized.south}
						onCollapse={onPanelCollapse}
					/>
				</div>
			)}
		</div>
	);
}

/** Error display for unknown layout types */
function ErrorPlaceholder({
	message,
}: {
	readonly message: string;
}): ReactNode {
	return (
		<div className="p-4 border border-destructive/50 rounded-md text-destructive text-sm">
			{message}
		</div>
	);
}

/** Categorized border regions by position */
interface BorderRegions {
	north?: LayoutRegion;
	south?: LayoutRegion;
	east?: LayoutRegion;
	west?: LayoutRegion;
	center: LayoutRegion;
}
