export interface SelectionStore<T = unknown> {
  selectedId: string | null
  selectedData: T | null
  setSelected: (id: string, data: T) => void
  clearSelection: () => void
}