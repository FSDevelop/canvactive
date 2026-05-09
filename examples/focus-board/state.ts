import { observable } from "@canvactive/core";

export const sessions = observable(3);
export const breaks = observable(1);
export const streak = observable(5);

export function resetBoard() {
  sessions.value = 0;
  breaks.value = 0;
  streak.value = 0;
}
