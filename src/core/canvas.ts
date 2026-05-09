import type {
  CanvasComponent,
  CanvasOptions,
  CanvasProject,
} from "./types.js";
import { createCanvasInteractions } from "./canvas/interactions.js";
import { CleanupScope } from "./canvas/lifecycle.js";
import { createRenderContext } from "./canvas/render-context.js";
import { resolveCanvasTarget } from "./canvas/target.js";
import { collectDependencies } from "./tracking.js";

const defaultCanvasOptions = {
  background: "#f6f7fb",
} satisfies Required<CanvasOptions>;

export function createCanvas(
  selector: string | HTMLCanvasElement,
  options: CanvasOptions = {},
): CanvasProject {
  const canvasOptions = {
    ...defaultCanvasOptions,
    ...options,
  };
  const { canvas, context } = resolveCanvasTarget(selector);
  const interactions = createCanvasInteractions(canvas);
  const setupCleanups = new CleanupScope();
  const renderCleanups = new CleanupScope();

  let component: CanvasComponent | undefined;
  let frameId = 0;

  const render = () => {
    frameId = 0;
    renderCleanups.flush();
    interactions.reset();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = canvasOptions.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (component) {
      const renderContext = createRenderContext(canvas, context, interactions.register);

      const dependencies = collectDependencies(() => {
        component?.render(renderContext);
      });

      dependencies.forEach((dependency) => {
        renderCleanups.add(dependency.subscribe(scheduleRender));
      });
    }
  };

  const scheduleRender = () => {
    if (frameId !== 0) {
      return;
    }

    frameId = requestAnimationFrame(render);
  };

  return {
    render: scheduleRender,
    mount(nextComponent) {
      setupCleanups.flush();
      renderCleanups.flush();
      component = nextComponent;

      setupCleanups.add(nextComponent.setup?.(this));

      render();
      return this;
    },
    destroy() {
      setupCleanups.flush();
      renderCleanups.flush();
      interactions.destroy();

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    },
  };
}
