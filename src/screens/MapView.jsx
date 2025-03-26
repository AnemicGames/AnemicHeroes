import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import styles from "./MapView.module.css";

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
            className="w-full top-0 absolute -z-10"
        />
    );
};

export default function MapView() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);
    const setEmbark = useGameStore((state) => state.setEmbark);

    const {
        map,
        currentPosition,
        setPosition,
        setEncounterType,
        setEncounterDifficulty,
        initializeMap,
    } = useGameStore();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const navigateWithAnimation = (view) => {
        setIsClosing(true);
        setTimeout(() => {
            setEmbark(false);
            setCurrentView(view);
        }, 1000);
    };

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMap = async () => {
            if (!Array.isArray(map) || map.length === 0) {
                await initializeMap();
            }
            setIsLoading(false);
        };
        fetchMap();
    }, [initializeMap]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTileClick = (cell) => {
        const currentCell = map.flat().find((c) => c.id === currentPosition.id);
        if (cell.type != 0 && currentCell.next.includes(cell.id)) {
            setPosition(cell.id);
        }
        if (
            (cell.type === "BATTLE" && currentCell.next.includes(cell.id)) ||
            (cell.type === "BOSS" && currentCell.next.includes(cell.id))
        ) {
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

    const startPosition = map.flat().find((cell) => cell.type === "START");

    const goToMainMenu = () => navigateWithAnimation("MAIN_MENU");
    const goToBattle = () => navigateWithAnimation("BATTLE");
    const goToShop = () => navigateWithAnimation("SHOP");

    return (
        <div className="relative h-full w-full">
            <AnimatedBgImage />

            <div
                className={`absolute w-full h-max ${
                    isClosing
                        ? styles["mapClose"]
                        : isVisible
                        ? styles["mapOpen"]
                        : ""
                }`}
            >
                <img
                    src="/assets/map.webp"
                    alt="map background"
                    className={`absolute w-full h-[720px]`}
                />
                <div
                    className={`grid grid-cols-17 z-10 absolute top-45 left-75 h-[360px] w-fit`}
                >
                    {map.map((row) =>
                        row.map((cell) => {
                            const isPlayer = currentPosition.id === cell.id;
                            const isWalkable = isWalkablePath(cell);
                            return (
                                <div
                                    key={cell.id}
                                    onClick={() => handleTileClick(cell)}
                                    className="relative w-10 h-10 flex items-center justify-center rounded-xl"
                                >
                                    {isPlayer && (
                                        <div className="absolute -inset-0 outline-red-600 z-1 outline-6 animate-pulse rounded-xl"></div>
                                    )}
                                    <div
                                        className={`relative w-full h-full flex items-center justify-center rounded-xl ${
                                            isPlayer
                                                ? "border-2 border-amber-950/90 bg-blue-800/80 cursor-pointer p-[.75px]"
                                                : isWalkable
                                                ? "border-2 border-amber-950/90 bg-amber-200/80 cursor-pointer p-[.75px]"
                                                : cell.type === "START"
                                                ? "border-2 border-amber-950/90 bg-green-950/80 cursor-pointer p-[.75px]"
                                                : cell.type === "BATTLE"
                                                ? "border-2 border-amber-950/90 bg-amber-800/70 cursor-not-allowed p-[.75px]"
                                                : cell.type === "BOSS"
                                                ? "border-2 border-amber-950/90 bg-red-600 cursor-pointer"
                                                : cell.type === "SHOP"
                                                ? "border-2 border-amber-950/90 bg-yellow-400/80 cursor-pointer p-[.75px]"
                                                : cell.type === "EVENT"
                                                ? "border-2 border-amber-950/90 bg-amber-400/80 cursor-pointer p-[.75px]"
                                                : "transparent"
                                        }`}
                                    >
                                        {cell.type === "START" && (
                                            <img
                                                src="./assets/sprites/map/fc911.png"
                                                alt="START"
                                            />
                                        )}
                                        {cell.type === "BATTLE" && (
                                            <img
                                                src="./assets/sprites/map/fc729.png"
                                                alt="BATTLE"
                                            />
                                        )}
                                        {cell.type === "EVENT" && (
                                            <img
                                                src="./assets/sprites/map/fc13.png"
                                                alt="RANDOM"
                                            />
                                        )}
                                        {cell.type === "SHOP" && (
                                            <img
                                                src="./assets/sprites/map/fc133.png"
                                                alt="SHOP"
                                            />
                                        )}
                                        {cell.type === "BOSS" && (
                                            <img
                                                src="./assets/sprites/map/fc1231.png"
                                                alt="Boss"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {startPosition && currentPosition.id === startPosition.id && (
                <button
                    className="absolute bottom-0 left-0 m-4 p-2 hover:bg-red-800 rounded z-50"
                    title="Exit"
                    onClick={() => goToMainMenu("MAIN_MENU")}
                >
                    <img
                        src="/assets/sprites/exit-nav-icon.png"
                        alt="Exit"
                        className="w-10 h-11"
                    />
                </button>
            )}
        </div>
    );
}
