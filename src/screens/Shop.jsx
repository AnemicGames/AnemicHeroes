import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import styles from "./Shop.module.css";

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
  const [purchasedLimitedOfferIds, setPurchasedLimitedOfferIds] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [activeTab, setActiveTab] = useState("buy");
  const [buyMessage, setBuyMessage] = useState("");
  const [sellMessage, setSellMessage] = useState("");
  const [floatingSell, setFloatingSell] = useState(null);
  const [floatingBuy, setFloatingBuy] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [finalBuyList, setFinalBuyList] = useState([]);
  const [healthPotionBought, setHealthPotionBought] = useState(0);

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
      setCountdown(60);
      setPurchasedLimitedOfferIds([]);
    }
  }, [items]);

  useEffect(() => {
    if (items && items.length > 0) {
      const storedOffers = localStorage.getItem("limitedOffers");
      const storedTimestamp = localStorage.getItem("limitedOffersTimestamp");
      if (storedOffers && storedTimestamp) {
        const timeElapsed = Math.floor(
          (Date.now() - Number(storedTimestamp)) / 1000
        );
        const remainingTime = 60 - timeElapsed;
        if (remainingTime > 0) {
          setLimitedOffers(JSON.parse(storedOffers));
          setCountdown(remainingTime);
        } else {
          const newOffers = getRandomItems(items, 2);
          setLimitedOffers(newOffers);
          setCountdown(60);
          localStorage.setItem("limitedOffers", JSON.stringify(newOffers));
          localStorage.setItem("limitedOffersTimestamp", Date.now().toString());
        }
      } else {
        const newOffers = getRandomItems(items, 2);
        setLimitedOffers(newOffers);
        setCountdown(60);
        localStorage.setItem("limitedOffers", JSON.stringify(newOffers));
        localStorage.setItem("limitedOffersTimestamp", Date.now().toString());
      }

      const storedIds = localStorage.getItem("purchasedLimitedOfferIds");
      if (storedIds) {
        setPurchasedLimitedOfferIds(JSON.parse(storedIds));
      }
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      "purchasedLimitedOfferIds",
      JSON.stringify(purchasedLimitedOfferIds)
    );
  }, [purchasedLimitedOfferIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (items && items.length > 0) {
            const newOffers = getRandomItems(items, 2);
            setLimitedOffers(newOffers);
            setPurchasedLimitedOfferIds([]);
            localStorage.setItem("limitedOffers", JSON.stringify(newOffers));
            localStorage.setItem(
              "limitedOffersTimestamp",
              Date.now().toString()
            );
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [items]);

  useEffect(() => {
    if (items && items.length > 0) {
      const staticItem = items.find(item => item.id === "POT_HEALTH");
      let dynamicItems = items.filter(it => it.id !== "POT_HEALTH");
      dynamicItems.sort(() => 0.5 - Math.random());
      dynamicItems = dynamicItems.slice(0, 20);
      const final = staticItem ? [staticItem, ...dynamicItems] : dynamicItems;
      setFinalBuyList(final);
    }
  }, [items]);
  //helth potion countdown
  useEffect(() => {
    if (cooldowns["POT_HEALTH"] && cooldowns["POT_HEALTH"] <= Date.now()) {
      setHealthPotionBought(0);
    }
  }, [cooldowns["POT_HEALTH"]]);
  
  function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const getBuyPrice = (item) => Math.floor(200 / (item.dropChance / 100));
  const getSellPrice = (item) => Math.floor(getBuyPrice(item) / 2);

  const handleReturn = () => {
    setCurrentView(embark ? "MAP" : "MAIN_MENU");
  };

  const handleItemClick = (item, mode) => {
    setSelectedItem(item);
    setSelectedMode(mode);
  };

  const handleBuy = (item) => {
    const price = getBuyPrice(item);
    if (inventory.gold < price) {
      console.warn("Not enough gold to buy this item!");
      return;
    }
    if (item.id === "POT_HEALTH") {
      if (healthPotionBought < 5) {

        removeGold(price);
        addItem(item.id, 1);
        setHealthPotionBought(prev => prev + 1);
        if (healthPotionBought + 1 === 5) {
          setCooldowns(prev => ({ ...prev, [item.id]: Date.now() + 120 * 1000 }));
        }
      } else {

        setBuyMessage("Health Potion on cooldown!");
        setTimeout(() => setBuyMessage(""), 2000);
        return;
      }
    } else if (limitedOffers.some((offer) => offer && offer.id === item.id)) {
      setLimitedOffers((prevOffers) =>
        prevOffers.map((offer) => (offer && offer.id === item.id ? null : offer))
      );
      setPurchasedLimitedOfferIds((prev) => [...prev, item.id]);
      localStorage.setItem(
        "limitedOffers",
        JSON.stringify(
          limitedOffers.map((offer) => (offer && offer.id === item.id ? null : offer))
        )
      );
      removeGold(price);
      addItem(item.id, 1);
    } else {
      removeGold(price);
      addItem(item.id, 1);
      setCooldowns(prev => ({ ...prev, [item.id]: Date.now() + 120 * 1000 }));
    }
    
    setBuyMessage(`Bought ${item.name}`);
    setFloatingBuy(`${item.name} -${price} gold`);
    setTimeout(() => {
      setFloatingBuy(null);
      setBuyMessage("");
    }, 2000);
  };

  const handleSell = (item) => {
    const count = inventory.items[item.id] || 0;
    if (count > 0) {
      const price = getSellPrice(item);
      removeItem(item.id, 1);
      addGold(price);
      setSellMessage(`Sold ${item.name}`);
      setFloatingSell(` ${item.name} +${price} gold`);
      setTimeout(() => {
        setFloatingSell(null);
        setSellMessage("");
      }, 2000);
      if (count - 1 <= 0) {
        setSelectedItem(null);
        setSelectedMode(null);
      }
    } else {
      setSellMessage(`No ${item.name} left to sell.`);
      setTimeout(() => setSellMessage(""), 2000);
    }
  };

  if (!items) return <p>Loading items...</p>;

  const visibleBuyList = finalBuyList.filter((item) => {
    if (item.id === "POT_HEALTH") {
      if (healthPotionBought < 5) return true;
      return !(cooldowns[item.id] && cooldowns[item.id] > Date.now());
    }

    return !(cooldowns[item.id] && cooldowns[item.id] > Date.now());
  });
    
  const inventoryArray = Object.entries(inventory.items)
    .map(([id, count]) => {
      const itemInfo = items.find((i) => i.id === id);
      if (!itemInfo) return null;
      return { ...itemInfo, count };
    })
    .filter(Boolean);

  const remainingCooldown =
    selectedItem && cooldowns[selectedItem.id]
      ? Math.max(
          0,
          Math.floor((cooldowns[selectedItem.id] - Date.now()) / 1000)
        )
      : 0;
  return (
    <div className="w-full h-full text-white relative">
      <AnimatedImage />

      {/* Floating sell and buy messages */}
      {floatingSell && (
        <div
          className={`${styles["flash-up"]} absolute top-20 left-1/2 transform -translate-x-1/2`}
        >
          {floatingSell}
        </div>
      )}
      {floatingBuy && (
        <div
          className={`${styles["flash-up-buy"]} absolute top-28 left-1/2 transform -translate-x-1/2`}
        >
          {floatingBuy}
        </div>
      )}

      <div className="relative z-10">
        {/* Top section with navigation and gold display */}
        <div className="flex justify-between items-center p-4 bg-gray-800/">
          <img
            src="/assets/sprites/exit-nav-icon.png"
            alt="exit icon"
            onClick={handleReturn}
            className="cursor-pointer w-12 h-12"
          />
          <h1 className="text-2xl font-bold">The Tavern of Goods</h1>
          <div className="flex items-center text-lg">
            <img
              src="/assets/sprites/shop-nav-icon.png"
              alt=""
              className="w-12 h-10"
            />
            {inventory.gold}
          </div>
        </div>

        {/* Placeholder for middle section */}
        <div className="hidden relative w-full h-64"></div>

        {/* Limited Offer Section */}
        <div className="relative w-full h-64">
          <div
            className={`${
              limitedOffers[0] ? styles["flicker-border"] : ""
            } absolute top-4 left-4 w-40 bg-gray-800/80 p-2 rounded`}
          >
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
          <div
            className={`${
              limitedOffers[1] ? styles["flicker-border"] : ""
            } absolute top-4 right-4 w-40 bg-gray-800/80 p-2 rounded`}
          >
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

        {/* Tabs for Lower Section – placed to the left */}
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

        {/* Lower Section: Two columns – Left: List (Buy/Sell items with cooldown), Right: Item Details */}
        <div className="flex gap-4 p-2 w-full h-80">
          {/* Left column: List for active tab */}
          <div className="bg-gray-800/80 p-2 rounded w-full overflow-y-auto">
            {activeTab === "buy" ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Buy</h3>
                <div className="grid grid-cols-7 gap-2 w-full">
                  {visibleBuyList.map((item) => {
                    // Check if the item is on cooldown.
                    const onCooldown =
                      cooldowns[item.id] && cooldowns[item.id] > Date.now();
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item, "buy")}
                        className="bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600 flex flex-col items-center w-full"
                      >
                        {onCooldown ? (
                          // If on cooldown, display the cooldown timer.
                          <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-xs">Cooldown</p>
                            <p className="text-xs text-red-500">
                              {Math.floor(
                                (cooldowns[item.id] - Date.now()) / 1000
                              )}{" "}
                              s
                            </p>
                          </div>
                        ) : (
                          <>
                            {item.sprite && (
                              <img
                                src={item.sprite}
                                alt={item.name}
                                className="w-10 h-10 object-contain mb-1"
                              />
                            )}
                            <p className="text-xs text-center">{item.name}</p>
                            {/* No Buy button here */}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Sell</h3>
                {inventoryArray.length === 0 ? (
                  <p className="text-center text-xs">No items in inventory</p>
                ) : (
                  <div className="grid grid-cols-7 gap-2 w-full">
                    {inventoryArray.map((invItem) => (
                      <div
                        key={invItem.id}
                        onClick={() => handleItemClick(invItem, "sell")}
                        className="bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600 flex flex-col items-center w-full"
                      >
                        {invItem.sprite && (
                          <img
                            src={invItem.sprite}
                            alt={invItem.name}
                            className="w-10 h-10 object-contain mb-1"
                          />
                        )}
                        <p className="text-xs text-center">
                          {invItem.name} x {invItem.count}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          {/* Right column: Item Details */}
          <div className="bg-gray-800/80 p-2 rounded flex flex-col items-center w-[20%]">
            <h3 className="text-lg font-semibold mb-2">Item Details</h3>
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
                {/* If the selected item is on cooldown, display remaining time */}
                {cooldowns[selectedItem?.id] &&
                  cooldowns[selectedItem.id] > Date.now() && (
                    <p className="text-xs text-red-500">
                      Cooldown:{" "}
                      {Math.floor(
                        (cooldowns[selectedItem.id] - Date.now()) / 1000
                      )}{" "}
                      s
                    </p>
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
                    {floatingBuy}
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
            {floatingSell}
          </div>
        </div>
      </div>
    </div>
  );
}
