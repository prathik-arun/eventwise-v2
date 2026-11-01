import { LARGE_CROWD_GUESTS } from '../data/constants.js';
import { PROFILES } from '../data/events/index.js';
import { formatINR, pluralize } from '../lib/format.js';

/** Plain-language observations about a plan: affordability, timing, crowd and season. */

// Months are zero-based, as in `Date#getMonth()`: January is 0, December is 11.
const MONSOON_MONTHS = new Set([5, 6, 7, 8]);
const SUMMER_MONTHS = new Set([3, 4]);
const WEDDING_PEAK_MONTHS = new Set([10, 11, 0, 1]);
const WEEKEND_DAYS = new Set([0, 6]); // Sunday and Saturday

/**
 * Weather, demand and pricing tips for the date.
 * @param {Date} date
 * @param {string} type event type id
 * @returns {string[]}
 */
function seasonTips(date, type) {
  const month = date.getMonth();
  const tips = [];
  if (MONSOON_MONTHS.has(month)) {
    tips.push('Monsoon season: pick a covered or indoor venue, or keep a rain backup.');
  }
  if (SUMMER_MONTHS.has(month)) {
    tips.push('Summer heat: prefer evening timings, shade and cooling.');
  }
  if (type === 'wedding' && WEDDING_PEAK_MONTHS.has(month)) {
    tips.push(
      'Peak wedding season: book venue, caterer and photographer early, as demand and prices rise.',
    );
  }
  if (WEEKEND_DAYS.has(date.getDay())) {
    tips.push('Weekend date: venues often charge a premium, so a weekday could save money.');
  }
  return tips;
}

function perGuestInsight(request, profile) {
  const perGuest = request.budget / request.guests;
  const level = formatINR(perGuest);
  if (perGuest >= profile.minPerGuest) {
    return {
      text: `Your budget is ${level} per guest, a workable level for this kind of event.`,
    };
  }
  return {
    text:
      `Your budget is ${level} per guest, below the typical ${formatINR(profile.minPerGuest)} ` +
      'for this kind of event. Consider fewer guests or simpler catering.',
    warning: true,
  };
}

/**
 * @param {object} request a validated plan request
 * @returns {{text: string, warning: boolean}[]} in display order
 */
function buildInsights(request) {
  const profile = PROFILES[request.type];
  const items = [perGuestInsight(request, profile)];

  if (!request.past && request.days < profile.rushDays) {
    items.push({
      text: `Only ${pluralize(request.days, 'day')} to go, so the timeline is compressed. Lock the venue and food first.`,
      warning: true,
    });
  }
  if (request.guests >= LARGE_CROWD_GUESTS) {
    items.push({ text: 'Large crowd: plan entry flow, seating and a helpdesk.' });
  }
  if (!request.past) {
    items.push(...seasonTips(request.date, request.type).map((text) => ({ text })));
  }
  if (request.priorities.length) {
    items.push({ text: `Extra budget share went to: ${request.priorities.join(', ')}.` });
  }
  return items.map((item) => ({ warning: false, ...item }));
}

export { buildInsights, seasonTips };
