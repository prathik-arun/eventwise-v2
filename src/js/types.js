/**
 * Shapes of the main data passed between modules. This file has no code: it
 * exists so the JSDoc in other files can refer to one definition of each shape.
 *
 * @typedef {object} PlanRequest A validated request to plan an event.
 * @property {string} [id] Unique id, assigned when the plan is created or loaded from history.
 * @property {string} type Event type id, a key of `PROFILES`.
 * @property {string} name Optional event name (may be empty).
 * @property {string} requests Free-text "specific needs" (may be empty).
 * @property {Date} date Event day, local midnight.
 * @property {number} days Days from the plan's start date to the event.
 * @property {number} guests Whole number of guests.
 * @property {number} budget Total budget in rupees.
 * @property {string} vibe Style, a key of `VIBES`.
 * @property {string[]} priorities Budget categories given a bigger share.
 * @property {boolean} past True when the event date has already passed.
 *
 * @typedef {object} BudgetRow One category of the budget split.
 * @property {string} category
 * @property {number} amount Rupees.
 * @property {number} percent Share of the total, 0 to 100.
 *
 * @typedef {object} TimelineStep
 * @property {string} task
 * @property {number} inDays Days from the start date.
 * @property {Date} due
 * @property {boolean} compressed True when short notice moved this step closer to the event.
 *
 * @typedef {object} Insight
 * @property {string} text
 * @property {boolean} warning True when the insight should be highlighted.
 *
 * @typedef {object} Plan A complete plan, as drawn on the page.
 * @property {PlanRequest} request
 * @property {BudgetRow[]} rows
 * @property {TimelineStep[]} timeline
 * @property {Insight[]} insights
 * @property {{label: string, url: string}[]} shoppingLinks
 */

export {};
