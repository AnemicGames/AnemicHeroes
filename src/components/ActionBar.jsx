import { useGameStore } from "../store/useGameStore";
import { useState } from "react";

const POTION_ID = "POT_HEALTH";
const POTION_HEAL_AMOUNT = 50; 

export function ActionBar() {
  const {
    setTurnCount,
    damageEnemy,
    enemy,
    nextToAttack,
    gameOver,
    takeDamage,
    endBattle,
    player,
    startFighting,
    heal,
    inventory,
    removeItem,
  } = useGameStore();

  const [isAttacking, setIsAttacking] = useState(false);
  const [isDrinkingPotion, setIsDrinkingPotion] = useState(false);

  const handleAttack = () => {
    if (nextToAttack === "PLAYER" && !gameOver) {
      setIsAttacking(true)
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
          setIsAttacking(false)
        }, 1000);
      }
    }
  };

  const handleDrink = (e) => {
    e.stopPropagation();
  
    if (!inventory.items[POTION_ID] || inventory.items[POTION_ID] <= 0) {
      console.warn(`No Health Potion left in inventory.`);
      return;
    }
    setIsDrinkingPotion(true)
    removeItem(POTION_ID);
    heal(POTION_HEAL_AMOUNT);
    console.log(`Healed player for ${POTION_HEAL_AMOUNT} HP using Health Potion.`);
    setTurnCount();
  
    setTimeout(() => {
      if (player.currentHp > 0) {
        const damageAmount = Math.floor(Math.random() * (25 - 5 + 1)) + 5;
        takeDamage(damageAmount);
  
        if (player.currentHp - damageAmount <= 0) {
          endBattle();
        } else {
          setTurnCount();
        }
      }
      setIsDrinkingPotion(false)
    }, 1000);
  };
  

  return (
    <div className="flex flex-col w-full items-center gap-4 absolute bottom-1 left-0">
      <button
        className="flex items-center justify-center gap-3 text-white bg-red-700 hover:bg-red-600 rounded-full relative p-3 font-bold text-2xl bottom-6 border-2 border-yellow-300 w-[200px] z-50"
        onClick={handleAttack}
        disabled={gameOver || isAttacking}
      >
        <img src="assets/sprites/sword-shiny.png" alt="Attack" />
        Attack!
      </button>

      {inventory.items[POTION_ID] > 0 && (
        <button
          className="text-white bg-red-700 hover:bg-red-600 rounded-full absolute right-12 bottom-6 font-bold text-xl p-3 border-2 border-yellow-300 w-fit-content z-50"
          onClick={handleDrink}
          disabled={gameOver || isDrinkingPotion || isAttacking}
        >
          <img
            src="/assets/sprites/potions/hp_pot.png"
            alt="Health Potion"
            className="h-[64px] w-[64px]"
          />
        </button>
      )}
    </div>
  );
}

 