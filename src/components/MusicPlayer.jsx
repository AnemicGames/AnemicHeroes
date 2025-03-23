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
    if (embark) {
      return '/assets/audio/bgm/loop3.ogg';
    }
    if (currentView === 'SPLASH' || currentView === 'CREATE_CHARACTER') {
      return '/assets/audio/bgm/dread_march_loop.ogg';
    }

    if (currentWorld === 'FOREST' && currentView === 'MAIN_MENU' || currentWorld === 'FOREST' && currentView === 'MAP') {
      return '/assets/audio/bgm/loop2.ogg';
    }

    if (currentView === 'BATTLE') {
      return '/assets/audio/bgm/loop.ogg';
    }
    if (currentView === 'SHOP') {
      return '/assets/audio/bgm/loop2.ogg';
    }

    return '/assets/audio/bgm/loop4.ogg';
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
