'use strict';

/** Draws a whole plan into the results area, one section after another. */
Eventwise.ui.results = (() => {
  const { $ } = Eventwise.dom;
  const { assistant, budget, checklist, overview, state, venues } = Eventwise.ui;

  /** Section builders in display order. A builder may return null to skip its section. */
  const SECTIONS = [
    overview.buildSummary,
    overview.buildInsights,
    budget.buildBudgetSection,
    overview.buildTimeline,
    checklist.buildChecklistSection,
    venues.buildVenueSection,
    venues.buildShoppingSection,
    assistant.buildIdeasSection,
    assistant.buildChatSection,
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

  return { renderPlan, focusTitle };
})();
