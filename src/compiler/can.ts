export function compileCan(source: string): string {
  const script = readBlock(source, "script") ?? "";
  const render = readBlock(source, "render");

  if (!render) {
    throw new Error("Canvactive component is missing a <render> block.");
  }

  return [
    script.trim(),
    "const __can_component = {",
    "  setup: typeof setup === 'undefined' ? undefined : setup,",
    `  render: ${render.trim()},`,
    "};",
    "export default __can_component;",
  ]
    .filter(Boolean)
    .join("\n");
}

function readBlock(source: string, tagName: string): string | undefined {
  const blockPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`);
  const match = source.match(blockPattern);

  return match?.[1];
}
