import { getRandomItems } from "../utils/getRandomItem";

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
  gameOver: false,
  turnCount: 0,
  nextToAttack: null,
  isFighting: true,
  skipTurn: false,
  xp: 1,
  //message: "", this is for displaying turn messages

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

  applyPlayerAttack: () => {
    const {
      enemy,
      damageEnemy,
      takeDamage,
      setTurnCount,
      setBattleOutcome,
      player,
      handleVictory,
      inventory,
    } = get();

    // Her må det diskuteres hvordan damage kalkulasjonen faktisk skal gjøres. Det jeg har lagt inn er et foreløpig forslag
    // Dette er lagt til nylig, må kanskje fjernes
    let totalStrength = player.strength;
    if (inventory.items) {
      Object.values(inventory.items).forEach((item) => {
        if (item.statModifiers) {
          totalStrength += item.statModifiers.strength || 0;
        }
      });
    }

    const baseDamage = totalStrength * 2;
    // ned til hit

    const randomVariance = Math.floor(Math.random() * 7) - 3;

    let rawDamage = baseDamage + randomVariance;

    const enemyDefenseReduction = Math.floor(enemy.baseDefence / 2);

    const finalDamage = Math.max(1, rawDamage - enemyDefenseReduction);

    damageEnemy(finalDamage);
    setTurnCount();

    setTimeout(async () => {
      const updatedEnemyHP = get().enemy.currentHP;

      if (updatedEnemyHP <= 0) {
        await handleVictory();
      } else {
        const enemyDamage = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
        const updatedPlayerHP = player.currentHp - enemyDamage;

        takeDamage(enemyDamage);

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
    const { enemy, setXP, addGold, clearMap, addItem, setBattleOutcome } =
      get();
    setXP(enemy.xp);
    addGold(get().calculateGoldReward());

    const lootItemIds = await getRandomItems(1);
    lootItemIds.forEach((item) => {
      if (typeof item === "object" && item.id) {
        addItem(item.id, 1);
      } else {
        addItem(item, 1);
      }
    });

    if (enemy.encounterType === "BOSS") {
      clearMap();
      addItem(3);
      const bossLootItemIds = await getRandomItems(3);
      bossLootItemIds.forEach((itemId) => addItem(itemId, 1));
    }

    const allLoot = [...lootItemIds];
    setBattleOutcome("VICTORY");

    return allLoot;
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
    set((state) => {
      let newXP = state.player.xp + xp;
      let newLevel = state.player.level;
      let newXpToNextLvl = state.player.xpToNextLvl;
      let newMaxHp = state.player.maxHp;
      let currentHp = state.player.currentHp;
      // Dette er lagt til nylig, må kanskje fjernes
      let totalStrength = state.player.strength;
      let totalSpeed = state.player.speed;
      let totalDefense = state.player.defense;

      // Dette er lagt til nylig, må kanskje fjernes
      if (state.inventory.items) {
        Object.values(state.inventory.items).forEach((item) => {
          if (item.statModifiers) {
            totalStrength += item.statModifiers.strength || 0;
            totalSpeed += item.statModifiers.speed || 0;
            totalDefense += item.statModifiers.defense || 0;
          }
        });
      }

      while (newXP >= newXpToNextLvl) {
        newXP -= newXpToNextLvl;
        newLevel += 1;
        newXpToNextLvl = Math.floor(newXpToNextLvl * 1.2);
        newMaxHp = Math.floor(newMaxHp * 1.1);
        currentHp = newMaxHp; // Må endres til currentHp = state.player.currentHp hvis vi ikke vil at spilleren skal heales hver gang den lvler opp
      }

      return {
        player: {
          ...state.player,
          xp: newXP,
          level: newLevel,
          xpToNextLvl: newXpToNextLvl,
          maxHp: newMaxHp,
          currentHp: currentHp,
          // Dette er lagt til nylig, må kanskje fjernes
          strength: totalStrength,
          speed: totalSpeed,
          defense: totalDefense,
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
