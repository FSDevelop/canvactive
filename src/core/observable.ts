import type { Observable, Observer } from "./types.js";
import { trackDependency } from "./tracking.js";

export function observable<T>(initialValue: T): Observable<T> {
  let value = initialValue;
  const observers = new Set<Observer<T>>();

  const state: Observable<T> = {
    get value() {
      return this.get();
    },

    set value(nextValue) {
      this.set(nextValue);
    },

    get() {
      trackDependency(state as Observable<unknown>);
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

    toString() {
      return String(this.get());
    },
  };

  return state;
}
