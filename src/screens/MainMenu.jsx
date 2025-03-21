import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

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
            className="w-full"
        />
    );
};

export default function MainMenu() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);
    const setEmbark = useGameStore((state) => state.setEmbark);

    const goToMap = () => {
        setEmbark(true);
        setCurrentView("MAP");
    };
    const goToCharacterSheet = () => setCurrentView("CHARACTER_SHEET");
    const goToShop = () => setCurrentView("SHOP");

    return (
        <div className="h-full w-full relative text-white">
            <AnimatedImage />

            <div className="absolute top-[130px] flex flex-col items-center justify-center gap-2 left-[250px]">
                <button
                    className="text-right px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-2xl pl-13 border-2 border-yellow-300 w-[180px]"
                    onClick={goToMap}
                >
                    <img
                        src="/assets/sprites/embark-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt=""
                    />
                    Embark!
                </button>

                <button
                    className="text-right px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-xl pl-14 border-2 border-yellow-300 w-[180px]"
                    onClick={goToCharacterSheet}
                >
                    <img
                        src="/assets/sprites/inventory-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt=""
                    />
                    Inventory
                </button>

                <button
                    className="justify-between px-6 py-3 bg-red-700 hover:bg-red-600 rounded-full relative p-5 font-bold text-xl pl-12 border-2 border-yellow-300 w-[180px]"
                    onClick={goToShop}
                >
                    <img
                        src="/assets/sprites/shop-nav-icon.png"
                        className="absolute left-0 bottom-1 w-[50px]"
                        alt=""
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
