import type {
  CanvasComponent,
  CanvasElement,
  CanvasOptions,
  CanvasPoint,
  CanvasProject,
  InteractiveCanvasElement,
  Unsubscribe,
} from "./types.js";
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
  let interactiveElements: InteractiveCanvasElement[] = [];

  const render = () => {
    frameId = 0;
    cleanupRenderSubscriptions();
    interactiveElements = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = canvasOptions.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (component) {
      const renderContext = {
        canvas,
        context,
        draw(element, overrides) {
          element.draw(renderContext, overrides);

          if (isInteractiveElement(element)) {
            interactiveElements.push(element);
          }
        },
      } satisfies Parameters<CanvasComponent["render"]>[0];

      const dependencies = collectDependencies(() => {
        component?.render(renderContext);
      });

      dependencies.forEach((dependency) => {
        renderCleanups.push(dependency.subscribe(scheduleRender));
      });
    }
  };

  const getCanvasPoint = (event: MouseEvent): CanvasPoint => {
    const bounds = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const findInteractiveElement = (point: CanvasPoint) => {
    for (let index = interactiveElements.length - 1; index >= 0; index -= 1) {
      const element = interactiveElements[index];

      if (element.hitTest(point)) {
        return element;
      }
    }

    return undefined;
  };

  const handlePointerMove = (event: PointerEvent) => {
    canvas.style.cursor = findInteractiveElement(getCanvasPoint(event)) ? "pointer" : "";
  };

  const handlePointerLeave = () => {
    canvas.style.cursor = "";
  };

  const handleClick = (event: PointerEvent) => {
    findInteractiveElement(getCanvasPoint(event))?.click();
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

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("click", handleClick);

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
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
      canvas.style.cursor = "";

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    },
  };
}

function isInteractiveElement(element: CanvasElement): element is InteractiveCanvasElement {
  const possibleElement = element as Partial<InteractiveCanvasElement>;

  return typeof possibleElement.hitTest === "function" && typeof possibleElement.click === "function";
}
