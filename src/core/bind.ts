import { createCanvas } from "./canvas.js";
import type { CanvasProject, CanvasRenderer, Observable } from "./types.js";

export function bind<T>(
  canvas: HTMLCanvasElement,
  state: Observable<T>,
  renderer: CanvasRenderer<T>,
): CanvasProject {
  return createCanvas(canvas).mount({
    watch: [state as Observable<unknown>],
    render({ context }) {
      renderer(context, state.get());
    },
  });
}
