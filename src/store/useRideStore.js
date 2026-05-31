import { create } from 'zustand';
import { MEDIA } from '@/data/media';

export const useRideStore = create((set, get) => ({
  detailRide: null,
  rides: MEDIA.rides,
  
  setDetailRide: (ride) => set({ detailRide: ride }),
  
  closeDetail: () => set({ detailRide: null }),
  
  navigateRide: (direction) => {
    const { detailRide, rides } = get();
    if (!detailRide) return;
    
    const currentIndex = rides.findIndex(r => r.id === detailRide.id);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex < 0) nextIndex = rides.length - 1;
    if (nextIndex >= rides.length) nextIndex = 0;
    
    set({ detailRide: rides[nextIndex] });
  }
}));
