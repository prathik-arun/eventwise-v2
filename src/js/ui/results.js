import { $ } from '../lib/dom.js';
import { buildBudgetSection } from './sections/budget.js';
import { buildChecklistSection } from './sections/checklist.js';
import { buildChatSection, buildIdeasSection } from './sections/assistant.js';
import { buildInsights, buildSummary, buildTimeline } from './sections/overview.js';
import { buildShoppingSection, buildVenueSection } from './sections/venues.js';
import { state } from './state.js';

/** Draws a whole plan into the results area, one section after another. */

/** Section builders in display order. A builder may return null to skip its section. */
const SECTIONS = [
  buildSummary,
  buildInsights,
  buildBudgetSection,
  buildTimeline,
  buildChecklistSection,
  buildVenueSection,
  buildShoppingSection,
  buildIdeasSection,
  buildChatSection,
];

/** Replaces whatever plan is on screen with `plan` and starts a fresh assistant chat. */
function renderPlan(plan) {
  state.plan = plan;
  state.chat = [];
  state.chatBusy = false;

  const container = $('#results');
  container.replaceChildren(...SECTIONS.map((build) => build(plan)).filter(Boolean));
  container.hidden = false;
}

/** Moves keyboard and screen-reader focus to the plan's title. */
const focusTitle = () => $('#plan-title').focus();

export { renderPlan, focusTitle };
