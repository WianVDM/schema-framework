import { createServerFn } from "@tanstack/react-start";
import { mockVirtualData } from "../data/mock-virtual-data";
import type { SerializableRecord } from "../lib/serializable-record";
import { toSerializable } from "../lib/to-serializable";

const serializedVirtualData: readonly SerializableRecord[] =
	toSerializable(mockVirtualData);

export const getVirtualData = createServerFn({ method: "GET" }).handler(
	async (): Promise<readonly SerializableRecord[]> => {
		return serializedVirtualData;
	},
);
