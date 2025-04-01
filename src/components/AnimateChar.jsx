import { useEffect, useState } from "react";

const AnimateChar = ({ characterClass }) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 4;
  const frameRate = 500;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame % totalFrames) + 1);
    }, frameRate);
    return () => clearInterval(interval);
  }, [totalFrames, frameRate]);

  return (
    <img
      src={`/assets/sprites/heroes/${characterClass}/${currentFrame}.png`}
      alt={`Animated ${characterClass}`}
      className="max-w-full object-contain h-80"
    />
  );
};

export default AnimateChar;
