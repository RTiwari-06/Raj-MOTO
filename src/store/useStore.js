import { create } from 'zustand';

export const useStore = create((set) => ({
  scroll: 0,
  velocity: 0,
  mouse: { x: 0, y: 0 },
  hovering: false,
  // Local UV position of the mouse over the image box [0,1]. Used by the reveal shader.
  imageMouse: { x: 0.5, y: 0.5 },
  imageHovering: false,
  fluidIntensity: 0,
  setScroll: (scroll, velocity) => set({ scroll, velocity }),
  setMouse: (x, y) => set({ mouse: { x, y } }),
  setHovering: (hovering) => set({ hovering }),
  setImageMouse: (x, y) => set({ imageMouse: { x, y } }),
  setImageHovering: (v) => set({ imageHovering: v }),
  setFluidIntensity: (fluidIntensity) => set({ fluidIntensity }),
}));
