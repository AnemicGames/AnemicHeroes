import { useEffect } from "react";

export function CombatInventory({ callback }) {
  useEffect(() => {
    setTimeout(() => {
      callback("TEST");
    }, 10000);
  }, []);

  return <p>Your Health Potions</p>;
}