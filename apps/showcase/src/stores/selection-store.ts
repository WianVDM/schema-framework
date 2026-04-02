import { create } from 'zustand'
import type { SelectionStore } from '@my-framework/core'

export function createSelectionStore<T>() {
  return create<SelectionStore<T>>((set) => ({
    selectedId: null,
    selectedData: null,
    setSelected: (id, data) => set({ selectedId: id, selectedData: data }),
    clearSelection: () => set({ selectedId: null, selectedData: null }),
  }))
}