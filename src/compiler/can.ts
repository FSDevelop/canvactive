export function compileCan(source: string): string {
  const script = compileScript(readBlock(source, "script") ?? "");
  const render = readBlock(source, "render");

  if (!render) {
    throw new Error("Canvactive component is missing a <render> block.");
  }

  return [
    script.trim(),
    "const __can_component = {",
    "  onClick: undefined,",
    "  setup: typeof setup === 'undefined' ? undefined : setup,",
    `  render: ${render.trim()},`,
    "  draw(context) {",
    "    const componentContext = {",
    "      ...context,",
    "      draw: (element, overrides) => {",
    "        if (typeof __can_component.onClick === 'function' && typeof element.onClick === 'function') {",
    "          element.onClick(__can_component.onClick);",
    "        }",
    "        context.draw(element, overrides);",
    "      },",
    "    };",
    "    __can_component.render(componentContext);",
    "  },",
    "  measure() {",
    "    return { width: 0, height: 0 };",
    "  },",
    "};",
    "export default __can_component;",
  ]
    .filter(Boolean)
    .join("\n");
}

function compileScript(source: string): string {
  return source.replace(/\btext\s*\(\s*(`(?:\\.|[^`\\])*`)\s*\)/g, "text(() => $1)");
}

function readBlock(source: string, tagName: string): string | undefined {
  const blockPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`);
  const match = source.match(blockPattern);

  return match?.[1];
}
