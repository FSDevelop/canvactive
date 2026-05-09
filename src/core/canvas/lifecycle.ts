import type { Unsubscribe } from "../types.js";

export class CleanupScope {
  #cleanups: Unsubscribe[] = [];

  add(cleanup: Unsubscribe | void): void {
    if (cleanup) {
      this.#cleanups.push(cleanup);
    }
  }

  flush(): void {
    this.#cleanups.forEach((cleanup) => cleanup());
    this.#cleanups = [];
  }
}
