import type { CustomComponentRegistry } from "@my-framework/core";
import {
	CustomComponentProvider,
	LayoutPrimitivesProvider,
	PrimitivesProvider,
} from "@my-framework/core";
import type { ReactNode } from "react";
import { layoutPrimitives, primitives } from "../data/primitive-mappings";

const EMPTY_COMPONENTS = {} as const satisfies CustomComponentRegistry;

export function AppPrimitivesProvider({ children }: { children: ReactNode }) {
	return (
		<PrimitivesProvider primitives={primitives}>
			<LayoutPrimitivesProvider primitives={layoutPrimitives}>
				<CustomComponentProvider components={EMPTY_COMPONENTS}>
					{children}
				</CustomComponentProvider>
			</LayoutPrimitivesProvider>
		</PrimitivesProvider>
	);
}
