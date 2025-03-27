import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Howl } from 'howler';

function MusicPlayer() {
  const currentView = useGameStore((state) => state.currentView);
  const embark = useGameStore((state) => state.embark);
  const currentWorld = useGameStore((state) => state.currentWorld);

  const [currentHowl, setCurrentHowl] = useState(null);
  const [currentSrc, setCurrentSrc] = useState('');

  const determineTrack = () => {
    if (currentView === 'SPLASH' || currentView === 'CREATE_CHARACTER') {
      return '/assets/audio/bgm/splash-bgm.mp3';
    }

    if (currentWorld === 'FOREST' && currentView === 'MAIN_MENU' || currentWorld === 'FOREST' && currentView === 'MAP' || currentWorld === 'FOREST' && currentView === 'CHARACTER_SHEET') {
      return '/assets/audio/bgm/forest-bgm.mp3';
    }

    if (currentWorld === 'MOUNTAIN' && currentView === 'MAIN_MENU' || currentWorld === 'MOUNTAIN' && currentView === 'MAP' || currentWorld === 'MOUNTAIN' && currentView === 'CHARACTER_SHEET') {
      return '/assets/audio/bgm/mountain-bgm.mp3';
    }
    if (currentWorld === 'DESERT' && currentView === 'MAIN_MENU' || currentWorld === 'DESERT' && currentView === 'MAP' || currentWorld === 'DESERT' && currentView === 'CHARACTER_SHEET') {
      return '/assets/audio/bgm/desert-bgm.mp3';
    }
    if (currentWorld === 'SWAMP' && currentView === 'MAIN_MENU' || currentWorld === 'SWAMP' && currentView === 'MAP' || currentWorld === 'SWAMP' && currentView === 'CHARACTER_SHEET') {
      return '/assets/audio/bgm/swamp-bgm.mp3';
    }
    if (currentWorld === 'CAVES' && currentView === 'MAIN_MENU' || currentWorld === 'CAVES' && currentView === 'MAP' || currentWorld === 'CAVES' && currentView === 'CHARACTER_SHEET') {
      return '/assets/audio/bgm/caves-bgm.mp3';
    }
    if (currentWorld === 'CASTLE' && currentView === 'MAIN_MENU' || currentWorld === 'CASTLE' && currentView === 'MAP' || currentWorld === 'CASTLE' && currentView === 'CHARACTER_SHEET') {
      return '/assets/audio/bgm/desert-bgm.mp3';
    }
    if (currentView === 'SHOP') {
      return '/assets/audio/bgm/tavern-bgm.wav';
    }
    if (currentView === 'BATTLE') {
      const randomBattleTrack = Math.floor(Math.random() * 3) + 1;
      return `/assets/audio/bgm/battle-${randomBattleTrack}-bgm.mp3`;
    }

    return '/assets/audio/bgm/forest-bgm.mp3';
  };

  const fadeOutHowl = (howl, duration = 500) => {
    return new Promise((resolve) => {
      if (!howl) return resolve();

      const initialVol = howl.volume();
      howl.once('fade', () => {
        howl.stop();
        howl.unload();
        resolve();
      });
      howl.fade(initialVol, 0, duration);
    });
  };

  const fadeInTrack = async (src, duration = 500) => {
    const newHowl = new Howl({
        src: [src],
        loop: true,     
        volume: 0,      
        html5: false,   
      });

    newHowl.play();

    newHowl.fade(0, 1, duration);

    setCurrentHowl(newHowl);
    setCurrentSrc(src);
  };

  useEffect(() => {
    const newTrack = determineTrack();

    if (currentSrc === newTrack) {
      return;
    }

    const switchTrack = async () => {
      await fadeOutHowl(currentHowl, 500);
      await fadeInTrack(newTrack, 500);
    };

    switchTrack();

    return () => {
      if (currentHowl) {
        currentHowl.stop();
        currentHowl.unload();
      }
    };
  }, [currentView, embark]);

  return null;
}

export default MusicPlayer;
