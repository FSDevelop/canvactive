import { rect } from "@canvactive/elements";
import { playerX } from "../game/state";
import { world } from "../game/config";

export const player = rect({
  x: playerX.value,
  y: 190,
  width: 52,
  height: 52,
  color: "#66e3b4",
});

let direction = 1;

export function updatePlayer(delta: number, canvas: HTMLCanvasElement) {
  player.x += world.playerSpeed * direction * delta;

  if (player.x + player.width >= canvas.width - world.padding) {
    player.x = canvas.width - world.padding - player.width;
    direction = -1;
  }

  if (player.x <= world.padding) {
    player.x = world.padding;
    direction = 1;
  }

  playerX.value = player.x;
}
