import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

const AnimatedBgImage = () => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const currentWorld = useGameStore((state) => state.currentWorld);
    const totalFrames = 12;
    const frameRate = 190;
    useEffect(() => {
        const imageCache = [];
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = `/assets/bonfire_bg/${currentWorld}/${i}.webp`;
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
            src={`/assets/bonfire_bg/${currentWorld}/${currentFrame}.webp`}
            alt="Animated bonfire"
            className="w-full"
        />
    );
};

export default function MainMenu() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);
    const setEmbark = useGameStore((state) => state.setEmbark);
    const [isHovered, setIsHovered] = useState(false);

    const goToMap = () => {
        setEmbark(true);
        setCurrentView("MAP");
    };
    const goToCharacterSheet = () => setCurrentView("CHARACTER_SHEET");
    const goToShop = () => setCurrentView("SHOP");
    const goToWorldMap = () => setCurrentView("WORLDMAP");
    const goToQuestLog = () => setCurrentView("QUEST");

    return (
        <div className="h-full w-full relative text-white">
            <AnimatedBgImage />

            <div className="absolute top-[130px] flex flex-col gap-2 left-[250px]">
                <button
                    className="text-left px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-2xl pl-13 border-2 border-yellow-300 w-[210px]"
                    onClick={goToWorldMap}
                >
                    <img
                        src="/assets/sprites/embark-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt="Embark"
                    />
                    World Map
                </button>

                <button
                    className="text-left px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-2xl pl-13 border-2 border-yellow-300 w-[210px]"
                    onClick={goToMap}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={
                            isHovered
                                ? "/assets/sprites/embark-shiny.png"
                                : "/assets/sprites/embark.png"
                        }
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt="Embark"
                    />
                    Embark!
                </button>

                <button
                    className="text-left px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-2xl pl-13 border-2 border-yellow-300 w-[210px]"
                    onClick={goToCharacterSheet}
                >
                    <img
                        src="/assets/sprites/inventory-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt="Inventory"
                    />
                    Inventory
                </button>

                <button
                    className="text-left px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-2xl pl-13 border-2 border-yellow-300 w-[210px]"
                    onClick={goToQuestLog}
                >
                    <img
                        src="/assets/sprites/quest-log-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt="Quest Log"
                    />
                    <span className="w-full text-center">Quest Log</span>
                </button>

                <button
                    className="text-left px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-2xl pl-13 border-2 border-yellow-300 w-[210px]"
                    onClick={goToShop}
                >
                    <img
                        src="/assets/sprites/shop-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt="Shop"
                    />
                    Shop
                </button>
            </div>

            <div>
                <button
                    className="absolute bottom-0 left-0 m-4 p-2 hover:bg-red-800 rounded"
                    title="Exit"
                    onClick={() => setCurrentView("SPLASH")}
                >
                    <img
                        src="/assets/sprites/exit-nav-icon.png"
                        alt="Exit"
                        className="w-10 h-11"
                    />
                </button>
            </div>
        </div>
    );
}
