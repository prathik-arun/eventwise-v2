/**
 * Tunable limits and numbers used across the app. Keeping them in one place
 * means validation, storage clean-up and the UI always agree.
 */

/** Budget category that is never given a priority boost. */
export const CONTINGENCY = 'Contingency';

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** A prioritised category gets this multiple of its normal budget weight. */
export const PRIORITY_WEIGHT = 1.3;

/** From this many guests onwards the plan warns about crowd management. */
export const LARGE_CROWD_GUESTS = 300;

export const LIMITS = Object.freeze({
  minGuests: 1,
  maxGuests: 5000,
  minBudget: 1000,
  maxBudget: 1e9,
  nameLength: 60,
  requestsLength: 120,
  areaLength: 60,
  idLength: 40,
  questionLength: 300,
  replyLength: 1200,
  ideaCount: 6,
  ideaTitleLength: 80,
  ideaDetailLength: 240,
  historyEntries: 20,
  chatEntries: 20,
  chatContextEntries: 4,
  nextTasksInContext: 5,
});

export const STORAGE_KEYS = Object.freeze({
  history: 'ew:history',
  checklistPrefix: 'ew:chk:',
  spentPrefix: 'ew:spent:',
});

/** Location is rounded to two decimals (about 1 km) before it is used in a link. */
export const COORDINATE_DECIMALS = 2;

export const GEOLOCATION_OPTIONS = Object.freeze({ timeout: 10000, maximumAge: 600000 });
