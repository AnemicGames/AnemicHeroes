import React, { useState } from "react";
import { useGameStore } from "./store/useGameStore";

import LoadScreen from "./screens/LoadScreen";
import SplashScreen from "./screens/SplashScreen";
import MainMenu from "./screens/MainMenu";
import MapView from "./screens/MapView";
import BattleView from "./screens/BattleView";
import CharacterSheet from "./screens/CharacterSheet";
import Shop from "./screens/Shop";
import CreateCharacter from "./screens/CreateCharacter";
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

    switch (currentView) {
        case "SPLASH":
            return <SplashScreen />;
        case "MAIN_MENU":
            return <MainMenu />;
        case "WORLDMAP":
            return <WorldMap />;
        case "MAP":
            return <MapView />;
        case "BATTLE":
            return <BattleView />;
        case "CHARACTER_SHEET":
            return <CharacterSheet />;
        case "SHOP":
            return <Shop />;
        case "CREATE_CHARACTER":
            return <CreateCharacter />;
        default:
            return <SplashScreen />;
    }
}
