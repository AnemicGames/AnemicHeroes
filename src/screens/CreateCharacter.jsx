import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const AnimatedImage = () => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 10;
  const frameRate = 170;
  useEffect(() => {
    const imageCache = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/assets/bonfire_bg/${i}.webp`;
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
      src={`/assets/bonfire_bg/${currentFrame}.webp`}
      alt="Animated bonfire"
      className="w-full"
    />
  );
};

export default function CreateCharacter() {
  const setPlayer = useGameStore((state) => state.setPlayer);
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('Warrior');
  const [items, setItems] = useState(null);

  useEffect(() => {
    fetch('/assets/items.json')
      .then((response) => response.json())
      .then((data) => setItems(data.itemTable))
      .catch((error) => console.error('Error loading items:', error));
  }, []);

  const classPortraits = {
    Mage: '/assets/sprites/heroes/mage.png',
    Warrior: '/assets/sprites/heroes/warrior.png',
    Rogue: '/assets/sprites/heroes/rogue.png',
  };

  const classStats = {
    Mage: { maxHp: 80, strength: 7, defense: 3, speed: 8 },
    Warrior: { maxHp: 120, strength: 12, defense: 10, speed: 4 },
    Rogue: { maxHp: 90, strength: 10, defense: 4, speed: 9 },
  };

  const classGear = {
    Mage: { weapon: "WPN_STAFF", helmet: "HLM_HAT", armor: "ARM_ROBE", boots: "BTS_SLIPPERS", trinket: "TRK_AMULET" },
    Warrior: { weapon: "WPN_SWORD", helmet: "HLM_HELMET", armor: "ARM_PLATE", boots: "BTS_GREAVES", trinket: "TRK_NECKLACE" },
    Rogue: { weapon: "WPN_DAGGER", helmet: "HLM_HOOD", armor: "ARM_VEST", boots: "BTS_BOOTS", trinket: "TRK_RING" },
  };

  const classLore = {
    Mage: "Hailing from the perpetually gloomy towers of Bloodmoon Academy, Mages have dedicated themselves to arcane studies at the expense of sunlight and exercise. Years spent reading under dim candlelight have left them pale, slightly dizzy, and chronically anemic. They descend into dungeons hoping to find magical supplements rumored to boost both mana and iron levels.",
  
    Warrior: "Born in the iron-rich yet bafflingly anemic kingdom of Ferritania, Warriors pride themselves on their courage and swordsmanship—but somehow overlook dietary essentials. Their strength is legendary, though their frequent fainting spells are equally renowned. They adventure into dark dungeons, convinced that conquering evil might magically restore their iron count and grant them the vigor their diets cannot.",
  
    Rogue: "Sneaky and swift, Rogues originate from the shadowy alleys of Palehaven—a city eternally blanketed in twilight, where citizens are mysteriously allergic to red meat and leafy greens. Master thieves and expert infiltrators, their agility is matched only by their fragile health and tendency to become lightheaded mid-heist. They delve into dungeons hoping to discover hidden treasures—and perhaps a rare vegetable or two to stave off their constant fatigue."
  };
  

  const getItemDetails = (itemId) => items?.find((item) => item.id === itemId) || null;

  const handleCreateCharacter = () => {
    if (name.trim() === '') return;
    setPlayer(name, selectedClass);
    setCurrentView('MAIN_MENU');
  };

  return (
    <div className="h-full w-full relative text-white">
      <AnimatedImage />

      <div className="flex flex-col items-center justify-center  absolute left-[500px] top-0 z-20 h-full">
        <h1 className="text-4xl font-bold mb-6">Create Your Hero</h1>

        <div className="flex space-x-4 mb-6">
          {['Mage', 'Warrior', 'Rogue'].map((cls) => (
            <button
              key={cls}
              className={`flex flex-col items-center px-4 py-3 rounded 
              ${selectedClass === cls ? 'bg-blue-700' : 'bg-gray-600/90 hover:bg-gray-700'}`}
              onClick={() => setSelectedClass(cls)}
            >
              <img src={classPortraits[cls]} alt={cls} className="w-16 h-16 mb-2" />
              {cls}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Enter your hero's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 mb-4 text-black rounded bg-white"
        />

        <button
          className=" px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full mt-[150px] relative p-5 font-bold text-xl pl-12 border-2 border-yellow-300"
          onClick={handleCreateCharacter}
        >
          <img src="/assets/sprites/sword-shiny.png" alt="" className='absolute left-0 bottom-1 w-[50px]' /> Start Adventure!
        </button>
      </div>


      <div className="absolute top-0 left-0 m-4 p-2 rounded bg-gray-700/90  w-[280px] ">
        <h2 className="text-2xl font-bold mb-4">Hero Stats</h2>
        <p><strong>Class:</strong> {selectedClass}</p>
        <p><strong>HP:</strong> {classStats[selectedClass].maxHp}</p>
        <p><strong>Strength:</strong> {classStats[selectedClass].strength}</p>
        <p><strong>Defense:</strong> {classStats[selectedClass].defense}</p>
        <p><strong>Speed:</strong> {classStats[selectedClass].speed}</p>
      </div>

      <div className='absolute bottom-[150px] left-0 m-4 p-2 rounded bg-gray-700/90 w-[280px]'>
        <h3 className="text-xl font-semibold mt-4">Starting Gear</h3>
        {items ? (
          <ul className="list-none">
            {Object.entries(classGear[selectedClass]).map(([slot, itemId]) => {
              const item = getItemDetails(itemId);
              return item ? (
                <li key={slot} className="flex items-center space-x-4 mb-3">
                  <img src={item.sprite} alt={item.name} className="w-10 h-10" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.statModifiers
                        ? `STR: ${item.statModifiers.strength} | DEF: ${item.statModifiers.defense} | SPD: ${item.statModifiers.speed}`
                        : ''}
                    </p>
                  </div>
                </li>
              ) : null;
            })}
          </ul>
        ) : (
          <p>Loading gear...</p>
        )}
      </div>

      <div>
        <button
          className='absolute bottom-0 left-0 m-4 p-2 hover:bg-red-800 rounded'
          title='Exit'
          onClick={() => setCurrentView('SPLASH')}
        >
          <img src="/assets/sprites/exit-nav-icon.png" alt="Exit" className='w-10 h-11' />
        </button>
      </div>

      <div className="absolute top-0 right-0 m-4 p-4 rounded bg-gray-700/90 w-[280px]">
  <h2 className="text-2xl font-bold mb-4">About {selectedClass}</h2>
  <p className="leading-relaxed">
    {classLore[selectedClass]}
  </p>
</div>

    </div>
  );
}
