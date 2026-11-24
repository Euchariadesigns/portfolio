"use client";

import { useState } from "react";
import { play } from "@/lib/sound";

/*
  Eucharia's picture above her name, as on Bimanshu's page (and where it sat
  on her Framer portfolio), with a perforated edge. Slightly tilted; it
  straightens when you point at it and wiggles when tapped.
*/
export default function Stamp() {
  const [k, setK] = useState(0);
  return (
    <button
      type="button"
      key={k}
      className={`av${k ? " is-tapped" : ""}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && play("tick")}
      onClick={() => {
        setK((v) => v + 1);
        play("tick");
      }}
      aria-label="Eucharia's photo"
    >
      <span className="av-paper">
        <img src="/me/stamp.webp" alt="Eucharia Odili" width={480} height={602} />
      </span>
    </button>
  );
}
