import type { CanvasComponent, CanvasProject, Unsubscribe } from "./types.js";

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
  let cleanups: Unsubscribe[] = [];

  const render = () => {
    frameId = 0;

    if (component) {
      component.render({ canvas, context });
    }
  };

  const scheduleRender = () => {
    if (frameId !== 0) {
      return;
    }

    frameId = requestAnimationFrame(render);
  };

  const cleanup = () => {
    cleanups.forEach((unsubscribe) => unsubscribe());
    cleanups = [];
  };

  return {
    render: scheduleRender,
    mount(nextComponent) {
      cleanup();
      component = nextComponent;

      nextComponent.watch?.forEach((observableState) => {
        cleanups.push(observableState.subscribe(scheduleRender));
      });

      const setupCleanup = nextComponent.setup?.(this);

      if (setupCleanup) {
        cleanups.push(setupCleanup);
      }

      render();
      return this;
    },
    destroy() {
      cleanup();

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    },
  };
}
