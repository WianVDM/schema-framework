export interface SelectionStore<T = unknown> {
  selectedId: string | null
  selectedData: Readonly<T> | null
  setSelected: (id: string, data: T) => void
  clearSelection: () => void
}