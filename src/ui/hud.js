const objectiveEl = document.getElementById('objective');
const promptEl = document.getElementById('interaction-prompt');
const flashlightEl = document.getElementById('flashlight-status');
const staminaEl = document.getElementById('stamina-status');
const hiddenEl = document.getElementById('hidden-status');
const inventoryQuickEl = document.getElementById('inventory-quick');
const objectiveToastEl = document.getElementById('objective-toast');

let objectiveTimer = null;
let lastObjective = null;

export const hud = {
  setObjective(text) {
    objectiveEl.textContent = text;
    if (lastObjective !== text) {
      lastObjective = text;
      showObjectiveToast(text);
    }
  },

  setPrompt(text) {
    if (text) {
      promptEl.innerHTML = `<span class="key">[E]</span>${text}`;
      promptEl.classList.add('show');
    } else {
      promptEl.classList.remove('show');
      promptEl.textContent = '';
    }
  },

  setFlashlight(battery, on) {
    flashlightEl.innerHTML = `<span class="tag">Senter</span><span class="val">${
      on ? 'Nyala' : 'Mati'
    } ${Math.round(battery)}%</span>`;
  },

  setStamina(stamina) {
    const rounded = Math.round(stamina);
    staminaEl.innerHTML = `<span class="tag">Stamina</span><span class="val">${rounded}%</span>`;
    staminaEl.classList.toggle('low', rounded <= 25);
  },

  setHidden(text) {
    if (text) {
      hiddenEl.textContent = text;
      hiddenEl.classList.add('show');
    } else {
      hiddenEl.classList.remove('show');
      hiddenEl.textContent = '';
    }
  },

  setInventory(items, catalog) {
    const grouped = new Map();
    for (const id of items) {
      grouped.set(id, (grouped.get(id) ?? 0) + 1);
    }
    inventoryQuickEl.innerHTML = '';
    for (const [id, count] of grouped) {
      const chip = document.createElement('div');
      chip.className = 'inventory-chip';
      const name = catalog[id]?.name ?? id;
      chip.innerHTML = `${name}<span class="count">${count > 1 ? ` ×${count}` : ''}</span>`;
      inventoryQuickEl.appendChild(chip);
    }
  },
};

const showObjectiveToast = (text) => {
  if (!objectiveToastEl) return;
  objectiveToastEl.innerHTML = `<span class="tag">OBJEKTIF BARU</span> ${text}`;
  objectiveToastEl.classList.remove('show');
  void objectiveToastEl.offsetWidth;
  objectiveToastEl.classList.add('show');
  if (objectiveTimer) clearTimeout(objectiveTimer);
  objectiveTimer = setTimeout(() => objectiveToastEl.classList.remove('show'), 4200);
};