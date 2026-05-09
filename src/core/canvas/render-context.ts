import type {
  CanvasComponent,
  CanvasDrawable,
  CanvasElement,
  CanvasElementConstructor,
  CanvasElementOverrides,
  CanvasRenderContext,
  InteractiveCanvasElement,
} from "../types.js";

const componentInstances = new WeakMap<CanvasElementConstructor, CanvasElement>();

export function createRenderContext(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  registerInteractiveElement: (element: InteractiveCanvasElement) => void,
  registerUpdateableElement: (element: CanvasElement) => void,
): CanvasRenderContext {
  const flow = {
    x: 0,
    y: 0,
  };

  const renderContext = {
    canvas,
    context,
    draw(drawable, overrides) {
      const element = resolveElement(drawable);
      const resolvedOverrides = resolveDrawOverrides(element, flow, overrides);

      element.draw(renderContext, resolvedOverrides);

      if (!overrides && element.layout !== "absolute") {
        flow.y += element.measure(renderContext).height;
      }

      if (isInteractiveElement(element)) {
        registerInteractiveElement(element);
      }

      if (element.update) {
        registerUpdateableElement(element);
      }
    },
  } satisfies Parameters<CanvasComponent["render"]>[0];

  return renderContext;
}

function resolveElement(drawable: CanvasDrawable): CanvasElement {
  if (typeof drawable !== "function") {
    return drawable;
  }

  const cachedElement = componentInstances.get(drawable);

  if (cachedElement) {
    return cachedElement;
  }

  const element = new drawable();
  componentInstances.set(drawable, element);
  return element;
}

function resolveDrawOverrides(
  element: CanvasElement,
  flow: Pick<CanvasElementOverrides, "x" | "y">,
  overrides: CanvasElementOverrides | undefined,
): CanvasElementOverrides | undefined {
  if (overrides || element.layout === "absolute") {
    return overrides;
  }

  return {
    x: flow.x,
    y: flow.y,
  };
}

function isInteractiveElement(element: CanvasElement): element is InteractiveCanvasElement {
  const possibleElement = element as Partial<InteractiveCanvasElement>;

  return typeof possibleElement.hitTest === "function" && typeof possibleElement.click === "function";
}
