import type { CanvasUpdateContext } from "./types.js";

export interface EngineContext {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  delta: number;
  elapsed: number;
  frame: number;
}

export const engine: EngineContext = {
  delta: 0,
  elapsed: 0,
  frame: 0,
};

export function updateEngineContext(context: CanvasUpdateContext): void {
  engine.canvas = context.canvas;
  engine.context = context.context;
  engine.delta = context.delta;
  engine.elapsed = context.elapsed;
  engine.frame = context.frame;
}
