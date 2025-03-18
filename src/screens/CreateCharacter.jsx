import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

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

  const getItemDetails = (itemId) => items?.find((item) => item.id === itemId) || null;

  const handleCreateCharacter = () => {
    if (name.trim() === '') return;
    setPlayer(name, selectedClass);
    setCurrentView('MAIN_MENU');
  };

  return (
    <div className="flex h-full w-full bg-gray-900 text-white p-6">
      <div className="w-1/3 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Hero Stats</h2>
        <p><strong>Class:</strong> {selectedClass}</p>
        <p><strong>HP:</strong> {classStats[selectedClass].maxHp}</p>
        <p><strong>Strength:</strong> {classStats[selectedClass].strength}</p>
        <p><strong>Defense:</strong> {classStats[selectedClass].defense}</p>
        <p><strong>Speed:</strong> {classStats[selectedClass].speed}</p>

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

      <div className="w-1/3 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">Create Your Hero</h1>

        <input
          type="text"
          placeholder="Enter your hero's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 mb-4 text-black rounded"
        />

        <div className="flex space-x-4 mb-6">
          {['Mage', 'Warrior', 'Rogue'].map((cls) => (
            <button
              key={cls}
              className={`flex flex-col items-center px-4 py-3 rounded 
              ${selectedClass === cls ? 'bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
              onClick={() => setSelectedClass(cls)}
            >
              <img src={classPortraits[cls]} alt={cls} className="w-16 h-16 mb-2" />
              {cls}
            </button>
          ))}
        </div>

        <button
          className="px-6 py-3 bg-green-700 hover:bg-green-800 rounded"
          onClick={handleCreateCharacter}
        >
          Start Adventure
        </button>
      </div>
    </div>
  );
}
