import { createCanvas } from "@canvactive/core";
import Game from "./Game.can";

createCanvas("#input-canvas", {
  background: "#f4f7fb",
}).mount(Game);
