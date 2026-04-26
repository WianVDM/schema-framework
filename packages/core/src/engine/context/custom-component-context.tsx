import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
// compliance-ignore no-cross-engine-import: NOTE: Type-only import — context needs direct type reference to avoid circular barrel dependency
import type { CustomComponentRegistry } from "../types/custom-component-registry";

/** Silent empty fallback — custom components are always optional */
const customComponentDefaultValue: CustomComponentRegistry = {};

export const CustomComponentContext = createContext<CustomComponentRegistry>(
	customComponentDefaultValue,
);
CustomComponentContext.displayName = "CustomComponentContext";

export function CustomComponentProvider({
	components,
	children,
}: {
	components: CustomComponentRegistry;
	children: ReactNode;
}) {
	// NOTE: Consumers must memoize the `components` prop (useMemo/useRef) for this optimization to be effective.
	const value = useMemo(() => components, [components]);
	return (
		<CustomComponentContext.Provider value={value}>
			{children}
		</CustomComponentContext.Provider>
	);
}

export function useCustomComponents(): CustomComponentRegistry {
	return useContext(CustomComponentContext);
}
