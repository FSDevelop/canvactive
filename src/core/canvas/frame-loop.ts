import type { CanvasUpdateContext } from "../types.js";
import { updateEngineContext } from "../engine.js";

export interface FrameLoop {
  start(): void;
  stop(): void;
  get running(): boolean;
}

export interface FrameLoopOptions {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  update(context: CanvasUpdateContext): void;
  render(): void;
}

export function createFrameLoop(options: FrameLoopOptions): FrameLoop {
  let frameId = 0;
  let frame = 0;
  let startedAt = 0;
  let previousTime = 0;
  let running = false;

  const tick = (time: number) => {
    if (!running) {
      return;
    }

    if (startedAt === 0) {
      startedAt = time;
      previousTime = time;
    }

    const delta = (time - previousTime) / 1000;
    const elapsed = (time - startedAt) / 1000;

    previousTime = time;
    frame += 1;

    const context = {
      canvas: options.canvas,
      context: options.context,
      delta,
      elapsed,
      frame,
    };

    updateEngineContext(context);
    options.update(context);
    options.render();

    frameId = requestAnimationFrame(tick);
  };

  return {
    get running() {
      return running;
    },

    start() {
      if (running) {
        return;
      }

      running = true;
      frameId = requestAnimationFrame(tick);
    },

    stop() {
      running = false;

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    },
  };
}
