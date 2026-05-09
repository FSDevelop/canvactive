export function compileCan(source: string): string {
  const scriptBlock = readScriptBlock(source);
  const script = compileScript(scriptBlock?.content ?? "");
  const isScene = scriptBlock?.attributes.split(/\s+/).includes("scene") ?? false;
  const render = readBlock(source, isScene ? "create" : "render");
  const update = isScene ? readBlock(source, "update") : undefined;

  if (!render) {
    throw new Error(
      isScene
        ? "Canvactive scene is missing a <create> block."
        : "Canvactive component is missing a <render> block.",
    );
  }

  return [
    script.trim(),
    "const __can_component = {",
    "  onClick: undefined,",
    "  setup: typeof setup === 'undefined' ? undefined : setup,",
    isScene
      ? `  update: ${update ? update.trim() : "undefined"},`
      : "  update: typeof update === 'undefined' ? undefined : update,",
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

function readScriptBlock(source: string): { attributes: string; content: string } | undefined {
  const blockPattern = /<script(?<attributes>[^>]*)>(?<content>[\s\S]*?)<\/script>/;
  const match = source.match(blockPattern);

  if (!match?.groups) {
    return undefined;
  }

  return {
    attributes: match.groups.attributes.trim(),
    content: match.groups.content,
  };
}

function compileScript(source: string): string {
  return source.replace(/\btext\s*\(\s*(`(?:\\.|[^`\\])*`)\s*\)/g, "text(() => $1)");
}

function readBlock(source: string, tagName: string): string | undefined {
  const blockPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`);
  const match = source.match(blockPattern);

  return match?.[1];
}
