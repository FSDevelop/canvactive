import type {
  CanvasComponent,
  CanvasElement,
  CanvasElementOverrides,
  CanvasRenderContext,
  InteractiveCanvasElement,
} from "../types.js";

export function createRenderContext(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  registerInteractiveElement: (element: InteractiveCanvasElement) => void,
): CanvasRenderContext {
  const flow = {
    x: 0,
    y: 0,
  };

  const renderContext = {
    canvas,
    context,
    draw(element, overrides) {
      const resolvedOverrides = resolveDrawOverrides(flow, overrides);

      element.draw(renderContext, resolvedOverrides);

      if (!overrides) {
        flow.y += element.measure(renderContext).height;
      }

      if (isInteractiveElement(element)) {
        registerInteractiveElement(element);
      }
    },
  } satisfies Parameters<CanvasComponent["render"]>[0];

  return renderContext;
}

function resolveDrawOverrides(
  flow: Pick<CanvasElementOverrides, "x" | "y">,
  overrides: CanvasElementOverrides | undefined,
): CanvasElementOverrides {
  return overrides ?? {
    x: flow.x,
    y: flow.y,
  };
}

function isInteractiveElement(element: CanvasElement): element is InteractiveCanvasElement {
  const possibleElement = element as Partial<InteractiveCanvasElement>;

  return typeof possibleElement.hitTest === "function" && typeof possibleElement.click === "function";
}
