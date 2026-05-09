import type { CanvasRenderContext, TextElement, TextOptions, TextValue } from "../types.js";

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
} satisfies Required<Omit<TextOptions, "width" | "height">>;

export function text(valueOrOptions: TextValue | TextOptions = {}): TextElement {
  const options = normalizeTextOptions(valueOrOptions);
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
      context.fillText(resolveTextValue(currentValue), x, y);
    },
  };
}

function normalizeTextOptions(valueOrOptions: TextValue | TextOptions): TextOptions {
  if (isTextOptions(valueOrOptions)) {
    return valueOrOptions;
  }

  return {
    value: valueOrOptions,
  };
}

function isTextOptions(valueOrOptions: TextValue | TextOptions): valueOrOptions is TextOptions {
  return (
    typeof valueOrOptions === "object" &&
    valueOrOptions !== null &&
    !("get" in valueOrOptions) &&
    !("subscribe" in valueOrOptions)
  );
}

function resolveTextValue(value: TextValue): string {
  return typeof value === "function" ? value() : String(value);
}
