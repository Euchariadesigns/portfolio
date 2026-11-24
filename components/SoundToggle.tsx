"use client";

import { useEffect, useState } from "react";
import { initSound, isSoundOn, onSoundChange, play, setSound } from "@/lib/sound";

export default function SoundToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const off = onSoundChange(setOn);
    initSound();
    setOn(isSoundOn());
    return off;
  }, []);

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={on}
      aria-label={on ? "Turn interface sounds off" : "Turn interface sounds on"}
      onClick={() => {
        const next = !on;
        setSound(next);
        if (next) requestAnimationFrame(() => play("tick"));
      }}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path className="spk" d="M3.5 8v4h3l4 3.2V4.8l-4 3.2h-3Z" />
        <path className={`wave w1${on ? "" : " off"}`} d="M13.2 8a2.8 2.8 0 0 1 0 4" />
        <path className={`wave w2${on ? "" : " off"}`} d="M15.4 6a5.6 5.6 0 0 1 0 8" />
        <path className={`mute${on ? "" : " show"}`} d="M13.5 8.2 17 11.8M17 8.2l-3.5 3.6" />
      </svg>
    </button>
  );
}
