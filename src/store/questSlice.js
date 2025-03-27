export const createQuestSlice = (set, get) => ({
  quests: [],
  activeQuest: null,

  loadQuests: async () => {
    try {
      const response = await fetch("/assets/quests.json");
      const data = await response.json();

      const allQuests = [
        ...(data.main_quests || []),
        ...(data.side_quests || []),
      ];

      const questsWithDefaults = allQuests.map((quest) => ({
        ...quest,
        objective: { current: 0, ...quest.objective },
        status: quest.previous ? quest.status || "locked" : "active",
      }));

      set({ quests: questsWithDefaults });
    } catch (error) {
      console.error("Error loading quests:", error);
    }
  },

  completeQuest: (questId) => {
    set((state) => {
      let totalXpAward = 0;
      let questsCopy = state.quests.map((quest) => {
        if (quest.id === questId && quest.status === "active") {
          if (quest.objective.current < quest.objective.target) {
            return quest;
          }
          totalXpAward += quest.xpReward || 0;

          if (quest.unlocksWorld) {
            const unlockWorld = get().unlockWorld;
            unlockWorld(quest.unlocksWorld);
          }

          return { ...quest, status: "completed" };
        }
        return quest;
      });

      const currentQuest = state.quests.find((q) => q.id === questId);
      if (currentQuest && currentQuest.next) {
        questsCopy = questsCopy.map((quest) => {
          if (quest.id === currentQuest.next && quest.status === "locked") {
            return { ...quest, status: "active" };
          }
          return quest;
        });
      }

      if (totalXpAward > 0) {
        get().setXP(totalXpAward);
      }

      return { quests: questsCopy, activeQuest: null };
    });
  },

  updateMobChainState: (increment) => {
    set((state) => {
      let totalXpAward = 0;
      let questsCopy = state.quests.map((quest) => {
        if (quest.chain === "mob_chain" && quest.status === "active") {
          const newCurrent = quest.objective.current + increment;
          let newStatus = quest.status;
          if (newCurrent >= quest.objective.target) {
            newStatus = "completed";
            totalXpAward += quest.xpReward || 0;
          }
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
            status: newStatus,
          };
        }
        return quest;
      });

      questsCopy = questsCopy.map((quest) => {
        if (
          quest.chain === "mob_chain" &&
          quest.status === "locked" &&
          quest.previous
        ) {
          const previousQuest = questsCopy.find((q) => q.id === quest.previous);
          if (previousQuest && previousQuest.status === "completed") {
            return { ...quest, status: "active" };
          }
        }
        return quest;
      });

      if (totalXpAward > 0) {
        get().setXP(totalXpAward);
      }
      return { quests: questsCopy };
    });
  },

  updateBossChainState: (increment) => {
    set((state) => {
      let totalXpAward = 0;
      let questsCopy = state.quests.map((quest) => {
        if (quest.chain === "boss_chain" && quest.status === "active") {
          const newCurrent = quest.objective.current + increment;
          let newStatus = quest.status;
          if (newCurrent >= quest.objective.target) {
            newStatus = "completed";
            totalXpAward += quest.xpReward || 0;
          }
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
            status: newStatus,
          };
        }
        return quest;
      });

      questsCopy = questsCopy.map((quest) => {
        if (
          quest.chain === "boss_chain" &&
          quest.status === "locked" &&
          quest.previous
        ) {
          const previousQuest = questsCopy.find((q) => q.id === quest.previous);
          if (previousQuest && previousQuest.status === "completed") {
            return { ...quest, status: "active" };
          }
        }
        return quest;
      });

      if (totalXpAward > 0) {
        get().setXP(totalXpAward);
      }
      return { quests: questsCopy };
    });
  },

  updateQuestProgress: (questId, increment) => {
    set((state) => {
      let totalXpAward = 0;
      const questsCopy = state.quests.map((quest) => {
        if (quest.id === questId && quest.status === "active") {
          const newCurrent = quest.objective.current + increment;
          let newStatus = quest.status;
          if (newCurrent >= quest.objective.target) {
            newStatus = "completed";
            totalXpAward += quest.xpReward || 0;
          }
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
            status: newStatus,
          };
        }
        return quest;
      });
      if (totalXpAward > 0) {
        get().setXP(totalXpAward);
      }
      return { quests: questsCopy };
    });
  },

  updateNamedBossState: (bossId) => {
    set((state) => {
      let totalXpAward = 0;
      let questsCopy = state.quests.map((quest) => {
        if (
          quest.objective?.type === "defeat_named_boss" &&
          quest.status === "active" &&
          quest.objective.targetId === bossId
        ) {
          const newCurrent = quest.objective.current + 1;
          let newStatus = quest.status;

          if (newCurrent >= quest.objective.target) {
            newStatus = "completed";
            totalXpAward += quest.xpReward || 0;
          }

          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
            status: newStatus,
          };
        }
        return quest;
      });

      // Unlock next in chain (if any)
      questsCopy = questsCopy.map((quest) => {
        if (
          quest.status === "locked" &&
          quest.previous &&
          questsCopy.find((q) => q.id === quest.previous)?.status ===
            "completed"
        ) {
          return { ...quest, status: "active" };
        }
        return quest;
      });

      if (totalXpAward > 0) {
        get().setXP(totalXpAward);
      }

      return { quests: questsCopy };
    });
  },

  registerKill: ({ type, bossId = null }) => {
    if (type === "mob") {
      get().updateMobChainState(1);
    } else if (type === "boss") {
      get().updateBossChainState(1);
    } else if (type === "named_boss" && bossId) {
      get().updateNamedBossState(bossId);
    }

    const updatedQuests = get().quests;

    updatedQuests.forEach((quest) => {
      if (quest.status !== "active") return;

      const { objective } = quest;

      if (objective?.type === "win_mobs" && type === "mob") {
        get().updateQuestProgress(quest.id, 1);
      }

      if (objective?.type === "defeat_bosses" && type === "boss") {
        get().updateQuestProgress(quest.id, 1);
      }

      if (
        objective?.type === "defeat_named_boss" &&
        objective?.targetId === bossId &&
        type === "named_boss"
      ) {
        get().updateNamedBossState(bossId);
      }

      const latestQuest = get().quests.find((q) => q.id === quest.id);
      if (
        latestQuest &&
        latestQuest.objective.current >= latestQuest.objective.target &&
        latestQuest.status !== "completed"
      ) {
        get().completeQuest(latestQuest.id);
      }
      console.log("Quest progress updated:", quest.id, quest.objective.current);
    });
  },
});
