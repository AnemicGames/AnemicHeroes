import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import mapViewStyles from "./MapView.module.css"; // Animation
import questViewStyles from "./QuestView.module.css"; // Font

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
      alt={`Animated ${currentWorld} bonfire`}
      className="w-full"
    />
  );
};

const QuestItem = ({ quest, onComplete }) => (
  <li
    key={quest.id}
    className={`py-2 rounded flex justify-between items-center ${
      quest.status === "completed" ? "line-through text-black/40" : ""
    }`}
  >
    <div>
      <h3 className="text-2xl font-semibold">{quest.title}</h3>
      {quest.objective && (
        <p>
          Progress: {quest.objective.current} / {quest.objective.target}
        </p>
      )}
    </div>
    {quest.status === "active" &&
      quest.objective?.current >= quest.objective?.target && (
        <button
          onClick={() => onComplete(quest.id)}
          className="ml-20 px-3 py-1 text-black hover:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-3xl cursor-pointer font-bold"
        >
          Claim
        </button>
      )}
  </li>
);

const MainQuestItem = ({ quest, onComplete }) => {
  let progressDisplay = "";
  let isComplete = false;

  if (quest.objective.type === "compound") {
    progressDisplay = quest.objective.objectives
      .map((obj) => {
        let label = obj.name;
        if (!label) {
          switch (obj.type) {
            case "win_mobs":
              label = "Mobs";
              break;
            case "defeat_bosses":
              label = "Bosses";
              break;
            case "defeat_named_boss":
              label = "Named Boss";
              break;
            default:
              label = obj.type;
          }
        }
        return `${label}: ${obj.current} / ${obj.target}`;
      })
      .join(" | ");
    isComplete = quest.objective.objectives.every(
      (obj) => (obj.current || 0) >= (obj.target || 0)
    );
  } else {
    progressDisplay = `Progress: ${quest.objective.current} / ${quest.objective.target}`;
    isComplete = quest.objective.current >= quest.objective.target;
  }

  return (
    <div className="main-quest-item p-4 text-black h-[500px] gap-3 flex flex-col">
      <h2 className="text-3xl font-bold">{quest.title}</h2>
      <p className="mt-2 text-xl">{quest.description}</p>
      {quest.lore && <p className="mt-2 italic text-2xl">{quest.lore}</p>}
      <p className="mt-2 text-xl">
        Reward: {quest.xpReward} XP, {quest.moneyReward} Gold
      </p>
      <p className="mt-2 text-xl">{progressDisplay}</p>
      {quest.status === "active" && isComplete && (
        <button
          onClick={() => onComplete(quest.id)}
          className="mt-4 px-4 py-2  text-black hover:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-3xl font-bold"
        >
          Claim
        </button>
      )}
      {quest.status === "locked" && (
        <p className="mt-4 text-red-600 font-bold text-3xl flex justify-center">
          Unlock previous quest
        </p>
      )}
      {quest.status === "completed" && (
        <p className="mt-4 text-gray-500 text-7xl flex justify-center">
          Completed
        </p>
      )}
    </div>
  );
};

