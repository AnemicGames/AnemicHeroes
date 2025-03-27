import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export function QuestHandler({ battleOutcome }) {
  useEffect(() => {
    if (battleOutcome !== "VICTORY") return;

    const { enemy, registerKill, encounterType } = useGameStore.getState();

    if (!enemy) return;

    const type =
      encounterType === "BOSS" ? (enemy.id ? "named_boss" : "boss") : "mob";

    const payload =
      type === "named_boss" ? { type, bossId: enemy.id } : { type };

    console.log("QuestHandler -> registerKill", payload);
    registerKill(payload);
  }, [battleOutcome]);

  return null;
}
