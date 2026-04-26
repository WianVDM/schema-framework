import { SchemaDashboard } from "@my-framework/core";
import { createFileRoute } from "@tanstack/react-router";
import { dashboardSchema } from "../data/dashboard-schema";

export const Route = createFileRoute("/demo-dashboard")({
	component: DemoDashboardRoute,
});

function DemoDashboardRoute() {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl font-bold">Dashboard</h2>
				<p className="text-muted-foreground">
					Multi-panel dashboard with tabbed navigation composing border, vbox,
					and card layouts.
				</p>
			</div>
			<div className="h-[600px] border rounded-lg overflow-hidden">
				<SchemaDashboard schema={dashboardSchema} />
			</div>
		</div>
	);
}
