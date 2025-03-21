import { AttackBar } from "./AttackBar";
import { CombatInventory } from "./CombatInventory";

export function ActionBar({ action, callback }) {
  switch (action) {
    case "INITIAL":
      return <p>Initial</p>;

    case "INVENTORY":
      return <CombatInventory callback={callback} />;

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
              <img
                src="./public/assets/sprites/weapons/sword_wpn.png"
                alt=""
              ></img>
            </button>
            <button
              className="w-1/2 border-2 bg-neutral-100 text-xl flex items-center justify-center gap-3"
              onClick={() => callback("INVENTORY")}
            >
              Health Potion{" "}
              <img
                src="./public/assets/sprites/potions/hp_pot.png"
                alt=""
              ></img>
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
  }
}
