import React, { useState, useEffect } from "react";
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
      alt="Animert bål"
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
  const [finalBuyList, setFinalBuyList] = useState([]);
  const [healthPotionBought, setHealthPotionBought] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [activeTab, setActiveTab] = useState("buy");
  const [floatingSell, setFloatingSell] = useState(null);
  const [floatingBuy, setFloatingBuy] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch("/assets/items.json")
      .then((response) => response.json())
      .then((data) => {
        setItems(data.itemTable);
      })
      .catch((error) => console.error("Feil ved lasting av varer:", error));
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      const highDropChanceItems = items.filter((item) => item.dropChance > 20);
      const lowDropChanceItems = items.filter((item) => item.dropChance <= 20);

      const highOffer =
        highDropChanceItems.length > 0
          ? highDropChanceItems[
              Math.floor(Math.random() * highDropChanceItems.length)
            ]
          : null;
      const lowOffer =
        lowDropChanceItems.length > 0
          ? lowDropChanceItems[
              Math.floor(Math.random() * lowDropChanceItems.length)
            ]
          : null;

      setLimitedOffers([highOffer, lowOffer]);
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
      const staticItem = items.find((item) => item.id === "POT_HEALTH");

      let dynamicItems = items.filter((item) => item.id !== "POT_HEALTH");

      dynamicItems.sort(() => 0.5 - Math.random());
      dynamicItems = dynamicItems.slice(0, 20);
      const final = staticItem ? [staticItem, ...dynamicItems] : dynamicItems;
      setFinalBuyList(final);
    }
  }, [items]);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cooldowns["POT_HEALTH"] && cooldowns["POT_HEALTH"] <= Date.now()) {
      setHealthPotionBought(0);
      setCooldowns((prev) => {
        const { POT_HEALTH, ...rest } = prev;
        return rest;
      });
    }
  }, [tick, cooldowns["POT_HEALTH"]]);

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
  const getLimitedOfferPrice = (item) => {
    const normalPrice = getBuyPrice(item);
    return Math.floor(normalPrice * 0.5);
  };

  const getBuyPrice = (item) => {
    if (!item || !item.dropChance) return 0;
    return Math.floor(200 / (item.dropChance / 100));
  };
  const getSellPrice = (item) => Math.floor(getBuyPrice(item) / 2);

  const handleReturn = () => {
    setCurrentView(embark ? "MAP" : "MAIN_MENU");
  };

  //Sett valgt vare og modus for visning av varedetaljer.
  const handleItemClick = (item, mode) => {
    setSelectedItem(item);
    setSelectedMode(mode);
  };

  //  Kjøp en vare.og fjern vare fra item details når kjøpt
  const handleBuy = (item) => {
    const price = getBuyPrice(item);
    if (inventory.gold < price) {
      setFloatingBuy("Not enough gold");
      setTimeout(() => {
        setFloatingBuy(null);
      }, 2000);
      return;
    }
    // Spesiell håndtering for Health Potion.
    if (item.id === "POT_HEALTH") {
      // Tillat alltid å kjøpe opptil 5 potions uansett hva inventory viser.
      if (healthPotionBought < 5) {
        removeGold(price);
        addItem(item.id, 1);
        setHealthPotionBought((prev) => prev + 1);
        // Hvis dette kjøpet gir 5 potions, sett en cooldown.
        if (healthPotionBought + 1 === 5) {
          setCooldowns((prev) => ({
            ...prev,
            [item.id]: Date.now() + 120 * 1000,
          }));
        }
      }
    } else if (limitedOffers.some((offer) => offer && offer.id === item.id)) {
      // For begrensede tilbud, fjern varen fra tilbudene og spor kjøpet.
      setLimitedOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer && offer.id === item.id ? null : offer
        )
      );
      setPurchasedLimitedOfferIds((prev) => [...prev, item.id]);
      localStorage.setItem(
        "limitedOffers",
        JSON.stringify(
          limitedOffers.map((offer) =>
            offer && offer.id === item.id ? null : offer
          )
        )
      );
      removeGold(price);
      addItem(item.id, 1);
    } else {
      // For normale varer, 2-minutters cooldown og fjern varen fra butikken.
      removeGold(price);
      addItem(item.id, 1);
      setCooldowns((prev) => ({ ...prev, [item.id]: Date.now() + 120 * 1000 }));
    }

    setFloatingBuy(`${item.name} -${price} gold`);
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
      setSelectedMode(null);
    }
    setTimeout(() => {
      setFloatingBuy(null);
    }, 2000);
  };

  // Selg en vare.
  const handleSell = (item) => {
    const count = inventory.items[item.id] || 0;
    if (count > 0) {
      const price = getSellPrice(item);
      removeItem(item.id, 1);
      addGold(price);
      setFloatingSell(`${item.name} +${price} gold`);
      setTimeout(() => {
        setFloatingSell(null);
      }, 2000);
      if (count - 1 <= 0) {
        setSelectedItem(null);
        setSelectedMode(null);
      }
    }
  };

  if (!items) return <p>Loading items...</p>;

  const visibleBuyList = finalBuyList.filter((item) => {
    if (item.id === "POT_HEALTH") {
      // For Health Potion, vis den hvis færre enn 5 er kjøpt, ellers sjekk cooldown.
      if (healthPotionBought < 5) return true;
      return !(cooldowns[item.id] && cooldowns[item.id] > Date.now());
    }
    return !(cooldowns[item.id] && cooldowns[item.id] > Date.now());
  });

  // Bygg inventory-listen fra inventory-objektet.
  const inventoryArray = Object.entries(inventory.items)
    .map(([id, count]) => {
      const itemInfo = items.find((i) => i.id === id);
      if (!itemInfo) return null;
      return { ...itemInfo, count };
    })
    .filter(Boolean);

  const leftLimitedOffer = limitedOffers[0];
  const rightLimitedOffer = limitedOffers[1];

  // Beregn gjenværende cooldown (i sekunder) for en valgt vare, hvis den er på cooldown.
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
      {/* Flytende meldinger */}
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
        {/* Toppseksjon med navigasjon og gullvisning */}
        <div className="flex justify-between items-center p-4 bg-gray-800/0">
          <div className="flex items-center">
            <img
              src="/assets/sprites/exit-nav-icon.png"
              alt="exit icon"
              onClick={handleReturn}
              className="cursor-pointer w-12 h-12"
            />
            <div className="relative ml-11 -mt-11">
              <img
                src="/assets/tavern_sing_2.png"
                alt="tavern sign"
                className="w-auto h-auto"
              />
            </div>
          </div>

          {/* Shop section */}
          <div className="flex items-center text-lg">
            <img
              src="/assets/sprites/shop-nav-icon.png"
              alt=""
              className="w-12 h-10"
            />
            {inventory.gold}
          </div>
        </div>
        {/* Plassholder for midtseksjonen */}
        <div className="hidden relative w-full h-64"></div>
        {/* Begrensede tilbud-seksjonen */}
        <div className="relative w-full h-64">
          {/* Venstre boks: varer med dropChance > 20, vanlig flashy border */}
          <div
            className={`${
              leftLimitedOffer ? styles["flicker-border"] : ""
            } absolute top-4 left-4 w-55 h-55 overflow-hidden bg-gray-800/80 p-2 rounded`}
          >
            <h2 className="font-semibold text-center">Limited Offer</h2>
            {leftLimitedOffer ? (
              <div className="mt-2 flex flex-col items-center">
                {leftLimitedOffer.sprite && (
                  <img
                    src={leftLimitedOffer.sprite}
                    alt={leftLimitedOffer.name}
                    className="w-16 h-16 object-contain mb-1"
                  />
                )}
                <p className="text-sm">{leftLimitedOffer.name}</p>
                <p className="text-xs text-gray-300">
                  <span className="line-through mr-1 text-red-500">
                    {getBuyPrice(leftLimitedOffer)}
                  </span>
                  <span className="text-green-500 font-bold mr-1">50% OFF</span>
                  <span className="text-white underline">
                    {getLimitedOfferPrice(leftLimitedOffer)}
                  </span>
                </p>
                <button
                  onClick={() => handleBuy(leftLimitedOffer)}
                  className={`${styles["buyButton"]} px-12 py-1 mt-6 text-sm rounded cursor-pointer`}
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
              rightLimitedOffer ? styles["mega-flash-border"] : ""
            } absolute top-4 right-4 w-55 h-55 overflow-hidden bg-gray-800/80 p-2 rounded`}
          >
            <h2 className="font-semibold text-center">Limited Offer</h2>
            {rightLimitedOffer ? (
              <div className="mt-2 flex flex-col items-center">
                {rightLimitedOffer.sprite && (
                  <img
                    src={rightLimitedOffer.sprite}
                    alt={rightLimitedOffer.name}
                    className="w-16 h-16 object-contain mb-1"
                  />
                )}
                <p className="text-sm">{rightLimitedOffer.name}</p>
                <p className="text-xs text-gray-300">
                  <span className="line-through mr-1 text-red-500">
                    {getBuyPrice(rightLimitedOffer)}
                  </span>
                  <span className="text-green-500 font-bold mr-1">50% OFF</span>
                  <span className="text-white underline">
                    {getLimitedOfferPrice(rightLimitedOffer)}
                  </span>
                </p>
                <button
                  onClick={() => handleBuy(rightLimitedOffer)}
                  className={`${styles["buyButton"]} px-12 py-1 mt-6 text-sm rounded cursor-pointer`}
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
        {/* Faner for nedre seksjonen */}
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
        {/* Nedre seksjonen: To kolonner – venstre: Liste (Buy/Sell) og høyre: Varedetaljer */}
        <div className="flex gap-4 p-2 w-full h-80">
          {/* Venstre kolonne: Liste for aktiv fane */}
          <div className="bg-gray-800/80 p-2 rounded w-full overflow-y-auto">
            {activeTab === "buy" ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Buy</h3>
                <div className="grid grid-cols-7 gap-2 w-full">
                  {visibleBuyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item, "buy")}
                      className="bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600 flex flex-col items-center w-full"
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
                  <p className="text-center text-sm">
                    No items in inventory, fight more!
                  </p>
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
          {/* Høyre kolonne: Varedetaljer */}
          <div className="bg-gray-800/80 p-2 rounded flex flex-col items-center w-[20%]">
            <h3 className="text-lg font-semibold mb-2">Item Details</h3>
            {!selectedItem ? (
              <p className="text-center text-xs">No item chosen</p>
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
                    <p className="text-sm text-green-300">
                      Price: {getBuyPrice(selectedItem)}
                    </p>
                    <button
                      onClick={() => handleBuy(selectedItem)}
                      className={`${styles["buyButton"]} px-3 py-1 mt-1 text-sm w-full rounded cursor-pointer`}
                    >
                      Buy
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-green-300">
                      Price: {getSellPrice(selectedItem)}
                    </p>
                    <button
                      onClick={() => handleSell(selectedItem)}
                      className={`${styles["buyButton"]} px-3 py-1 mt-1 text-sm w-full rounded cursor-pointer`}
                    >
                      Sell
                    </button>
                  </>
                )}
              </div>
            )}
            {floatingSell && (
              <div
                className={`${styles["flash-up"]} absolute left-1/2 transform -translate-x-1/2`}
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
