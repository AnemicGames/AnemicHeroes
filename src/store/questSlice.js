export const createQuestSlice = (set, get) => ({
  quests: [],

  activeQuest: null,

  loadQuests: async () => {
    try {
      const response = await fetch("/assets/quests.json");
      const data = await response.json();

      set({ quests: data.quests || [] });
    } catch (error) {
      console.error("Error loading quests:", error);
    }
  },

  acceptQuest: (questId) => {
    set((state) => {
      const updatedQuests = state.quests.map((quest) =>
        quest.id === questId ? { ...quest, status: "active" } : quest
      );
      return { quests: updatedQuests, activeQuest: questId };
    });
  },

  completeQuest: (questId) => {
    set((state) => {
      const updatedQuests = state.quests.map((quest) =>
        quest.id === questId && quest.status === "active"
          ? { ...quest, status: "completed" }
          : quest
      );
      return { quests: updatedQuests, activeQuest: null };
    });
  },
});
