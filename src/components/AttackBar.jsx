import React from "react";
import { useGameStore } from "../store/useGameStore";

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
    stopFighting,
  } = useGameStore();

  const handleAttack = () => {
    if (nextToAttack === "PLAYER" && !gameOver) {
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
    <div className="text-black flex items-center flex-col h-12">
      <p className="text-white text-xl">Turn: {turnCount}</p>
      {!gameOver ? (
        nextToAttack === "PLAYER" && (
          <>
            <button
              onClick={handleAttack}
              disabled={gameOver}
              className="border flex items-center justify-center gap-3 text-white p-2 mt-4 bg-black"
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
                className="w-14 h-14"
              />
            </button>
          </>
        )
      ) : (
        <p className="text-white text-lg">
          {enemy.currentHP === 0 ? "You defeated the enemy!" : "Game Over"}
        </p>
      )}
    </div>
  );
};
