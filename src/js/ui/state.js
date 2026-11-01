import { $ } from '../lib/dom.js';

/**
 * The few pieces of state shared between UI parts, plus the screen-reader
 * announcer. Everything else lives in the part of the page that owns it.
 */
export const state = {
  /** The plan currently on screen, or null before the first one is created. */
  plan: null,
  /** The user's shared location, if any. Kept in memory only, never stored. */
  place: null,
  /** The area or city the user typed. */
  area: '',
  /** Questions and answers in the assistant box for the current plan. */
  chat: [],
  chatBusy: false,
};

/** Announces `message` politely to screen readers through the page's status region. */
export function announce(message) {
  $('#status').textContent = message;
}
