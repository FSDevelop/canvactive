import Entity from "./Entity.can";

export interface EntityOptions {
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
}

export function createEntity(options: EntityOptions) {
  return new Entity(options);
}
