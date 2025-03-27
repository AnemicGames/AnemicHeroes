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

const AnimatedMapSprite = ({ isUnlocked, isSameWorld }) => {
    const [currentImage, setCurrentImage] = useState(
        "./assets/sprites/map/fc43.png"
    );

    useEffect(() => {
        let interval;

        if (isUnlocked) {
            const imageSet = isSameWorld
                ? [
                      "./assets/sprites/map/fc41.png",
                      "./assets/sprites/map/fc42.png",
                  ]
                : [
                      "./assets/sprites/map/fc43.png",
                      "./assets/sprites/map/fc44.png",
                  ];
            interval = setInterval(() => {
                setCurrentImage((prevImage) =>
                    prevImage === imageSet[0] ? imageSet[1] : imageSet[0]
                );
            }, 200);
            return () => clearInterval(interval);
        } else {
            setCurrentImage("./assets/sprites/map/fc43.png");
        }
    }, [isUnlocked, isSameWorld]);

    return <img src={currentImage} alt="Animated Image" />;
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
    const { map, initializeMap, worlds, currentWorld } = useGameStore();

    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [loadingText, setLoadingText] = useState("Loading...");
    const [transitionActive, setTransitionActive] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [messageVisible, setMessageVisible] = useState(false);

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

    const goToMainMenu = () => navigateWithAnimation("MAIN_MENU");

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
        { id: "FOREST", row: 6.5, col: 9 },
        { id: "MOUNTAIN", row: 5.2, col: 13.85 },
        { id: "DESERT", row: 5.65, col: 20.12 },
        { id: "SWAMP", row: 11.5, col: 21.9 },
        { id: "CAVES", row: 8.8, col: 23.9 },
        { id: "CASTLE", row: 6.7, col: 23.8 },
        { id: "HELL", row: 12, col: 13.4 },
    ]);

    useEffect(() => {
        const fetchMap = async () => {
            if (!Array.isArray(map) || map.length === 0) {
                await initializeMap();
            }
        };
        fetchMap();
    }, [initializeMap]); // eslint-disable-line react-hooks/exhaustive-deps

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
        if (id === currentWorld) {
            setMessageVisible(true);
            setTimeout(() => {
                setMessageVisible(false);
            }, 2000);
            return;
        }

        if (worlds[id] === "UNLOCKED") {
            closeMap(id);
        }
    };

    const preloadMapImages = () => {
        const mapImage = new Image();
        mapImage.src = getBackgroundImage();

        mapImage.onload = () => {
            setMapLoaded(true);
        };
    };

    useEffect(() => {
        preloadMapImages();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!mapLoaded) {
        return (
            <div className="relative h-full w-full">
                <ScreenTransition
                    isVisible={transitionActive}
                    text={loadingText}
                />
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <AnimatedBgImage />

            {messageVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-xl font-bold h-0 w-60 text-center shadow-[0_0_70px_50px_rgba(0,0,0,1)] z-80">
                        <span className="relative top-[-16px]">
                            You are already here!
                        </span>
                    </div>
                </div>
            )}
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
                            className={`w-14 h-14 p-3 rounded-full ${
                                worlds[id] === "UNLOCKED"
                                    ? "transition duration-300 hover:bg-green-500/50 cursor-pointer"
                                    : "transparent"
                            }`}
                            onClick={() => handleCellClick(id)}
                        >
                            {worlds[id] === "UNLOCKED" ? (
                                <AnimatedMapSprite
                                    isUnlocked={true}
                                    isSameWorld={currentWorld === id}
                                />
                            ) : (
                                <span></span>
                            )}
                            {worlds[id] === "UNLOCKED" && (
                                <span className="flex justify-center">
                                    <p className="bg-black/70 text-white text-sm p-1 mt-1">
                                        {id}
                                    </p>
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
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
            <ScreenTransition isVisible={transitionActive} text={loadingText} />
        </div>
    );
}
