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
    }, [currentWorld]);

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

const ScreenTransition = ({ isVisible, text }) => {
    return (
        <div
            className={`fixed inset-0 flex items-center justify-center bg-black text-white text-2xl font-bold z-50 transition-opacity duration-1000 ease-out ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
        >
            {text}
        </div>
    );
};

export default function WorldMap() {
    const setCurrentView = useGameStore((state) => state.setCurrentView);
    const setEmbark = useGameStore((state) => state.setEmbark);
    const setCurrentWorld = useGameStore((state) => state.setCurrentWorld);
    const { map, initializeMap, worlds } = useGameStore();

    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [loadingText, setLoadingText] = useState("Loading...");
    const [transitionActive, setTransitionActive] = useState(false);

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

    const handleTransition = (id) => {
        const travelsfx = new Audio("/src/audio/sfx/travel-sfx.mp3");
        travelsfx.play();
        setTransitionActive(true);
        setLoadingText(`Going to ${id}`);
        setTimeout(() => {
            setCurrentWorld(id);
        }, 1000);
        setTimeout(() => {
            setTransitionActive(false);
        }, 2000);
        setTimeout(() => {
            navigateWithAnimation("MAIN_MENU");
        }, 2000);
    };

    const closeMap = (id) => {
        setIsClosing(true);
        setTimeout(() => {
            handleTransition(id);
        }, 500);
    };

    const [worldCells] = useState([
        { id: "FOREST", row: 6.8, col: 9 },
        { id: "MOUNTAIN", row: 5.7, col: 13.6 },
        { id: "DESERT", row: 6.1, col: 20 },
        { id: "SWAMP", row: 12, col: 21.6 },
        { id: "CAVES", row: 9.2, col: 23.3 },
        { id: "CASTLE", row: 7.5, col: 24 },
    ]);

    useEffect(() => {
        const fetchMap = async () => {
            if (!Array.isArray(map) || map.length === 0) {
                await initializeMap();
            }
        };
        fetchMap();
    }, [initializeMap]); // eslint-disable-line react-hooks/exhaustive-deps

    const goToMainMenu = () => navigateWithAnimation("MAIN_MENU");

    const getLastUnlockedWorld = () => {
        const priorityOrder = [
            "FOREST",
            "MOUNTAIN",
            "DESERT",
            "SWAMP",
            "CAVES",
            "CASTLE",
        ];

        for (let i = priorityOrder.length - 1; i >= 0; i--) {
            const id = priorityOrder[i];
            if (worlds[id] === "UNLOCKED") {
                return id;
            }
        }
        return "FOREST";
    };

    const getBackgroundImage = () => {
        const lastUnlockedWorld = getLastUnlockedWorld();
        return `/assets/map/${lastUnlockedWorld.toLowerCase()}-map.png`;
    };

    const handleCellClick = (id) => {
        if (worlds[id] === "UNLOCKED") {
            closeMap(id);
        }
    };

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
                <img
                    src={getBackgroundImage()}
                    alt="current world map"
                    className={`absolute top-[104px] left-[220px] h-[460px]`}
                />
                {worldCells.map(({ id, row, col }) => (
                    <div
                        key={id}
                        className="absolute"
                        style={{
                            top: `${row * 40}px`,
                            left: `${col * 40}px`,
                        }}
                    >
                        <div
                            className={`w-11 h-11 rounded-full ${
                                worlds[id] === "UNLOCKED"
                                    ? "bg-green-600 cursor-pointer"
                                    : "bg-red-600 cursor-pointer"
                            }`}
                            onClick={() => handleCellClick(id)}
                        >
                            {worlds[id] === "UNLOCKED" ? (
                                <span className="text-3xl">👍</span>
                            ) : (
                                <span className="text-3xl">🔒</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ScreenTransition isVisible={transitionActive} text={loadingText} />
        </div>
    );
}
