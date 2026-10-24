import "./style.css";
import { state } from "./state";

const titleInput = document.getElementById ("title-input") as HTMLInputElement;
const cardTitle = document.getElementById ("card-title") as HTMLElement; 
const descInput = document.getElementById("desc-input") as HTMLTextAreaElement;
const colorInput = document.getElementById("bg-color") as HTMLInputElement;
const card = document.getElementById("card") as HTMLElement;
const cardDesc = document.getElementById("card-desc") as HTMLElement;




function render (): void{
  cardTitle.textContent = state.title;
   cardDesc.textContent = state.description;
  card.style.backgroundColor = state.color;
}
render();



titleInput.addEventListener("input", () => {
  state.title = titleInput.value;
  render();
});
descInput.addEventListener("input",()=> {
    cardDesc.textContent = descInput.value;
});
colorInput.addEventListener("input", () => {
  card.style.backgroundColor = colorInput.value;
});