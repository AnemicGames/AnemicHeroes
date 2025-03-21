import { useState, useEffect } from "react";
import { preloadAssets } from "../utils/preloadAssets";
import { assetsManifest } from "../assetsManifest";

export default function LoadScreen({ onDone }) {
    const [progress, setProgress] = useState({ loaded: 0, total: 0 });

    useEffect(() => {
        let isMounted = true;

        (async () => {
            await preloadAssets(assetsManifest, (loaded, total) => {
                if (isMounted) {
                    setProgress({ loaded, total });
                }
            });
            if (isMounted) {
                onDone();
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [onDone]);

    const { loaded, total } = progress;
    const progressRatio = total > 0 ? loaded / total : 0;
    const progressPercent = Math.floor(progressRatio * 100);

    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
            {/* Title */}
            <h1 className="mb-4 text-2xl font-bold">Loading Game...</h1>

            {/* Progress Bar Container */}
            <div className="w-4/5 max-w-sm h-5 border-2 border-white rounded overflow-hidden mb-2">
                {/* Progress Fill */}
                <div
                    className="h-full bg-red-700 transition-all duration-200 ease-in-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Loading status (x of total) */}
            {total > 0 && (
                <p className="text-sm">
                    Loading {loaded} of {total} assets ({progressPercent}%)
                </p>
            )}
        </div>
    );
}
