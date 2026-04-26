import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import type { BoxConfig } from "../types/box-config";
import type { LayoutRegion } from "../types/layout-region";
import type { PanelCollapseHandler } from "../types/panel-collapse-handler";
import { SchemaPanel } from "./schema-panel";

interface BoxLayoutProps {
	readonly direction: "horizontal" | "vertical";
	readonly regions: readonly LayoutRegion[];
	readonly boxConfig?: BoxConfig;
	readonly onPanelCollapse?: PanelCollapseHandler;
}

/** Renders hbox/vbox flex layout from LayoutSchema regions */
export function BoxLayoutRenderer({
	direction,
	regions,
	boxConfig,
	onPanelCollapse,
}: BoxLayoutProps): ReactNode {
	// NOTE: stackBelow causes hbox to switch to vertical when viewport is narrower than threshold
	const isStacked = useStackBelow(direction, boxConfig?.stackBelow);
	const effectiveDirection = isStacked ? "vertical" : direction;

	// NOTE: hbox/vbox are pure CSS flex layouts — no injected primitives needed
	const containerStyle = buildFlexStyle(boxConfig);

	return (
		<div
			className={
				effectiveDirection === "horizontal" ? "flex flex-row" : "flex flex-col"
			}
			style={containerStyle}
		>
			{regions.map((region) => (
				<SchemaPanel
					key={region.id}
					region={region}
					onCollapse={onPanelCollapse}
				/>
			))}
		</div>
	);
}

/** Hook that returns true when viewport width is below the stackBelow threshold.
 *  Returns `undefined` during SSR / first render to avoid hydration mismatch. */
function useStackBelow(
	direction: "horizontal" | "vertical",
	stackBelow: number | undefined,
): boolean | undefined {
	// NOTE: Start as undefined so SSR and first client render agree — avoids hydration mismatch
	const [isBelow, setIsBelow] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		// NOTE: Only hbox (horizontal) can stack below threshold; vbox is already vertical
		if (direction !== "horizontal" || stackBelow === undefined) {
			setIsBelow(false);
			return;
		}

		const query = window.matchMedia(`(max-width: ${stackBelow - 1}px)`);

		function handleChange(e: MediaQueryListEvent) {
			setIsBelow(e.matches);
		}

		// NOTE: Initialize with current match state
		setIsBelow(query.matches);
		query.addEventListener("change", handleChange);
		return () => query.removeEventListener("change", handleChange);
	}, [direction, stackBelow]);

	return isBelow;
}

/** Builds CSS flex style from BoxConfig */
function buildFlexStyle(config: BoxConfig | undefined): CSSProperties {
	const style: CSSProperties = {};

	if (!config) return style;

	if (config.gap !== undefined) {
		style.gap = typeof config.gap === "number" ? `${config.gap}px` : config.gap;
	}

	// NOTE: Map align values to CSS align-items
	const alignMap: Record<string, string> = {
		start: "flex-start",
		center: "center",
		end: "flex-end",
		stretch: "stretch",
	};
	if (config.align) {
		style.alignItems = alignMap[config.align] ?? config.align;
	}

	// NOTE: Map justify values to CSS justify-content
	const justifyMap: Record<string, string> = {
		start: "flex-start",
		center: "center",
		end: "flex-end",
		between: "space-between",
		around: "space-around",
		evenly: "space-evenly",
	};
	if (config.justify) {
		style.justifyContent = justifyMap[config.justify] ?? config.justify;
	}

	if (config.wrap === true) {
		style.flexWrap = "wrap";
	}

	if (config.padding !== undefined) {
		style.padding =
			typeof config.padding === "number"
				? `${config.padding}px`
				: config.padding;
	}

	return style;
}
