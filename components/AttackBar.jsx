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
  } = useGameStore();

  const handleAttack = () => {
    console.log(isFighting);
    if (nextToAttack === "PLAYER" && !gameOver) {
      startFighting();
      console.log(isFighting);
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
    <div className="flex flex-col gap-4 border-2 border-red-500 bg-blue-500 p-4">
      <p className="text-white">Turn: {turnCount}</p>
      {!gameOver ? (
        nextToAttack === "PLAYER" && (
          <>
            <button
              onClick={handleAttack}
              disabled={gameOver}
              className="border flex items-center justify-center gap-3 text-white"
            >
              Attack{" "}
              <img
                src="./public/assets/sprites/weapons/sword_wpn.png"
                alt=""
              ></img>
            </button>
            <button onClick={() => callback("FIGHT")}></button>
          </>
        )
      ) : (
        <p>{enemy.currentHP === 0 ? "You defeated the enemy!" : "Game Over"}</p>
      )}
    </div>
  );
};
