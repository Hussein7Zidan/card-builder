import type { EditorState } from "./types";

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildHtml(state: EditorState, width: number, height: number): string {
  const items = state.elements
    .map((element) => {
      const position = `position: absolute; left: ${element.x}px; top: ${element.y}px;`;

      if (element.kind === "shape") {
        return `  <div style="${position} width: 64px; height: 64px; background-color: ${element.color};"></div>`;
      }

      return `  <div style="${position} padding: 0 4px; color: ${element.color};">${escapeHtml(element.text)}</div>`;
    })
    .join("\n");

  const box = `position: relative; width: ${width}px; height: ${height}px; background-color: ${state.canvasColor}; border-radius: 16px; overflow: hidden;`;

  return `<div style="${box}">\n${items}\n</div>`;
}