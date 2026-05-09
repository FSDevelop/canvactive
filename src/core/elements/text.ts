import type { CanvasRenderContext, TextElement, TextOptions, TextValue } from "../types.js";

const defaultTextOptions = {
  value: "",
  x: 0,
  y: 0,
  color: "#172033",
  fontFamily: "system-ui, sans-serif",
  fontSize: 40,
  fontWeight: 600,
  align: "left",
  baseline: "top",
} satisfies Required<Omit<TextOptions, "width" | "height">>;

export function text(valueOrOptions: TextValue | TextOptions = {}): TextElement {
  const options = normalizeTextOptions(valueOrOptions);
  let currentValue = options.value ?? defaultTextOptions.value;

  const elementOptions = {
    ...defaultTextOptions,
    ...options,
  };

  return {
    layout: "flow",

    set(nextValue) {
      currentValue = nextValue;
      return this;
    },

    measure({ context }) {
      applyTextStyles(context, elementOptions);

      return {
        width: context.measureText(resolveTextValue(currentValue)).width,
        height: elementOptions.fontSize,
      };
    },

    draw({ context }: CanvasRenderContext, overrides = {}) {
      const x = overrides.x ?? elementOptions.x;
      const y = overrides.y ?? elementOptions.y;

      applyTextStyles(context, elementOptions);
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

function applyTextStyles(
  context: CanvasRenderingContext2D,
  options: Required<Pick<
    TextOptions,
    "color" | "fontFamily" | "fontSize" | "fontWeight" | "align" | "baseline"
  >>,
) {
  context.fillStyle = options.color;
  context.font = `${options.fontWeight} ${options.fontSize}px ${options.fontFamily}`;
  context.textAlign = options.align;
  context.textBaseline = options.baseline;
}
