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
  draw(element: CanvasElement, overrides?: CanvasElementOverrides): void;
}

export interface CanvasElementOverrides {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CanvasElement {
  draw(context: CanvasRenderContext, overrides?: CanvasElementOverrides): void;
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

export interface CanvasOptions {
  background?: string;
}

export interface CanvasComponent {
  setup?: (canvas: CanvasProject) => void | Unsubscribe;
  render: (context: CanvasRenderContext) => void;
}

export interface CanvasProject {
  render(): void;
  mount(component: CanvasComponent): CanvasProject;
  destroy(): void;
}
