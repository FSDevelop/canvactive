import type {
  CanvasComponent,
  CanvasComponentConstructor,
  CanvasOptions,
  CanvasProject,
} from "./types.js";
import { createFrameLoop } from "./canvas/frame-loop.js";
import { createCanvasInteractions } from "./canvas/interactions.js";
import { CleanupScope } from "./canvas/lifecycle.js";
import { createRenderContext } from "./canvas/render-context.js";
import { resolveCanvasTarget } from "./canvas/target.js";
import { createUpdateRegistry } from "./canvas/update-registry.js";
import { engine } from "./engine.js";
import { bindKeyboardInput } from "./input.js";
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
  const updateRegistry = createUpdateRegistry();
  const setupCleanups = new CleanupScope();
  const renderCleanups = new CleanupScope();
  const runtimeCleanups = new CleanupScope();

  let component: CanvasComponent | undefined;
  let frameId = 0;
  runtimeCleanups.add(bindKeyboardInput(engine.input));
  let frameLoop = createFrameLoop({
    canvas,
    context,
    update(updateContext) {
      component?.update?.(updateContext);
      updateRegistry.update(updateContext);
    },
    render() {
      render();
    },
  });

  const render = () => {
    frameId = 0;
    renderCleanups.flush();
    interactions.reset();
    updateRegistry.reset();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = canvasOptions.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (component) {
      const renderContext = createRenderContext(
        canvas,
        context,
        interactions.register,
        updateRegistry.register,
      );

      const dependencies = collectDependencies(() => {
        component?.render(renderContext);
      });

      dependencies.forEach((dependency) => {
        renderCleanups.add(dependency.subscribe(scheduleRender));
      });
    }
  };

  const scheduleRender = () => {
    if (frameLoop.running) {
      return;
    }

    if (frameId !== 0) {
      return;
    }

    frameId = requestAnimationFrame(render);
  };

  return {
    render: scheduleRender,
    mount(nextComponent) {
      frameLoop.stop();
      setupCleanups.flush();
      renderCleanups.flush();
      component = resolveComponent(nextComponent);

      setupCleanups.add(component.setup?.(this));

      render();
      frameLoop.start();

      return this;
    },
    destroy() {
      frameLoop.stop();
      setupCleanups.flush();
      renderCleanups.flush();
      runtimeCleanups.flush();
      interactions.destroy();

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    },
  };
}

function resolveComponent(component: CanvasComponent | CanvasComponentConstructor): CanvasComponent {
  return typeof component === "function" ? new component() : component;
}
