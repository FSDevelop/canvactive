export type Unsubscribe = () => void;
export type Observer<T> = (value: T, previousValue: T) => void;
export type CanvasRenderer<T> = (context: CanvasRenderingContext2D, state: T) => void;

export interface Observable<T> {
  value: T;
  get(): T;
  set(nextValue: T | ((currentValue: T) => T)): void;
  subscribe(observer: Observer<T>): Unsubscribe;
  toString(): string;
}

export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  draw(element: CanvasDrawable, overrides?: CanvasElementOverrides): void;
}

export interface CanvasElementOverrides {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CanvasElement {
  layout?: "flow" | "absolute";
  draw(context: CanvasRenderContext, overrides?: CanvasElementOverrides): void;
  measure(context: CanvasRenderContext): CanvasElementSize;
  update?: (context: CanvasUpdateContext) => void;
}

export interface CanvasElementConstructor<T extends CanvasElement = CanvasElement> {
  new (...args: unknown[]): T;
}

export type CanvasDrawable = CanvasElement | CanvasElementConstructor;

export interface CanvasElementSize {
  width: number;
  height: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface InteractiveCanvasElement extends CanvasElement {
  hitTest(point: CanvasPoint): boolean;
  click(): void;
}

export type TextValue = string | Observable<unknown> | (() => string);

export interface TextOptions extends CanvasElementOverrides {
  value?: TextValue;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

export interface TextElement extends CanvasElement {
  set(value: TextValue): TextElement;
}

export interface ButtonOptions extends CanvasElementOverrides {
  label?: string;
  onClick?: () => void;
  background?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  radius?: number;
}

export interface ButtonElement extends InteractiveCanvasElement {
  setLabel(label: string): ButtonElement;
  onClick(handler: () => void): ButtonElement;
}

export interface RectOptions extends CanvasElementOverrides {
  color?: string;
}

export interface RectElement extends CanvasElement {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CanvasOptions {
  background?: string;
}

export interface CanvasUpdateContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  delta: number;
  elapsed: number;
  frame: number;
  input: import("./input.js").InputState;
}

export interface CanvasComponent extends CanvasElement {
  onClick?: () => void;
  setup?: (canvas: CanvasProject) => void | Unsubscribe;
  render: (context: CanvasRenderContext) => void;
}

export interface CanvasComponentConstructor {
  new (...args: unknown[]): CanvasComponent;
}

export interface CanvasProject {
  render(): void;
  mount(component: CanvasComponent | CanvasComponentConstructor): CanvasProject;
  destroy(): void;
}
