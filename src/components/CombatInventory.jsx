import { useEffect, useState } from "react";

export function CombatInventory({ callback, handleDrink }) {
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

  return (
    <div className="text-white flex items-center flex-col h-17">
      <h2 className="text-white text-xl font-bold mb-2">Your Health Potions</h2>

      {potions.length > 0 ? (
        <div className="flex gap-4 mb-4 bg-black relative">
          {potions.map((potion) => (
            <div
              key={potion.id}
              onClick={(e) => handleDrink(potion, e)}
              className="border p-1 flex flex-col items-center hover cursor-pointer"
            >
              <img
                src={potion.sprite}
                alt={potion.name}
                className="w-7 h-5 object-contain"
              />
              <p>{potion.name}</p>
              <button className="text-green-400">
                +{potion.healAmount} HP
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No potions found.</p>
      )}

      <div className="mt-4 flex gap-2">
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
      </div>
    </div>
  );
}
