import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as offline from '../../src/js/assistant/offline.js';
import * as budget from '../../src/js/planner/budget.js';
import * as timeline from '../../src/js/planner/timeline.js';

function makePlan(overrides = {}) {
  const request = {
    type: 'wedding',
    name: 'Meera',
    date: new Date(2026, 11, 12),
    budget: 1_000_000,
    guests: 100,
    days: 40,
    past: false,
    ...overrides,
  };
  return {
    request,
    rows: budget.allocateBudget(request.type, request.budget),
    timeline: timeline.buildTimeline(request.type, new Date(2026, 10, 1), request.date),
  };
}

describe('offlineAnswer', () => {
  const plan = makePlan();
  const answer = (question) => offline.offlineAnswer(question, plan);

  it('drafts an invitation using the event name and date', () => {
    assert.match(answer('Write a short invitation message'), /invited to Meera on 12 Dec 2026/);
  });

  it('lists common risks', () => {
    assert.match(answer('What could go wrong?'), /Common risks/);
  });

  it('suggests the next upcoming tasks', () => {
    assert.match(answer('What should I do this week?'), /^Focus next on: .+\.$/);
  });

  it('says so when the event has passed', () => {
    const past = makePlan({ date: new Date(2026, 9, 1) });
    past.timeline = past.timeline.map((step) => ({ ...step, inDays: -1 }));
    assert.match(offline.offlineAnswer('what next?', past), /has passed/);
  });

  it('prices an extra guest', () => {
    assert.match(answer('what if too many people come?'), /extra guest costs about ₹10,000/);
  });

  it('answers anything else with general advice', () => {
    assert.match(answer('How can I save 15%?'), /biggest costs/);
  });

  it('falls back to the event type when there is no name', () => {
    const unnamed = makePlan({ name: '' });
    assert.match(offline.offlineAnswer('invitation please', unnamed), /invited to wedding on/);
  });
});

describe('quickAdvice', () => {
  it('names the two biggest costs and never the contingency', () => {
    const advice = offline.quickAdvice(makePlan());
    assert.match(advice, /Venue \(₹3,00,000\) and Catering \(₹2,80,000\)/);
    assert.doesNotMatch(advice, /Contingency \(/);
  });

  it('prices ten fewer guests at the per-guest rate', () => {
    assert.match(
      offline.quickAdvice(makePlan()),
      /Trimming 10 guests would free up about ₹1,00,000/,
    );
  });

  it('does not reorder the plan rows', () => {
    const plan = makePlan();
    const before = plan.rows.map((row) => row.category);
    offline.quickAdvice(plan);
    assert.deepEqual(
      plan.rows.map((row) => row.category),
      before,
    );
  });
});
