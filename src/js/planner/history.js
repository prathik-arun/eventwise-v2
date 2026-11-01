'use strict';

/**
 * Past plans, kept in the browser's local storage. Anything read back is
 * treated as untrusted and re-validated, because storage can be edited by the
 * user or by other scripts on the same origin.
 */
Eventwise.history = (() => {
  const { LIMITS, STORAGE_KEYS } = Eventwise.constants;
  const { daysBetween, parseISODate, startOfDay, toISODate } = Eventwise.dates;
  const { cleanPriorities, cleanText, cleanVibe, hasProfile, isBudget, isGuestCount } =
    Eventwise.validation;
  const storage = Eventwise.storage;

  const checklistKey = (planId) => `${STORAGE_KEYS.checklistPrefix}${planId}`;
  const spentKey = (planId) => `${STORAGE_KEYS.spentPrefix}${planId}`;

  /**
   * @param {unknown} raw one stored entry
   * @returns {object | null} a clean history entry, or null if the entry is unusable
   */
  function cleanEntry(raw) {
    if (!raw || typeof raw.id !== 'string' || !hasProfile(raw.type)) {
      return null;
    }
    const guests = Number(raw.guests);
    const budget = Number(raw.budget);
    if (!parseISODate(raw.date) || !isGuestCount(guests) || !isBudget(budget)) {
      return null;
    }

    return {
      id: raw.id.slice(0, LIMITS.idLength),
      type: raw.type,
      name: cleanText(raw.name, LIMITS.nameLength),
      date: raw.date,
      guests,
      budget,
      vibe: cleanVibe(raw.vibe),
      priorities: cleanPriorities(raw.type, raw.priorities),
      requests: cleanText(raw.requests, LIMITS.requestsLength),
      created: Number(raw.created) || 0,
    };
  }

  /** @returns {object[]} saved plans, newest first */
  const loadHistory = () => storage.readList(STORAGE_KEYS.history).map(cleanEntry).filter(Boolean);

  /** Saves a plan request at the top of the history, replacing any earlier copy of it. */
  function saveEntry(request) {
    const entry = {
      id: request.id,
      type: request.type,
      name: request.name,
      date: toISODate(request.date),
      guests: request.guests,
      budget: request.budget,
      vibe: request.vibe,
      priorities: request.priorities,
      requests: request.requests,
      created: Date.now(),
    };
    const others = loadHistory().filter((saved) => saved.id !== entry.id);
    storage.write(STORAGE_KEYS.history, [entry, ...others].slice(0, LIMITS.historyEntries));
  }

  const forgetPlanData = (planId) => {
    storage.remove(checklistKey(planId));
    storage.remove(spentKey(planId));
  };

  function deleteEntry(planId) {
    storage.write(
      STORAGE_KEYS.history,
      loadHistory().filter((saved) => saved.id !== planId),
    );
    forgetPlanData(planId);
  }

  function clearHistory() {
    loadHistory().forEach((saved) => forgetPlanData(saved.id));
    storage.remove(STORAGE_KEYS.history);
  }

  /**
   * Rebuilds a plan request from a saved entry. A past event is replayed from
   * the day it was created, so its timeline keeps the lead time it had then.
   * @param {object} entry a clean entry from `loadHistory`
   * @param {Date} today
   * @returns {{startDate: Date, request: object}}
   */
  function entryToRequest(entry, today) {
    const date = parseISODate(entry.date);
    const past = daysBetween(today, date) < 0;
    const replayStart = startOfDay(new Date(entry.created || date.getTime()));
    const startDate = past ? replayStart : today;
    const base = startDate > date ? date : startDate;

    return {
      startDate: base,
      request: {
        id: entry.id,
        type: entry.type,
        name: entry.name,
        date,
        days: daysBetween(base, date),
        guests: entry.guests,
        budget: entry.budget,
        vibe: entry.vibe,
        priorities: entry.priorities,
        requests: entry.requests,
        past,
      },
    };
  }

  return {
    checklistKey,
    spentKey,
    cleanEntry,
    loadHistory,
    saveEntry,
    deleteEntry,
    clearHistory,
    entryToRequest,
  };
})();
