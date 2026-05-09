import { observable } from "@canvactive/core";
import type { Entity } from "../entities/types";

export const entities = observable<Entity[]>([]);
export const batches = observable(0);

export function addEntities(nextEntities: Entity[]) {
  entities.value = [...entities.value, ...nextEntities];
  batches.value++;
}

export function clearEntities() {
  entities.value = [];
  batches.value = 0;
}
