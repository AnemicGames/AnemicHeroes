export const createPlayerSlice = (set, get) => ({
  player: {
    name: 'Hero',
    class: '',
    level: 0,
    currentHp: 100,
    maxHp: 100,
    strength: 10,
    defense: 5,
    speed: 5,
    xp: 0,
    xpToNextLvl: 100,
    equipped: {
      weapon: null,
      helmet: null,
      armor: null,
      boots: null,
      trinket: null,
    },
  },

  setPlayer: (name, playerClass) => {
    let newStats = {};
    let startingEquipment = {};

    switch (playerClass) {
      case 'Mage':
        newStats = {
          maxHp: 80,
          currentHp: 80,
          strength: 7,
          defense: 3,
          speed: 8,
        };
        startingEquipment = {
          weapon: "WPN_STAFF",
          helmet: "HLM_HAT",
          armor: "ARM_ROBE",
          boots: "BTS_SLIPPERS",
          trinket: "TRK_AMULET",
        };
        break;
      case 'Warrior':
        newStats = {
          maxHp: 120,
          currentHp: 120,
          strength: 12,
          defense: 10,
          speed: 4,
        };
        startingEquipment = {
          weapon: "WPN_SWORD",
          helmet: "HLM_HELMET",
          armor: "ARM_PLATE",
          boots: "BTS_GREAVES",
          trinket: "TRK_NECKLACE",
        };
        break;
      case 'Rogue':
        newStats = {
          maxHp: 90,
          currentHp: 90,
          strength: 10,
          defense: 4,
          speed: 9,
        };
        startingEquipment = {
          weapon: "WPN_DAGGER",
          helmet: "HLM_HOOD",
          armor: "ARM_VEST",
          boots: "BTS_BOOTS",
          trinket: "TRK_RING",
        };
        break;
      default:
        newStats = {
          maxHp: 100,
          currentHp: 100,
          strength: 10,
          defense: 5,
          speed: 5,
        };
        startingEquipment = {};
    }

    set({
      player: {
        name,
        class: playerClass,
        level: 1,
        xp: 0,
        xpToNextLvl: 100,
        equipped: startingEquipment,
        ...newStats,
      },
    });
  },

  equipItem: (slot, itemId) => {
    set((state) => {
      const inventory = state.inventory.items;
      const equippedItems = state.player.equipped;

      if (!inventory[itemId] || inventory[itemId] <= 0) {
        console.warn(`Item ${itemId} is not available in the inventory.`);
        return state;
      }

      const updatedInventory = { ...inventory };

      if (updatedInventory[itemId] > 1) {
        updatedInventory[itemId] -= 1;
      } else {
        delete updatedInventory[itemId];
      }

      return {
        player: {
          ...state.player,
          equipped: {
            ...equippedItems,
            [slot]: itemId,
          },
        },
        inventory: {
          ...state.inventory,
          items: updatedInventory,
        },
      };
    });
  },


  unequipItem: (slot) => {
    set((state) => {
      const equippedItems = state.player.equipped;
      const itemId = equippedItems[slot];

      if (!itemId) {
        console.warn(`No item equipped in ${slot}.`);
        return state;
      }

      const updatedInventory = { ...state.inventory.items };

      if (updatedInventory[itemId]) {
        updatedInventory[itemId] += 1;
      } else {
        updatedInventory[itemId] = 1;
      }

      return {
        player: {
          ...state.player,
          equipped: {
            ...equippedItems,
            [slot]: null,
          },
        },
        inventory: {
          ...state.inventory,
          items: updatedInventory,
        },
      };
    });
  },

  setXP: (xp) => {
    set((state) => {
      let newXP = state.player.xp + xp;
      let newLevel = state.player.level;
      let newXpToNextLvl = state.player.xpToNextLvl;
      let newMaxHp = state.player.maxHp;
      let currentHp = state.player.currentHp;

      while (newXP >= newXpToNextLvl) {
        newXP -= newXpToNextLvl;
        newLevel += 1;
        newXpToNextLvl = Math.floor(newXpToNextLvl * 1.2); //XP scaling

        newMaxHp = Math.floor(newMaxHp * 1.1); //HP scaling
        currentHp = newMaxHp;
      }

      return {
        player: {
          ...state.player,
          xp: newXP,
          level: newLevel,
          xpToNextLvl: newXpToNextLvl,
          maxHp: newMaxHp,
          currentHp: currentHp,
        },
      };
    });
  },

  heal: (amount) => {
    set((state) => ({
      player: {
        ...state.player,
        currentHp: Math.min(state.player.currentHp + amount, state.player.maxHp),
      },
    }));
  },

  takeDamage: (amount) => {
    set((state) => ({
      player: {
        ...state.player,
        currentHp: Math.max(0, state.player.currentHp - amount),
      },
    }));
  },

});