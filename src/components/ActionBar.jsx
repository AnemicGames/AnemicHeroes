import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export function ActionBar() {
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
  } = useGameStore();

  // State and effect for potions
  const [potions, setPotions] = useState([]);
  useEffect(() => {
    fetch("/assets/items.json")
      .then((response) => response.json())
      .then((data) => {
        if (data.itemTable && Array.isArray(data.itemTable)) {
          const potionItems = data.itemTable.filter(
            (item) => item.type === "potion"
          );
          setPotions(potionItems);
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((error) => console.error("Error loading items:", error));
  }, []);

  // Attack handler combining previous logic
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

  // Potion handler function
  const handleDrink = (potion, e) => {
    e.stopPropagation();
    // Insert your healing logic here, e.g., update player's HP with potion.healAmount
    console.log(`Used ${potion.name} to heal ${potion.healAmount} HP`);
  };

  return (
    <div className="flex flex-col w-full items-center gap-4 absolute bottom-1 left-0">
      <button
        className="flex items-center justify-center gap-3 text-white bg-red-700 hover:bg-red-600 rounded-full relative p-3 font-bold text-2xl bottom-6 border-2 border-yellow-300 w-[200px] z-50"
        onClick={handleAttack}
        disabled={gameOver}
      >
        <img src="assets/sprites/sword-shiny.png" alt="Attack" />
        Attack!
      </button>
      
      {/* Render a potion button if there is at least one potion */}
      {potions[0] && (
        <button
          className="text-white bg-red-700 hover:bg-red-600 rounded-full absolute right-12 bottom-6 font-bold text-xl p-3 border-2 border-yellow-300 w-fit-content z-50"
          onClick={(e) => handleDrink(potions[0], e)}
        >
          <img
            src={potions[0].sprite}
            alt={potions[0].name}
            className="h-[64px] w-[64px]"
          />
        </button>
      )}
    </div>
  );
}
 