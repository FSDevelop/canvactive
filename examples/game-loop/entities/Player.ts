import type { CanvasRenderContext, CanvasUpdateContext } from "@canvactive/core";
import { rect } from "@canvactive/elements";
import { world } from "../game/config";

const player = rect({
  x: 40,
  y: 190,
  width: 52,
  height: 52,
  color: "#66e3b4",
});

let direction = 1;

const Player = {
  get x() {
    return player.x;
  },

  get y() {
    return player.y;
  },

  update(context: CanvasUpdateContext) {
    player.x += world.playerSpeed * direction * context.delta;

    if (player.x + player.width >= context.canvas.width - world.padding) {
      player.x = context.canvas.width - world.padding - player.width;
      direction = -1;
    }

    if (player.x <= world.padding) {
      player.x = world.padding;
      direction = 1;
    }
  },

  draw(context: CanvasRenderContext) {
    player.draw(context);
  },

  measure(context: CanvasRenderContext) {
    return player.measure(context);
  },
};

export default Player;
