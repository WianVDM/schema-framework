import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { LayoutRegion } from "../types/layout-region";
import type { StackConfig } from "../types/stack-config";
import { SchemaPanel } from "./schema-panel";
import { useAnimationStyles } from "./use-animation-styles";

interface StackLayoutProps {
	readonly regions: readonly LayoutRegion[];
	readonly stackConfig?: StackConfig;
}

/** Renders one panel at a time with prev/next navigation and keyboard support */
export function StackLayoutRenderer({
	regions,
	stackConfig,
}: StackLayoutProps): ReactNode {
	const defaultIndex = stackConfig?.defaultIndex ?? 0;
	const showNavigation = stackConfig?.showNavigation ?? true;
	const keyboardNavigation = stackConfig?.keyboardNavigation ?? true;
	const animation = stackConfig?.animation ?? "none";
	const keepMounted = stackConfig?.keepMounted ?? false;

	// NOTE: Clamp defaultIndex to valid range [0, regions.length - 1] — safe even for empty regions (yields 0)
	const safeIndex =
		regions.length > 0
			? Math.max(0, Math.min(defaultIndex, regions.length - 1))
			: 0;
	const [activeIndex, setActiveIndex] = useState(safeIndex);
	const [animDirection, setAnimDirection] = useState<"forward" | "backward">(
		"forward",
	);

	// NOTE: Re-clamp activeIndex when regions shrink to prevent out-of-bounds access
	useEffect(() => {
		setActiveIndex((prev) => {
			if (regions.length === 0) return 0;
			return prev > regions.length - 1 ? regions.length - 1 : prev;
		});
	}, [regions.length]);

	// NOTE: Synchronous clamped index prevents rendering with out-of-bounds region access
	const clampedActiveIndex =
		regions.length > 0
			? Math.min(activeIndex, Math.max(0, regions.length - 1))
			: 0;

	// NOTE: Ref for container-scoped keyboard handling instead of document-level
	const containerRef = useRef<HTMLDivElement>(null);

	const goTo = useCallback(
		(index: number, direction: "forward" | "backward") => {
			if (index < 0 || index >= regions.length) return;
			setAnimDirection(direction);
			setActiveIndex(index);
		},
		[regions.length],
	);

	const goNext = useCallback(() => {
		goTo(activeIndex + 1, "forward");
	}, [activeIndex, goTo]);

	const goPrev = useCallback(() => {
		goTo(activeIndex - 1, "backward");
	}, [activeIndex, goTo]);

	// NOTE: Inject animation keyframes for stack transitions
	useAnimationStyles();

	// NOTE: Keyboard navigation scoped to container — only fires when container has focus
	useEffect(() => {
		if (!keyboardNavigation) return;

		const container = containerRef.current;
		if (container === null) return;

		function handleKeyDown(e: KeyboardEvent) {
			// NOTE: Skip navigation when target is an interactive or focusable element
			const target = e.target as HTMLElement;
			const tagName = target.tagName;
			const role = target.getAttribute("role");
			const tabIndexAttr = target.getAttribute("tabindex");
			const isInteractive =
				tagName === "INPUT" ||
				tagName === "TEXTAREA" ||
				tagName === "SELECT" ||
				tagName === "BUTTON" ||
				tagName === "A" ||
				target.isContentEditable ||
				role === "menu" ||
				role === "listbox" ||
				role === "button" ||
				role === "tab" ||
				(tabIndexAttr !== null && Number(tabIndexAttr) >= 0);

			if (isInteractive) return;

			switch (e.key) {
				case "ArrowRight":
				case "ArrowDown":
					e.preventDefault();
					goNext();
					break;
				case "ArrowLeft":
				case "ArrowUp":
					e.preventDefault();
					goPrev();
					break;
			}
		}

		container.addEventListener("keydown", handleKeyDown);
		return () => container.removeEventListener("keydown", handleKeyDown);
	}, [keyboardNavigation, goNext, goPrev]);

	const panelStyle: CSSProperties = getAnimationStyle(animation, animDirection);

	// NOTE: Early return for empty regions — placed after all hooks to respect Rules of Hooks
	if (regions.length === 0) return null;

	return (
		<div
			ref={containerRef}
			className="flex flex-col h-full w-full"
			tabIndex={keyboardNavigation ? -1 : undefined}
		>
			{showNavigation && (
				<div className="flex items-center justify-between p-2 border-b">
					<button
						type="button"
						onClick={goPrev}
						disabled={clampedActiveIndex === 0}
						className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
					>
						‹ Prev
					</button>
					<span className="text-sm text-muted-foreground">
						{clampedActiveIndex + 1} / {regions.length}
						{regions[clampedActiveIndex]?.title !== undefined &&
							` — ${regions[clampedActiveIndex].title}`}
					</span>
					<button
						type="button"
						onClick={goNext}
						disabled={clampedActiveIndex === regions.length - 1}
						className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next ›
					</button>
				</div>
			)}
			{keepMounted ? (
				// NOTE: keepMounted renders all panels but hides inactive ones; animation targets only the active panel
				<div className="flex-1 min-h-0 relative">
					{regions.map((region, index) => {
						const isActive = index === clampedActiveIndex;
						return (
							<div
								key={region.id}
								data-active={isActive}
								className={isActive ? "h-full w-full" : "hidden"}
								style={isActive ? panelStyle : undefined}
							>
								<SchemaPanel region={region} />
							</div>
						);
					})}
				</div>
			) : (
				// NOTE: Force remount via key to retrigger CSS animation on panel change
				<div
					key={`panel-${clampedActiveIndex}`}
					className="flex-1 min-h-0 relative"
					style={panelStyle}
				>
					<SchemaPanel region={regions[clampedActiveIndex]} />
				</div>
			)}
		</div>
	);
}

/** Returns CSS animation style based on config */
function getAnimationStyle(
	animation: "none" | "fade" | "slide",
	direction: "forward" | "backward",
): CSSProperties {
	switch (animation) {
		case "fade":
			return { animation: "sf-fade-in 0.2s ease-in-out" };
		case "slide":
			return {
				animation:
					direction === "forward"
						? "sf-slide-right 0.2s ease-out"
						: "sf-slide-left 0.2s ease-out",
			};
		default:
			return {};
	}
}
