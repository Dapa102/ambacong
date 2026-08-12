import { MAX_INVENTORY, ITEM_CATALOG } from '../systems/inventory-system.js';

const screen = document.getElementById('inventory-screen');
const grid = document.getElementById('inventory-grid');
const detail = document.getElementById('inventory-detail');

let selectedIndex = -1;
let onUse = null;
const ITEM_HINTS = {
  battery: 'Pakai untuk mengisi baterai senter.',
  'key-janitor': 'Kunci pintu keluar utama.',
  'medical-note': 'Hanya artefak cerita.',
};

export const initInventoryUi = ({ onUseItem }) => {
  onUse = onUseItem;
};

export const isInventoryOpen = () => !screen.hidden;

export const openInventory = (items, catalog) => {
  screen.hidden = false;
  grid.innerHTML = '';
  selectedIndex = items.length > 0 ? 0 : -1;
  for (let index = 0; index < MAX_INVENTORY; index += 1) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    const itemId = items[index];
    if (!itemId) {
      slot.classList.add('empty');
      slot.textContent = 'Kosong';
    } else {
      const info = catalog[itemId] ?? { name: itemId };
      const name = document.createElement('span');
      name.className = 'slot-name';
      name.textContent = info.name;
      const count = items.filter((id) => id === itemId).length;
      const countEl = document.createElement('span');
      countEl.className = 'slot-count';
      countEl.textContent = count > 1 ? `×${count}` : '';
      slot.appendChild(name);
      slot.appendChild(countEl);
      slot.dataset.itemId = itemId;
    }
    slot.addEventListener('click', () => {
      if (slot.dataset.itemId) {
        selectedIndex = index;
        renderSelection(items);
      }
    });
    grid.appendChild(slot);
  }
  renderSelection(items);
};

export const closeInventory = () => {
  screen.hidden = true;
};

export const selectFirst = () => {
  selectedIndex = 0;
};

const renderSelection = (items) => {
  grid.querySelectorAll('.inventory-slot').forEach((slot, index) => {
    slot.classList.toggle('selected', index === selectedIndex);
  });
  const itemId = items[selectedIndex];
  const info = itemId ? ITEM_CATALOG[itemId] : null;
  detail.textContent = info
    ? `${info.name} — ${info.description} (${ITEM_HINTS[itemId] ?? ''})`
    : 'Pilih item untuk melihat detail.';
};

export const tryUseSelected = (items) => {
  const itemId = items[selectedIndex];
  if (!itemId) return false;
  const used = onUse?.(itemId) ?? false;
  return used;
};
