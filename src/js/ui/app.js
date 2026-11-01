import { connect as connectAi } from '../assistant/ai.js';
import { daysBetween, parseISODate, startOfDay } from '../lib/dates.js';
import { $ } from '../lib/dom.js';
import { createPlan } from '../planner/plan.js';
import * as history from '../planner/history.js';
import { validatePlanRequest } from '../planner/validation.js';
import * as form from './form.js';
import * as historyView from './history-view.js';
import { renderPlan, focusTitle } from './results.js';
import { refreshAvailability } from './sections/assistant.js';
import { announce } from './state.js';

/** Entry point: connects the form, the plan view, the history list and the AI runtime. */

function showPlan(plan, message) {
  renderPlan(plan);
  announce(message);
  focusTitle();
}

function refreshHistory() {
  historyView.render(history.loadHistory(), {
    onView: openEntry,
    onReuse: reuseEntry,
    onDelete: deleteEntry,
  });
}

function openEntry(entry) {
  const { request, startDate } = history.entryToRequest(entry, startOfDay(new Date()));
  showPlan(createPlan(request, startDate), 'Plan opened.');
}

function reuseEntry(entry) {
  const isPast = daysBetween(startOfDay(new Date()), parseISODate(entry.date)) < 0;
  form.fillFrom(entry, { keepDate: !isPast });
  announce('Form filled from a past plan. Update the date if needed, then create a new plan.');
}

function deleteEntry(entry) {
  history.deleteEntry(entry.id);
  refreshHistory();
  announce('Plan deleted.');
}

function clearHistory() {
  history.clearHistory();
  refreshHistory();
  announce('All past plans deleted.');
  $('#name').focus();
}

function submitPlan(values) {
  const today = startOfDay(new Date());
  const { errors, value: request } = validatePlanRequest(values, today);
  form.showErrors(errors);
  if (!request) {
    announce('Please fix the highlighted fields.');
    form.focusFirstError();
    return;
  }
  request.id = String(Date.now());
  history.saveEntry(request);
  refreshHistory();
  showPlan(createPlan(request, today), 'Your plan is ready.');
}

form.init({ today: startOfDay(new Date()), onSubmit: submitPlan });
historyView.bindClearAll(clearHistory);
refreshHistory();
connectAi().then(refreshAvailability);
