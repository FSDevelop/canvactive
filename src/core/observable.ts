import type { Observable, Observer } from "./types.js";

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
