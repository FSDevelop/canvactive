import type { CanvasElement, CanvasUpdateContext } from "../types.js";

export interface UpdateRegistry {
  register(element: CanvasElement): void;
  update(context: CanvasUpdateContext): void;
  reset(): void;
}

export function createUpdateRegistry(): UpdateRegistry {
  let elements: CanvasElement[] = [];

  return {
    register(element) {
      if (element.update && !elements.includes(element)) {
        elements.push(element);
      }
    },

    update(context) {
      elements.forEach((element) => element.update?.(context));
    },

    reset() {
      elements = [];
    },
  };
}
