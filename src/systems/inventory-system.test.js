import assert from 'node:assert/strict';
import test from 'node:test';
import { InventorySystem, MAX_INVENTORY } from './inventory-system.js';

test('inventory rejects items beyond cap and tracks counts', () => {
  const inventory = new InventorySystem();
  assert.equal(MAX_INVENTORY, 6);
  for (let index = 0; index < 6; index += 1) {
    assert.equal(inventory.add('battery'), true);
  }
  assert.equal(inventory.add('battery'), false);
  assert.equal(inventory.count('battery'), 6);
});

test('has and remove work correctly', () => {
  const inventory = new InventorySystem();
  inventory.add('key-janitor');
  inventory.add('battery');
  assert.equal(inventory.has('key-janitor'), true);
  assert.equal(inventory.remove('key-janitor'), true);
  assert.equal(inventory.has('key-janitor'), false);
  assert.equal(inventory.remove('key-janitor'), false);
});

test('restore replaces item list and notifies handlers', () => {
  const inventory = new InventorySystem();
  let notified = [];
  inventory.onChange((items) => {
    notified = [...items];
  });
  inventory.restore(['medical-note', 'battery']);
  assert.deepEqual(notified, ['medical-note', 'battery']);
  assert.equal(inventory.count('battery'), 1);
});
