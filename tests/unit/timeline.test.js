'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load-core');

const { dates, timeline } = loadCore();
const today = new Date(2026, 0, 1);

describe('buildTimeline', () => {
  it('is sorted and ends on the event day', () => {
    const steps = timeline.buildTimeline('wedding', today, dates.addDays(today, 200));
    assert.ok(steps.every((step, i) => i === 0 || steps[i - 1].inDays <= step.inDays));
    assert.equal(steps.at(-1).inDays, 200);
    assert.equal(steps.at(-1).task, 'Event day: name a point person for each vendor');
  });

  it('keeps the ideal lead times when there is plenty of time', () => {
    const steps = timeline.buildTimeline('birthday', today, dates.addDays(today, 100));
    assert.ok(steps.every((step) => !step.compressed));
    assert.equal(steps[0].inDays, 100 - 60);
  });

  it('squeezes milestones into short notice without any landing in the past', () => {
    const steps = timeline.buildTimeline('wedding', today, dates.addDays(today, 3));
    assert.ok(steps.every((step) => step.inDays >= 0 && step.inDays <= 3));
    assert.ok(steps.some((step) => step.compressed));
    assert.equal(steps.at(-1).compressed, false, 'event day itself is never "fast-tracked"');
  });

  it('puts every task on the same day for an event today', () => {
    const steps = timeline.buildTimeline('birthday', today, today);
    assert.ok(steps.every((step) => step.inDays === 0));
  });

  it('gives each step a due date matching its offset', () => {
    const steps = timeline.buildTimeline('community', today, dates.addDays(today, 90));
    for (const step of steps) {
      assert.equal(dates.daysBetween(today, step.due), step.inDays);
    }
  });
});
