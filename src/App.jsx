import { useState } from 'react';
import { useGameStore } from './store/useGameStore.js';
import LoadScreen from './screens/LoadScreen';
import SplashScreen from './screens/SplashScreen';
import MainMenu from './screens/MainMenu';
import MapView from './screens/MapView';
import BattleView from './screens/BattleView';
import CharacterSheet from './screens/CharacterSheet';
import Shop from './screens/Shop';
import CreateCharacter from './screens/CreateCharacter';
import MusicPlayer from './components/MusicPlayer';
import QuestScreen from "./screens/questView";
import WorldMap from "./screens/WorldMap.jsx";


export default function App() {
    const [isLoaded, setIsLoaded] = useState(false);
    const currentView = useGameStore((state) => state.currentView);

    if (!isLoaded) {
        return (
            <LoadScreen
                onDone={() => {
                    setIsLoaded(true);
                }}
            />
        );
    }
  return (
    <>
      <MusicPlayer />
      {currentView === 'SPLASH' && <SplashScreen />}
      {currentView === 'MAIN_MENU' && <MainMenu />}
      {currentView === 'WORLDMAP' && <WorldMap />}
      {currentView === 'MAP' && <MapView />}
      {currentView === 'BATTLE' && <BattleView />}
      {currentView === 'CHARACTER_SHEET' && <CharacterSheet />}
      {currentView === 'SHOP' && <Shop />}
      {currentView === 'CREATE_CHARACTER' && <CreateCharacter />}
      {currentView === 'QUEST' && <QuestScreen />}
    </>
  );
}
