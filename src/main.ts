import "./style.css";
import { state } from "./state";
import type { CardElement, EditorState } from "./types";
import { toPng } from "html-to-image";
import { buildHtml } from "./exportHtml";
import { saveState, loadState, clearSavedState } from "./storage";
import { templates } from "./templates";
import type { Template } from "./templates";
import { pushHistory, undo, redo, canUndo, canRedo } from "./history";

const textInput = document.getElementById("text-input") as HTMLTextAreaElement;
const textColorInput = document.getElementById("text-color") as HTMLInputElement;
const colorInput = document.getElementById("bg-color") as HTMLInputElement;
const card = document.getElementById("card") as HTMLElement;
const addTextButton = document.getElementById("add-text") as HTMLButtonElement;
const addShapeButton = document.getElementById("add-shape") as HTMLButtonElement;
const deleteButton = document.getElementById("delete-btn") as HTMLButtonElement;
const exportButton = document.getElementById("export-png") as HTMLButtonElement;
const statusText = document.getElementById("status") as HTMLElement;
const exportCodeButton = document.getElementById("export-code") as HTMLButtonElement;
const codeOutput = document.getElementById("code-output") as HTMLTextAreaElement;
const copyButton = document.getElementById("copy-code") as HTMLButtonElement;
const resetButton = document.getElementById("reset-btn") as HTMLButtonElement;
const templateSelect = document.getElementById("template-select") as HTMLSelectElement;
const undoButton = document.getElementById("undo-btn") as HTMLButtonElement;
const redoButton = document.getElementById("redo-btn") as HTMLButtonElement;

const saved = loadState();
if (saved) {
  Object.assign(state, saved);
  state.selectedId = null;
}

type DragInfo = {
  id: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
};

let drag: DragInfo | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSelected(): CardElement | undefined {
  return state.elements.find((el) => el.id === state.selectedId);
}

function syncPanel(): void {
  colorInput.value = state.canvasColor;

  const selected = getSelected();
  textInput.disabled = !selected || selected.kind === "shape";
  textColorInput.disabled = !selected;
  deleteButton.disabled = !selected;
  undoButton.disabled = !canUndo();
  redoButton.disabled = !canRedo();

  if (selected) {
    textInput.value = selected.text;
    textColorInput.value = selected.color;
  } else {
    textInput.value = "";
  }
}

function render(): void {
  card.style.backgroundColor = state.canvasColor;

  let focusedId: string | undefined;
  const active = document.activeElement;
  if (active instanceof HTMLElement && card.contains(active)) {
    focusedId = active.dataset.id;
  }

  card.replaceChildren();
  for (const element of state.elements) {
    const node = document.createElement("div");
    node.className = "absolute cursor-grab select-none touch-none rounded px-1";
    node.dataset.id = String(element.id);





    let label = "شكل";
    if (element.kind === "text") {
      label = `نص: ${element.text}`;
    }

    node.tabIndex = 0;
    node.setAttribute("role", "button");
    node.setAttribute("aria-label", label);
    node.setAttribute("aria-pressed", String(element.id === state.selectedId));
    node.addEventListener("keydown", (event) => handleElementKey(event, element));


    node.style.left = `${element.x}px`;
    node.style.top = `${element.y}px`;

    if (element.kind === "shape") {
      node.style.width = "64px";
      node.style.height = "64px";
      node.style.backgroundColor = element.color;
    } else {
      node.textContent = element.text;
      node.style.color = element.color;
    }

    if (element.id === state.selectedId) {
      node.classList.add("ring-2", "ring-white");
    }

    node.addEventListener("pointerdown", (event) => {
      const rect = card.getBoundingClientRect();
      drag = {
        id: element.id,
        offsetX: event.clientX - rect.left - element.x,
        offsetY: event.clientY - rect.top - element.y,
        moved: false,
      };
      state.selectedId = element.id;
      render();
    });

    card.appendChild(node);

        if (node.dataset.id === focusedId) {
      node.focus();
    }
  }

  syncPanel();
  saveState(state);
}

function restore(restored: EditorState | null): void {
  if (!restored) return;
  Object.assign(state, restored);
  render();
}

function addText(): void {
  pushHistory(state);
  const element: CardElement = {
    id: state.nextId,
    kind: "text",
    text: "نص جديد",
    x: 24,
    y: 24,
    color: "#ffffff",
  };
  state.nextId += 1;
  state.elements.push(element);
  state.selectedId = element.id;
  render();
}

function addShape(): void {
  pushHistory(state);
  const element: CardElement = {
    id: state.nextId,
    kind: "shape",
    text: "",
    x: 24,
    y: 24,
    color: "#fbbf24",
  };
  state.nextId += 1;
  state.elements.push(element);
  state.selectedId = element.id;
  render();
}

