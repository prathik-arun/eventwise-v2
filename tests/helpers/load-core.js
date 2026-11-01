'use strict';

/**
 * Loads Eventwise's non-UI scripts into this Node process, in the same order
 * `index.html` lists them, so unit tests exercise the real source files.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..', '..');
const SOURCE_DIR = path.join(ROOT, 'src');
const SCRIPT_TAG = /<script src="([^"]+)"><\/script>/g;

const readIndexHtml = () => fs.readFileSync(path.join(SOURCE_DIR, 'index.html'), 'utf8');

/** @returns {string[]} script paths in the order `index.html` loads them */
const listScripts = () => [...readIndexHtml().matchAll(SCRIPT_TAG)].map((match) => match[1]);

const readScript = (relativePath) => fs.readFileSync(path.join(SOURCE_DIR, relativePath), 'utf8');

/** A minimal in-memory stand-in for `localStorage`. */
function createMemoryStorage() {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    key: (index) => [...items.keys()][index] ?? null,
    get length() {
      return items.size;
    },
  };
}

/**
 * Runs every script that does not touch the DOM and returns the namespace.
 * @param {{localStorage?: object, claude?: object}} [globals] stand-ins for browser globals
 */
function loadCore({ localStorage = createMemoryStorage(), claude } = {}) {
  delete globalThis.Eventwise;
  globalThis.localStorage = localStorage;
  globalThis.claude = claude;

  for (const relativePath of listScripts().filter((script) => !script.startsWith('js/ui/'))) {
    const filename = path.join(SOURCE_DIR, relativePath);
    vm.runInThisContext(readScript(relativePath), { filename });
  }
  return globalThis.Eventwise;
}

module.exports = {
  ROOT,
  SOURCE_DIR,
  SCRIPT_TAG,
  createMemoryStorage,
  loadCore,
  readIndexHtml,
  readScript,
};
