export const createBattleSlice = (set, get) => ({
  enemy: null, 
  enemyHealth: 0, 
  turnCount: 0, 
  nextToAttack: null,

  setEnemy: (enemy) => {
    set({
      enemy: { ...enemy },
      enemyHealth: enemy.baseHP,
      turnCount: 0,
    });

    get().rollInitiative();
  },

  damageEnemy: (amount) => {
    set((state) => {
      const newHealth = Math.max(0, state.enemyHealth - amount);
      const enemyDefeated = newHealth === 0;

      if (enemyDefeated) {
        console.log(`${state.enemy.name} (ID: ${state.enemy.id}) has been defeated!`);
      }

      return { enemyHealth: newHealth };
    });
  },

  setTurnCount: () => {
    set((state) => ({ turnCount: state.turnCount + 1 }));
    get().rollInitiative(); 
  },


  rollInitiative: () => {
    const playerSpeed = get().player?.speed || 5; 
    const enemySpeed = get().enemy?.baseSpeed || 5; 

    const playerInitiative = Math.floor(Math.random() * 20) + 1 + playerSpeed;
    const enemyInitiative = Math.floor(Math.random() * 20) + 1 + enemySpeed;

    const firstAttacker = playerInitiative >= enemyInitiative ? "PLAYER" : "ENEMY"; // Player wins ties

    set({ nextToAttack: firstAttacker });

    console.log(
      `Turn ${get().turnCount + 1} Initiative Roll: Player (${playerInitiative}) vs. ${get().enemy?.name} (${enemyInitiative}) -> ${firstAttacker} goes first!`
    );
  },
});
