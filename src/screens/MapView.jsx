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
        if (cell.type === "BATTLE" && currentCell.next.includes(cell.id)|| cell.type === "BOSS" && currentCell.next.includes(cell.id)) {
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

    const startPosition = map.flat().find(cell => cell.type === "START");

    const goToMainMenu = () => navigateWithAnimation("MAIN_MENU");
    const goToBattle = () => navigateWithAnimation("BATTLE");
    const goToShop = () => navigateWithAnimation("SHOP");


    return (
        <div className="relative h-full w-full">
            <AnimatedImage />

            <div
                className={`absolute w-full h-max ${
                    isClosing ? styles["mapClose"] : isVisible ? styles["mapOpen"] : ""
                }`}
>
                <img
                    src="/assets/map.webp"
                    alt="Easter Egg!!!!! <<3<3<3<3<3<3<<3<33<3<<<3<3<ÆØDÅDØASÅDØASÅDØÅA"
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

            {startPosition && currentPosition.id === startPosition.id && (
                <button
                    className='absolute bottom-0 left-0 m-4 p-2 hover:bg-red-800 rounded z-50'
                    title='Exit'
                    onClick={() => goToMainMenu('MAIN_MENU')}
                >
                    <img src="/assets/sprites/exit-nav-icon.png" alt="Exit" className='w-10 h-11' />
                </button>
            )}
        </div>
    );
}
