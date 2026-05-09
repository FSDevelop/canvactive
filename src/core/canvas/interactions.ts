import type { CanvasPoint, InteractiveCanvasElement, Unsubscribe } from "../types.js";

export interface CanvasInteractions {
  register(element: InteractiveCanvasElement): void;
  reset(): void;
  destroy(): void;
}

export function createCanvasInteractions(canvas: HTMLCanvasElement): CanvasInteractions {
  let interactiveElements: InteractiveCanvasElement[] = [];

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
    canvas.style.cursor = findInteractiveElement(getCanvasPoint(canvas, event)) ? "pointer" : "";
  };

  const handlePointerLeave = () => {
    canvas.style.cursor = "";
  };

  const handleClick = (event: PointerEvent) => {
    findInteractiveElement(getCanvasPoint(canvas, event))?.click();
  };

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("click", handleClick);

  return {
    register(element) {
      interactiveElements.push(element);
    },

    reset() {
      interactiveElements = [];
    },

    destroy() {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
      canvas.style.cursor = "";
    },
  };
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: MouseEvent): CanvasPoint {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
    y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
  };
}
