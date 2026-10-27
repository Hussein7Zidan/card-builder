import type { EditorState } from "./types";

export const state: EditorState = {
  canvasColor: "#6366f1",
  selectedId: null,
  elements: [
    { id: 1, kind: "text", text: "عنوان الكارت", x: 24, y: 24, color: "#ffffff" },
    { id: 2, kind: "text", text: "هنا يظهر وصف الكارت", x: 24, y: 80, color: "#ffffff" },
  ],
};