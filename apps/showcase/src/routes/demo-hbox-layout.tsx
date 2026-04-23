import { createFileRoute } from "@tanstack/react-router";
import { LayoutDemo } from "@/components/layout-demo";
import { hboxLayoutSchema } from "../data";

export const Route = createFileRoute("/demo-hbox-layout")({
	component: DemoHBoxLayoutRoute,
});

function DemoHBoxLayoutRoute() {
	return (
		<LayoutDemo
			title="HBox Layout"
			description="Horizontal flexbox layout with configurable gap, alignment, and justify."
			schema={hboxLayoutSchema}
		/>
	);
}
