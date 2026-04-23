import { useEffect } from "react";

/**
 * Named fallback component for optional primitives (DatePicker, TagInput, etc.)
 * that have not been provided via PrimitivesContext. Using a named component
 * instead of an inline `() => null` avoids unnecessary re-renders and provides
 * a visible warning to developers.
 */
export function DefaultFallbackComponent({
	placeholder,
}: { readonly placeholder?: string } & Record<string, unknown>) {
	useEffect(() => {
		console.warn(
			"A required primitive was not provided. Pass the missing component via PrimitiveComponents to enable this field type.",
		);
	}, []);

	return (
		<div className="flex items-center min-h-10 px-3 py-2 rounded-md border border-dashed border-muted-foreground/50 bg-muted/50 text-sm text-muted-foreground">
			{placeholder ?? "Primitive not configured"}
		</div>
	);
}
