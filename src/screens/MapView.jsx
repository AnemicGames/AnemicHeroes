import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import styles from "./MapView.module.css";

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
            className="w-full top-0 absolute -z-10"
        />
    );
};

export default function MapView() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);
    const {
        map,
        currentPosition,
        setPosition,
        resetPosition,
        setEncounterType,
        setEncounterDifficulty,
        initializeMap,
        clearMap,
        setMap
    } = useGameStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMap = async () => {
          if (!Array.isArray(map) || map.length === 0) {
            await initializeMap("map1");
          }
          setIsLoading(false);
        };
        fetchMap();
    }, [initializeMap]);

    const handleTileClick = (cell) => {
        const currentCell = map.flat().find((c) => c.id === currentPosition.id);
        if (cell.type != 0 && currentCell.next.includes(cell.id)) {
            setPosition(cell.id);
        }
        if (cell.type === "BATTLE" && currentCell.next.includes(cell.id)) {
            goToBattle();
            setEncounterType(cell.encounterType);
            setEncounterDifficulty(cell.encounterDifficulty);
        }
        if (cell.type === "SHOP" && currentCell.next.includes(cell.id)) {
            goToShop();
        }
    };

    if (isLoading || !Array.isArray(map) || map === 0) {
        return <div>Loading...</div>;
    }

    const isWalkablePath = (cell) => {
        const currentCell = map.flat().find((c) => c.id === currentPosition.id);
        return currentCell && currentCell.next.includes(cell.id);
    };

    const goToSplash = () => setCurrentView("SPLASH");
    const goToMainMenu = () => setCurrentView("MAIN_MENU");
    const goToMap = () => setCurrentView("MAP");
    const goToBattle = () => setCurrentView("BATTLE");
    const goToCharacterSheet = () => setCurrentView("CHARACTER_SHEET");
    const goToShop = () => clearMap();

    return (
        <div className="relative">
            <AnimatedImage />
            <div className="space-x-2 mt-4 bg-gray-200 absolute z-20 w-full top-0">
                <h1>Map</h1>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={goToSplash}
                >
                    Splash
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={goToMainMenu}
                >
                    Main Menu
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={goToMap}
                >
                    Map
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={goToBattle}
                >
                    Battle
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={setMap}
                >
                    Character
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={initializeMap}
                >
                    Shop
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={resetPosition}
                >
                    Reset to Start
                </button>
                {/* New button to clear the map */}
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={clearMap}
                >
                    Clear Map
                </button>
            </div>

            <div
                className={`${
                    isVisible ? styles["mapOpen"] : ""
                } absolute w-full h-max`}
            >
                <img
                    src="/assets/map.webp"
                    alt="Easter Egg!!!!! <<3<3<3<3<3<3<<3<33<3<<<3<3<ÆØDÅDØASÅDØASÅDØÅA"
                    className={`absolute w-full h-max`}
                />
                <div
                    className={`grid grid-cols-17 z-10 absolute top-45 left-75 h-fit w-fit`}
                >
                    {map.map((row) =>
                        row.map((cell) => {
                            const isPlayer = currentPosition.id === cell.id;
                            const isWalkable = isWalkablePath(cell);
                            return (
                                <div
                                    key={cell.id}
                                    onClick={() => handleTileClick(cell)}
                                    className={`w-10 h-10 flex items-center justify-center rounded ${
                                        isPlayer
                                            ? "bg-blue-500 border cursor-pointer"
                                            : isWalkable
                                            ? "bg-yellow-200 border cursor-pointer"
                                            : cell.type === "START"
                                            ? "bg-emerald-700 border cursor-pointer"
                                            : cell.type === "BATTLE"
                                            ? "bg-red-200 border cursor-pointer"
                                            : cell.type === "BOSS"
                                            ? "bg-orange-400 border cursor-pointer"
                                            : cell.type === "SHOP"
                                            ? "bg-green-400 border cursor-pointer"
                                            : cell.type === "EVENT"
                                            ? "bg-cyan-400 border cursor-pointer"
                                            : "transparent"
                                    }`}
                                >
                                    {cell.type === "START" ? "🏠" : ""}
                                    {cell.type === "BATTLE" ? "🗺️" : ""}
                                    {cell.type === "EVENT" ? "🎁" : ""}
                                    {cell.type === "SHOP" ? "🪙" : ""}
                                    {cell.type === "BOSS" ? "😡" : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
