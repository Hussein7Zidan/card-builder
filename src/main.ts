import "./style.css";
import { state } from "./state";

const titleInput = document.getElementById("title-input") as HTMLInputElement;
const descInput = document.getElementById("desc-input") as HTMLTextAreaElement;
const colorInput = document.getElementById("bg-color") as HTMLInputElement;
const card = document.getElementById("card") as HTMLElement;

type DragInfo = {
  id: number;
  offsetX: number;
  offsetY: number;
};

let drag: DragInfo | null = null;

function render(): void {
  card.style.backgroundColor = state.canvasColor;
  card.replaceChildren();

  for (const element of state.elements) {
    const node = document.createElement("div");
    node.textContent = element.text;
    node.className = "absolute cursor-grab select-none touch-none rounded px-1";
    node.style.left = `${element.x}px`;
    node.style.top = `${element.y}px`;
    node.style.color = element.color;

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
}

function updateText(id: number, value: string): void {
  const element = state.elements.find((el) => el.id === id);
  if (!element) return;
  element.text = value;
  render();
}

titleInput.addEventListener("input", () => {
  updateText(1, titleInput.value);
});

descInput.addEventListener("input", () => {
  updateText(2, descInput.value);
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
  const element = state.elements.find((el) => el.id === current.id);
  if (!element) return;

  const rect = card.getBoundingClientRect();
  element.x = Math.round(event.clientX - rect.left - current.offsetX);
  element.y = Math.round(event.clientY - rect.top - current.offsetY);
  render();
});

window.addEventListener("pointerup", () => {
  drag = null;
});

window.addEventListener("pointercancel", () => {
  drag = null;
});

render();