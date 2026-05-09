# Canvactive

Small reactive state bindings for canvas rendering.

## Example

```ts
import { createCanvas } from "@canvactive/core";
import Counter from "./Counter.can";

createCanvas("#counter-canvas").mount(Counter);
```

Use the Vite plugin to compile `.can` files:

```ts
import { defineConfig } from "vite";
import { canvactive } from "canvactive/vite";

export default defineConfig({
  plugins: [canvactive()],
});
```

## Editor Support

VS Code syntax highlighting for `.can` files lives in `packages/vscode-canvactive`.

The extension highlights both `<script>` and `<render>` blocks as JavaScript.

## Examples

```bash
npm run dev:counter
npm run dev:focus
```
