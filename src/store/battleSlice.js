export const createBattleSlice = (set, get) => ({
  enemy: {
    id: "m1",
    name: "Fallen knight",
    baseHP: 150,
    baseStrength: 12,
    baseSpeed: 10,
    baseDefence: 12,
    lvlMultiplier: 1.1,
    dropChance: 1.1,
    baseGold: 10,
    sprite: "",

    currentHP: 0,
  },
  gameOver: false,
  turnCount: 0,
  nextToAttack: null,
  isFighting: true,
  skipTurn: false,
  xp: 50,
  baseGold: 50,

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

  addGold: (amount) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        gold: state.inventory.gold + amount,
      },
    }));
  },

  setSkipTurn: (skip) =>
    set(() => ({
      player: {
        skipTurn: skip,
      },
    })),

  startFighting: () =>
    set({
      isFighting: true,
    }),

  stopFighting: () =>
    set({
      isFighting: false,
    }),

  resetBattle: () =>
    set({
      gameOver: false,
      turnCount: 0,
    }),

  setEnemy: (enemy) => set({ enemy, currentHP: enemy.baseHP }),
  

  damageEnemy: (amount) =>
    set((state) => {
      const newHealth = Math.max(0, state.enemy.currentHP - amount);
      const enemyDefeated = newHealth === 0;
      if (enemyDefeated) {
        console.log(`${state.enemy.name} has been defeated!`);
      }
      return {
        enemy: { ...state.enemy, currentHP: newHealth },
        gameOver: enemyDefeated,
      };
    }),

  endBattle: () =>
    set(() => {
      return { gameOver: true };
    }),

  setTurnCount: () =>
    set((state) => {
      const newTurnCount = state.turnCount + 1;
      return { turnCount: newTurnCount };
    }),

  rollInitiative: () => {
    const playerSpeed = 5;
    const enemySpeed = 5;
    const playerInitiative = Math.floor(Math.random() * 20) + 1 + playerSpeed;
    const enemyInitiative = Math.floor(Math.random() * 20) + 1 + enemySpeed;
    const firstAttacker =
      playerInitiative >= enemyInitiative ? "PLAYER" : "ENEMY";
    set({ nextToAttack: "PLAYER" });
  },
});
