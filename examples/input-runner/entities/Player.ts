import { engine, type CanvasRenderContext, type CanvasUpdateContext } from "@canvactive/core";
import { rect } from "@canvactive/elements";

const body = rect({
  x: 64,
  y: 190,
  width: 42,
  height: 42,
  color: "#2563eb",
});

const speed = 220;

const Player = {
  get x() {
    return body.x;
  },

  get y() {
    return body.y;
  },

  get width() {
    return body.width;
  },

  get height() {
    return body.height;
  },

  update({ canvas, delta }: CanvasUpdateContext) {
    const input = engine.input;
    const horizontal =
      Number(input.anyDown("ArrowRight", "d", "D")) -
      Number(input.anyDown("ArrowLeft", "a", "A"));
    const vertical =
      Number(input.anyDown("ArrowDown", "s", "S")) -
      Number(input.anyDown("ArrowUp", "w", "W"));

    body.x = clamp(body.x + horizontal * speed * delta, 24, canvas.width - body.width - 24);
    body.y = clamp(body.y + vertical * speed * delta, 86, canvas.height - body.height - 24);
  },

  draw(context: CanvasRenderContext) {
    body.draw(context);
  },

  measure(context: CanvasRenderContext) {
    return body.measure(context);
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default Player;
