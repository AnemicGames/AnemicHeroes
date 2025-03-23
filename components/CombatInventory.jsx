import { useEffect } from "react";

export function CombatInventory({ callback }) {
  useEffect(() => {
    setTimeout(() => {
      callback("TEST");
    }, 10000);
  }, []);

  return <p className="text-white">Your Health Potions</p>;
}