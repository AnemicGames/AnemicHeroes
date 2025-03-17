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
  });
  