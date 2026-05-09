import { createCanvas } from "@canvactive/core";
import Game from "./Game.can";

createCanvas("#game-canvas", {
  background: "#101722",
}).mount(Game);
