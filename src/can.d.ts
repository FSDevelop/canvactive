declare module "*.can" {
  import type { CanvasComponent } from "./main";

  const Component: {
    new (...args: unknown[]): CanvasComponent;
  };

  export default Component;
}
