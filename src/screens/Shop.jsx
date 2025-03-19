import React, { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
const AnimatedImage = () => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 12;
  const frameRate = 170;
  useEffect(() => {
    const imageCache = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/assets/shop_bg/${i}.webp`;
      imageCache.push(img);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame % totalFrames) + 1);
    }, frameRate);

    return () => clearInterval(interval);
  }, []);

  return (
    <img
      src={`/assets/shop_bg/${currentFrame}.webp`}
      alt="Animated bonfire"
      className="absolute top-0 left-0 w-full h-full object-cover z-0"
    />
  );
};

export default function Shop() {
  const inventory = useGameStore((state) => state.inventory);
  const addItem = useGameStore((state) => state.addItem);
  const removeItem = useGameStore((state) => state.removeItem);
  const addGold = useGameStore((state) => state.addGold);
  const removeGold = useGameStore((state) => state.removeGold);
  const embark = useGameStore((state) => state.embark);
  const setCurrentView = useGameStore((state) => state.setCurrentView);

  const [items, setItems] = useState(null);
  const [limitedOffers, setLimitedOffers] = useState([null, null]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [sellMessage, setSellMessage] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [buyMessage, setBuyMessage] = useState("");

  // Nedtelling i sekunder for limited offer (5 timer = 18000 sekunder)
  const [countdown, setCountdown] = useState(18000);

  useEffect(() => {
    fetch("/assets/items.json")
      .then((response) => response.json())
      .then((data) => setItems(data.itemTable))
      .catch((error) => console.error("Error loading items:", error));
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      const offers = getRandomItems(items, 2);
      setLimitedOffers(offers);
      setCountdown(18000);
    }
  }, [items]);

  // Oppdater nedtelling hvert sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Når nedtellingen er ferdig, sett inn nye limited offers
          if (items && items.length > 0) {
            const newOffers = getRandomItems(items, 2);
            setLimitedOffers(newOffers);
          }
          return 18000;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [items]);

  // Hjelpefunksjon for å trekke ut 'count' tilfeldige items fra et array
  function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Formater sekunder til HH:MM:SS
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const getBuyPrice = (item) => {
    return Math.floor(200 / (item.dropChance / 100));
  };

  const getSellPrice = (item) => {
    return Math.floor(getBuyPrice(item) / 2);
  };

  const handleReturn = () => {
    setCurrentView(embark ? "MAP" : "MAIN_MENU");
  };

  const handleItemClick = (item, mode) => {
    setSelectedItem(item);
    setSelectedMode(mode);
  };

  // Oppdater inventory og fjern produktet fra limitedOffers (sett til null)
  const handleBuy = (item) => {
    const price = getBuyPrice(item);
    if (inventory.gold >= price) {
      removeGold(price);
      addItem(item.id, 1);
      // Fjern produktet fra limitedOffers med null i den aktuelle slotten
      setLimitedOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer && offer.id === item.id ? null : offer
        )
      );
      setBuyMessage(`Bought ${item.name}`);
      setTimeout(() => {
        setBuyMessage("");
      }, 2000);
    } else {
      console.warn("Not enough gold to buy this item!");
    }
  };

  // Ved salg: Sjekk at inventory har produktet, oppdater inventory, vis melding og fjern valget hvis none gjenstår
  const handleSell = (item) => {
    const count = inventory.items[item.id] || 0;
    if (count > 0) {
      const price = getSellPrice(item);
      removeItem(item.id, 1);
      addGold(price);
      setSellMessage(`Sold ${item.name}`);
      setTimeout(() => {
        setSellMessage("");
      }, 2000);
      if (count - 1 <= 0) {
        setSelectedItem(null);
        setSelectedMode(null);
      }
    } else {
      setSellMessage(`No ${item.name} left to sell.`);
      setTimeout(() => {
        setSellMessage("");
      }, 2000);
    }
  };

  if (!items) return <p>Loading items...</p>;

  const buyList = items.filter(
    (it) => !limitedOffers.some((offer) => offer && offer.id === it.id)
  );

  const inventoryArray = Object.entries(inventory.items)
    .map(([id, count]) => {
      const itemInfo = items.find((i) => i.id === id);
      if (!itemInfo) return null;
      return { ...itemInfo, count };
    })
    .filter(Boolean);

  return (
    <div className="w-full h-full text-white relative">
      <AnimatedImage />

      <div className="relative z-10">
        {/* Toppseksjon */}
        <div className="flex justify-between items-center p-4 bg-gray-800/ bg-opacity-90">
          <img
            src="/assets/sprites/exit-nav-icon.png"
            alt="exit icon"
            onClick={handleReturn}
            className="cursor-pointer w-12 h-12"
          />
          <h1 className="text-2xl font-bold">The Tavern of Goods</h1>
          <div className=" flex items-center text-lg ">
            <img
              src="/assets/sprites/shop-nav-icon.png"
              alt=""
              className="w-12 h-10"
            />{" "}
            {inventory.gold}{" "}
          </div>
        </div>

        {/* Plassholder for midtseksjonen */}
        <div className="hidden relative w-full h-64"></div>

        {/* Limited Offers-seksjonen */}
        <div className="relative w-full h-64">
          <div className="absolute top-4 left-4 w-40 bg-gray-800/80 bg-opacity-80 p-2 rounded">
            <h2 className="font-semibold text-center">Limited Offer</h2>
            {limitedOffers[0] ? (
              <div className="mt-2 flex flex-col items-center">
                {limitedOffers[0].sprite && (
                  <img
                    src={limitedOffers[0].sprite}
                    alt={limitedOffers[0].name}
                    className="w-16 h-16 object-contain mb-1"
                  />
                )}
                <p className="text-sm">{limitedOffers[0].name}</p>
                <p className="text-xs text-gray-300">
                  Price: {getBuyPrice(limitedOffers[0])}
                </p>
                <button
                  onClick={() => handleBuy(limitedOffers[0])}
                  className="bg-yellow-600 px-6 py-1 mt-1 text-xs rounded cursor-pointer"
                >
                  Buy
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col items-center">
                <p className="text-sm">Next offer in:</p>
                <p className="text-xs text-gray-300">{formatTime(countdown)}</p>
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4 w-40 bg-gray-800/80 bg-opacity-80 p-2 rounded">
            <h2 className="font-semibold text-center">Limited Offer</h2>
            {limitedOffers[1] ? (
              <div className="mt-2 flex flex-col items-center">
                {limitedOffers[1].sprite && (
                  <img
                    src={limitedOffers[1].sprite}
                    alt={limitedOffers[1].name}
                    className="w-16 h-16 object-contain mb-1"
                  />
                )}
                <p className="text-sm">{limitedOffers[1].name}</p>
                <p className="text-xs text-gray-300">
                  Price: {getBuyPrice(limitedOffers[1])}
                </p>
                <button
                  onClick={() => handleBuy(limitedOffers[1])}
                  className="bg-yellow-600 px-6 py-1 mt-1 text-xs rounded cursor-pointer"
                >
                  Buy
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col items-center">
                <p className="text-sm">Next offer in:</p>
                <p className="text-xs text-gray-300">{formatTime(countdown)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Faner for nedre seksjon – plassert til venstre */}
        <div className="flex justify-start space-x-4 p-4 bg-gray-800/ bg-opacity-90">
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-4 py-2 rounded cursor-pointer ${
              activeTab === "buy" ? "bg-yellow-600" : "bg-gray-700"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`px-4 py-2 rounded cursor-pointer ${
              activeTab === "sell" ? "bg-yellow-600" : "bg-gray-700"
            }`}
          >
            Sell
          </button>
        </div>

        <div className="flex gap-4 p-2 w-full h-80">
          <div className="bg-gray-800/80 p-2 rounded w-full">
            {activeTab === "buy" ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Buy</h3>
                <div className="grid grid-cols-7 gap-2 w-full">
                  {buyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item, "buy")}
                      className="bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600 flex flex-col items-center"
                    >
                      {item.sprite && (
                        <img
                          src={item.sprite}
                          alt={item.name}
                          className="w-10 h-10 object-contain mb-1"
                        />
                      )}
                      <p className="text-xs text-center">{item.name}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Sell</h3>
                {inventoryArray.length === 0 ? (
                  <p className="text-center">No items in inventory</p>
                ) : (
                  <div className="grid grid-cols-7 gap-2 w-full">
                    {inventoryArray.map((invItem) => (
                      <div
                        key={invItem.id}
                        onClick={() => handleItemClick(invItem, "sell")}
                        className="bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600 w-full flex flex-col items-center"
                      >
                        {invItem.sprite && (
                          <img
                            src={invItem.sprite}
                            alt={invItem.name}
                            className="w-12 h-12 object-contain mb-1"
                          />
                        )}
                        <p className="text-xs">
                          {invItem.name} x {invItem.count}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          {/* Høyre kolonne: Item Details */}
          <div className="bg-gray-800/80 p-2 rounded flex flex-col items-center w-50">
            
            {!selectedItem ? (
              <p className="text-center text-xs">No item selected</p>
            ) : (
              <div className="space-y-2 text-center w-full">
                <p className="font-semibold text-sm">{selectedItem.name}</p>
                {selectedItem.sprite && (
                  <img
                    src={selectedItem.sprite}
                    alt={selectedItem.name}
                    className="w-20 h-20 object-contain mx-auto"
                  />
                )}
                {selectedItem.statModifiers && (
                  <ul className="text-xs">
                    <li>
                      Strength: {selectedItem.statModifiers.strength || 0}
                    </li>
                    <li>Speed: {selectedItem.statModifiers.speed || 0}</li>
                    <li>Defense: {selectedItem.statModifiers.defense || 0}</li>
                  </ul>
                )}
                {selectedItem.healAmount && (
                  <p className="text-xs">Heal: {selectedItem.healAmount}</p>
                )}
                {selectedMode === "buy" ? (
                  <>
                    <p className="text-xs text-gray-300">
                      Buy Price: {getBuyPrice(selectedItem)}
                    </p>
                    <button
                      onClick={() => handleBuy(selectedItem)}
                      className="bg-yellow-600 px-3 py-1 text-xs rounded w-full cursor-pointer"
                    >
                      Buy
                    </button>
                    {buyMessage && (
                      <div className=" text-center text-green-500">
                        <p>{buyMessage}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-300">
                      Sell Price: {getSellPrice(selectedItem)}
                    </p>
                    <button
                      onClick={() => handleSell(selectedItem)}
                      className="bg-yellow-600 px-3 py-1 text-xs rounded w-20 cursor-pointer"
                    >
                      Sell
                    </button>
                  </>
                )}
              </div>
            )}
            {sellMessage && (
              <div className=" text-center text-green-500">
                <p>{sellMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
