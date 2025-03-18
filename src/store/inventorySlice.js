export const createInventorySlice = (set, get) => ({
  inventory: {
    items: {}, // { "WPN_SWORD": 2, "ARM_PLATE": 1 }
  },

  addItem: (itemId, count = 1) => {
    set((state) => {
      const updatedItems = { ...state.inventory.items };

      if (updatedItems[itemId]) {
        updatedItems[itemId] += count;
      } else {
        updatedItems[itemId] = count;
      }

      return {
        inventory: {
          ...state.inventory,
          items: updatedItems,
        },
      };
    });
  },

  removeItem: (itemId, count = 1) => {
    set((state) => {
      const updatedItems = { ...state.inventory.items };

      if (updatedItems[itemId]) {
        updatedItems[itemId] -= count;
        if (updatedItems[itemId] <= 0) {
          delete updatedItems[itemId];
        }
      }

      return {
        inventory: {
          ...state.inventory,
          items: updatedItems,
        },
      };
    });
  },
});
