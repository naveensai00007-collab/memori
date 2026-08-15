import { create } from 'zustand';
import { Category, Status, Item } from '../../../shared/types';

interface UIState {
  // Navigation & Filters
  selectedCategory: Category | null;
  selectedStatus: Status | null;
  searchQuery: string;
  isSidebarCollapsed: boolean;
  
  // Modals & Panels
  isItemModalOpen: boolean;
  editingItem: Item | null;
  isLifeReviewOpen: boolean;
  isLocationModalOpen: boolean;
  
  // Actions
  setSelectedCategory: (category: Category | null) => void;
  setSelectedStatus: (status: Status | null) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  openCreateItemModal: (defaultCategory?: Category) => void;
  openEditItemModal: (item: Item) => void;
  closeItemModal: () => void;
  
  setLifeReviewOpen: (open: boolean) => void;
  setLocationModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedCategory: null,
  selectedStatus: null,
  searchQuery: '',
  isSidebarCollapsed: false,

  isItemModalOpen: false,
  editingItem: null,
  isLifeReviewOpen: false,
  isLocationModalOpen: false,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  openCreateItemModal: (defaultCategory) => set({
    isItemModalOpen: true,
    editingItem: defaultCategory ? ({ category: defaultCategory, status: 'missing', tags: [] } as any) : null,
  }),
  openEditItemModal: (item) => set({ isItemModalOpen: true, editingItem: item }),
  closeItemModal: () => set({ isItemModalOpen: false, editingItem: null }),

  setLifeReviewOpen: (open) => set({ isLifeReviewOpen: open }),
  setLocationModalOpen: (open) => set({ isLocationModalOpen: open }),
}));
