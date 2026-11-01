'use strict';

const { beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryStorage, loadCore } = require('../helpers/load-core');

const storageBacking = createMemoryStorage();
const { constants, history, storage } = loadCore({ localStorage: storageBacking });
const { STORAGE_KEYS, LIMITS } = constants;

const request = (id, overrides = {}) => ({
  id,
  type: 'birthday',
  name: 'Party',
  date: new Date(2026, 5, 20),
  guests: 40,
  budget: 80_000,
  vibe: 'Traditional',
  priorities: ['Decor'],
  requests: '',
  ...overrides,
});

beforeEach(() => {
  for (const key of [...Array(storageBacking.length).keys()].map((i) => storageBacking.key(i))) {
    storageBacking.removeItem(key);
  }
});

describe('cleanEntry', () => {
  const raw = { id: '1', type: 'wedding', date: '2026-01-01', guests: 5, budget: 5000 };

  it('accepts a valid entry and fills in safe defaults', () => {
    const entry = history.cleanEntry({ ...raw, priorities: ['Venue', 'nope', 'Contingency'] });
    assert.deepEqual([...entry.priorities], ['Venue']);
    assert.equal(entry.vibe, 'Traditional');
    assert.equal(entry.created, 0);
  });

  it('rejects entries that are unsafe or invalid', () => {
    const bad = [
      null,
      'text',
      { ...raw, id: 1 },
      { ...raw, type: 'constructor' },
      { ...raw, date: 'bad' },
      { ...raw, date: '2026-02-30' },
      { ...raw, guests: 0 },
      { ...raw, guests: 5001 },
      { ...raw, budget: 5 },
    ];
    for (const entry of bad) {
      assert.equal(history.cleanEntry(entry), null, JSON.stringify(entry));
    }
  });

  it('shortens oversized text', () => {
    const entry = history.cleanEntry({ ...raw, id: 'x'.repeat(100), name: 'n'.repeat(100) });
    assert.equal(entry.id.length, LIMITS.idLength);
    assert.equal(entry.name.length, LIMITS.nameLength);
  });
});

describe('saving and loading', () => {
  it('saves newest first and replaces an entry saved again', () => {
    history.saveEntry(request('a'));
    history.saveEntry(request('b'));
    history.saveEntry(request('a', { name: 'Renamed' }));
    const saved = history.loadHistory();
    assert.deepEqual(
      saved.map((entry) => entry.id),
      ['a', 'b'],
    );
    assert.equal(saved[0].name, 'Renamed');
  });

  it('stores the date as text and keeps at most the allowed number of plans', () => {
    for (let i = 0; i < LIMITS.historyEntries + 5; i += 1) {
      history.saveEntry(request(String(i)));
    }
    const saved = history.loadHistory();
    assert.equal(saved.length, LIMITS.historyEntries);
    assert.equal(saved[0].id, String(LIMITS.historyEntries + 4));
    assert.equal(saved[0].date, '2026-06-20');
  });

  it('drops corrupted entries when loading', () => {
    storage.write(STORAGE_KEYS.history, [
      { id: 'ok', type: 'wedding', date: '2026-01-01', guests: 5, budget: 5000 },
      { id: 2 },
      null,
    ]);
    assert.deepEqual(
      history.loadHistory().map((entry) => entry.id),
      ['ok'],
    );
  });
});

describe('deleting', () => {
  it('deleteEntry removes the plan together with its checklist and spending', () => {
    history.saveEntry(request('a'));
    history.saveEntry(request('b'));
    storage.write(history.checklistKey('a'), ['x']);
    storage.write(history.spentKey('a'), { Venue: 5 });
    history.deleteEntry('a');
    assert.deepEqual(
      history.loadHistory().map((entry) => entry.id),
      ['b'],
    );
    assert.deepEqual(storage.readList(history.checklistKey('a')), []);
    assert.deepEqual(storage.readRecord(history.spentKey('a')), {});
  });

  it('clearHistory removes every plan and its saved progress', () => {
    history.saveEntry(request('a'));
    storage.write(history.checklistKey('a'), ['x']);
    storage.write(history.spentKey('a'), { Venue: 5 });
    history.clearHistory();
    assert.deepEqual(history.loadHistory(), []);
    assert.equal(storageBacking.length, 0);
  });
});

describe('entryToRequest', () => {
  const today = new Date(2026, 0, 1);
  const entry = (overrides) =>
    history.cleanEntry({ id: '1', type: 'birthday', guests: 10, budget: 5000, ...overrides });

  it('counts an upcoming event from today', () => {
    const { request: rebuilt, startDate } = history.entryToRequest(
      entry({ date: '2026-01-11' }),
      today,
    );
    assert.equal(rebuilt.past, false);
    assert.equal(rebuilt.days, 10);
    assert.equal(startDate.getTime(), today.getTime());
  });

  it('replays a past event from the day it was created', () => {
    const created = new Date(2025, 10, 1).getTime();
    const { request: rebuilt } = history.entryToRequest(
      entry({ date: '2025-12-25', created }),
      today,
    );
    assert.equal(rebuilt.past, true);
    assert.equal(rebuilt.days, 54);
  });

  it('never starts the countdown after the event itself', () => {
    const created = new Date(2026, 5, 1).getTime();
    const { request: rebuilt, startDate } = history.entryToRequest(
      entry({ date: '2025-12-25', created }),
      today,
    );
    assert.equal(rebuilt.days, 0);
    assert.equal(startDate.getTime(), new Date(2025, 11, 25).getTime());
  });
});
