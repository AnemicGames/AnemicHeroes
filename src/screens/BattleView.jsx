import React from "react";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import { ActionBar } from "/src/components/ActionBar.jsx";
import { BackgroundImage } from "../components/BattleBackground.jsx";
import { QuestHandler } from "/src/components/QuestHandler.jsx";

export default function BattleView() {
  const [action, setAction] = useState("FIGHT");
  const setEnemy = useGameStore((state) => state.setEnemy);
  const rollInitiative = useGameStore((state) => state.rollInitiative);
  const clearBattle = useGameStore((state) => state.clearBattle);
  const heal = useGameStore((state) => state.heal);
  const resetBattleState = useGameStore((state) => state.resetBattleState);
  const [battleOutcome, setBattleOutcome] = useState(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const setXP = useGameStore((state) => state.setXP);
  const addGold = useGameStore((state) => state.addGold);
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const resetPosition = useGameStore((state) => state.resetPosition);
  const player = useGameStore((state) => state.player);
  const enemy = useGameStore((state) => state.enemy);
  const encounterType = useGameStore((state) => state.encounterType);
  const clearMap = useGameStore((state) => state.clearMap);
  const battleState = useGameStore((state) => state.battleState);
  const setBattleState = useGameStore((state) => state.setBattleState)

  const playerHealthPercent =
    player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const enemyHealthPercent =
    enemy.baseHP > 0 ? (enemy.currentHP / enemy.baseHP) * 100 : 0;

  {
    /*function for fetching random mobs */
  }
  function fetchRandomEnemy(mobs) {
    const randomMob = mobs[Math.floor(Math.random() * mobs.length)];
    const calculatedXP = Math.floor(50 * randomMob.lvlMultiplier);

    return {
      currentHP: randomMob.baseHP,
      xp: calculatedXP,
      gold: randomMob.baseGold,
      ...randomMob,
    };
  }

  function calculateGoldReward() {
    const goldReward = Math.round(
      enemy.baseGold * enemy.lvlMultiplier + player.level * enemy.lvlMultiplier
    );
    return goldReward;
  }

  {
    /*Getting current battleState from localStorage and fetch mobs */
  }

  useEffect(() => {
    if (battleState) {
      setEnemy(battleState.enemy);
      rollInitiative();
    } else {
      const dataFile =
        encounterType === "BOSS" ? "/assets/bosses.json" : "/assets/mobs.json";

      fetch(dataFile)
        .then((response) => response.json())
        .then((data) => {
          clearBattle();
          setBattleOutcome(null);
          setIsBattleOver(false);
          heal(player.maxHp);

          const newEnemy = fetchRandomEnemy(data);
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
      setBattleOutcome("VICTORY");
      setIsBattleOver(true);
      setXP(enemy.xp);
      addGold(calculateGoldReward());
  
      if (enemy.encounterType === "BOSS") {
        setBattleOutcome("VICTORY");
        setIsBattleOver(true);
        setXP(enemy.xp);
        addGold(calculateGoldReward());
        clearMap();
        setCurrentView("MAIN_MENU");
      }
    }
    
    if (player.currentHp <= 0 && !battleOutcome) {
      setBattleOutcome("DEFEAT");
      setIsBattleOver(true);
      resetPosition();
      clearMap();
    }
  }, [
    enemy.currentHP,
    enemy.xp,
    enemy.baseGold,
    player.xp,
    battleOutcome,
    player.currentHp,
    setXP,
    addGold,
    setCurrentView,
    resetPosition,
  ]);

  useEffect(() => {
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
  }, [enemy, player.currentHp, isBattleOver]);

  return (
    <div className="relative w-full h-full">
      <QuestHandler battleOutcome={battleOutcome} />
      {/* Background image */}
      <BackgroundImage />

      {/* Health Bars */}

      {/* Player Health Bar */}
      <div className="w-[40%] mr-20 top-6 absolute left-12">
        <p className="text-xl text-white">{player.name}</p>
        <p className="text-xl text-white">{`${player.currentHp}/${player.maxHp}`}</p>
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
        className={`absolute bottom-[120px] left-1/6 transform w-[300px] transition-transform duration-300 
    ${player.currentHp <= 0 ? "rotate-[-90deg] opacity-50 top-[300px]" : ""}`}
      />
      {/* Enemy sprite */}
      <img
        src={enemy.sprite}
        alt="Enemy"
        className={`absolute bottom-[120px] right-1/6 w-[300px] transition-transform duration-500 
    ${enemy.currentHP <= 0 && "rotate-90 opacity-60 top-[300px]"}`}
      />

      <ActionBar
        action={action}
        callback={setAction}
        className="animate-shake"
      />

      {/* Victory/Defeat Message */}
      <div className="w-7xl flex flex-col gap-4 absolute h-full">
        {battleOutcome && isBattleOver && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center p-6 bg-black bg-opacity-80 rounded-xl">
            {battleOutcome === "VICTORY" ? (
              <>
                <h2 className="text-4xl text-green-400">🎉 Victory! 🎉</h2>
                <p className="text-white">
                  You defeated {enemy.name}!
                  <br/>
                  You gained {player.xp} XP and {calculateGoldReward()} gold!
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={() => {
                    clearBattle();
                    setCurrentView("MAP");
                  }}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl text-red-400">☠️ Defeat! ☠️</h2>
                <p className="text-white">You were defeated in battle...</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-500/80 text-white rounded"
                  onClick={() => {
                    clearBattle();
                    setCurrentView("MAIN_MENU");
                  }}
                >
                  Respawn
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
