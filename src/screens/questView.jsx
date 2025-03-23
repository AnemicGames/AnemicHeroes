import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import mapViewStyles from "./MapView.module.css"; // Animation
import questViewStyles from "./QuestView.module.css"; // Font

const AnimatedBgImage = () => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const currentWorld = "MOUNTAIN";
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

export default function QuestScreen() {
  const quests = useGameStore((state) => state.quests);
  const loadQuests = useGameStore((state) => state.loadQuests);
  const completeQuest = useGameStore((state) => state.completeQuest);
  const setCurrentView = useGameStore((state) => state.setCurrentView);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const goToMainMenu = () => setCurrentView("MAIN_MENU");

  const availableQuests = quests.filter((quest) => quest.status !== "locked");

  const [journalClosing, setJournalClosing] = useState(false);

  const closeJournal = () => {
    setJournalClosing(true);
    setTimeout(() => {
      goToMainMenu();
    }, 1000);
  };

  return (
    <div className="h-full w-full relative text-black">
      <AnimatedBgImage />

      <div
        className={`absolute w-full h-full z-50 ${
          journalClosing ? mapViewStyles.mapClose : mapViewStyles.mapOpen
        }`}
      >
        <img
          src="/assets/quest_journal.webp"
          alt="Quest Journal"
          className="absolute w-full h-full object-cover"
        />

        {/* Quests */}
        <div
          className={`absolute inset-0 left-[220px] mt-4 p-8 overflow-auto ${questViewStyles.journalContent}`}
          style={{ fontFamily: "Caveat, cursive" }}
        >
          <h2 className="text-4xl font-bold mb-4">Quests</h2>
          {availableQuests && availableQuests.length > 0 ? (
            <ul className="absolute left-[50px]">
              {availableQuests.map((quest) => (
                <li
                  key={quest.id}
                  className="py-2 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-2xl font-semibold">{quest.title}</h3>
                    {quest.objective && (
                      <p>
                        Progress: {quest.objective.current} /{" "}
                        {quest.objective.target}
                      </p>
                    )}
                  </div>
                  {quest.status === "active" &&
                    quest.objective &&
                    quest.objective.current >= quest.objective.target && (
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="ml-20 px-3 py-1  text-black hover:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-3xl cursor-pointer"
                      >
                        Claim
                      </button>
                    )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No quests available.</p>
          )}
          <button
            onClick={closeJournal}
            className="absolute bottom-0 left-0 m-4 p-2 bg-gray-700 rounded z-50"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
}
