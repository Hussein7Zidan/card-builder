
import "./style.css";
import { state } from "./state";
import type { CardElement } from "./types";
import { toPng } from "html-to-image";
import { buildHtml } from "./exportHtml";
import { saveState, loadState, clearSavedState } from "./storage";

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

const saved = loadState();
if (saved) {
  Object.assign(state, saved);
  state.selectedId = null;
}

type DragInfo = {
  id: number;
  offsetX: number;
  offsetY: number;
};

let drag: DragInfo | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSelected(): CardElement | undefined {
  return state.elements.find((el) => el.id === state.selectedId);
}

function syncPanel(): void {
  const selected = getSelected();

  textInput.disabled = !selected || selected.kind === "shape";
  textColorInput.disabled = !selected;
  deleteButton.disabled = !selected;

  if (selected) {
    textInput.value = selected.text;
    textColorInput.value = selected.color;
  } else {
    textInput.value = "";
  }
}

function render(): void {
  card.style.backgroundColor = state.canvasColor;
  card.replaceChildren();

  for (const element of state.elements) {
    const node = document.createElement("div");

    node.className = "absolute cursor-grab select-none touch-none rounded px-1";
    node.dataset.id = String(element.id);

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
      };

      state.selectedId = element.id;
      render();
    });

    card.appendChild(node);
  }

  syncPanel();
    saveState(state);
}

function addText(): void {
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

  state.elements = state.elements.filter(
    (el) => el.id !== state.selectedId
  );

  state.selectedId = null;
  render();
}

addTextButton.addEventListener("click", addText);
addShapeButton.addEventListener("click", addShape);
deleteButton.addEventListener("click", deleteSelected);

textInput.addEventListener("input", () => {
  const selected = getSelected();
  if (!selected || selected.kind !== "text") return;

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

card.addEventListener("pointerdown", (event) => {
  if (event.target === card) {
    state.selectedId = null;
    render();
  }
});

window.addEventListener("pointermove", (event) => {
  if (!drag) return;

  const current = drag;

  const element = state.elements.find(
    (el) => el.id === current.id
  );

  if (!element) return;

  const node = card.querySelector<HTMLElement>(
    `[data-id="${current.id}"]`
  );

  if (!node) return;

  const rect = card.getBoundingClientRect();

  const maxX = card.clientWidth - node.offsetWidth;
  const maxY = card.clientHeight - node.offsetHeight;

  element.x = clamp(
    Math.round(event.clientX - rect.left - current.offsetX),
    0,
    maxX
  );

  element.y = clamp(
    Math.round(event.clientY - rect.top - current.offsetY),
    0,
    maxY
  );

  render();
});

window.addEventListener("pointerup", () => {
  drag = null;
});

window.addEventListener("pointercancel", () => {
  drag = null;
});

async function exportPng(): Promise<void> {
  exportButton.disabled = true;
  statusText.textContent = "جارٍ التصدير...";

  try {
    state.selectedId = null;
    render();

    const dataUrl = await toPng(card, {
      pixelRatio: 2,
    });

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

exportButton.addEventListener("click", exportPng);

exportCodeButton.addEventListener("click", () => {
  codeOutput.value = buildHtml(
    state,
    card.clientWidth,
    card.clientHeight
  );

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

render();
