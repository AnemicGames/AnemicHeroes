import React from 'react';
import { useGameStore } from '../store/useGameStore';

export default function MainMenu() {
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const setEmbark = useGameStore((state) => state.setEmbark);

  const goToMap = () => {
    setEmbark(true);
    setCurrentView('MAP');
  };
  const goToCharacterSheet = () => setCurrentView('CHARACTER_SHEET');
  const goToShop = () => setCurrentView('SHOP');

  return (
    <div className="h-full w-full relative">
      <img src="/assets/bonfire-bg.webp" alt="" className='w-full' />
      <div className='absolute top-[130px] flex flex-col gap-2 left-[250px]' >
        <button
          className="px-6 py-3 bg-green-700 hover:bg-green-800 rounded flex"
          onClick={goToMap}
        >
          <img src="/assets/sprites/embark-nav-icon.png"
            className='w-6 h-6 mr-2'
            alt="" />Embark
        </button>

        <button
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded flex"
          onClick={goToCharacterSheet}
        >
          <img src="/assets/sprites/inventory-nav-icon.png"
            className='w-6 h-6 mr-2'
            alt="" />
          Inventory
        </button>

        <button
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded flex"
          onClick={goToShop}
        >
          <img src="/assets/sprites/shop-nav-icon.png"
            className='w-6 h-6 mr-2'
            alt="" />
          Shop
        </button>
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
    </div>
  );
}
