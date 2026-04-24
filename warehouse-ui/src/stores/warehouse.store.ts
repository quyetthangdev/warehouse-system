import { create } from 'zustand'

interface WarehouseState {
  lockedByFormId: string | null
  lockWarehouse: (formId: string) => void
  unlockWarehouse: () => void
}

export const useWarehouseStore = create<WarehouseState>()((set) => ({
  lockedByFormId: null,
  lockWarehouse: (formId) => set({ lockedByFormId: formId }),
  unlockWarehouse: () => set({ lockedByFormId: null }),
}))