export default function QuestScreen() {
  const quests = useGameStore((state) => state.quests);
  const loadQuests = useGameStore((state) => state.loadQuests);
  const completeQuest = useGameStore((state) => state.completeQuest);
  const setEmbark = useGameStore((state) => state.setEmbark);
  const setCurrentView = useGameStore((state) => state.setCurrentView);
  const currentWorld = useGameStore((state) => state.currentWorld);

  const [sidePage, setSidePage] = useState(1);
  const questsPerPage = 6;

  useEffect(() => {
    if (quests.length === 0) {
      loadQuests();
    }
  }, [quests.length, loadQuests]);

  const goToMainMenu = () => setCurrentView("MAIN_MENU");

  const sideQuests = quests.filter(
    (q) =>
      q.type === "side" &&
      q.status !== "locked" &&
      Array.isArray(q.world) &&
      q.world.includes(currentWorld)
  );

  const sideQuestsByChain = sideQuests.reduce((acc, quest) => {
    const chain = quest.chain || quest.id;
    if (!acc[chain]) acc[chain] = [];
    acc[chain].push(quest);
    return acc;
  }, {});

  const displayedSideQuests = [];

  const totalPages = Math.ceil(sideQuests.length / questsPerPage);
  const paginatedSideQuests = sideQuests.slice(
    (sidePage - 1) * questsPerPage,
    sidePage * questsPerPage
  );

  Object.values(sideQuestsByChain).forEach((chainQuests) => {
    const allComplete = chainQuests.every((q) => q.status === "completed");
    if (allComplete) {
      displayedSideQuests.push(...chainQuests);
    } else {
      const activeQuest = chainQuests.find((q) => q.status === "active");
      if (activeQuest) {
        displayedSideQuests.push(activeQuest);
      }
    }
  });

  const mainQuestsAll = quests.filter((q) => q.type === "main");
  let mainChain = [];
  if (mainQuestsAll.length > 0) {
    let start = mainQuestsAll.find((q) => !q.previous);
    if (!start) {
      start = mainQuestsAll[0];
    }
    let current = start;
    while (current) {
      mainChain.push(current);
      if (current.next) {
        current = mainQuestsAll.find((q) => q.id === current.next);
      } else {
        break;
      }
    }
  }

  const [mainPage, setMainPage] = useState(0);

  useEffect(() => {
    if (mainPage >= mainChain.length && mainChain.length > 0) {
      setMainPage(mainChain.length - 1);
    }
  }, [mainChain, mainPage]);

  const [journalClosing, setJournalClosing] = useState(false);

  const exitGame = () => {
    const { embark, setCurrentView } = useGameStore.getState();
    setCurrentView(embark ? "MAP" : "MAIN_MENU");
  };

  const closeJournal = () => {
    setJournalClosing(true);
    setTimeout(() => {
      exitGame();
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

        {/* Main quests */}
        <div
          className={`relative inset-0 left-[220px] mt-4 p-8 w-[450px] h-[750px] overflow-hidden ${questViewStyles.journalContent}`}
          style={{ fontFamily: "Caveat, cursive" }}
        >
          <h2 className="text-4xl font-bold mb-4">Main Quests</h2>
          {mainChain.length > 0 ? (
            <div className="space-y-4 h-[550px]">
              <MainQuestItem
                quest={mainChain[mainPage]}
                onComplete={completeQuest}
              />
              <div className="flex justify-between mt-4 abosolute bottom-0 left-0">
                <button
                  onClick={() => setMainPage((prev) => Math.max(prev - 1, 0))}
                  disabled={mainPage === 0}
                  className="px-3 py-1 rounded disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xl flex items-center">
                  Quest {mainPage + 1} of {mainChain.length}
                </span>
                <button
                  onClick={() =>
                    setMainPage((prev) =>
                      Math.min(prev + 1, mainChain.length - 1)
                    )
                  }
                  disabled={mainPage === mainChain.length - 1}
                  className="px-3 py-1 rounded disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No main quests available.</p>
          )}
        </div>

        {/* Side quests */}
        <div
          className={`absolute inset-0 left-[650px] mt-4 p-8 overflow-auto ${questViewStyles.journalContent}`}
          style={{ fontFamily: "Caveat, cursive" }}
        >
          <h2 className="text-4xl font-bold mb-4">Side quests</h2>
          {sideQuests.length > 0 ? (
            <div className="absolute left-[50px] space-y-4 max-w-80 w-full">
              <ul className="space-y-4 h-[490px]">
                {paginatedSideQuests.map((quest) => (
                  <QuestItem
                    quest={quest}
                    onComplete={completeQuest}
                    key={quest.id}
                  />
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex justify-center mt-2 space-x-4">
                  <button
                    onClick={() => setSidePage((p) => Math.max(p - 1, 1))}
                    disabled={sidePage === 1}
                    className="px-3 py-1 rounded disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xl">
                    {sidePage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setSidePage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={sidePage === totalPages}
                    className="px-3 py-1 rounded disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>No side quests available for this world.</p>
          )}
        </div>
      </div>
      {/* Exit button */}
      <button
        className="absolute bottom-0 left-0 m-4 p-2 hover:bg-red-800 rounded z-50"
        title="Exit"
        onClick={closeJournal}
      >
        <img
          src="/assets/sprites/exit-nav-icon.png"
          alt="Exit"
          className="w-10 h-11"
        />
      </button>
    </div>
  );
}
