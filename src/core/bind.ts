import { createCanvas } from "./canvas.js";
import type { CanvasComponent, CanvasProject, CanvasRenderer, Observable } from "./types.js";

export function bind<T>(
  canvas: HTMLCanvasElement,
  state: Observable<T>,
  renderer: CanvasRenderer<T>,
): CanvasProject {
  const component: CanvasComponent = {
    render({ context }) {
      renderer(context, state.get());
    },
    draw(context) {
      component.render(context);
    },
    measure() {
      return { width: 0, height: 0 };
    },
  };

  return createCanvas(canvas).mount(component);
}
