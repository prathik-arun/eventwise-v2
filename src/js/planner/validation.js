import { CONTINGENCY, LIMITS } from '../data/constants.js';
import { VIBES } from '../data/content.js';
import { PROFILES } from '../data/events/index.js';
import { daysBetween, parseISODate } from '../lib/dates.js';

/**
 * Validation and sanitising of everything that enters the app, whether it is
 * typed into the form or read back from saved history.
 */

const DEFAULT_VIBE = Object.keys(VIBES)[0];

const hasProfile = (type) => Object.hasOwn(PROFILES, type);

/** @returns {boolean} true for a whole number of guests within the allowed range */
const isGuestCount = (value) =>
  Number.isInteger(value) && value >= LIMITS.minGuests && value <= LIMITS.maxGuests;

/** @returns {boolean} true for a whole rupee budget within the allowed range */
const isBudget = (value) =>
  Number.isInteger(value) && value >= LIMITS.minBudget && value <= LIMITS.maxBudget;

/** Trims `value` and cuts it to `maxLength`; null and undefined become ''. */
const cleanText = (value, maxLength) =>
  String(value ?? '')
    .trim()
    .slice(0, maxLength);

/** Falls back to the first style when `vibe` is not a known one. */
const cleanVibe = (vibe) => (Object.hasOwn(VIBES, vibe) ? vibe : DEFAULT_VIBE);

/** Keeps only real, non-contingency budget categories of `type`, without repeats. */
function cleanPriorities(type, priorities) {
  const categories = Object.keys(PROFILES[type].allocation);
  const wanted = Array.isArray(priorities) ? priorities : [];
  const valid = wanted.filter((name) => name !== CONTINGENCY && categories.includes(name));
  return [...new Set(valid)];
}

/** One check per form field; each returns an error message, or null when the value is fine. */
const FIELD_CHECKS = {
  type: (input) => (hasProfile(input.type) ? null : 'Choose an event type.'),
  date: (input, today) => {
    const date = parseISODate(input.date);
    if (!date) {
      return 'Enter a valid date.';
    }
    return daysBetween(today, date) < 0 ? 'Pick today or a future date.' : null;
  },
  guests: (input) =>
    isGuestCount(Number(input.guests)) ? null : 'Enter a whole number from 1 to 5,000.',
  budget: (input) =>
    isBudget(Number(input.budget)) ? null : 'Enter a whole amount from ₹1,000 to ₹100 crore.',
};

function collectErrors(input, today) {
  const errors = {};
  for (const [field, check] of Object.entries(FIELD_CHECKS)) {
    const message = check(input, today);
    if (message) {
      errors[field] = message;
    }
  }
  return errors;
}

/**
 * Validates the raw form values.
 * @param {object} input raw strings from the form
 * @param {Date} today the start of today, so tests can fix the date
 * @returns {{errors: Record<string, string>, value?: object}}
 *   `value` (a clean plan request) is only present when there are no errors.
 */
function validatePlanRequest(input, today) {
  const errors = collectErrors(input, today);
  if (Object.keys(errors).length) {
    return { errors };
  }

  const date = parseISODate(input.date);
  const value = {
    type: input.type,
    name: cleanText(input.name, LIMITS.nameLength),
    requests: cleanText(input.requests, LIMITS.requestsLength),
    past: false,
    date,
    days: daysBetween(today, date),
    guests: Number(input.guests),
    budget: Number(input.budget),
    vibe: cleanVibe(input.vibe),
    priorities: cleanPriorities(input.type, input.priorities),
  };
  return { errors, value };
}

export {
  DEFAULT_VIBE,
  hasProfile,
  isGuestCount,
  isBudget,
  cleanText,
  cleanVibe,
  cleanPriorities,
  validatePlanRequest,
};
