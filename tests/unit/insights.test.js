'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load-core');

const { insights } = loadCore();

const request = (overrides = {}) => ({
  type: 'birthday',
  date: new Date(2026, 8, 16), // a Wednesday
  days: 200,
  guests: 50,
  budget: 100_000,
  priorities: [],
  past: false,
  ...overrides,
});

const texts = (items) => items.map((item) => item.text);

describe('buildInsights', () => {
  it('says the budget is workable when it meets the typical per-guest level', () => {
    const [first] = insights.buildInsights(request());
    assert.match(first.text, /workable level/);
    assert.equal(first.warning, false);
  });

  it('warns when the per-guest budget is below the typical level', () => {
    const [first] = insights.buildInsights(request({ budget: 5000 }));
    assert.match(first.text, /below the typical/);
    assert.equal(first.warning, true);
  });

  it('warns about short notice only for upcoming events', () => {
    const rushed = insights.buildInsights(request({ days: 5 }));
    assert.equal(rushed[1].warning, true);
    assert.match(rushed[1].text, /Only 5 days to go/);
    assert.equal(rushed[0].warning, false, 'only the relevant insight is flagged');

    const past = insights.buildInsights(request({ days: 5, past: true }));
    assert.ok(!texts(past).some((text) => /to go/.test(text)));
  });

  it('adds a crowd tip from 300 guests', () => {
    assert.ok(
      texts(insights.buildInsights(request({ guests: 300 }))).some((t) => /Large crowd/.test(t)),
    );
    assert.ok(
      !texts(insights.buildInsights(request({ guests: 299 }))).some((t) => /Large crowd/.test(t)),
    );
  });

  it('names the categories that received extra budget', () => {
    const items = insights.buildInsights(request({ priorities: ['Decor', 'Cake & desserts'] }));
    assert.ok(texts(items).includes('Extra budget share went to: Decor, Cake & desserts.'));
  });

  it('skips season tips for past events', () => {
    const items = insights.buildInsights(request({ date: new Date(2026, 6, 15), past: true }));
    assert.ok(!texts(items).some((text) => /Monsoon/.test(text)));
  });
});

describe('seasonTips', () => {
  const tipsFor = (date, type = 'wedding') => insights.seasonTips(date, type).join(' | ');

  it('flags the monsoon months', () => {
    assert.match(tipsFor(new Date(2026, 6, 15)), /Monsoon/);
    assert.doesNotMatch(tipsFor(new Date(2026, 9, 14)), /Monsoon/);
  });

  it('flags summer heat in April and May', () => {
    assert.match(tipsFor(new Date(2026, 3, 14)), /Summer heat/);
  });

  it('flags the wedding peak season for weddings only', () => {
    assert.match(tipsFor(new Date(2026, 10, 18)), /Peak wedding season/);
    assert.match(tipsFor(new Date(2026, 0, 14)), /Peak wedding season/);
    assert.doesNotMatch(tipsFor(new Date(2026, 10, 18), 'birthday'), /Peak/);
  });

  it('flags weekends, not weekdays', () => {
    assert.match(tipsFor(new Date(2026, 10, 14)), /Weekend date/); // Saturday
    assert.match(tipsFor(new Date(2026, 10, 15)), /Weekend date/); // Sunday
    assert.doesNotMatch(tipsFor(new Date(2026, 6, 15)), /Weekend/); // Wednesday
  });
});
