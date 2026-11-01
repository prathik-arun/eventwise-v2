'use strict';

/**
 * Eventwise is written as plain scripts (no bundler, no ES modules) so that
 * `index.html` keeps working when it is opened straight from disk.
 *
 * Every script attaches its public API to this single namespace. The load
 * order is declared in `index.html`; a script may only use the parts of the
 * namespace that were registered by scripts listed above it.
 *
 * - `profiles`: one entry per event type, registered by `js/data/events/*.js`
 * - `ui`: everything that touches the DOM (not loaded by the unit tests)
 */
globalThis.Eventwise = { profiles: {}, ui: {} };
