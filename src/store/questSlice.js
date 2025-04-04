import questData from "../../public/assets/quests.json";
const allQuests = [
  ...(questData.main_quests || []),
  ...(questData.side_quests || []),
].map((quest) => ({
  ...quest,
  objective: { current: 0, ...quest.objective },
  status: quest.previous ? "locked" : quest.status || "active",
}));

export const createQuestSlice = (set, get) => ({
  quests: allQuests,
  activeQuest: null,

  loadQuests: async () => {
    set({ quests: allQuests });
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
      let questsCopy = state.quests.map((quest) => {
        if (quest.chain === "mob_chain" && quest.status === "active") {
          const newCurrent = Math.min(
            quest.objective.current + increment,
            quest.objective.target
          );
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
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

      return { quests: questsCopy };
    });
  },

  updateBossChainState: (increment) => {
    set((state) => {
      let questsCopy = state.quests.map((quest) => {
        if (quest.chain === "boss_chain" && quest.status === "active") {
          const newCurrent = Math.min(
            quest.objective.current + increment,
            quest.objective.target
          );
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
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

      return { quests: questsCopy };
    });
  },

  updateQuestProgress: (questId, increment) => {
    set((state) => {
      const questsCopy = state.quests.map((quest) => {
        if (quest.id === questId && quest.status === "active") {
          const newCurrent = Math.min(
            quest.objective.current + increment,
            quest.objective.target
          );
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
          };
        }
        return quest;
      });
      return { quests: questsCopy };
    });
  },

  updateNamedBossState: (bossId) => {
    set((state) => {
      let questsCopy = state.quests.map((quest) => {
        if (
          quest.objective?.type === "defeat_named_boss" &&
          quest.status === "active" &&
          quest.objective.targetId === bossId
        ) {
          const newCurrent = quest.objective.current + 1;
          return {
            ...quest,
            objective: { ...quest.objective, current: newCurrent },
          };
        }
        return quest;
      });

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

      return { quests: questsCopy };
    });
  },

  registerKill: ({ type, bossId = null }) => {
    set((state) => {
      let questsCopy = [...state.quests];
      const updatedTypes = new Set();

      const updateChain = (chainType) => {
        questsCopy = questsCopy.map((quest) => {
          if (quest.chain === chainType && quest.status === "active") {
            const newCurrent = Math.min(
              quest.objective.current + 1,
              quest.objective.target
            );
            return {
              ...quest,
              objective: { ...quest.objective, current: newCurrent },
            };
          }
          return quest;
        });
        updatedTypes.add(
          chainType === "mob_chain" ? "win_mobs" : "defeat_bosses"
        );
      };

      if (type === "mob") updateChain("mob_chain");
      if (type === "boss") updateChain("boss_chain");

      if (type === "named_boss" && bossId) {
        questsCopy = questsCopy.map((quest) => {
          if (
            quest.status === "active" &&
            quest.objective?.type === "defeat_named_boss" &&
            quest.objective?.targetId === bossId
          ) {
            const newCurrent = quest.objective.current + 1;
            return {
              ...quest,
              objective: { ...quest.objective, current: newCurrent },
            };
          }
          return quest;
        });
        updatedTypes.add("defeat_named_boss");
      }

      questsCopy = questsCopy.map((quest) => {
        if (quest.status !== "active") return quest;
        const { objective } = quest;
        if (
          objective?.type === "win_mobs" &&
          type === "mob" &&
          (!quest.chain || !updatedTypes.has("win_mobs"))
        ) {
          const newCurrent = objective.current + 1;
          return { ...quest, objective: { ...objective, current: newCurrent } };
        }
        if (
          objective?.type === "defeat_bosses" &&
          type === "boss" &&
          (!quest.chain || !updatedTypes.has("defeat_bosses"))
        ) {
          const newCurrent = objective.current + 1;
          return { ...quest, objective: { ...objective, current: newCurrent } };
        }
        return quest;
      });

      return { quests: questsCopy };
    });
  },
});
