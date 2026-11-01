import { CONTINGENCY } from '../data/constants.js';
import { PROFILES } from '../data/events/index.js';
import { formatDate, formatINR } from '../lib/format.js';

/**
 * Rule-based answers used when the AI is not available. They only read the
 * plan, so they work with no network and no permissions.
 */

const BIGGEST_COSTS_SHOWN = 2;
const GUESTS_TRIMMED = 10;
const NEXT_TASKS_SHOWN = 3;

/** The assistant's general-purpose answer: where the money goes and one way to save. */
function quickAdvice({ request, rows }) {
  const biggest = rows
    .filter((row) => row.category !== CONTINGENCY)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, BIGGEST_COSTS_SHOWN)
    .map((row) => `${row.category} (${formatINR(row.amount)})`);
  const savings = formatINR(Math.round(request.budget / request.guests) * GUESTS_TRIMMED);
  return (
    `Your biggest costs are ${biggest.join(' and ')}. Trimming ${GUESTS_TRIMMED} guests would ` +
    `free up about ${savings}. Compare at least two quotes for the top category and keep ` +
    'the contingency untouched.'
  );
}

function invitationText({ request }) {
  const occasion = request.name || PROFILES[request.type].label.toLowerCase();
  return (
    `You are warmly invited to ${occasion} on ${formatDate(request.date)}. ` +
    'Please join us to celebrate, and let us know you are coming by replying to this message.'
  );
}

const RISKS_TEXT =
  'Common risks: vendors not confirmed in writing, no rain or heat backup, a headcount that ' +
  'keeps growing, and unpaid balances on the day. Confirm every vendor a week before, keep ' +
  'the contingency untouched and name a point person for each vendor.';

function nextStepsText({ timeline }) {
  const upcoming = timeline
    .filter((step) => step.inDays >= 0)
    .slice(0, NEXT_TASKS_SHOWN)
    .map((step) => step.task);
  if (!upcoming.length) {
    return 'The event date has passed, so note what went well for next time.';
  }
  return `Focus next on: ${upcoming.join('; ')}.`;
}

function extraGuestsText({ request }) {
  const perGuest = formatINR(Math.round(request.budget / request.guests));
  return (
    `If more guests come than planned, each extra guest costs about ${perGuest} at your ` +
    'current rate. Ask the caterer for a 10% buffer, keep spare seating, and use your ' +
    'contingency for it.'
  );
}

/** Question patterns, checked in order; the first match decides the answer. */
const TOPICS = [
  { pattern: /invit/, answer: invitationText },
  { pattern: /wrong|risk|problem|fail/, answer: () => RISKS_TEXT },
  { pattern: /week|next|todo|start/, answer: nextStepsText },
  { pattern: /many|crowd|extra|overflow/, answer: extraGuestsText },
];

/**
 * @param {string} question
 * @param {object} plan
 * @returns {string} the answer for the first topic the question mentions, else general advice
 */
function offlineAnswer(question, plan) {
  const text = question.toLowerCase();
  const topic = TOPICS.find(({ pattern }) => pattern.test(text));
  return topic ? topic.answer(plan) : quickAdvice(plan);
}

export { quickAdvice, offlineAnswer };
