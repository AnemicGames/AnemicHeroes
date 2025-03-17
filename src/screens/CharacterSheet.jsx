import React from "react";
import { useGameStore } from "../store/useGameStore";

export default function CharacterSheet() {
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const goToSplash = () => setCurrentView("SPLASH");
  const goToMainMenu = () => setCurrentView("MAIN_MENU");
  const goToMap = () => setCurrentView("MAP");
  const goToBattle = () => setCurrentView("BATTLE");
  const goToCharacterSheet = () => setCurrentView("CHARACTER_SHEET");
  const goToShop = () => setCurrentView("SHOP");

  const player = useGameStore((state) => state.player);
  const inventory = useGameStore((state) => state.inventory);
  const equipItem = useGameStore((state) => state.equipItem);

  const getSlotFromItemType = (itemType) => {
    switch (itemType) {
      case "weapon":
        return "weapon";
      case "helm":
        return "helmet";
      case "armor":
        return "armor";
      case "boots":
        return "boots";
      case "trinket":
        return "trinket";
      default:
        return "weapon";
    }
  };

  const handleEquip = (item) => {
    const slot = getSlotFromItemType(item.type);
    equipItem(slot, item.id);
  };

  return (
    <div className="p-4">
      <div className="space-x-2 mb-4">
        <button
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToSplash}
        >
          Splash
        </button>
        <button
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToMainMenu}
        >
          Main Menu
        </button>
        <button
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToMap}
        >
          Map
        </button>
        <button
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToBattle}
        >
          Battle
        </button>
        <button
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToCharacterSheet}
        >
          Character
        </button>
        <button
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToShop}
        >
          Shop
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">
        {player.name}'s Character Sheet
      </h2>

      <div className="flex gap-4 mb-4">
        <div className="stats-box border p-4 flex-1">
          <h3 className="font-semibold mb-2">{player.name}'s Stats</h3>
          <div>Class: {player.class}</div>
          <div>Strength: {player.strength}</div>
          <div>Defense: {player.defense}</div>
          <div>Speed: {player.speed}</div>
          <div>
            HP: {player.currentHp} / {player.maxHp}
          </div>
        </div>
        <div className="hero-image border p-4 flex-1 flex items-center justify-center">
          <img
            src={`/assets/sprites/heroes/${
              player.class ? player.class.toLowerCase() : "warrior"
            }.png`}
            alt={player.class || "Hero"}
            className="max-w-full max-h-64 object-contain"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="equipment flex gap-2">
          {Object.entries(player.equipped || {}).map(([slot, itemId]) => (
            <div
              key={slot}
              className="equipment-slot border p-2 w-20 h-20 flex items-center justify-center"
            >
              {itemId ? (
                <span>{itemId}</span>
              ) : (
                <span className="text-xs text-gray-500">{slot}</span>
              )}
            </div>
          ))}
        </div>
        <div className="gold-count text-lg font-semibold">
          Gold: {player.gold || 0}
        </div>
      </div>

      <div className="inventory border p-4">
        <h3 className="font-semibold mb-2">Inventory</h3>
        {inventory && inventory.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {inventory.map((item) => (
              <div key={item.id} className="inventory-item border p-2">
                <img
                  src={item.sprite}
                  alt={item.name}
                  className="w-full h-16 object-contain mb-1"
                />
                <div className="text-sm">{item.name}</div>
                {item.equippable && (
                  <button
                    onClick={() => handleEquip(item)}
                    className="mt-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded p-1"
                  >
                    Equip
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No items in inventory.</p>
        )}
      </div>
    </div>
  );
}
