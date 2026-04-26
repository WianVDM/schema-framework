import { createServerFn } from "@tanstack/react-start";
import { mockOrders } from "../data/mock-orders";
import type { SerializableRecord } from "../lib/serializable-record";

export const getOrders = createServerFn({ method: "GET" }).handler(
	async (): Promise<readonly SerializableRecord[]> => {
		return mockOrders;
	},
);
