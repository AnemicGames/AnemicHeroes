import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export const BackgroundImage = () => {
  const currentWorld = useGameStore((state) => state.currentWorld);
  const [background, setBackground] = useState();

  useEffect(() => {
    let imgSrc = "";

    if (currentWorld === "FOREST") {
      const imgIndex = Math.floor(Math.random() * 10) + 1;
      imgSrc = `assets/battle_bg/forest/${imgIndex}.webp`;
    } else if (currentWorld === "MOUNTAIN") {
      const imgIndex = Math.floor(Math.random() * 10) + 1;
      imgSrc = `assets/battle_bg/mountain/${imgIndex}.webp`;
    } else if (currentWorld === "DESERT") {
      const imgIndex = Math.floor(Math.random() * 9) + 1;
      imgSrc = `assets/battle_bg/desert/${imgIndex}.webp`;
    } else if (currentWorld === "SWAMP") {
      const imgIndex = Math.floor(Math.random() * 9) + 1;
      imgSrc = `assets/battle_bg/swamp/${imgIndex}.webp`;
    } else if (currentWorld === "CAVE") {
      const imgIndex = Math.floor(Math.random() * 6) + 1;
      imgSrc = `assets/battle_bg/cave/${imgIndex}.webp`;
    }

    if (!imgSrc) {
      imgSrc = "assets/battle_bg/default.webp";
    }

    setBackground(imgSrc);
  }, [currentWorld]);

  return (
    <img
      src={background}
      alt="Background"
      className="w-full absolute top-0"
    />
  );
};
