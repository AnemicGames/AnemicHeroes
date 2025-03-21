import React from "react";
import { useGameStore } from "../src/store/useGameStore";

export const AttackBar = ({ callback }) => {
  const {
    enemyHealth,
    setTurnCount,
    damageEnemy,
    nextToAttack,
    damagePlayer,
    gameOver,
    turnCount,
  } = useGameStore();

  const handleAttack = () => {
    if (nextToAttack === "PLAYER" && !gameOver) {
      damageEnemy(Math.floor(Math.random() * (25 - 5 + 1)) + 5);
      setTurnCount();

      if (enemyHealth > 0) {
        setTimeout(() => {
          damagePlayer(Math.floor(Math.random() * (25 - 5 + 1)) + 5);
          setTurnCount();
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p>Turn: {turnCount}</p>
      {!gameOver ? (
        nextToAttack === "PLAYER" && (
          <button onClick={handleAttack} disabled={gameOver} className="border flex items-center justify-center gap-3">
            Attack <img src="./public/assets/sprites/weapons/sword_wpn.png" alt=""></img>
          </button>
        )
      ) : (
        <p>{enemyHealth === 0 ? "You defeated the enemy!" : "Game Over"}</p>
      )}
    </div>
  );
};
