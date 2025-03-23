import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

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

  return (
    <div className="p-4 text-white">
      <h2 className="text-4xl font-bold mb-4">Quests</h2>
      <button
        className="mb-4 px-4 py-2 bg-gray-700 rounded"
        onClick={goToMainMenu}
      >
        Back to Main Menu
      </button>
      {availableQuests && availableQuests.length > 0 ? (
        <ul className="space-y-4">
          {availableQuests.map((quest) => (
            <li
              key={quest.id}
              className="p-4 bg-gray-800 rounded shadow-md flex justify-between items-center"
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
                    className="mt-2 px-3 py-1 bg-blue-600 rounded"
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
    </div>
  );
}
