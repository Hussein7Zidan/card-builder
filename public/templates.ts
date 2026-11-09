import type { EditorState } from "./types";

export type Template = {
  name: string;
  state: EditorState;
};

export const templates: Template[] = [
  {
    name: "بطاقة عمل",
    state: {
      canvasColor: "#0f172a",
      selectedId: null,
      nextId: 4,
      elements: [
        { id: 1, kind: "text", text: "اسمك هنا", x: 24, y: 28, color: "#ffffff" },
        { id: 2, kind: "text", text: "المسمى الوظيفي", x: 24, y: 64, color: "#94a3b8" },
        { id: 3, kind: "shape", text: "", x: 232, y: 140, color: "#38bdf8" },
      ],
    },
  },
  {
    name: "إعلان عرض",
    state: {
      canvasColor: "#be123c",
      selectedId: null,
      nextId: 4,
      elements: [
        { id: 1, kind: "text", text: "خصم 50%", x: 24, y: 40, color: "#ffffff" },
        { id: 2, kind: "text", text: "لفترة محدودة فقط", x: 24, y: 90, color: "#fde68a" },
        { id: 3, kind: "shape", text: "", x: 232, y: 24, color: "#fbbf24" },
      ],
    },
  },
  {
    name: "دعوة",
    state: {
      canvasColor: "#065f46",
      selectedId: null,
      nextId: 3,
      elements: [
        { id: 1, kind: "text", text: "أنت مدعو!", x: 24, y: 60, color: "#ffffff" },
        { id: 2, kind: "text", text: "الجمعة، الساعة 7 مساءً", x: 24, y: 110, color: "#a7f3d0" },
      ],
    },
  },
];