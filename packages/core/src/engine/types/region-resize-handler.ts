/** Callback invoked when a layout region is resized */
export type RegionResizeHandler = (
  regionId: string,
  newSizes: Readonly<Record<string, number>>
) => void
