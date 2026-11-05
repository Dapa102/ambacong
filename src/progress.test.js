import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceProgress } from './progress.js';

test('key must be collected before the door opens', () => {
  assert.equal(advanceProgress('start', 'door'), 'start');
  assert.equal(advanceProgress('start', 'key'), 'key');
  assert.equal(advanceProgress('key', 'door'), 'done');
  assert.equal(advanceProgress('done', 'key'), 'done');
});
