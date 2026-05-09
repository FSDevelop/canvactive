# Architecture

Canvactive is split into three main layers:

- `.can` compilation
- canvas runtime
- canvas elements

The package is intentionally small. Most modules are narrow and should stay that way as the project grows.

## Package Entrypoints

`package.json` exposes these public entrypoints:

```text
canvactive
canvactive/core
canvactive/elements
canvactive/vite
```

Current examples use local development aliases:

```text
@canvactive/core -> src/core/index.ts
@canvactive/elements -> src/core/elements/index.ts
```

Those aliases are configured per example in `vite.config.ts` and in the root `tsconfig.json`.

## Source Layout

```text
src/
  main.ts
  vite.ts
  can.d.ts
  compiler/
    can.ts
  core/
    index.ts
    types.ts
    observable.ts
    tracking.ts
    bind.ts
    canvas.ts
    canvas/
      target.ts
      lifecycle.ts
      render-context.ts
      interactions.ts
    elements/
      index.ts
      text.ts
      button.ts
```

## `.can` Compiler

The compiler lives in `src/compiler/can.ts`.

It reads:

```html
<script>
// module code
</script>

<render>
({ draw }) => {
  // drawing code
}
</render>
```

and emits a JavaScript module with a default component object.

Compiled components are both:

- mountable root components
- drawable child components

That is why this works:

```js
createCanvas("#app").mount(Canvas);
```

and this also works inside another component:

```js
draw(Counter);
```

The compiler currently performs one small ergonomics transform:

```js
text(`Counter: ${count}`)
```

becomes a lazy text value:

```js
text(() => `Counter: ${count}`)
```

This keeps template-style text reactive without requiring the user to write the function manually.

## Vite Plugin

The Vite plugin lives in `src/vite.ts`.

Its only responsibility is to detect `.can` files and pass their contents to `compileCan`.

Keep Vite-specific behavior here. Keep component semantics in `src/compiler/can.ts` or the core runtime.

## Core Runtime

The core public API is exported from `src/core/index.ts`.

Important exports:

```ts
createCanvas
observable
bind
```

`bind` is a compatibility helper. New examples should prefer `createCanvas(...).mount(...)`.

## Canvas Lifecycle

`src/core/canvas.ts` owns `createCanvas`.

It coordinates:

- resolving a canvas target
- creating the 2D context
- clearing and painting the default background every render
- rendering the mounted component
- collecting reactive dependencies
- scheduling rerenders with `requestAnimationFrame`
- cleaning up setup subscriptions, render subscriptions, and pointer listeners

Supporting modules:

- `canvas/target.ts`: selector or element resolution plus 2D context creation
- `canvas/lifecycle.ts`: cleanup scope helper
- `canvas/render-context.ts`: `draw()` implementation and default flow layout
- `canvas/interactions.ts`: pointer cursor, hit testing, and click dispatch

## Render Context

Components receive a render context:

```ts
{
  canvas,
  context,
  draw
}
```

`draw(element)` uses a simple vertical flow:

- first unpositioned element draws at top-left
- each following unpositioned element draws below the previous one

Explicit coordinates override the flow:

```js
draw(label, { x: 40, y: 36 });
```

Elements must implement:

```ts
draw(context, overrides)
measure(context)
```

`measure` is used by the default flow layout.

## Reactivity

Reactivity lives in:

```text
src/core/observable.ts
src/core/tracking.ts
```

`observable(value)` returns an object with:

```ts
state.value
state.get()
state.set(next)
state.subscribe(observer)
state.toString()
```

Reads are tracked during render. When an observable is read in a render pass, the canvas runtime subscribes to it. When the observable changes, the canvas schedules a rerender.

Users should normally write:

```js
count.value++;
```

Older `get()` and `set()` calls are still supported.

## Elements

Canvas elements live in `src/core/elements`.

Current elements:

- `text`
- `button`

Elements are exported from:

```ts
canvactive/elements
```

and, for convenience, from the root runtime barrel.

### Text

`text()` accepts:

- a string
- an observable
- a lazy function
- an options object

Examples:

```js
text("Hello")
text(`Counter: ${count}`)
text({ value: "Title", fontSize: 44, fontWeight: 700 })
```

### Button

`button()` creates a canvas-native interactive element:

```js
button({
  label: "Increase counter",
  onClick() {
    count.value++;
  },
});
```

Buttons participate in hit testing through `canvas/interactions.ts`.

## Component Composition

`.can` components are drawable.

Example:

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

Button components can receive a click handler from their parent:

```js
IncrementBtn.onClick = () => {
  count.value++;
};
```

The compiled component forwards that handler to the first interactive element it draws.

## Examples

Current examples:

```text
examples/counter
examples/focus-board
```

Run them with:

```bash
npm run dev:counter
npm run dev:focus
```

Build checks:

```bash
npm run typecheck
npm run build
npx vite build examples/counter --config examples/counter/vite.config.ts
npx vite build examples/focus-board --config examples/focus-board/vite.config.ts
```

## Editor Support

VS Code syntax highlighting lives in:

```text
packages/vscode-canvactive
```

It contributes a `.can` language and a TextMate grammar that highlights both `<script>` and `<render>` as JavaScript.

## Design Direction

Current direction:

- keep `.can` files small and component-oriented
- keep DOM usage outside components unless explicitly needed
- prefer canvas-native elements
- keep layout simple until the element model is more stable
- keep compiler transforms small and predictable

Avoid pushing unrelated behavior into `canvas.ts`; split lifecycle, interaction, layout, or compiler responsibilities into focused modules.
