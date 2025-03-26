import React from "react";
import { useGameStore } from "../store/useGameStore";
import { useEffect, useState } from "react";
import { ActionBar } from "../components/Actionbar.jsx";
import { BackgroundImage } from "../components/BattleBackground.jsx";
// import { ActionBar } from "/src/components/ActionBar.jsx"; bruk denne når du pusher

export default function BattleView() {
  const [action, setAction] = useState("FIGHT");
  const setEnemy = useGameStore((state) => state.setEnemy);
  const rollInitiative = useGameStore((state) => state.rollInitiative);
  const heal = useGameStore((state) => state.heal);
  const resetBattle = useGameStore((state) => state.resetBattle);
  const [mobs, setMobs] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const setXP = useGameStore((state) => state.setXP);
  const addGold = useGameStore((state) => state.addGold);
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const resetPosition = useGameStore((state) => state.resetPosition)
  const player = useGameStore((state) => state.player);
  const enemy = useGameStore((state) => state.enemy);

  const playerHealthPercent = (player.currentHp / player.maxHp) * 100;
  const enemyHealthPercent = (enemy.currentHP / enemy.baseHP) * 100;

  function fetchRandomEnemy(mobs) {
    const randomMob = mobs[Math.floor(Math.random() * mobs.length)];

    return {
      currentHP: randomMob.baseHP,
      ...randomMob,
    };
  }

  useEffect(() => {
    fetch("/assets/mobs.json")
      .then((response) => response.json())
      .then((data) => {
        setMobs(data);
        resetBattle();
        setBattleOutcome(null);
        setIsBattleOver(false);
        heal(player.maxHp);
        setEnemy(fetchRandomEnemy(data));
        rollInitiative();
        // Alle her skal ut til map.
      })
      .catch((error) => console.error("Error loading mobs:", error));
  }, []);

  useEffect(() => {
    if (enemy.currentHP <= 0 && battleOutcome === null) {
      setBattleOutcome("VICTORY");
      setIsBattleOver(true);
      setXP(enemy.xpReward);
      addGold(enemy.goldReward);
    }

    if (player.currentHp <= 0 && battleOutcome === null) {
      console.log("Player defeated!");
      setBattleOutcome("DEFEAT");
      setIsBattleOver(true);
      resetPosition()
    }
  }, [
    enemy.currentHP,
    enemy.xpReward,
    enemy.goldReward,
    battleOutcome,
    player.currentHp,
    setXP,
    addGold,
    setCurrentView,
    resetPosition,
  ]);

  const goToSplash = () => setCurrentView("SPLASH");
  const goToMainMenu = () => setCurrentView("MAIN_MENU");
  const goToMap = () => setCurrentView("MAP");
  const goToBattle = () => setCurrentView("BATTLE");
  const goToCharacterSheet = () => setCurrentView("CHARACTER_SHEET");
  const goToShop = () => setCurrentView("SHOP");

  return (
    <div className="relative w-full h-full">
      <BackgroundImage />
      <div className="w-7xl flex flex-col gap-4 absolute h-[600px]">
        {/* Background image */}
        <div className="relative w-full h-full">
          {/* Player sprite */}
          <img
            src={"./public/assets/sprites/heroes/mage.png"}
            alt="Player Sprite"
            className={`absolute bottom-12 left-1/6 transform w-[300px] transition-transform duration-300 
    ${player.currentHp <= 0 ? "rotate-[-90deg] opacity-50 top-[300px]" : ""}`}
          />

          {/* Enemy sprite */}
          <img
            src={enemy.sprite}
            alt="Enemy"
            className={`absolute bottom-12 right-1/6 w-[300px] transition-transform duration-500 
    ${enemy.currentHP <= 0 ? "rotate-90 opacity-60 top-[300px]" : ""}`}
          />

          {/* Health Bars */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full text-center">
            <div className="flex gap-4 justify-center">
              {/* Player Health Bar */}
              <div className="w-[40%] mr-20">
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
              <div className="w-[40%]">
                <p className="text-xl text-white">{enemy.name}</p>
                <p className="text-xl text-white">{`${enemy.currentHP}/${enemy.baseHP}`}</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${enemyHealthPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Victory/Defeat Message */}
        {battleOutcome && isBattleOver && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center p-6 bg-black bg-opacity-80 rounded-xl">
            {battleOutcome === "VICTORY" ? (
              <>
                <h2 className="text-4xl text-green-400">🎉 Victory! 🎉</h2>
                <p className="text-white">
                  You gained {enemy.xpReward} XP and {enemy.goldReward} gold!
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={() => setCurrentView("MAP")}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl text-red-400">☠️ Defeat! ☠️</h2>
                <p className="text-white">You were defeated in battle...</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={() => setCurrentView("MAIN_MENU")}
                >
                  Respawn
                </button>
              </>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex gap-4 flex-col relative">
          <ActionBar
            action={action}
            callback={setAction}
            className="animate-shake"
          />
        </div>
      </div>
    </div>
  );
}
