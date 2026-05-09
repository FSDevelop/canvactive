declare module "*.can" {
  import type { CanvasComponent } from "./main";

  const component: CanvasComponent;
  export default component;
}
