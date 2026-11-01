'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load-core');

const { validation } = loadCore();
const today = new Date(2026, 0, 1);

const validInput = (overrides = {}) => ({
  type: 'wedding',
  date: '2026-03-01',
  guests: '100',
  budget: '500000',
  ...overrides,
});

describe('validatePlanRequest: errors', () => {
  it('reports every invalid field and returns no value', () => {
    const result = validation.validatePlanRequest({}, today);
    assert.deepEqual(Object.keys(result.errors).sort(), ['budget', 'date', 'guests', 'type']);
    assert.equal(result.value, undefined);
  });

  it('rejects an unknown or inherited event type', () => {
    for (const type of ['party', 'constructor', '__proto__', '']) {
      assert.ok(validation.validatePlanRequest(validInput({ type }), today).errors.type, type);
    }
  });

  it('rejects dates that are past, impossible or missing', () => {
    for (const date of ['2025-12-31', '2026-02-30', '']) {
      assert.ok(validation.validatePlanRequest(validInput({ date }), today).errors.date, date);
    }
  });

  it('accepts today', () => {
    const result = validation.validatePlanRequest(validInput({ date: '2026-01-01' }), today);
    assert.equal(result.errors.date, undefined);
    assert.equal(result.value.days, 0);
  });

  it('enforces the guest range and whole numbers', () => {
    for (const guests of ['0', '1.5', '5001', '-3', 'many', '']) {
      assert.ok(
        validation.validatePlanRequest(validInput({ guests }), today).errors.guests,
        guests,
      );
    }
    for (const guests of ['1', '5000']) {
      assert.equal(
        validation.validatePlanRequest(validInput({ guests }), today).errors.guests,
        undefined,
      );
    }
  });

  it('enforces the budget range and whole numbers', () => {
    for (const budget of ['999', '1000.5', '1000000001', 'lots', '']) {
      assert.ok(
        validation.validatePlanRequest(validInput({ budget }), today).errors.budget,
        budget,
      );
    }
    for (const budget of ['1000', '1000000000']) {
      assert.equal(
        validation.validatePlanRequest(validInput({ budget }), today).errors.budget,
        undefined,
      );
    }
  });
});

describe('validatePlanRequest: clean value', () => {
  it('converts numbers and dates and works out the days to go', () => {
    const { value } = validation.validatePlanRequest(validInput(), today);
    assert.equal(value.guests, 100);
    assert.equal(value.budget, 500000);
    assert.equal(value.days, 59);
    assert.equal(value.past, false);
    assert.ok(value.date instanceof Date);
  });

  it('trims and shortens free text', () => {
    const { value } = validation.validatePlanRequest(
      validInput({ name: `  ${'N'.repeat(80)}  `, requests: ' flowers ' }),
      today,
    );
    assert.equal(value.name, 'N'.repeat(60));
    assert.equal(value.requests, 'flowers');
  });

  it('falls back to the first style for an unknown one', () => {
    const { value } = validation.validatePlanRequest(validInput({ vibe: 'Steampunk' }), today);
    assert.equal(value.vibe, validation.DEFAULT_VIBE);
  });

  it('keeps only real, distinct, non-contingency priorities', () => {
    const { value } = validation.validatePlanRequest(
      validInput({
        type: 'community',
        priorities: ['Venue & permits', 'Venue & permits', 'Contingency', 'bogus'],
      }),
      today,
    );
    assert.deepEqual([...value.priorities], ['Venue & permits']);
  });
});

describe('cleanPriorities', () => {
  it('ignores input that is not a list', () => {
    assert.deepEqual([...validation.cleanPriorities('wedding', 'Venue')], []);
    assert.deepEqual([...validation.cleanPriorities('wedding', null)], []);
  });
});
