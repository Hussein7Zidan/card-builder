import type { CardElement, EditorState } from "./types";

const STORAGE_KEY = "card-builder-state";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isElement(value: unknown): value is CardElement {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "number" &&
    (value.kind === "text" || value.kind === "shape") &&
    typeof value.text === "string" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    isHexColor(value.color)
  );
}

function isValidState(value: unknown): value is EditorState {
  if (!isRecord(value)) return false;

  return (
    isHexColor(value.canvasColor) &&
    (typeof value.selectedId === "number" || value.selectedId === null) &&
    typeof value.nextId === "number" &&
    Array.isArray(value.elements) &&
    value.elements.every(isElement)
  );
}

export function saveState(state: EditorState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save the design", error);
  }
}

export function loadState(): EditorState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (isValidState(parsed)) return parsed;
    return null;
  } catch (error) {
    console.error("Could not load the saved design", error);
    return null;
  }
}

export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}