'use strict';

/**
 * Starts the whole app in jsdom, exactly as a browser would: the page's own
 * `<script src>` tags are inlined in order and run.
 */
const { JSDOM } = require('jsdom');
const { SCRIPT_TAG, readIndexHtml, readScript } = require('./load-core');

const FLUSH_MS = 30;

/**
 * @param {{geolocation?: object, claude?: object}} [options] browser features to fake
 * @returns {Window} the page's window
 */
function bootApp({ geolocation, claude } = {}) {
  const html = readIndexHtml().replace(
    SCRIPT_TAG,
    (_tag, src) => `<script>${readScript(src)}</script>`,
  );
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    beforeParse(window) {
      if (geolocation) {
        window.navigator.geolocation = geolocation;
      }
      if (claude) {
        window.claude = claude;
      }
    },
  });
  return dom.window;
}

/** `YYYY-MM-DD` for a date `days` from today. */
function isoDateIn(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Types into the form and submits it. Anything left out gets a sensible default. */
function submitPlanForm(window, values = {}) {
  const $ = (selector) => window.document.querySelector(selector);
  $('#type').value = values.type ?? 'wedding';
  $('#type').dispatchEvent(new window.Event('change'));
  $('#date').value = values.date ?? isoDateIn(60);
  $('#guests').value = values.guests ?? '100';
  $('#budget').value = values.budget ?? '500000';
  $('#name').value = values.name ?? '';
  $('#plan-form').dispatchEvent(new window.Event('submit', { cancelable: true }));
}

/** Lets promises and timers started by the page settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, FLUSH_MS));

/** Finds a button inside the results whose text matches `pattern`. */
function findButton(window, pattern) {
  const buttons = [...window.document.querySelectorAll('#results button')];
  return buttons.find((candidate) => pattern.test(candidate.textContent));
}

module.exports = { bootApp, findButton, isoDateIn, settle, submitPlanForm };
