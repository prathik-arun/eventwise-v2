'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStorage, loadCore } = require('../helpers/load-core');

describe('storage', () => {
  it('round-trips lists and records', () => {
    const { storage } = loadCore({ localStorage: createMemoryStorage() });
    storage.write('list', ['a', 'b']);
    storage.write('record', { a: 1 });
    assert.deepEqual(storage.readList('list'), ['a', 'b']);
    assert.deepEqual(storage.readRecord('record'), { a: 1 });
  });

  it('returns empty values for missing, corrupt or wrongly shaped data', () => {
    const memory = createMemoryStorage();
    memory.setItem('corrupt', '{not json');
    memory.setItem('object', '{"a":1}');
    memory.setItem('array', '[1]');
    const { storage } = loadCore({ localStorage: memory });
    assert.deepEqual(storage.readList('missing'), []);
    assert.deepEqual(storage.readList('corrupt'), []);
    assert.deepEqual(storage.readList('object'), []);
    assert.deepEqual(storage.readRecord('array'), {});
    assert.deepEqual(storage.readRecord('corrupt'), {});
  });

  it('removes keys', () => {
    const { storage } = loadCore({ localStorage: createMemoryStorage() });
    storage.write('k', ['x']);
    storage.remove('k');
    assert.deepEqual(storage.readList('k'), []);
  });

  it('never throws when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    const { storage } = loadCore({ localStorage: blocked });
    assert.doesNotThrow(() => storage.write('k', []));
    assert.doesNotThrow(() => storage.remove('k'));
    assert.deepEqual(storage.readList('k'), []);
  });
});
