# Canvactive

Reactive canvas components with a small `.can` single-file component format.

Canvactive is early-stage. The current API focuses on:

- reactive state with `observable`
- canvas project mounting with `createCanvas`
- drawable `.can` components
- canvas-native elements like `text` and `button`
- Vite compilation for `.can` files

## Usage

Create a canvas in HTML:

```html
<canvas id="app" width="760" height="420"></canvas>
<script type="module" src="./main.ts"></script>
```

Mount a `.can` component:

```ts
import { createCanvas } from "@canvactive/core";
import Canvas from "./Canvas.can";

createCanvas("#app", {
  background: "#eef2f8",
}).mount(Canvas);
```

## Vite

Use the Vite plugin to compile `.can` files:

```ts
import { defineConfig } from "vite";
import { canvactive } from "canvactive/vite";

export default defineConfig({
  plugins: [canvactive()],
});
```

In this repo, examples use local aliases while the package is under development:

```ts
export default defineConfig({
  resolve: {
    alias: {
      "@canvactive/core": new URL("../../src/core/index.ts", import.meta.url).pathname,
      "@canvactive/elements": new URL("../../src/core/elements/index.ts", import.meta.url).pathname,
    },
  },
  plugins: [canvactive()],
});
```

## Components

A `.can` file has a `<script>` block and a `<render>` block:

```html
<script>
import Counter from "./elements/Counter.can";
</script>

<render>
({ draw }) => {
  draw(Counter);
}
</render>
```

Components are drawable, so one `.can` component can render another with `draw(Component)`.

## Scenes

Game-style components can use `<script scene>` with `<create>` and `<update>`:

```html
<script scene>
import { rect } from "@canvactive/elements";

const player = rect({ x: 40, y: 190, width: 52, height: 52 });
</script>

<update>
({ delta }) => {
  player.x += 180 * delta;
}
</update>

<create>
({ draw }) => {
  draw(player);
}
</create>
```

For scene components, `<create>` defines the draw tree and `<update>` runs on the frame loop.

## State

Use `observable()` for reactive state:

```html
<script>
import { observable } from "@canvactive/core";

const count = observable(0);

function increment() {
  count.value++;
}
</script>
```

Observables expose `.value` for reads and writes. They also stringify, so they can be used in text templates:

```js
`Counter: ${count}`
```

When observable state is read during rendering, Canvactive tracks it automatically and rerenders when it changes.

Game-loop metadata is available through the `engine` singleton:

```js
import { engine } from "@canvactive/core";

engine.frame;
engine.delta;
engine.elapsed;
```

Use observables for game state that belongs to the world. Use `engine` for runtime frame context.

## Elements

Import canvas-native elements from `@canvactive/elements`:

```html
<script>
import { text, button } from "@canvactive/elements";

const label = text(`Counter: ${count}`);
const incrementButton = button({
  label: "Increase counter",
  onClick() {
    count.value++;
  },
});
</script>

<render>
({ draw }) => {
  draw(label);
  draw(incrementButton);
}
</render>
```

`draw(element)` defaults to a simple top-left vertical flow. Passing coordinates overrides that:

```js
draw(label, { x: 40, y: 36 });
```

## Button Composition

Canvas buttons can live inside their own `.can` files:

```html
<script>
import { button } from "@canvactive/elements";
</script>

<render>
({ draw }) => {
  draw(button({ label: "Add session" }));
}
</render>
```

Parent components can assign click handlers to drawable button components:

```js
AddSessionButton.onClick = () => {
  sessions.value++;
};
```

## Examples

Run the minimal counter:

```bash
npm run dev:counter
```

Run the larger focus board example:

```bash
npm run dev:focus
```

Run the game-loop example:

```bash
npm run dev:game
```

## Editor Support

VS Code syntax highlighting for `.can` files lives in `packages/vscode-canvactive`.

Open that folder in VS Code and run the extension host to highlight both `<script>` and `<render>` blocks as JavaScript.
