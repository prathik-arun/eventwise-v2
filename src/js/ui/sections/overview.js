'use strict';

/** The read-only parts of a plan: summary, key insights and the timeline. */
Eventwise.ui.overview = (() => {
  const { announce } = Eventwise.ui;
  const { VIBES } = Eventwise.content;
  const { formatDate, formatINR, pluralize } = Eventwise.format;
  const { button, el, labelledSection } = Eventwise.dom;
  const { planToText } = Eventwise.plan;

  function buildStats({ request }) {
    const countdown = request.past ? 'Past event' : `${pluralize(request.days, 'day')} to go`;
    const stats = [
      ['Date', formatDate(request.date)],
      ['Countdown', countdown],
      ['Guests', String(request.guests)],
      ['Budget', formatINR(request.budget)],
      ['Per guest', formatINR(request.budget / request.guests)],
      ['Style', request.vibe],
    ];
    return el(
      'dl',
      { class: 'stats meta' },
      ...stats.map(([term, value]) =>
        el('div', { class: 'stat' }, el('dt', {}, term), el('dd', {}, value)),
      ),
    );
  }

  async function copyPlan(plan) {
    try {
      await navigator.clipboard.writeText(planToText(plan));
      announce('Plan copied to clipboard.');
    } catch {
      announce('Copy failed. Select the content manually.');
    }
  }

  function printPage() {
    try {
      window.print();
    } catch {
      announce('Printing is not available here.');
    }
  }

  /** The plan title (focus moves here when a plan opens) with its key figures and actions. */
  function buildSummary(plan) {
    const { request } = plan;
    const { icon, label } = Eventwise.profiles[request.type];
    const title = el(
      'h2',
      { id: 'plan-title', tabindex: '-1' },
      el('span', { 'aria-hidden': 'true' }, `${icon} `),
      `${request.name || label} plan`,
    );
    return el(
      'section',
      { 'aria-labelledby': 'plan-title' },
      title,
      buildStats(plan),
      el(
        'div',
        { class: 'row-actions' },
        button('Copy plan as text', () => copyPlan(plan), { class: 'alt' }),
        button('Print or save as PDF', printPage, { class: 'alt' }),
      ),
    );
  }

  function buildInsights({ request, insights }) {
    const paragraphs = insights.map(({ text, warning }) =>
      el('p', { class: warning ? 'note' : '' }, text),
    );
    return labelledSection(
      'insights-heading',
      'Key insights',
      ...paragraphs,
      el('p', { class: 'hint' }, VIBES[request.vibe]),
    );
  }

  function describeDue(step) {
    return step.inDays === 0 ? 'today' : `in ${pluralize(step.inDays, 'day')}`;
  }

  function buildTimeline({ request, timeline }) {
    const items = timeline.map((step) => {
      const due = request.past ? '' : ` (${describeDue(step)})`;
      return el(
        'li',
        {},
        el('strong', {}, formatDate(step.due)),
        `${due}: ${step.task}`,
        step.compressed ? el('span', { class: 'badge' }, 'Fast-tracked') : '',
      );
    });
    return labelledSection(
      'timeline-heading',
      'Timeline',
      el('ol', { class: 'timeline', role: 'list' }, ...items),
    );
  }

  return { buildSummary, buildInsights, buildTimeline };
})();
