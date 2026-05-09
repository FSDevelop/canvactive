import type { CanvasComponent, CanvasProject, Unsubscribe } from "./types.js";
import { collectDependencies } from "./tracking.js";

export function createCanvas(selector: string | HTMLCanvasElement): CanvasProject {
  const canvas =
    typeof selector === "string"
      ? document.querySelector<HTMLCanvasElement>(selector)
      : selector;

  if (!canvas) {
    throw new Error(`Canvas target "${selector}" was not found.`);
  }

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a 2D canvas context.");
  }

  let component: CanvasComponent | undefined;
  let frameId = 0;
  let setupCleanups: Unsubscribe[] = [];
  let renderCleanups: Unsubscribe[] = [];

  const render = () => {
    frameId = 0;
    cleanupRenderSubscriptions();

    if (component) {
      const dependencies = collectDependencies(() => {
        component?.render({ canvas, context });
      });

      dependencies.forEach((dependency) => {
        renderCleanups.push(dependency.subscribe(scheduleRender));
      });
    }
  };

  const scheduleRender = () => {
    if (frameId !== 0) {
      return;
    }

    frameId = requestAnimationFrame(render);
  };

  const cleanupSetup = () => {
    setupCleanups.forEach((unsubscribe) => unsubscribe());
    setupCleanups = [];
  };

  const cleanupRenderSubscriptions = () => {
    renderCleanups.forEach((unsubscribe) => unsubscribe());
    renderCleanups = [];
  };

  return {
    render: scheduleRender,
    mount(nextComponent) {
      cleanupSetup();
      cleanupRenderSubscriptions();
      component = nextComponent;

      const setupCleanup = nextComponent.setup?.(this);

      if (setupCleanup) {
        setupCleanups.push(setupCleanup);
      }

      render();
      return this;
    },
    destroy() {
      cleanupSetup();
      cleanupRenderSubscriptions();

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    },
  };
}
