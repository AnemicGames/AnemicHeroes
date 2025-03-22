export const createWorldSlice = (set, get) => ({
    currentWorld: "FOREST",
    worlds: {
      FOREST: "UNLOCKED",
      MOUNTAIN: "LOCKED",
      DESERT: "LOCKED",
      SWAMP: "LOCKED",
      CAVES: "LOCKED",
    },
  });
  