// uiStore — global UI state: theme, active filters, etc.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors } from '../constants/colors';
import type { Theme, ConversationFilters } from '../types/app';
import type { ColorScheme } from '../constants/colors';

interface UIState {
  theme: Theme;
  colors: ColorScheme;
  filters: ConversationFilters;

  // Actions
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  hydrateTheme: () => Promise<void>;
  setFilters: (filters: Partial<ConversationFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: ConversationFilters = {
  status: 'open',
  assigneeType: 'all',
  labels: [],
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark',
  colors: DarkColors,
  filters: DEFAULT_FILTERS,

  hydrateTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem('chatflow_theme');
      if (saved === 'light' || saved === 'dark') {
        set({ theme: saved, colors: saved === 'dark' ? DarkColors : LightColors });
      }
    } catch {
      // Keep default dark theme
    }
  },

  setTheme: async (theme: Theme) => {
    set({ theme, colors: theme === 'dark' ? DarkColors : LightColors });
    await AsyncStorage.setItem('chatflow_theme', theme);
  },

  toggleTheme: async () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
