import type { CanvasRenderContext, TextElement, TextOptions } from "../types.js";

const defaultTextOptions = {
  value: "",
  x: 0,
  y: 0,
  color: "#172033",
  fontFamily: "system-ui, sans-serif",
  fontSize: 40,
  fontWeight: 600,
  align: "center",
  baseline: "middle",
} satisfies Required<TextOptions>;

export function text(options: TextOptions = {}): TextElement {
  let currentValue = options.value ?? defaultTextOptions.value;

  const elementOptions = {
    ...defaultTextOptions,
    ...options,
  };

  return {
    set(nextValue) {
      currentValue = nextValue;
      return this;
    },

    draw({ context }: CanvasRenderContext, overrides = {}) {
      const x = overrides.x ?? elementOptions.x;
      const y = overrides.y ?? elementOptions.y;

      context.fillStyle = elementOptions.color;
      context.font = `${elementOptions.fontWeight} ${elementOptions.fontSize}px ${elementOptions.fontFamily}`;
      context.textAlign = elementOptions.align;
      context.textBaseline = elementOptions.baseline;
      context.fillText(currentValue, x, y);
    },
  };
}
