import type { Unsubscribe } from "./types.js";

export interface InputState {
  down(key: string): boolean;
  pressed(key: string): boolean;
  released(key: string): boolean;
  anyDown(...keys: string[]): boolean;
}

export interface RuntimeInputState extends InputState {
  flush(): void;
}

interface KeyboardInputState extends RuntimeInputState {
  handleKeyDown(event: KeyboardEvent): void;
  handleKeyUp(event: KeyboardEvent): void;
}

const aliases = new Map([
  ["Left", "ArrowLeft"],
  ["Right", "ArrowRight"],
  ["Up", "ArrowUp"],
  ["Down", "ArrowDown"],
  ["Space", " "],
]);

const defaultPreventedKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "]);

export function createInputState(): RuntimeInputState {
  const downKeys = new Set<string>();
  const pressedKeys = new Set<string>();
  const releasedKeys = new Set<string>();

  const normalize = (key: string) => aliases.get(key) ?? key;

  const input: KeyboardInputState = {
    down(key) {
      return downKeys.has(normalize(key));
    },

    pressed(key) {
      return pressedKeys.has(normalize(key));
    },

    released(key) {
      return releasedKeys.has(normalize(key));
    },

    anyDown(...keys) {
      return keys.some((key) => downKeys.has(normalize(key)));
    },

    flush() {
      pressedKeys.clear();
      releasedKeys.clear();
    },

    handleKeyDown(event: KeyboardEvent) {
      const key = normalize(event.key);
      preventGameKeyDefault(event, key);

      if (!downKeys.has(key)) {
        pressedKeys.add(key);
      }

      downKeys.add(key);
    },

    handleKeyUp(event: KeyboardEvent) {
      const key = normalize(event.key);
      preventGameKeyDefault(event, key);
      downKeys.delete(key);
      releasedKeys.add(key);
    },
  };

  return input;
}

export function bindKeyboardInput(input: RuntimeInputState): Unsubscribe {
  const keyboardInput = input as KeyboardInputState;

  const handleKeyDown = (event: KeyboardEvent) => {
    keyboardInput.handleKeyDown(event);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keyboardInput.handleKeyUp(event);
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}

function preventGameKeyDefault(event: KeyboardEvent, key: string) {
  if (defaultPreventedKeys.has(key)) {
    event.preventDefault();
  }
}
