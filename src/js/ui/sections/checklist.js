'use strict';

/** The vendor checklist, with progress saved per plan. */
Eventwise.ui.checklist = (() => {
  const { formatINR } = Eventwise.format;
  const { el, labelledSection } = Eventwise.dom;
  const { checklistKey } = Eventwise.history;
  const storage = Eventwise.storage;

  const taskId = (category, index) => `${category}|${index}`;

  /** Tasks of the categories that appear in this plan's budget. */
  const countTasks = (vendorTasks, rows) =>
    rows.reduce((count, { category }) => count + (vendorTasks[category]?.length ?? 0), 0);

  function buildChecklistSection({ request, rows }) {
    const { vendorTasks } = Eventwise.profiles[request.type];
    const storageKey = checklistKey(request.id);
    const done = new Set(storage.readList(storageKey));
    const total = countTasks(vendorTasks, rows);

    const progressText = el('p', { class: 'ok', 'aria-live': 'polite' });
    const meter = el('progress', { 'aria-label': 'Vendor tasks completed' });

    const showProgress = () => {
      const finished = Math.min(done.size, total);
      progressText.textContent = `${finished} of ${total} vendor tasks done`;
      meter.max = total || 1;
      meter.value = finished;
    };

    function buildTask(id, text) {
      const checkbox = el('input', { type: 'checkbox' });
      checkbox.checked = done.has(id);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          done.add(id);
        } else {
          done.delete(id);
        }
        storage.write(storageKey, [...done]);
        showProgress();
      });
      return el('label', {}, checkbox, text);
    }

    const groups = rows
      .filter(({ category }) => vendorTasks[category])
      .map(({ category, amount }) =>
        el(
          'fieldset',
          {},
          el('legend', {}, `${category} (${formatINR(amount)})`),
          el(
            'div',
            { class: 'checks' },
            ...vendorTasks[category].map((text, index) => buildTask(taskId(category, index), text)),
          ),
        ),
      );

    showProgress();
    return labelledSection('checklist-heading', 'Vendor checklist', progressText, meter, ...groups);
  }

  return { buildChecklistSection };
})();
