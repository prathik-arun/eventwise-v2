import { MS_PER_DAY } from '../data/constants.js';

/** Calendar-day helpers. All dates are local; the time of day is always ignored. */
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** @param {Date} date @returns {Date} midnight at the start of `date`'s day */
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** @param {Date} date @param {number} days @returns {Date} a new date `days` later */
const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** @returns {number} whole calendar days from `from` to `to` (negative if `to` is earlier) */
const daysBetween = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);

/**
 * Parses a `YYYY-MM-DD` string.
 * @param {unknown} text
 * @returns {Date | null} null for anything that is not a real calendar date (e.g. 2026-02-30)
 */
function parseISODate(text) {
  const match = ISO_DATE_PATTERN.exec(text ?? '');
  if (!match) {
    return null;
  }
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  date.setFullYear(year);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

/** @param {Date} date @returns {string} `YYYY-MM-DD` in local time */
function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export { startOfDay, addDays, daysBetween, parseISODate, toISODate };
