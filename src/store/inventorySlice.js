export const createInventorySlice = (set, get) => ({
  inventory: {
    items: {}, // Example: { "WPN_SWORD": 2, "ARM_PLATE": 1 }
    gold: 0,
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

  addGold: (amount) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        gold: state.inventory.gold + amount,
      },
    }));
  },

  removeGold: (amount) => {
    set((state) => {
      const currentGold = state.inventory.gold;
      if (currentGold < amount) {
        console.warn("Not enough gold!");
        return state;
      }

      return {
        inventory: {
          ...state.inventory,
          gold: currentGold - amount,
        },
      };
    });
  },
});
