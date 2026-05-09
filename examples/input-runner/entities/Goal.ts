import type { CanvasRenderContext } from "@canvactive/core";
import { rect } from "@canvactive/elements";

const body = rect({
  x: 560,
  y: 210,
  width: 34,
  height: 34,
  color: "#f59e0b",
});

const Goal = {
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

  move() {
    body.x = 80 + Math.random() * 600;
    body.y = 120 + Math.random() * 240;
  },

  draw(context: CanvasRenderContext) {
    body.draw(context);
  },

  measure(context: CanvasRenderContext) {
    return body.measure(context);
  },
};

export default Goal;
