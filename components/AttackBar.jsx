import React from "react";
import { useGameStore } from "../src/store/useGameStore";

export const AttackBar = ({ callback }) => {
  const {
    setTurnCount,
    damageEnemy,
    turnCount,
    enemy,
    nextToAttack,
    gameOver,
    takeDamage,
    endBattle,
    player,
    startFighting,
    stopFighting,
    isFighting,
    enemyAttack,
    setSkipTurn,
  } = useGameStore();

  const handleAttack = () => {
    if (nextToAttack === "PLAYER" && !gameOver) {
      startFighting();
      const damage = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
      damageEnemy(damage);
      setTurnCount();

      if (enemy.currentHP - damage > 0) {
        setTimeout(() => {
          const damageAmount = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
          takeDamage(damageAmount);
          if (player.currentHp - damageAmount <= 0) {
            endBattle();
          } else {
            setTurnCount();
          }
          stopFighting();
        }, 1000);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <p className="text-white">Turn: {turnCount}</p>
      {!gameOver ? (
        nextToAttack === "PLAYER" && (
          <>
            <button
              onClick={handleAttack}
              disabled={gameOver}
              className="border flex items-center justify-center gap-3 text-white p-2 mt-4"
            >
              Attack{" "}
              <img
                src="./public/assets/sprites/weapons/sword_wpn.png"
                alt=""
              ></img>
            </button>
            <button
              className="absolute bottom-0 left-0 m-4 p-2 hover:bg-red-800 rounded"
              title="Exit"
              onClick={() => callback("FIGHT")}
            >
              <img
                src="/assets/sprites/exit-nav-icon.png"
                alt="Exit"
                className="w-10 h-11"
              />
            </button>
          </>
        )
      ) : (
        <p>{enemy.currentHP === 0 ? "You defeated the enemy!" : "Game Over"}</p>
      )}
    </div>
  );
};
