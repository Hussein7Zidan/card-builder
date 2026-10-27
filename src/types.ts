export type CardElement = {
  id: number;
  kind: "text" | "shape";
  text: string;
  x: number;
  y: number;
  color: string;
};

export type EditorState = {
  canvasColor: string;
  selectedId: number | null;
  elements: CardElement[];
};