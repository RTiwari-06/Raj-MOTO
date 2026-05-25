import { create } from 'zustand';

export const useUIStore = create((set) => ({
  scrollDepth: 0,
  isLoaded: false,
  motionEnabled: true,
  setScrollDepth: (scrollDepth) => set({ scrollDepth }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  toggleMotion: () => set((state) => {
    const next = !state.motionEnabled;
    document.documentElement.classList.toggle('motion-off', !next);
    return { motionEnabled: next };
  }),
}));
