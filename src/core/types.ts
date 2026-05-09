export type Unsubscribe = () => void;
export type Observer<T> = (value: T, previousValue: T) => void;
export type CanvasRenderer<T> = (context: CanvasRenderingContext2D, state: T) => void;

export interface Observable<T> {
  get(): T;
  set(nextValue: T | ((currentValue: T) => T)): void;
  subscribe(observer: Observer<T>): Unsubscribe;
}

export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

export interface CanvasComponent {
  watch?: Observable<unknown>[];
  setup?: (canvas: CanvasProject) => void | Unsubscribe;
  render: (context: CanvasRenderContext) => void;
}

export interface CanvasProject {
  render(): void;
  mount(component: CanvasComponent): CanvasProject;
  destroy(): void;
}
