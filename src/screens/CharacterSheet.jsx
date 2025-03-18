import React, { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";

export default function CharacterSheet() {
  const [itemsData, setItemsData] = useState(null);
  useEffect(() => {
    fetch("/assets/items.json")
      .then((response) => response.json())
      .then((data) => setItemsData(data))
      .catch((error) => console.error("Error loading items:", error));
  }, []);

  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const goToMainMenu = () => setCurrentView("MAIN_MENU");

  const player = useGameStore((state) => state.player);
  const inventory = useGameStore((state) => state.inventory);
  const equipItem = useGameStore((state) => state.equipItem);
  const unequipItem = useGameStore((state) => state.unequipItem);
  const removeItem = useGameStore((state) => state.removeItem);

  const equipped =
    player.equipped && Object.keys(player.equipped).length > 0
      ? player.equipped
      : { weapon: null, helmet: null, armor: null, boots: null, trinket: null };

  useEffect(() => {
    if (
      player &&
      player.equipped &&
      Object.keys(player.equipped).length > 0 &&
      Object.keys(inventory.items).length === 0
    ) {
      const initFunc = useGameStore.getState().initializeFromPlayer;
      if (typeof initFunc === "function") {
        initFunc();
      }
    }
  }, [inventory.items, player.equipped]);

  if (!itemsData) {
    return <div>Loading items...</div>;
  }

  const getItemDetails = (itemId) => {
    return itemsData.itemTable.find((item) => item.id === itemId) || null;
  };

  const effectiveStats = {
    strength: player.strength,
    defense: player.defense,
    speed: player.speed,
  };
  Object.entries(player.equipped || {}).forEach(([slot, itemId]) => {
    if (itemId) {
      const item = getItemDetails(itemId);
      if (item && item.statModifiers) {
        effectiveStats.strength += item.statModifiers.strength || 0;
        effectiveStats.defense += item.statModifiers.defense || 0;
        effectiveStats.speed += item.statModifiers.speed || 0;
      }
    }
  });
  const bonusStrength = effectiveStats.strength - player.strength;
  const bonusDefense = effectiveStats.defense - player.defense;
  const bonusSpeed = effectiveStats.speed - player.speed;

  const heroImage =
    player.class && player.class.trim().length > 0
      ? `/assets/sprites/heroes/${player.class.toLowerCase()}.png`
      : `/assets/sprites/heroes/warrior.png`;

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

  const handleUnequip = (slot) => {
    unequipItem(slot);
  };

  const handleDrink = (item, event) => {
    event.preventDefault();
    if (item.type === "potion" && item.healAmount) {
      useGameStore.setState((state) => ({
        player: {
          ...state.player,
          currentHp: Math.min(
            state.player.maxHp,
            state.player.currentHp + item.healAmount
          ),
        },
      }));
      removeItem(item.id, 1);
    }
  };

  return (
    <div
      className="p-4 h-full text-white flex flex-col gap-2"
      style={{
        backgroundImage: "url('/assets/battle_bg/13.webp')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top",
      }}
    >
      <h2 className="text-4xl font-bold mb-4">
        {player.name}'s Character Sheet
      </h2>

      <div className="flex gap-4 mb-4">
        {/* Hero image */}
        <div className="hero-image border p-4 flex items-center justify-center">
          <img
            src={heroImage}
            alt={player.class || "Hero"}
            className="max-w-full max-h-64 object-contain h-48"
          />
        </div>

        {/* Stats */}
        <div className="stats-box border p-2 flex-1/2 flex flex-col gap-4 text-2xl bg-gray-800 bg-opacity-80">
          <h3 className="font-semibold mb-2 text-2xl">Stats</h3>
          <div className="flex justify-between items-center gap-12 mb-6">
            <div>
              <div>Class: {player.class}</div>
              <div>Level: {player.level}</div>
              <div
                className={` ${
                  player.currentHp <= 20
                    ? "blink text-red-500 font-semibold"
                    : ""
                }`}
              >
                HP: {player.currentHp} / {player.maxHp}
              </div>
            </div>
            <div>
              <div>
                Strength:{" "}
                <span className="font-bold"> {effectiveStats.strength}</span> (
                {player.strength}{" "}
                {bonusStrength > 0 && (
                  <span className="text-green-500">+{bonusStrength}</span>
                )}
                )
              </div>
              <div>
                Defense:
                <span className="font-bold"> {effectiveStats.defense}</span> (
                {player.defense}{" "}
                {bonusDefense > 0 && (
                  <span className="text-green-500">+{bonusDefense}</span>
                )}
                )
              </div>
              <div>
                Speed:{" "}
                <span className="font-bold"> {effectiveStats.speed}</span> (
                {player.speed}{" "}
                {bonusSpeed > 0 && (
                  <span className="text-green-500">+{bonusSpeed}</span>
                )}
                )
              </div>
            </div>
          </div>

          <div className="mb-2 flex flex-col items-center gap-2">
            <div className="w-full bg-gray-300 rounded-full h-4 mt-1">
              <div
                className="bg-red-500 h-4 rounded-full"
                style={{ width: `${(player.xp / player.xpToNextLvl) * 100}%` }}
              ></div>
            </div>
            <div className="text-xl font-semibold flex items-center justify-between w-full">
              <div>XP</div>
              {player.xp} / {player.xpToNextLvl}
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="flex justify-between items-start mb-4 flex-1">
          <div className="equipment grid grid-cols-2 gap-2">
            {Object.entries(equipped).map(([slot, itemId]) => {
              const item = itemId ? getItemDetails(itemId) : null;
              return (
                <div
                  key={slot}
                  className="equipment-slot border p-2 w-20 h-20 flex flex-col items-center justify-center relative"
                >
                  {item ? (
                    <div className="group">
                      <img
                        src={item.sprite}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                      {/* Tooltip equip */}
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex flex-col bg-black text-white p-2 rounded text-xs z-10">
                        <div className="mb-1">{item.name}</div>
                        <div>STR: {item.statModifiers.strength}</div>
                        <div>DEF: {item.statModifiers.defense}</div>
                        <div>SPD: {item.statModifiers.speed}</div>
                      </div>
                      <button
                        onClick={() => handleUnequip(slot)}
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">{slot}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="inventory border p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold mb-2">Inventory</h3>
          <div className="gold-count text-lg font-semibold">
            Gold: {inventory.gold || 0}
          </div>
        </div>
        {inventory && Object.keys(inventory.items).length > 0 ? (
          <div className="grid grid-cols-10 gap-2">
            {Object.entries(inventory.items).map(([itemId, count]) => {
              const item = getItemDetails(itemId);
              if (!item) return null;
              return (
                <div
                  key={itemId}
                  className="inventory-item border p-2 relative group flex flex-col items-center justify-center"
                  onContextMenu={(e) => {
                    if (item.type === "potion") handleDrink(item, e);
                  }}
                  title={
                    item.type === "potion" ? "Right-click to drink" : undefined
                  }
                >
                  <img
                    src={item.sprite}
                    alt={item.name}
                    className="w-full h-16 object-contain mb-1"
                  />
                  <div className="absolute top-0 right-0 bg-gray-800 text-white text-2xl px-1">
                    {count}
                  </div>
                  {item.equippable && (
                    <button
                      onClick={() => handleEquip(item)}
                      className="mt-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded p-1 px-2 "
                    >
                      Equip
                    </button>
                  )}
                  {/* Tooltip inventory */}
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex flex-col bg-black text-white p-2 rounded text-xs z-10">
                    <div className="mb-1">{item.name}</div>
                    <div>STR: {item.statModifiers.strength}</div>
                    <div>DEF: {item.statModifiers.defense}</div>
                    <div>SPD: {item.statModifiers.speed}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No items in inventory.</p>
        )}
      </div>
      <div className="space-x-2 mb-4 flex justify-end">
        <img
          src="/assets/sprites/exit-nav-icon.png"
          alt="Exit"
          className="px-2 py-1 border rounded bg-gray-700 text-white"
          onClick={goToMainMenu}
        />
      </div>
    </div>
  );
}
