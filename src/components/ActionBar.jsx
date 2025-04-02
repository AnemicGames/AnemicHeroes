import { useGameStore } from "../store/useGameStore";
import { useState } from "react";

export function ActionBar() {
  const { applyPlayerAttack, applyDrinkPotion, gameOver, inventory } = useGameStore();
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDrinkingPotion, setIsDrinkingPotion] = useState(false);

  const hasPotions = inventory.items?.POT_HEALTH > 0;

  return (
    <div className="flex flex-col w-full items-center gap-4 absolute bottom-1 left-0">
      <button
        className="flex items-center justify-center gap-3 text-white bg-red-700 hover:bg-red-600 rounded-full relative p-3 font-bold text-2xl bottom-6 border-2 border-yellow-300 w-[200px] z-50"
        onClick={() => {
          setIsAttacking(true);
          applyPlayerAttack();
          setTimeout(() => setIsAttacking(false), 1000);
        }}
        disabled={gameOver || isAttacking || isDrinkingPotion}
      >
        <img src="assets/sprites/sword-shiny.png" alt="Attack" />
        Attack!
      </button>

      <button
        className={`text-white rounded-full absolute right-12 bottom-6 font-bold text-xl p-3 border-2 border-yellow-300 w-fit-content z-50
          ${!hasPotions ? "bg-gray-500 cursor-not-allowed" : "bg-red-700 hover:bg-red-600"}
        `}
        onClick={() => {
          setIsDrinkingPotion(true);
          applyDrinkPotion();
          setTimeout(() => setIsDrinkingPotion(false), 1000);
        }}
        disabled={gameOver || isDrinkingPotion || isAttacking || !hasPotions}
      >
        <img
          src="/assets/sprites/potions/hp_pot.png"
          alt="Health Potion"
          className="h-[64px] w-[64px]"
        />
      </button>
    </div>
  );
}
