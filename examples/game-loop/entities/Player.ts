import type { CanvasRenderContext, CanvasUpdateContext } from "@canvactive/core";
import { rect } from "@canvactive/elements";
import { playerX } from "../game/state";
import { world } from "../game/config";

const player = rect({
  x: playerX.value,
  y: 190,
  width: 52,
  height: 52,
  color: "#66e3b4",
});

let direction = 1;

const Player = {
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

    playerX.value = player.x;
  },

  draw(context: CanvasRenderContext) {
    player.draw(context);
  },

  measure(context: CanvasRenderContext) {
    return player.measure(context);
  },
};

export default Player;
