import { create } from 'zustand'
import { Asset, AssetType, AssetCategory } from '@prisma/client'

interface AssetState {
  assets: Asset[]
  selectedAssets: Asset[]
  isLoading: boolean
  error: string | null
  filterType: AssetType | null
  filterCategory: AssetCategory | null

  // Actions
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  selectAsset: (asset: Asset) => void
  deselectAsset: (id: string) => void
  clearSelection: () => void
  setFilterType: (type: AssetType | null) => void
  setFilterCategory: (category: AssetCategory | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  selectedAssets: [],
  isLoading: false,
  error: null,
  filterType: null,
  filterCategory: null,

  setAssets: (assets) => set({ assets }),

  addAsset: (asset) =>
    set((state) => ({ assets: [asset, ...state.assets] })),

  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      selectedAssets: state.selectedAssets.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  deleteAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
      selectedAssets: state.selectedAssets.filter((a) => a.id !== id),
    })),

  selectAsset: (asset) =>
    set((state) => ({
      selectedAssets: [...state.selectedAssets, asset],
    })),

  deselectAsset: (id) =>
    set((state) => ({
      selectedAssets: state.selectedAssets.filter((a) => a.id !== id),
    })),

  clearSelection: () => set({ selectedAssets: [] }),

  setFilterType: (filterType) => set({ filterType }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
