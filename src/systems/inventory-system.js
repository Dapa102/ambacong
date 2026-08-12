export const MAX_INVENTORY = 6;

export const ITEM_CATALOG = {
  'key-janitor': {
    name: 'Kunci Janitor',
    description: 'Kunci berkarat untuk pintu keluar utama rumah sakit.',
  },
  battery: { name: 'Baterai Senter', description: 'Baterai cadangan untuk mengisi daya senter.' },
  'medical-note': {
    name: 'Catatan Medis',
    description: 'Catatan pasien dari ruang isolasi. Ada tulisan aneh di sana.',
  },
};

export class InventorySystem {
  constructor() {
    this.items = [];
    this.handlers = new Set();
  }

  add(itemId) {
    if (this.items.length >= MAX_INVENTORY) return false;
    this.items.push(itemId);
    this.emit();
    return true;
  }

  has(itemId) {
    return this.items.includes(itemId);
  }

  count(itemId) {
    return this.items.filter((item) => item === itemId).length;
  }

  remove(itemId) {
    const index = this.items.indexOf(itemId);
    if (index === -1) return false;
    this.items.splice(index, 1);
    this.emit();
    return true;
  }

  info(itemId) {
    return ITEM_CATALOG[itemId] ?? { name: itemId, description: '' };
  }

  restore(items) {
    this.items = Array.isArray(items) ? [...items] : [];
    this.emit();
  }

  onChange(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit() {
    const snapshot = [...this.items];
    for (const handler of [...this.handlers]) handler(snapshot);
  }
}
