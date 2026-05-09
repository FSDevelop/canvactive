import type { CanvasRenderContext, RectElement, RectOptions } from "../types.js";

const defaultRectOptions = {
  x: 0,
  y: 0,
  width: 48,
  height: 48,
  color: "#172033",
} satisfies Required<RectOptions>;

export function rect(options: RectOptions = {}): RectElement {
  return {
    layout: "absolute",
    x: options.x ?? defaultRectOptions.x,
    y: options.y ?? defaultRectOptions.y,
    width: options.width ?? defaultRectOptions.width,
    height: options.height ?? defaultRectOptions.height,
    color: options.color ?? defaultRectOptions.color,

    measure() {
      return {
        width: this.width,
        height: this.height,
      };
    },

    draw({ context }: CanvasRenderContext, overrides = {}) {
      const x = overrides.x ?? this.x;
      const y = overrides.y ?? this.y;
      const width = overrides.width ?? this.width;
      const height = overrides.height ?? this.height;

      context.fillStyle = this.color;
      context.fillRect(x, y, width, height);
    },
  };
}
