import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";

export default function CharacterSheet() {
  const [itemsData, setItemsData] = useState(null);
  const [notification, setNotification] = useState(null);

  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 12;
  const frameRate = 583;

  // Pagination
  const [currentInventoryPage, setCurrentInventoryPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const imageCache = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/assets/char_sheet_bg/${i}.webp`;
      imageCache.push(img);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame % totalFrames) + 1);
    }, frameRate);
    return () => clearInterval(interval);
  }, []);

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
      : {
          weapon: null,
          helmet: null,
          armor: null,
          boots: null,
          trinket: null,
        };

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
    if (item.equippable === false) {
      setNotification(`${item.name} cannot be equipped.`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const slot = getSlotFromItemType(item.type);
    if (equipped[slot]) {
      unequipItem(slot);
    }
    equipItem(slot, item.id);
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

  const inventoryEntries = Object.entries(inventory.items);
  const totalInventoryPages = Math.ceil(inventoryEntries.length / itemsPerPage);

  if (currentInventoryPage > totalInventoryPages && totalInventoryPages > 0) {
    setCurrentInventoryPage(totalInventoryPages);
  }
  const startIndex = (currentInventoryPage - 1) * itemsPerPage;
  const currentItems = inventoryEntries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-4 h-full text-white grid grid-cols-30 grid-rows-5 gap-2 relative">
      <img
        src={`/assets/char_sheet_bg/${currentFrame}.webp`}
        alt="Background Animation"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />

      {/* Notification */}
      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}

      <h2 className="text-5xl font-bold mt-4 col-start-1 col-end-3 row-start-1">
        {player.name}
      </h2>

      {/* Hero image */}
      <div className="hero-image flex items-center justify-center absolute bottom-[100px] left-[420px]">
        <img
          src={heroImage}
          alt={player.class || "Hero"}
          className="max-w-full object-contain h-80"
        />
      </div>

      {/* Equipment */}
      <div className="flex items-start absolute bottom-4 left-[360px]">
        <div className="equipment flex gap-2 cursor-pointer">
          {Object.entries(equipped).map(([slot, itemId]) => {
            const item = itemId ? getItemDetails(itemId) : null;
            return (
              <div
                key={slot}
                className="equipment-slot rounded p-2 w-20 h-20 flex flex-col items-center justify-center relative bg-gray-500/80"
              >
                {item ? (
                  <div className="group" onClick={() => unequipItem(slot)}>
                    <img
                      src={item.sprite}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-0 hidden group-hover:flex flex-col bg-black text-white p-2 rounded text-xs z-10">
                      <div className="mb-1 h-15">{item.name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-white">{slot}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-box rounded p-2 flex flex-col gap-8 text-2xl bg-gray-500/80 col-start-1 col-end-8 row-start-2 row-end-6 relative">
        <h3 className="font-semibold mb-2 text-2xl">Stats</h3>
        <div>
          <div>Class: {player.class}</div>
          <div>Level: {player.level}</div>
          <div>
            HP:{" "}
            <span
              className={`${
                player.currentHp <= 20 ? "text-amber-500 font-semibold" : ""
              }`}
            >
              {player.currentHp}
            </span>{" "}
            / {player.maxHp}{" "}
            {player.currentHp <= 20 && (
              <span className="text-4xl blink text-amber-500 font-semibold">
                !
              </span>
            )}
          </div>
        </div>
        <div>
          <div>
            Strength:{" "}
            <span className="font-bold">{effectiveStats.strength}</span> (
            {player.strength}
            {bonusStrength > 0 ? (
              <span className="text-green-500"> +{bonusStrength}</span>
            ) : bonusStrength < 0 ? (
              <span className="text-red-500"> {bonusStrength}</span>
            ) : null}
            )
          </div>
          <div>
            Defense: <span className="font-bold">{effectiveStats.defense}</span>{" "}
            ({player.defense}
            {bonusDefense > 0 ? (
              <span className="text-green-500"> +{bonusDefense}</span>
            ) : bonusDefense < 0 ? (
              <span className="text-red-500"> {bonusDefense}</span>
            ) : null}
            )
          </div>
          <div>
            Speed: <span className="font-bold">{effectiveStats.speed}</span> (
            {player.speed}
            {bonusSpeed > 0 ? (
              <span className="text-green-500"> +{bonusSpeed}</span>
            ) : bonusSpeed < 0 ? (
              <span className="text-red-500"> {bonusSpeed}</span>
            ) : null}
            )
          </div>
        </div>

        <div className="mb-2 flex flex-col items-center gap-2">
          <div className="w-full bg-gray-300 rounded-full h-4 mt-1">
            <div
              className="bg-blue-400 h-4 rounded-full"
              style={{
                width: `${(player.xp / player.xpToNextLvl) * 100}%`,
              }}
            ></div>
          </div>
          <div className="text-xl font-semibold flex items-center justify-between w-full">
            <div>XP</div>
            {player.xp} / {player.xpToNextLvl}
          </div>

          {/* Exit */}
          <button className="space-x-2 flex absolute bottom-2 right-2 cursor-pointer hover:bg-red-800 rounded">
            <img
              src="/assets/sprites/exit-nav-icon.png"
              alt="Exit"
              className="px-2 py-1 rounded text-white w-14 h-14"
              onClick={goToMainMenu}
            />
          </button>
        </div>
      </div>

      {/* Inventory */}
      <div className="inventory rounded p-4 col-start-23 col-end-31 row-start-1 row-end-6 bg-gray-500/80 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold mb-2">Inventory</h3>
          <div className="gold-count text-lg font-semibold">
            Gold: {inventory.gold || 0}
          </div>
        </div>
        {inventoryEntries.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-1">
              {currentItems.map(([itemId, count]) => {
                const item = getItemDetails(itemId);
                if (!item) return null;
                return (
                  <div
                    key={itemId}
                    className="inventory-item rounded p-2 w-24 h-24 relative group flex flex-col items-center justify-center bg-gray-800 cursor-pointer"
                    onContextMenu={(e) => {
                      if (item.type === "potion") handleDrink(item, e);
                    }}
                    title={
                      item.type === "potion"
                        ? "Right-click to drink"
                        : undefined
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

                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-0 h-24 w-24 hidden group-hover:flex flex-col bg-black text-white p-2 rounded text-xs z-10">
                      {item.type === "potion" ? (
                        <>
                          <div className="mb-1">{item.name}</div>
                          <div>Heal {item.healAmount} HP</div>
                        </>
                      ) : (
                        <div
                          onClick={() => handleEquip(item)}
                          title="Click to equip"
                        >
                          <div className="mb-1">{item.name}</div>
                          <div>STR: {item.statModifiers?.strength ?? 0}</div>
                          <div>DEF: {item.statModifiers?.defense ?? 0}</div>
                          <div>SPD: {item.statModifiers?.speed ?? 0}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="pagination-controls flex justify-between items-center px-4 absolute bottom-2 right-1 w-full">
              <button
                onClick={() =>
                  setCurrentInventoryPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentInventoryPage === 1}
                className="bg-gray-700 px-2 py-1 rounded"
              >
                Previous
              </button>
              <span>
                Page {currentInventoryPage} of {totalInventoryPages}
              </span>
              <button
                onClick={() =>
                  setCurrentInventoryPage((prev) =>
                    Math.min(prev + 1, totalInventoryPages)
                  )
                }
                disabled={currentInventoryPage === totalInventoryPages}
                className="bg-gray-700 px-2 py-1 rounded"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>No items in inventory.</p>
        )}
      </div>
    </div>
  );
}
