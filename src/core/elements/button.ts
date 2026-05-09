import type {
  ButtonElement,
  ButtonOptions,
  CanvasPoint,
  CanvasRenderContext,
} from "../types.js";

const defaultButtonOptions = {
  label: "Button",
  x: 0,
  y: 0,
  width: 180,
  height: 44,
  background: "#172033",
  color: "#ffffff",
  fontFamily: "system-ui, sans-serif",
  fontSize: 16,
  fontWeight: 600,
  radius: 6,
  onClick: () => undefined,
} satisfies Required<ButtonOptions>;

export function button(options: ButtonOptions = {}): ButtonElement {
  let label = options.label ?? defaultButtonOptions.label;
  let clickHandler = options.onClick ?? (() => undefined);
  let bounds = {
    x: options.x ?? defaultButtonOptions.x,
    y: options.y ?? defaultButtonOptions.y,
    width: options.width ?? defaultButtonOptions.width,
    height: options.height ?? defaultButtonOptions.height,
  };

  const elementOptions = {
    ...defaultButtonOptions,
    ...options,
  };

  return {
    layout: "flow",

    setLabel(nextLabel) {
      label = nextLabel;
      return this;
    },

    onClick(handler) {
      clickHandler = handler;
      return this;
    },

    measure() {
      return {
        width: elementOptions.width,
        height: elementOptions.height,
      };
    },

    hitTest(point: CanvasPoint) {
      return (
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
      );
    },

    click() {
      clickHandler();
    },

    draw({ context }: CanvasRenderContext, overrides = {}) {
      bounds = {
        x: overrides.x ?? elementOptions.x,
        y: overrides.y ?? elementOptions.y,
        width: overrides.width ?? elementOptions.width,
        height: overrides.height ?? elementOptions.height,
      };

      context.fillStyle = elementOptions.background;
      drawRoundedRect(context, bounds.x, bounds.y, bounds.width, bounds.height, elementOptions.radius);
      context.fill();

      context.fillStyle = elementOptions.color;
      context.font = `${elementOptions.fontWeight} ${elementOptions.fontSize}px ${elementOptions.fontFamily}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    },
  };
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const resolvedRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + resolvedRadius, y);
  context.lineTo(x + width - resolvedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + resolvedRadius);
  context.lineTo(x + width, y + height - resolvedRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - resolvedRadius, y + height);
  context.lineTo(x + resolvedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - resolvedRadius);
  context.lineTo(x, y + resolvedRadius);
  context.quadraticCurveTo(x, y, x + resolvedRadius, y);
  context.closePath();
}
