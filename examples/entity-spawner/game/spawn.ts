import type { CanvasUpdateContext } from "@canvactive/core";
import { createEntity } from "../entities/EntityFactory";
import { addEntities } from "./state";

const colors = ["#2563eb", "#0f766e", "#f59e0b", "#db2777", "#7c3aed"];

export function spawnBatch(context: CanvasUpdateContext, amount = 12) {
  const spawned = Array.from({ length: amount }, (_, index) =>
    createEntity({
      x: 120 + Math.random() * (context.canvas.width - 180),
      y: 150 + Math.random() * (context.canvas.height - 200),
      size: 12 + Math.random() * 18,
      color: colors[index % colors.length],
      velocityX: -80 + Math.random() * 160,
      velocityY: -70 + Math.random() * 140,
    }),
  );

  addEntities(spawned);
}
