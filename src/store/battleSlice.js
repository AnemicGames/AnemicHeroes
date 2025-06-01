import { getRandomItems } from "../utils/getRandomItem";

let itemDataById = {};

async function ensureItemDataLoaded() {
  if (Object.keys(itemDataById).length === 0) {
    const response = await fetch("/assets/items.json");
    const data = await response.json();
    itemDataById = {};
    data.itemTable.forEach((item) => {
      itemDataById[item.id] = item;
    });
  }
}

export const createBattleSlice = (set, get) => ({
  battleState: null,
  enemy: {
    id: "1",
    name: "Forest Knight",
    baseHP: 150,
    baseStrength: 1,
    baseSpeed: 1,
    baseDefence: 1,
    lvlMultiplier: 1,
    dropChance: 1,
    baseGold: 1,
    sprite: "",
    currentHP: 1,
  },
  lootItems: [],
  gameOver: false,
  turnCount: 0,
  nextToAttack: null,
  isFighting: true,
  skipTurn: false,
  xp: 1,
  showLevelUp: false,
  levelUpMessage: "",
  isAttacking: false,
  initiativeWinner: null,
  initiativeMessage: "",

  getPlayerEffectiveStats: async () => {
    const { player } = get();

    await ensureItemDataLoaded();

    let strength = player.strength;
    let speed = player.speed;
    let defense = player.defense;

    if (player.equipped) {
      Object.values(player.equipped).forEach((itemId) => {
        if (itemDataById[itemId]) {
          const modifiers = itemDataById[itemId].statModifiers;
          strength += modifiers.strength || 0;
          speed += modifiers.speed || 0;
          defense += modifiers.defense || 0;
        }
      });
    }

    return { strength, speed, defense };
  },

  setLevelUpMessage: (message) =>
    set({ levelUpMessage: message, showLevelUp: true }),
  clearLevelUpMessage: () => set({ levelUpMessage: "", showLevelUp: false }),

  setIsAttacking: (value) => set({ isAttacking: value }),

  setBattleState: (state) => set({ battleState: state }),

  resetBattleState: () => set({ battleState: null, playerDefeated: false }),

  isEnemyTurn: () => get().nextToAttack === "ENEMY",

  setNextToAttack: (attacker) => set({ nextToAttack: attacker }),

  setTurnCount: () => set((state) => ({ turnCount: state.turnCount + 1 })),

  setMessage: (message) => set({ battleMessage: message }),

  damageEnemy: (damage) => {
    set((state) => ({
      enemy: {
        ...state.enemy,
        currentHP: Math.max(0, state.enemy.currentHP - damage),
      },
    }));
  },

  setPlayerDefeated: () =>
    set((state) => {
      if (state.player.currentHp <= 0) {
        return { playerDefeated: true };
      }
      return state;
    }),

  takeDamage: (damage) => {
    set((state) => ({
      player: {
        ...state.player,
        currentHp: Math.max(0, state.player.currentHp - damage),
      },
    }));
  },

  heal: (amount) => {
    set((state) => ({
      player: {
        ...state.player,
        currentHp: Math.min(
          state.player.maxHp,
          state.player.currentHp + amount
        ),
      },
    }));
  },

  updateItemCount: (itemId, amount) => {
    set((state) => {
      const updatedItems = { ...state.inventory.items };

      if (!updatedItems[itemId] || updatedItems[itemId] + amount < 0) {
        return state;
      }

      updatedItems[itemId] += amount;

      return {
        inventory: {
          ...state.inventory,
          items: updatedItems,
        },
      };
    });
  },

  applyPlayerAttack: async () => {
    const {
      enemy,
      damageEnemy,
      takeDamage,
      setTurnCount,
      setBattleOutcome,
      player,
      getPlayerEffectiveStats,
    } = get();

    const stats = await getPlayerEffectiveStats();

    console.log("Effective player stats during attack:", stats);
    console.log("Player base strength:", player.strength);

    const baseDamage = stats.strength * 2;
    const randomVariance = Math.floor(Math.random() * 7) - 3;
    const rawDamage = baseDamage + randomVariance;
    const enemyDefenseReduction = Math.floor(enemy.baseDefence / 2);
    const finalDamage = Math.max(1, rawDamage - enemyDefenseReduction);

    damageEnemy(finalDamage);
    setTurnCount();

    setTimeout(async () => {
      const updatedEnemyHP = get().enemy.currentHP;

      if (updatedEnemyHP > 0) {
        const enemyDamage = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
        const playerDefenseReduction = Math.floor(stats.defense / 5);
        const finalEnemyDamage = Math.max(
          1,
          enemyDamage - playerDefenseReduction
        );
        const updatedPlayerHP = player.currentHp - enemyDamage;

        takeDamage(finalEnemyDamage);

        if (updatedPlayerHP <= 0) {
          setBattleOutcome("DEFEAT");
        } else {
          setTurnCount();
        }
      }
    }, 300);
  },

  applyDrinkPotion: () => {
    const {
      inventory,
      heal,
      updateItemCount,
      takeDamage,
      setTurnCount,
      player,
      setBattleOutcome,
    } = get();

    if (!inventory.items.POT_HEALTH || inventory.items.POT_HEALTH <= 0) {
      get().setMessage("No Health Potion left in inventory!");
      setTimeout(() => get().setMessage(""), 2000);
      return;
    }

    updateItemCount("POT_HEALTH", -1);
    heal(50);
    setTurnCount();

    setTimeout(() => {
      if (player.currentHp > 0) {
        const enemyDamage = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
        takeDamage(enemyDamage);

        if (player.currentHp - enemyDamage <= 0) {
          setBattleOutcome();
        } else {
          setTurnCount();
        }
      }
    }, 1000);
  },

  fetchRandomEnemy: (mobs) => {
    const randomMob = mobs[Math.floor(Math.random() * mobs.length)];
    return {
      currentHP: randomMob.baseHP,
      xp: Math.floor(50 * randomMob.lvlMultiplier),
      gold: randomMob.baseGold,
      ...randomMob,
    };
  },

  setEnemy: (enemy) => set({ enemy, currentHP: enemy.baseHP }),

  clearBattle: () =>
    set(() => ({
      battleState: null,
      enemy: {
        id: "id",
        name: "placeholder",
        baseHP: 1,
        baseStrength: 1,
        baseSpeed: 1,
        baseDefence: 1,
        lvlMultiplier: 1,
        dropChance: 1,
        baseGold: 1,
        sprite: "",
        currentHP: 1,
      },
      gameOver: false,
      turnCount: 0,
      nextToAttack: null,
      isFighting: false,
      skipTurn: false,
      xp: 1,
    })),

  calculateGoldReward: () => {
    const { enemy, player } = get();
    return Math.round(
      enemy.baseGold * enemy.lvlMultiplier + player.level * enemy.lvlMultiplier
    );
  },

  setLootItems: (items) => set({ lootItems: items }),

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

  handleVictory: async () => {
    const {
      enemy,
      setXP,
      addGold,
      clearMap,
      addItem,
      setBattleOutcome,
      setLootItems,
      setLevelUpMessage,
      clearLevelUpMessage,
    } = get();

    const leveledUp = setXP(enemy.xp);

    if (leveledUp) {
      setLevelUpMessage(`Level Up! You are now level ${get().player.level}!`);
      setTimeout(() => {
        clearLevelUpMessage();
      }, 3000);
    }

    addGold(get().calculateGoldReward());

    const lootItems = await getRandomItems(1);
    lootItems.forEach((item) => {
      addItem(item.id, 1);
    });

    let bossLootItems = [];
    if (enemy.encounterType === "BOSS") {
      clearMap();

      bossLootItems = await getRandomItems(2);
      bossLootItems.forEach((item) => addItem(item.id, 1));
    }

    const allLootItems = [...lootItems, ...bossLootItems];
    console.log("Loot dropped:", allLootItems);
    setLootItems(allLootItems);

    setBattleOutcome("VICTORY");

    return allLootItems;
  },

  handleDefeat: () => {
    const { resetPosition, clearMap, setBattleOutcome, setPlayerDefeated } =
      get();
    resetPosition();
    clearMap();
    setBattleOutcome("DEFEAT");
    setPlayerDefeated();
  },

  updateBattleState: () => {
    const { enemy, player, isBattleOver, resetBattleState, setBattleState } =
      get();
    if (isBattleOver) {
      resetBattleState();
    } else {
      setBattleState({
        enemy,
        player: {
          ...player,
          maxHp: player.maxHp,
          currentHp: player.currentHp,
        },
      });
    }
  },

  setBattleOutcome: (outcome) =>
    set({ battleOutcome: outcome, isBattleOver: true }),

  setXP: (xp) => {
    let leveledUp = false;

    set((state) => {
      let newXP = state.player.xp + xp;
      let newLevel = state.player.level;
      let newXpToNextLvl = state.player.xpToNextLvl;
      let newMaxHp = state.player.maxHp;
      let currentHp = state.player.currentHp;

      if (state.inventory.items) {
        Object.values(state.inventory.items).forEach((item) => {
          if (item.statModifiers) {
            state.player.strength += item.statModifiers.strength || 0;
            state.player.speed += item.statModifiers.speed || 0;
            state.player.defense += item.statModifiers.defense || 0;
          }
        });
      }

      while (newXP >= newXpToNextLvl) {
        newXP -= newXpToNextLvl;
        newLevel += 1;
        newXpToNextLvl = Math.floor(newXpToNextLvl * 1.2);
        newMaxHp = Math.floor(newMaxHp * 1.1);
        currentHp = newMaxHp;
        leveledUp = true;
      }

      return {
        player: {
          ...state.player,
          xp: newXP,
          level: newLevel,
          xpToNextLvl: newXpToNextLvl,
          maxHp: newMaxHp,
          currentHp,
        },
      };
    });

    return leveledUp;
  },

  addGold: (amount) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        gold: state.inventory.gold + amount,
      },
    }));
  },

  rollInitiative: () => {
    const { player, enemy, setTurnCount, takeDamage } = get();

    const playerSpeed = player.speed;
    const enemySpeed = enemy.baseSpeed;

    const playerInitiative = Math.floor(Math.random() * 20) + 1 + playerSpeed;
    const enemyInitiative = Math.floor(Math.random() * 20) + 1 + enemySpeed;

    const firstAttacker =
      playerInitiative >= enemyInitiative ? "PLAYER" : "ENEMY";
    set({ nextToAttack: firstAttacker });

    if (firstAttacker === "ENEMY") {
      set({ message: "The enemy strikes first!" });
    } else {
      set({ message: "You strike first!" });
    }

    setTimeout(() => {
      set({ message: "" });
    }, 2000);

    if (firstAttacker === "ENEMY") {
      setTimeout(() => {
        const enemyDamage = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
        takeDamage(enemyDamage);
        setTurnCount();
        set({ nextToAttack: "PLAYER" });
      }, 1000);
    } else {
      setTurnCount();
    }
  },
});
