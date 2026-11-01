import { PROFILES } from '../data/events/index.js';
import { formatDate, formatINR } from '../lib/format.js';
import { allocateBudget } from './budget.js';
import { buildInsights } from './insights.js';
import { buildShoppingLinks } from './links.js';
import { buildTimeline } from './timeline.js';

/** Assembles a complete plan from a validated request, and exports it as text. */

/**
 * @param {import('../types.js').PlanRequest} request a validated plan request
 * @param {Date} startDate the day the countdown starts from
 * @returns {import('../types.js').Plan}
 */
function createPlan(request, startDate) {
  const rows = allocateBudget(request.type, request.budget, request.priorities);
  return {
    request,
    rows,
    timeline: buildTimeline(request.type, startDate, request.date),
    insights: buildInsights(request),
    shoppingLinks: buildShoppingLinks(request, rows),
  };
}

/** @returns {string} the plan as plain text, for copying */
function planToText({ request, rows, timeline }) {
  const { label } = PROFILES[request.type];
  return [
    `${request.name || label} (${label}), ${formatDate(request.date)}`,
    `Guests: ${request.guests} | Budget: ${formatINR(request.budget)}`,
    '',
    'BUDGET',
    ...rows.map(
      (row) => `- ${row.category}: ${formatINR(row.amount)} (${row.percent.toFixed(1)}%)`,
    ),
    '',
    'TIMELINE',
    ...timeline.map((step) => `- ${formatDate(step.due)}: ${step.task}`),
  ].join('\n');
}

export { createPlan, planToText };
