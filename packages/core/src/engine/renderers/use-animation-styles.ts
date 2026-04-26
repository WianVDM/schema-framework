import { useEffect, useRef } from "react";

/** NOTE: Animation keyframes for stack-layout transitions.
 * Injects @keyframes into document.head once (idempotent via data-sf-styles attribute). */
const ANIMATION_CSS = /* css */ `
@keyframes sf-fade-in {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes sf-slide-right {
	from { transform: translateX(-100%); opacity: 0; }
	to { transform: translateX(0); opacity: 1; }
}
@keyframes sf-slide-left {
	from { transform: translateX(100%); opacity: 0; }
	to { transform: translateX(0); opacity: 1; }
}
`;

const STYLE_ID = "sf-animation-keyframes";

/** Injects stack-layout animation keyframes into document.head (once, idempotent). */
export function useAnimationStyles(): void {
	const injected = useRef(false);

	useEffect(() => {
		if (injected.current) return;
		if (document.getElementById(STYLE_ID) !== null) {
			injected.current = true;
			return;
		}

		const style = document.createElement("style");
		style.id = STYLE_ID;
		style.setAttribute("data-sf-styles", "animation-keyframes");
		style.textContent = ANIMATION_CSS;
		document.head.appendChild(style);
		injected.current = true;
	}, []);
}
