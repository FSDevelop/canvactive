import { createCanvas } from "@canvactive/core";
import Game from "./Game.can";

createCanvas("#spawner-canvas", {
  background: "#f7f9fc",
}).mount(Game);
