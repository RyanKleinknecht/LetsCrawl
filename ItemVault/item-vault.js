const list = document.getElementById("itemList");
const template = document.getElementById("itemTemplate");
const importFile = document.getElementById("importFile");

let dirty = false;

function createItem(data = {}) {
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector(".vault-card");
  const header = clone.querySelector(".card-header");
  const title = clone.querySelector(".item-title");

  const name = clone.querySelector(".item-name");
  const effect = clone.querySelector(".item-effect");
  const tagline = clone.querySelector(".item-tagline");

  name.value = data.name || "";
  effect.value = data.effect || "";
  tagline.value = data.tagline || "";

  title.textContent = name.value || "New Item";

  header.onclick = () => card.classList.toggle("open");

  name.oninput = () => {
    title.textContent = name.value || "New Item";
    dirty = true;
  };
  effect.oninput = tagline.oninput = () => dirty = true;

  // DELETE ITEM (EXPLICIT)
  clone.querySelector(".deleteItem").onclick = e => {
    e.stopPropagation();
    if (confirm(`Delete item "${name.value || "Unnamed Item"}"?`)) {
      card.remove();
      dirty = true;
    }
  };

  // MOVE UP
  clone.querySelector(".moveUp").onclick = e => {
    e.stopPropagation();
    if (card.previousElementSibling) {
      list.insertBefore(card, card.previousElementSibling);
      dirty = true;
    }
  };

  // MOVE DOWN
  clone.querySelector(".moveDown").onclick = e => {
    e.stopPropagation();
    if (card.nextElementSibling) {
      list.insertBefore(card.nextElementSibling, card);
      dirty = true;
    }
  };

  list.appendChild(card);
  card.classList.add("open");
}

function saveVault() {
  const items = [];
  document.querySelectorAll(".vault-card").forEach(card => {
    items.push({
      name: card.querySelector(".item-name").value,
      effect: card.querySelector(".item-effect").value,
      tagline: card.querySelector(".item-tagline").value
    });
  });
  localStorage.setItem("LC_ITEM_VAULT", JSON.stringify(items));
  dirty = false;
  alert("Item Vault saved.");
}

function loadVault() {
  const data = JSON.parse(localStorage.getItem("LC_ITEM_VAULT") || "[]");
  list.innerHTML = "";
  data.forEach(createItem);
  dirty = false;
}

function exportVault() {
  const data = localStorage.getItem("LC_ITEM_VAULT") || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Lets-Crawl-Item-Vault.json";
  a.click();
}

function importVault(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      list.innerHTML = "";
      data.forEach(createItem);
      dirty = false;
    } catch {
      alert("Invalid Item Vault file.");
    }
  };
  reader.readAsText(file);
}

// HEADER BUTTONS
document.getElementById("addItem").onclick = () => createItem();
document.getElementById("saveVault").onclick = saveVault;
document.getElementById("loadVault").onclick = () => {
  if (!dirty || confirm("Discard unsaved changes?")) loadVault();
};

document.getElementById("exportVault").onclick = exportVault;
document.getElementById("importVault").onclick = () => importFile.click();
importFile.onchange = e => importVault(e.target.files[0]);

document.getElementById("printVault").onclick = () => window.print();

document.getElementById("backVault").onclick = () => {
  if (!dirty || confirm("Go back without saving?")) {
    window.history.back();
  }
};

window.onload = loadVault;
window.onbeforeunload = () => dirty ? true : null;
