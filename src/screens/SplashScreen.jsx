import React from 'react';
import { useGameStore } from '../store/useGameStore';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const playerLevel = useGameStore((state) => state.player.level);

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
              className={`px-4 py-2 rounded flex items-center ${
                playerLevel > 0 ? 'bg-red-950 hover:bg-red-900' : 'bg-gray-700 cursor-not-allowed'
              }`}
              onClick={handleContinue}
              disabled={playerLevel === 0}
            >
              <div className={styles["book-container"]}>
                <img src="/assets/sprites/book-closed.png" alt="" className={styles["book-icon"]} />
                <img src="/assets/sprites/book-open.png" alt="" className={styles["book-icon-hover"]} />
              </div>
              <span className="ml-2">Continue</span>
            </button>

            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded flex items-center"
              onClick={handleCreateHero}
            >
              <img src="/assets/sprites/feather.png" alt="" className="w-6 h-6 mr-2" />
              New Hero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
