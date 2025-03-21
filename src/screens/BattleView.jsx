import { useGameStore } from "../store/useGameStore";

export default function BattleView() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);

    const goToSplash = () => setCurrentView("SPLASH");
    const goToMainMenu = () => setCurrentView("MAIN_MENU");
    const goToMap = () => setCurrentView("MAP");
    const goToBattle = () => setCurrentView("BATTLE");
    const goToCharacterSheet = () => setCurrentView("CHARACTER_SHEET");
    const goToShop = () => setCurrentView("SHOP");

    return (
        <div className="space-x-2 mt-4">
            <h1>Battle</h1>
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
    );
}
