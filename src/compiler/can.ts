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
    isScene
      ? `const __can_update = ${update ? update.trim() : "undefined"};`
      : "const __can_update = typeof update === 'undefined' ? undefined : update;",
    `const __can_render = ${render.trim()};`,
    "class __CanComponent {",
    "  constructor(props = {}) {",
    "    this.props = props;",
    "    this.onClick = this.constructor.onClick;",
    "    this.__instance = typeof create === 'undefined' ? undefined : create.call(this, props);",
    "  }",
    "  setup(canvas) {",
    "    return typeof setup === 'undefined' ? undefined : setup.call(this, canvas);",
    "  }",
    "  update(context) {",
    "    if (this.__instance?.update) {",
    "      return this.__instance.update(context);",
    "    }",
    "    return __can_update?.call(this, context);",
    "  }",
    "  render(context) {",
    "    return __can_render.call(this, context);",
    "  }",
    "  draw(context, overrides) {",
    "    if (this.__instance?.draw) {",
    "      return this.__instance.draw(context, overrides);",
    "    }",
    "    const componentContext = {",
    "      ...context,",
    "      draw: (element, overrides) => {",
    "        if (typeof this.onClick === 'function' && typeof element.onClick === 'function') {",
    "          element.onClick(this.onClick);",
    "        }",
    "        context.draw(element, overrides);",
    "      },",
    "    };",
    "    this.render(componentContext);",
    "  }",
    "  measure(context) {",
    "    if (this.__instance?.measure) {",
    "      return this.__instance.measure(context);",
    "    }",
    "    return { width: 0, height: 0 };",
    "  }",
    "}",
    "export default __CanComponent;",
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
