'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load-core');

const { dates } = loadCore();

describe('parseISODate', () => {
  it('parses a real calendar date as local midnight', () => {
    const date = dates.parseISODate('2026-03-15');
    assert.deepEqual(
      [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()],
      [2026, 2, 15, 0],
    );
  });

  it('accepts 29 February only in leap years', () => {
    assert.ok(dates.parseISODate('2024-02-29'));
    assert.equal(dates.parseISODate('2026-02-29'), null);
  });

  it('rejects impossible and malformed input', () => {
    for (const bad of ['2026-02-30', '2026-13-01', '2026-00-10', '26-01-01', 'soon', '', null]) {
      assert.equal(dates.parseISODate(bad), null, String(bad));
    }
  });
});

describe('toISODate', () => {
  it('pads month and day', () => {
    assert.equal(dates.toISODate(new Date(2026, 0, 5)), '2026-01-05');
  });

  it('round-trips with parseISODate', () => {
    assert.equal(dates.toISODate(dates.parseISODate('2026-11-30')), '2026-11-30');
  });
});

describe('daysBetween and addDays', () => {
  it('counts calendar days and ignores the time of day', () => {
    const lateEvening = new Date(2026, 0, 1, 23, 59);
    const earlyMorning = new Date(2026, 0, 2, 0, 1);
    assert.equal(dates.daysBetween(lateEvening, earlyMorning), 1);
  });

  it('is negative when the second date is earlier', () => {
    assert.equal(dates.daysBetween(new Date(2026, 0, 10), new Date(2026, 0, 7)), -3);
  });

  it('adds days across month ends', () => {
    assert.equal(dates.toISODate(dates.addDays(new Date(2026, 0, 31), 1)), '2026-02-01');
  });

  it('startOfDay drops the time', () => {
    const start = dates.startOfDay(new Date(2026, 5, 1, 17, 45, 10));
    assert.deepEqual([start.getHours(), start.getMinutes(), start.getSeconds()], [0, 0, 0]);
  });
});
