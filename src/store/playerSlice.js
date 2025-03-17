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
    set((state) => ({
      player: {
        ...state.player,
        equipped: {
          ...state.player.equipped,
          [slot]: itemId,
        },
      },
    }));
  },

  unequipItem: (slot) => {
    set((state) => ({
      player: {
        ...state.player,
        equipped: {
          ...state.player.equipped,
          [slot]: null,
        },
      },
    }));
  },
});
