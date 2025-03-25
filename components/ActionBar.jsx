import { useGameStore } from "../src/store/useGameStore";
import { AttackBar } from "./AttackBar";
import { CombatInventory } from "../components/CombatInventory";

export function ActionBar({ action, callback }) {
  const removeItem = useGameStore((state) => state.removeItem);
  const setSkipTurn = useGameStore((state) => state.setSkipTurn);
  const handleDrink = (item, event) => {
    event.preventDefault();
    if (item.type === "potion" && item.healAmount) {
      useGameStore.setState((state) => ({
        player: {
          ...state.player,
          currentHp: Math.min(
            state.player.maxHp,
            state.player.currentHp + item.healAmount
          ),
        },
      }));
      removeItem(item.id, 1);
      setSkipTurn(true);
    }
  };

  switch (action) {
    case "INITIAL":
      return <p>Initial</p>;

    case "INVENTORY":
      return <CombatInventory callback={callback} handleDrink={handleDrink} />;

    case "ATTACK":
      return <AttackBar callback={callback} />;

    case "FIGHT":
      return (
        <>
          <div className="flex gap-4 h-12">
            <button
              className="w-1/2 border-2 bg-neutral-100 text-xl flex items-center justify-center gap-3"
              onClick={() => callback("ATTACK")}
            >
              Attack{" "}
              <img src="./public/assets/sprites/weapons/sword_wpn.png" alt="" />
            </button>
            <button
              className="w-1/2 border-2 bg-neutral-100 text-xl flex items-center justify-center gap-3"
              onClick={() => callback("INVENTORY")}
            >
              Health Potion{" "}
              <img src="./public/assets/sprites/potions/hp_pot.png" alt="" />
            </button>
          </div>
          <div className="flex gap-4 h-12">
            <button className="w-1/2 border-2 bg-neutral-100 text-xl">
              Special Attack
            </button>
            <button className="w-1/2 border-2 bg-neutral-100 text-xl">
              Run
            </button>
          </div>
        </>
      );

    default:
      return <p className="text-white">Waiting for action...</p>;
  }
}
