export const createWorldSlice = (set, get) => ({
    currentWorld: "FOREST",
    worlds: {
      FOREST: "UNLOCKED",
      MOUNTAIN: "LOCKED",
      DESERT: "LOCKED",
      SWAMP: "LOCKED",
      CAVES: "LOCKED",
    },
  
    setCurrentWorld: (world) =>
      set(() => ({
        currentWorld: world,
      })),
  
    unlockWorld: (world) =>
      set((state) => ({
        worlds: {
          ...state.worlds,
          [world]: "UNLOCKED",
        },
      })),
  });
  