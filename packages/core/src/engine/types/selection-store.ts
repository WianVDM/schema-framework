export interface SelectionStore<T = unknown> {
  readonly selectedId: string | null
  readonly selectedData: Readonly<T> | null
  setSelected: (id: string, data: T) => void
  clearSelection: () => void
}