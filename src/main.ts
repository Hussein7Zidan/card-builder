import "./style.css";
const titleInput = document.getElementById ("title-input") as HTMLInputElement;
const cardTitle = document.getElementById ("card-title") as HTMLElement; 
const descInput = document.getElementById("desc-input") as HTMLTextAreaElement;
const colorInput = document.getElementById("bg-color") as HTMLInputElement;
const card = document.getElementById("card") as HTMLElement;
const cardDesc = document.getElementById("card-desc") as HTMLElement;


titleInput.addEventListener ("input", function () {
cardTitle.textContent = titleInput.value;});
descInput.addEventListener("input",()=> {
    cardDesc.textContent = descInput.value;
});
colorInput.addEventListener("input", () => {
  card.style.backgroundColor = colorInput.value;
});