"use client";

import React from "react";

type HeartInstance = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  createdAt: number;
};

const HEART_LIFETIME_MS = 850;
const MAX_HEARTS = 40;
const SPAWN_THROTTLE_MS = 40;

export function CursorHearts() {
  const [hearts, setHearts] = React.useState<HeartInstance[]>([]);
  const lastSpawnRef = React.useRef(0);
  const idRef = React.useRef(0);

  // Spawn hearts on pointer move with throttling
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < SPAWN_THROTTLE_MS) return;
      lastSpawnRef.current = now;

      const { clientX, clientY } = event;

      setHearts((prev) => {
        const id = ++idRef.current;
        const size = 14 + Math.random() * 20; // subtle size range
        const rotation = Math.random() * 360;
        const createdAt = now;

        const next: HeartInstance[] = [
          ...prev,
          { id, x: clientX, y: clientY, size, rotation, createdAt },
        ];

        if (next.length > MAX_HEARTS) {
          return next.slice(next.length - MAX_HEARTS);
        }

        return next;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  // Cleanup old hearts
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = window.setInterval(() => {
      const now = performance.now();
      setHearts((prev) => prev.filter((heart) => now - heart.createdAt < HEART_LIFETIME_MS));
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  if (hearts.length === 0) return null;

  return (
    <div className="cursor-heart-layer" aria-hidden="true">
      {hearts.map((heart) => {
        const style: React.CSSProperties = {
          left: heart.x,
          top: heart.y,
          width: heart.size,
          height: heart.size,
          transform: `translate(-50%, -50%) rotate(${heart.rotation}deg)`,
        };

        return <div key={heart.id} className="cursor-heart cursor-heart--fade" style={style} />;
      })}
    </div>
  );
}

