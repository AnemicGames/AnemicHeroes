import { useEffect, useState, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { ActionBar } from "/src/components/ActionBar.jsx";
import { BackgroundImage } from "../components/BattleBackground.jsx";
import { QuestHandler } from "/src/components/QuestHandler.jsx";

export default function BattleView() {
  const [action, setAction] = useState("FIGHT");
  const [lootItems, setLootItems] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const victoryHandledRef = useRef(false);

  const {
    setEnemy,
    rollInitiative,
    clearBattle,
    heal,
    resetBattleState,
    addItem,
    setCurrentView,
    resetPosition,
    setBattleState,
    player,
    enemy,
    encounterType,
    battleState,
    fetchRandomEnemy,
    calculateGoldReward,
    handleVictory,
    handleDefeat,
    clearMap,
    levelUpMessage,
    showLevelUp,
    isAttacking,
  } = useGameStore();

  const playerHealthPercent =
    player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const enemyHealthPercent =
    enemy.baseHP > 0 ? (enemy.currentHP / enemy.baseHP) * 100 : 0;

  useEffect(() => {
    if (battleState) {
      setEnemy(battleState.enemy);
      rollInitiative();
    } else {
      const mobsFile =
        encounterType === "BOSS" ? "/assets/bosses.json" : "/assets/mobs.json";

      fetch(mobsFile)
        .then((response) => response.json())
        .then((mobs) => {
          clearBattle();
          setBattleOutcome(null);
          setLootItems([]);
          setIsBattleOver(false);

          const newEnemy = fetchRandomEnemy(mobs);
          setEnemy(newEnemy);
          rollInitiative();
        })
        .catch((error) =>
          console.error(`Error loading ${encounterType}:`, error)
        );
    }
  }, []);

  useEffect(() => {
    if (enemy.currentHP <= 0 && !battleOutcome) {
      victoryHandledRef.current = true;
      setBattleOutcome("VICTORY");
      setIsBattleOver(true);
      handleVictory().then((loot) => {
        if (loot && loot.length > 0) {
          setLootItems(loot);
        }
      });

      if (enemy.encounterType === "BOSS") {
        setCurrentView("MAIN_MENU");
        heal(player.maxHp);
      }
    }

    if (player.currentHp <= 0 && !battleOutcome) {
      setBattleOutcome("DEFEAT");
      setIsBattleOver(true);
      handleDefeat();
    }
  }, [
    enemy.currentHP,
    enemy.xp,
    enemy.baseGold,
    enemy.encounterType,
    player.xp,
    battleOutcome,
    setCurrentView,
    resetPosition,
    handleDefeat,
    heal,
    handleVictory,
    player.currentHp,
    player,
    addItem,
  ]);

  useEffect(() => {
    if (isBattleOver) {
      resetBattleState();
    } else {
      setBattleState({
        enemy,
        player: { ...player, maxHp: player.maxHp, currentHp: player.currentHp },
      });
    }
  }, [
    enemy,
    player.currentHp,
    isBattleOver,
    player,
    resetBattleState,
    setBattleState,
  ]);

  return (
    <div className="relative w-full h-full">
      <QuestHandler battleOutcome={battleOutcome} />
      <BackgroundImage />

      {/* Player Health Bar */}
      <div className="w-[40%] mr-20 top-6 absolute left-12">
        <p className="text-2xl text-white">{player.name}</p>

        <div className="flex gap-88">
          <p className="text-xl text-white">{`${player.currentHp}/${player.maxHp}`}</p>
          <p className="text-xl text-white">Level: {player.level}</p>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className="h-full rounded-full bg-red-500"
            style={{ width: `${playerHealthPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Enemy Health Bar */}
      <div className="w-[40%] top-7 absolute right-12">
        <p
          className={`text-xl text-white ${
            encounterType === "BOSS" ? "text-3xl font-bold text-red-400" : ""
          }`}
        >
          {enemy.name}
          {encounterType === "BOSS" && "☠️"}
        </p>
        <p
          className={`text-xl text-white ${
            encounterType === "BOSS" ? "text-2xl text-red-300" : ""
          }`}
        >
          {`${enemy.currentHP}/${enemy.baseHP}`}
          </p>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className={`h-full rounded-full ${
              encounterType === "BOSS"
                ? "bg-gradient-to-r from-red-500 to-green-600"
                : "bg-red-500"
            }`}
            style={{ width: `${enemyHealthPercent}%` }}
          ></div>
        </div>
      </div>

      {encounterType === "BOSS" && (
        <img
          src="/assets/sprites/cracked-skull.png"
          alt="Skull"
          className="absolute top-3 left-3/4 transform -translate-x-1/2 w-20 h-20"
        />
      )}

      {/* Player sprite */}
      <img
        src={`/assets/sprites/heroes/${player.class.toLowerCase()}.png`}
        alt={`${player.class} Sprite`}
        className={`absolute bottom-[120px] left-1/6 w-[300px] transition-transform duration-300
    ${
      player.currentHp <= 0
        ? "rotate-[-90deg] opacity-50 transition-opacity duration-1000 top-[300px]"
        : ""
    }
    ${isAttacking ? "translate-x-5" : "translate-x-0"}
  `}
      />
      {/* Enemy sprite */}
      <img
        src={enemy.sprite}
        alt="Enemy"
        className={`absolute bottom-[120px] right-1/6 w-[300px] transition-all duration-300
    ${
      enemy.currentHP <= 0
        ? "rotate-90 opacity-50 transition-opacity duration-1000 top-[300px]"
        : ""
    }
    ${isAttacking ? "animate-pulse" : ""}
  `}
      />

      {/* Victory/Defeat Message */}
      <div className="w-7xl flex flex-col gap-4 absolute h-full">
        {battleOutcome && isBattleOver && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center p-6 bg-black bg-opacity-80 rounded-xl">
            {battleOutcome === "VICTORY" ? (
              <>
                <h2 className="text-4xl text-green-400"> Victory! </h2>
                <p className="text-white">
                  You defeated {enemy.name}!
                  <br />
                  You gained {player.xp} XP and {calculateGoldReward()} gold!
                </p>
                {lootItems.map((item) => (
                  <div key={item.id} className="text-center group relative">
                    <p className="mt-2 text-sm">You also gained {item.name}!</p>
                    <img
                      src={item.sprite}
                      alt={item.name}
                      className="w-16 h-16 object-cover mx-auto"
                    />
                    <div className="absolute left-0 bottom-0 h-28 w-24 hidden group-hover:flex flex-col bg-gray-900 text-white p-2 rounded text-xs z-10">
                      {item.type === "potion" ? (
                        <>
                          <div className="mb-1 break-words">{item.name}</div>
                          <div>Heal {item.healAmount} HP</div>
                        </>
                      ) : (
                        <div>
                          <div className="mb-1 break-words">{item.name}</div>
                          <div className="underline">{item.type ?? 0}</div>
                          <div>STR: {item.statModifiers?.strength ?? 0}</div>
                          <div>DEF: {item.statModifiers?.defense ?? 0}</div>
                          <div>SPD: {item.statModifiers?.speed ?? 0}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  className="mt-4 px-4 py-2 text-white rounded cursor-pointer bg-green-600 font-bold hover:bg-green-800 transition duration-150"
                  onClick={() => {
                    clearBattle();
                    if (encounterType === "BOSS") {
                      clearMap();
                      setCurrentView("MAIN_MENU");
                    } else {
                      setCurrentView("MAP");
                    }
                  }}
                >
                  Continue!
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl text-red-400">☠️ Defeat! ☠️</h2>
                <p className="text-white">You were defeated in battle...</p>
                <button
                  className="mt-4 px-4 py-2 bg-red-500/80 text-white rounded cursor-pointer"
                  onClick={() => {
                    clearBattle();
                    setCurrentView("MAIN_MENU");
                    heal(player.maxHp);
                  }}
                >
                  Respawn
                </button>
              </>
            )}
          </div>
        )}

        {showLevelUp && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-black rounded shadow text-white text-lg z-50 p-4">
            {levelUpMessage}
          </div>
        )}

        <ActionBar
          action={action}
          callback={setAction}
          className="animate-shake"
        />
      </div>
    </div>
  );
}
