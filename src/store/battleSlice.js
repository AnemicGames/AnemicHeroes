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
  turnCount: 0,
  nextToAttack: null,

  setEnemy: (enemy) => set({ enemy, enemyHealth: enemy.baseHP }),
  
  damageEnemy: (amount) =>
    set((state) => {
      const newHealth = Math.max(0, state.enemyHealth - amount);
      const enemyDefeated = newHealth === 0;
      if (enemyDefeated) {
        console.log(`${state.enemy.name} has been defeated!`);
      }
      return { enemyHealth: newHealth, gameOver: enemyDefeated };
    }),

  damagePlayer: (amount) =>
    set((state) => {
      const newHealth = Math.max(0, state.playerHealth - amount);
      const playerDefeated = newHealth === 0;
      return { playerHealth: newHealth, gameOver: playerDefeated };
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
    set({ nextToAttack: firstAttacker });
  },
});
