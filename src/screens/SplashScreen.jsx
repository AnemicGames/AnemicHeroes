import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const playerLevel = useGameStore((state) => state.player.level);
  const [isHovered, setIsHovered] = useState(false); 
  const handleContinue = () => {
    if (playerLevel > 0) {
      setCurrentView('MAIN_MENU');
    }
  };

  const handleCreateHero = () => {
    setCurrentView('CREATE_CHARACTER');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900 text-white">
      <div className="absolute top-0 left-0 w-full h-full">
        <img
          src="assets/castle-bg-dither-2px.webp"
          alt="Splash Background"
          className={`${styles["pan-zoom-animation"]} w-auto h-full object-cover`}
        />
      </div>

      <div className="flex items-center justify-center w-full h-full relative z-10">
        <div className={`${styles["fade-in-container"]} flex flex-col items-center justify-center w-fit h-full p-4`}>
          <img src="assets/splashScreenTitle.png" alt="" className={`${styles["title-descend"]} w-[450px]`} />
          <div className={`${styles["fade-in-buttons"]} flex flex-col items-center space-y-2`}>

          <button
            className={`flex px-6 py-3 rounded-full relative p-5 font-bold text-xl pl-12 border-2 ${
              playerLevel > 0 ? 'bg-red-700 hover:bg-red-600 border-yellow-300' : 'bg-gray-700 border-gray-300'
            }`}
            onClick={handleContinue}
            disabled={playerLevel === 0}
            onMouseEnter={() => playerLevel > 0 && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={isHovered && playerLevel > 0 ? "/assets/sprites/book-open.png" : "/assets/sprites/book-closed.png"}
              alt="Book Icon"
              className='absolute left-0 bottom-1 w-[50px]'
            />
            <span className="ml-2">Continue</span>
          </button>

            <button
              className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-xl pl-12 border-2 border-yellow-300"
              onClick={handleCreateHero}
            >
              <img src="/assets/sprites/feather.png" alt="" className='absolute left-0 bottom-1 w-[50px]' />
              New Hero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
