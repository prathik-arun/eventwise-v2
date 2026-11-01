import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as budget from '../../src/js/planner/budget.js';
import { PROFILES as profiles } from '../../src/js/data/events/index.js';

const sumOf = (rows) => rows.reduce((total, row) => total + row.amount, 0);

describe('allocateBudget', () => {
  for (const type of Object.keys(profiles)) {
    it(`${type}: rows add up to the budget exactly`, () => {
      for (const total of [1000, 1001, 123457, 5_000_000, 999_999_999]) {
        assert.equal(sumOf(budget.allocateBudget(type, total)), total, `${type} ${total}`);
      }
    });
  }

  it('lists the profile categories in order, contingency last', () => {
    const categories = budget.allocateBudget('birthday', 50000).map((row) => row.category);
    assert.deepEqual(categories, Object.keys(profiles.birthday.allocation));
    assert.equal(categories.at(-1), 'Contingency');
  });

  it('reports each share as a percentage of the total', () => {
    const rows = budget.allocateBudget('wedding', 1_000_000);
    assert.ok(Math.abs(rows.reduce((total, row) => total + row.percent, 0) - 100) < 1e-9);
  });

  it('gives a prioritised category a bigger share', () => {
    const plain = budget.allocateBudget('wedding', 1_000_000);
    const boosted = budget.allocateBudget('wedding', 1_000_000, ['Decor & flowers']);
    const amountOf = (rows, name) => rows.find((row) => row.category === name).amount;
    assert.ok(amountOf(boosted, 'Decor & flowers') > amountOf(plain, 'Decor & flowers'));
    assert.ok(amountOf(boosted, 'Catering') < amountOf(plain, 'Catering'));
  });

  it('keeps contingency at its fixed share whatever the priorities', () => {
    const rows = budget.allocateBudget('wedding', 1_000_000, ['Venue', 'Catering']);
    assert.equal(rows.find((row) => row.category === 'Contingency').amount, 50_000);
  });
});

describe('clampMoney', () => {
  it('turns anything into a whole, non-negative amount within the limit', () => {
    assert.equal(budget.clampMoney('abc'), 0);
    assert.equal(budget.clampMoney(undefined), 0);
    assert.equal(budget.clampMoney(-5), 0);
    assert.equal(budget.clampMoney('1500.7'), 1500);
    assert.equal(budget.clampMoney(1e12), 1e9);
  });
});

describe('spending', () => {
  it('spendStatus reports what is left and whether it is exceeded', () => {
    assert.deepEqual(budget.spendStatus(100, 150), { left: -50, over: true });
    assert.deepEqual(budget.spendStatus(100, 100), { left: 0, over: false });
  });

  it('summarizeSpending totals clean amounts and flags overspent categories', () => {
    const rows = [
      { category: 'Venue', amount: 500 },
      { category: 'Catering', amount: 300 },
    ];
    const summary = budget.summarizeSpending(
      rows,
      { Venue: 600, Catering: 'bad', Other: 99 },
      1000,
    );
    assert.equal(summary.totalSpent, 600);
    assert.deepEqual(summary.total, { left: 400, over: false });
    assert.deepEqual(summary.categories[0], { category: 'Venue', left: -100, over: true });
    assert.deepEqual(summary.categories[1], { category: 'Catering', left: 300, over: false });
  });
});
