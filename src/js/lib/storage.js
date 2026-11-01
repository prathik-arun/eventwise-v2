'use strict';

/**
 * Thin wrapper over `localStorage`. Storage can be missing, full or blocked
 * (private mode, strict browser settings), so every call fails safe: reads
 * return an empty value and writes are silently skipped.
 */
Eventwise.storage = (() => {
  const isPlainObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function readJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  /** @returns {unknown[]} the stored array, or [] if missing or not an array */
  function readList(key) {
    const value = readJSON(key);
    return Array.isArray(value) ? value : [];
  }

  /** @returns {Record<string, unknown>} the stored object, or {} if missing or not an object */
  function readRecord(key) {
    const value = readJSON(key);
    return isPlainObject(value) ? value : {};
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is unavailable or full; the app keeps working without saving.
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Nothing was saved, so there is nothing to remove.
    }
  }

  return { readList, readRecord, write, remove };
})();