function deleteSelected(): void {
  if (state.selectedId === null) return;
  pushHistory(state);
  state.elements = state.elements.filter((el) => el.id !== state.selectedId);
  state.selectedId = null;
  render();
}
function moveElement(element: CardElement, dx: number, dy: number): void {
  const node = card.querySelector<HTMLElement>(`[data-id="${element.id}"]`);
  if (!node) return;

  const maxX = card.clientWidth - node.offsetWidth;
  const maxY = card.clientHeight - node.offsetHeight;
  element.x = clamp(element.x + dx, 0, maxX);
  element.y = clamp(element.y + dy, 0, maxY);
}

function handleElementKey(event: KeyboardEvent, element: CardElement): void {
  let step = 4;
  if (event.shiftKey) step = 16;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    state.selectedId = element.id;
    render();
    return;
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    state.selectedId = element.id;
    deleteSelected();
    return;
  }

  let dx = 0;
  let dy = 0;
  if (event.key === "ArrowLeft") dx = -step;
  if (event.key === "ArrowRight") dx = step;
  if (event.key === "ArrowUp") dy = -step;
  if (event.key === "ArrowDown") dy = step;
  if (dx === 0 && dy === 0) return;

  event.preventDefault();
  pushHistory(state);
  state.selectedId = element.id;
  moveElement(element, dx, dy);
  render();
}
function applyTemplate(template: Template): void {
  pushHistory(state);
  Object.assign(state, structuredClone(template.state));
  state.selectedId = null;
  render();
}

async function exportPng(): Promise<void> {
  exportButton.disabled = true;
  statusText.textContent = "جارٍ التصدير...";

  try {
    state.selectedId = null;
    render();

    const dataUrl = await toPng(card, { pixelRatio: 2 });

    const link = document.createElement("a");
    link.download = "card.png";
    link.href = dataUrl;
    link.click();

    statusText.textContent = "تم التنزيل ✅";
  } catch (error) {
    console.error(error);
    statusText.textContent = "حصل خطأ أثناء التصدير ❌";
  } finally {
    exportButton.disabled = false;
  }
}

templates.forEach((template, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = template.name;
  templateSelect.appendChild(option);
});

templateSelect.addEventListener("change", () => {
  if (templateSelect.value === "") return;

  const template = templates[Number(templateSelect.value)];
  if (!template) return;

  if (confirm("ده هيستبدل تصميمك الحالي. تكمل؟")) {
    applyTemplate(template);
  }
  templateSelect.value = "";
});

addTextButton.addEventListener("click", addText);
addShapeButton.addEventListener("click", addShape);
deleteButton.addEventListener("click", deleteSelected);
exportButton.addEventListener("click", exportPng);
undoButton.addEventListener("click", () => restore(undo(state)));
redoButton.addEventListener("click", () => restore(redo(state)));

textInput.addEventListener("focus", () => pushHistory(state));
textColorInput.addEventListener("focus", () => pushHistory(state));
colorInput.addEventListener("focus", () => pushHistory(state));

textInput.addEventListener("input", () => {
  const selected = getSelected();
  if (!selected) return;
  selected.text = textInput.value;
  render();
});

textColorInput.addEventListener("input", () => {
  const selected = getSelected();
  if (!selected) return;
  selected.color = textColorInput.value;
  render();
});

colorInput.addEventListener("input", () => {
  state.canvasColor = colorInput.value;
  render();
});

exportCodeButton.addEventListener("click", () => {
  codeOutput.value = buildHtml(state, card.clientWidth, card.clientHeight);
  codeOutput.classList.remove("hidden");
  copyButton.classList.remove("hidden");
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeOutput.value);
    statusText.textContent = "تم نسخ الكود ✅";
  } catch (error) {
    console.error(error);
    statusText.textContent = "تعذّر النسخ، انسخ الكود يدويًا ❌";
  }
});

resetButton.addEventListener("click", () => {
  if (!confirm("متأكد إنك عايز تمسح التصميم وترجع للبداية؟")) return;
  clearSavedState();
  location.reload();
});

card.addEventListener("pointerdown", (event) => {
  if (event.target === card) {
    state.selectedId = null;
    render();
  }
});

window.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const current = drag;
  const element = state.elements.find((el) => el.id === current.id);
  if (!element) return;

  const node = card.querySelector<HTMLElement>(`[data-id="${current.id}"]`);
  if (!node) return;

  if (!current.moved) {
    pushHistory(state);
    current.moved = true;
  }

  const rect = card.getBoundingClientRect();
  const maxX = card.clientWidth - node.offsetWidth;
  const maxY = card.clientHeight - node.offsetHeight;

  element.x = clamp(Math.round(event.clientX - rect.left - current.offsetX), 0, maxX);
  element.y = clamp(Math.round(event.clientY - rect.top - current.offsetY), 0, maxY);
  render();
});

window.addEventListener("pointerup", () => {
  drag = null;
});

window.addEventListener("pointercancel", () => {
  drag = null;
});

window.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;

  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

  const key = event.key.toLowerCase();
  if (key === "z" && !event.shiftKey) {
    event.preventDefault();
    restore(undo(state));
  } else if (key === "y" || (key === "z" && event.shiftKey)) {
    event.preventDefault();
    restore(redo(state));
  }
});

render();