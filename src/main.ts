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

export function observable<T>(initialValue: T): Observable<T> {
  let value = initialValue;
  const observers = new Set<Observer<T>>();

  return {
    get() {
      return value;
    },

    set(nextValue) {
      const previousValue = value;
      value =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(value)
          : nextValue;

      if (Object.is(value, previousValue)) {
        return;
      }

      observers.forEach((observer) => observer(value, previousValue));
    },

    subscribe(observer) {
      observers.add(observer);

      return () => {
        observers.delete(observer);
      };
    },
  };
}

export function createCanvas(selector: string | HTMLCanvasElement): CanvasProject {
  const canvas =
    typeof selector === "string"
      ? document.querySelector<HTMLCanvasElement>(selector)
      : selector;

  if (!canvas) {
    throw new Error(`Canvas target "${selector}" was not found.`);
  }

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a 2D canvas context.");
  }

  let component: CanvasComponent | undefined;
  let frameId = 0;
  let cleanups: Unsubscribe[] = [];

  const render = () => {
    frameId = 0;

    if (component) {
      component.render({ canvas, context });
    }
  };

  const scheduleRender = () => {
    if (frameId !== 0) {
      return;
    }

    frameId = requestAnimationFrame(render);
  };

  const cleanup = () => {
    cleanups.forEach((unsubscribe) => unsubscribe());
    cleanups = [];
  };

  return {
    render: scheduleRender,
    mount(nextComponent) {
      cleanup();
      component = nextComponent;

      nextComponent.watch?.forEach((observableState) => {
        cleanups.push(observableState.subscribe(scheduleRender));
      });

      const setupCleanup = nextComponent.setup?.(this);

      if (setupCleanup) {
        cleanups.push(setupCleanup);
      }

      render();
      return this;
    },
    destroy() {
      cleanup();

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    },
  };
}

export function bind<T>(
  canvas: HTMLCanvasElement,
  state: Observable<T>,
  renderer: CanvasRenderer<T>,
): CanvasProject {
  return createCanvas(canvas).mount({
    watch: [state as Observable<unknown>],
    render({ context }) {
      renderer(context, state.get());
    },
  });
}
