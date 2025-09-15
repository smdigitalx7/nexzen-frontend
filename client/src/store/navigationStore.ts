import { create } from 'zustand';

interface NavigationState {
  sidebarOpen: boolean;
  activeModule: string;
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveModule: (module: string) => void;
  setIsMobile: (mobile: boolean) => void;
  toggleSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  sidebarOpen: true,
  activeModule: 'dashboard',
  isMobile: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveModule: (module) => set({ activeModule: module }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));