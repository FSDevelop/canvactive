import type { Plugin } from "vite";
import { compileCan } from "./compiler/can.js";

const canFilePattern = /\.can$/;

export interface CanvactivePluginOptions {
  includeSourceMap?: boolean;
}

export function canvactive(options: CanvactivePluginOptions = {}): Plugin {
  return {
    name: "canvactive",
    enforce: "pre",
    transform(code, id) {
      if (!canFilePattern.test(id)) {
        return null;
      }

      return {
        code: compileCan(code),
        map: options.includeSourceMap ? null : { mappings: "" },
      };
    },
  };
}
