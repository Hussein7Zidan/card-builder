import "./style.css";
import { state } from "./state";

const titleInput = document.getElementById ("title-input") as HTMLInputElement;

const descInput = document.getElementById("desc-input") as HTMLTextAreaElement;
const colorInput = document.getElementById("bg-color") as HTMLInputElement;
const card = document.getElementById("card") as HTMLElement;




function render(): void {
function render(): void {
  card.style.backgroundColor = state.canvasColor;
  card.replaceChildren();

  for (const element of state.elements) {
    const node = document.createElement("div");
    node.textContent = element.text;
    node.className = "absolute cursor-pointer rounded px-1"; // جديد
    node.style.left = `${element.x}px`;
    node.style.top = `${element.y}px`;
    node.style.color = element.color;

    if (element.id === state.selectedId) {                    
      node.classList.add("ring-2", "ring-white");            
    }                                                          

    node.addEventListener("click", () => {              
      state.selectedId = element.id;                          
      render();                                             
    });                                                       

    card.appendChild(node);
  }
}
render();



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