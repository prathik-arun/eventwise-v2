'use strict';

/** Entry point: connects the form, the plan view, the history list and the AI runtime. */
(() => {
  const { announce, form, historyView, results } = Eventwise.ui;
  const { daysBetween, parseISODate, startOfDay } = Eventwise.dates;
  const { $ } = Eventwise.dom;
  const history = Eventwise.history;
  const { createPlan } = Eventwise.plan;
  const { validatePlanRequest } = Eventwise.validation;

  const showPlan = (plan, message) => {
    results.renderPlan(plan);
    announce(message);
    results.focusTitle();
  };

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

  function init() {
    form.init({ today: startOfDay(new Date()), onSubmit: submitPlan });
    historyView.bindClearAll(clearHistory);
    refreshHistory();
    Eventwise.ai.connect().then(Eventwise.ui.assistant.refreshAvailability);
  }

  init();
})();
