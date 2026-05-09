export interface CanvasTarget {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

export function resolveCanvasTarget(selector: string | HTMLCanvasElement): CanvasTarget {
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

  return {
    canvas,
    context,
  };
}
