import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as dates from '../../src/js/lib/dates.js';
import * as plan from '../../src/js/planner/plan.js';
import * as validation from '../../src/js/planner/validation.js';

const today = new Date(2026, 0, 1);

function planFor(input = {}) {
  const { value } = validation.validatePlanRequest(
    { type: 'birthday', date: '2026-02-10', guests: '40', budget: '80000', ...input },
    today,
  );
  return plan.createPlan(value, today);
}

describe('createPlan', () => {
  it('combines the budget, timeline, insights and shopping links for one request', () => {
    const created = planFor({ requests: 'balloons' });
    assert.equal(
      created.rows.reduce((sum, row) => sum + row.amount, 0),
      80000,
    );
    assert.equal(created.timeline.at(-1).inDays, 40);
    assert.ok(created.insights.length >= 1);
    assert.ok(created.shoppingLinks.some((link) => link.label === 'Balloons'));
    assert.equal(created.request.guests, 40);
  });

  it('counts the timeline from the given start date', () => {
    const request = planFor().request;
    const later = plan.createPlan(request, dates.addDays(today, 30));
    assert.equal(later.timeline.at(-1).inDays, 10);
  });
});

describe('planToText', () => {
  it('lists the title, figures, every budget row and every timeline step', () => {
    const created = planFor({ name: 'Riya turns 8', priorities: ['Decor'] });
    const lines = plan.planToText(created).split('\n');

    assert.equal(lines[0], 'Riya turns 8 (Birthday), 10 Feb 2026');
    assert.equal(lines[1], 'Guests: 40 | Budget: ₹80,000');
    assert.equal(
      lines.filter((line) => line.startsWith('- ')).length,
      created.rows.length + created.timeline.length,
    );
    assert.ok(lines.includes('BUDGET') && lines.includes('TIMELINE'));
    assert.match(
      lines.find((line) => line.startsWith('- Contingency')),
      /\(4\.0%\)$/,
    );
  });

  it('uses the event type as the title when there is no name', () => {
    assert.match(plan.planToText(planFor()).split('\n')[0], /^Birthday \(Birthday\), /);
  });
});
