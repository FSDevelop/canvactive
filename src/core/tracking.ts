import type { Observable } from "./types.js";

type DependencySet = Set<Observable<unknown>>;

const trackingStack: DependencySet[] = [];

export function trackDependency(dependency: Observable<unknown>): void {
  trackingStack[trackingStack.length - 1]?.add(dependency);
}

export function collectDependencies(callback: () => void): DependencySet {
  const dependencies: DependencySet = new Set();
  trackingStack.push(dependencies);

  try {
    callback();
  } finally {
    trackingStack.pop();
  }

  return dependencies;
}
