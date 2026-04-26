import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import type { LayoutRegion } from "../types/layout-region";
import type { StackConfig } from "../types/stack-config";
import { SchemaPanel } from "./schema-panel";

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

	const [activeIndex, setActiveIndex] = useState(defaultIndex);
	const [animDirection, setAnimDirection] = useState<"forward" | "backward">(
		"forward",
	);

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

	// NOTE: Keyboard navigation with arrow keys
	useEffect(() => {
		if (!keyboardNavigation) return;

		function handleKeyDown(e: KeyboardEvent) {
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

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [keyboardNavigation, goNext, goPrev]);

	const panelStyle: CSSProperties = getAnimationStyle(animation, animDirection);

	return (
		<div className="flex flex-col h-full w-full">
			{showNavigation && (
				<div className="flex items-center justify-between p-2 border-b">
					<button
						type="button"
						onClick={goPrev}
						disabled={activeIndex === 0}
						className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
					>
						‹ Prev
					</button>
					<span className="text-sm text-muted-foreground">
						{activeIndex + 1} / {regions.length}
						{regions[activeIndex]?.title && ` — ${regions[activeIndex].title}`}
					</span>
					<button
						type="button"
						onClick={goNext}
						disabled={activeIndex === regions.length - 1}
						className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next ›
					</button>
				</div>
			)}
			<div className="flex-1 min-h-0 relative" style={panelStyle}>
				{regions.map((region, index) => {
					// NOTE: Only render active panel unless keepMounted is true
					if (!keepMounted && index !== activeIndex) return null;

					return (
						<div
							key={region.id}
							className={index === activeIndex ? "h-full w-full" : "hidden"}
						>
							<SchemaPanel region={region} />
						</div>
					);
				})}
			</div>
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
