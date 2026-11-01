'use strict';

/** Assembles a complete plan from a validated request, and exports it as text. */
Eventwise.plan = (() => {
  const { allocateBudget } = Eventwise.budget;
  const { buildInsights } = Eventwise.insights;
  const { buildShoppingLinks } = Eventwise.links;
  const { buildTimeline } = Eventwise.timeline;
  const { formatDate, formatINR } = Eventwise.format;

  /**
   * @param {object} request a validated plan request (see `validatePlanRequest`)
   * @param {Date} startDate the day the countdown starts from
   * @returns {{request: object, rows: object[], timeline: object[], insights: object[], shoppingLinks: object[]}}
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
    const { label } = Eventwise.profiles[request.type];
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

  return { createPlan, planToText };
})();
