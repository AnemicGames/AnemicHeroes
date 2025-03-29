import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export function QuestHandler({ battleOutcome }) {
  useEffect(() => {
    if (battleOutcome !== "VICTORY") return;

    const { enemy, registerKill, encounterType } = useGameStore.getState();

    if (!enemy) return;

    const isBoss = encounterType === "BOSS";
    const isNamed = isBoss && enemy.id?.startsWith("b");

    if (!isBoss) {
      registerKill({ type: "mob" });
    }

    if (isBoss) {
      registerKill({ type: "boss" });
    }

    if (isNamed) {
      registerKill({ type: "named_boss", bossId: enemy.id });
    }
  }, [battleOutcome]);

  return null;
}
