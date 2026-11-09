import type { EditorState } from "./types";

const MAX_HISTORY = 50;

let past: string[] = [];
let future: string[] = [];

function snapshot(state: EditorState): string {
  return JSON.stringify(state);
}

export function pushHistory(state: EditorState): void {
  const current = snapshot(state);
  if (past[past.length - 1] === current) return;

  past.push(current);
  if (past.length > MAX_HISTORY) past.shift();
  future = [];
}

export function undo(state: EditorState): EditorState | null {
  const previous = past.pop();
  if (previous === undefined) return null;

  future.push(snapshot(state));
  return JSON.parse(previous) as EditorState;
}

export function redo(state: EditorState): EditorState | null {
  const next = future.pop();
  if (next === undefined) return null;

  past.push(snapshot(state));
  return JSON.parse(next) as EditorState;
}

export function canUndo(): boolean {
  return past.length > 0;
}

export function canRedo(): boolean {
  return future.length > 0;
}