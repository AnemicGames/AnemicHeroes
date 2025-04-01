import { useState, useEffect } from "react";
import { preloadAssets } from "../utils/preloadAssets";
import { assetsManifest } from "../assetsManifest";
export default function LoadScreen({ onDone }) {
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      await preloadAssets(assetsManifest, (loaded, total) => {
        if (isMounted) {
          setProgress({ loaded, total });
        }
      });
      if (isMounted) {
        setIsLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const { loaded, total } = progress;
  const progressRatio = total > 0 ? loaded / total : 0;
  const progressPercent = Math.floor(progressRatio * 100);

  const handlePlayGame = () => {
    onDone();
  };

  return (
    <div className="bg-black text-white w-full h-full flex flex-col items-center justify-center relative">

        <img
          src="/assets/battle_bg/2.webp"
          alt=""
          style={{ opacity: progressPercent / 100 }}
          className="w-full h-auto absolute top-0 z-0"
      />

      {
        !isLoaded && (
          <h1 className="mb-4 text-2xl font-bold z-10">Loading Game...</h1>
        )
      }
  
      <div className="absolute top-[85%] w-4/5 max-w-sm h-5 border-2 border-white rounded overflow-hidden mb-2 z-10">
        <div
          className="h-full bg-red-700 transition-all duration-200 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
  
      {total > 0 && !isLoaded && (
        <p className="text-sm z-10">
          Loading {loaded} of {total} assets ({progressPercent}%)
        </p>
      )}
  
      {isLoaded && (
        <button
          onClick={handlePlayGame}
          className="mt-4 px-4 py-2 rounded bg-red-700 text-white hover:bg-red-600 absolute z-10 top-2/3"
        >
          Play Game
        </button>
      )}
    </div>
  );
}  
