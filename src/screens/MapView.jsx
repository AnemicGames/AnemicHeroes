import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export default function MapView() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);
    const {
        map,
        currentPosition,
        initializeMap,
        setPosition,
        resetPosition,
        setEncounterType,
        setEncounterDifficulty,
    } = useGameStore();

    useEffect(() => {
        initializeMap();
    }, [initializeMap]);

    const handleTileClick = (cell) => {
        console.log("Cell type:", cell.type);
        const currentCell = map.flat().find((c) => c.id === currentPosition.id);
        if (cell.type != 0 && currentCell.next.includes(cell.id)) {
            setPosition(cell.id);
        }
        if (cell.type === "BATTLE") {
            goToBattle();
            setEncounterType(cell.encounterType);
            setEncounterDifficulty(cell.encounterDifficulty);
        }
        if (cell.type === "SHOP" && currentCell.next.includes(cell.id)) {
            goToShop();
        }
    };

    if (!map || map.length === 0) {
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
    const goToShop = () => setCurrentView("SHOP");

    return (
        <>
            <div className="space-x-2 mt-4 bg-gray-200">
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
                    onClick={goToCharacterSheet}
                >
                    Character
                </button>
                <button
                    className="px-2 py-1 border rounded bg-gray-700"
                    onClick={goToShop}
                >
                    Shop
                </button>
            </div>
            <button onClick={resetPosition}>Clik me</button>
            <div className="grid grid-cols-12 gap-1">
                {map.map((row) =>
                    row.map((cell) => {
                        const isPlayer = currentPosition.id === cell.id;
                        const isWalkable = isWalkablePath(cell);
                        return (
                            <div
                                key={cell.id}
                                onClick={() => handleTileClick(cell)}
                                className={`w-12 h-12 flex items-center justify-center rounded ${
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
        </>
    );
}
