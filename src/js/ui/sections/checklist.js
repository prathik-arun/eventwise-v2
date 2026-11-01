import { PROFILES } from '../../data/events/index.js';
import { el, labelledSection } from '../../lib/dom.js';
import { formatINR } from '../../lib/format.js';
import * as storage from '../../lib/storage.js';
import { checklistKey } from '../../planner/history.js';

/** The vendor checklist, with progress saved per plan. */

const taskId = (category, index) => `${category}|${index}`;

/** Tasks of the categories that appear in this plan's budget. */
const countTasks = (vendorTasks, rows) =>
  rows.reduce((count, { category }) => count + (vendorTasks[category]?.length ?? 0), 0);

/** The "N of M done" text and the progress bar, kept in step by `show`. */
function createProgress(total) {
  const text = el('p', { class: 'ok', 'aria-live': 'polite' });
  const meter = el('progress', { 'aria-label': 'Vendor tasks completed' });
  const show = (doneCount) => {
    const finished = Math.min(doneCount, total);
    text.textContent = `${finished} of ${total} vendor tasks done`;
    meter.max = total || 1;
    meter.value = finished;
  };
  return { text, meter, show };
}

function buildTask(id, label, isDone, onToggle) {
  const checkbox = el('input', { type: 'checkbox' });
  checkbox.checked = isDone;
  checkbox.addEventListener('change', () => onToggle(id, checkbox.checked));
  return el('label', {}, checkbox, label);
}

/** One category's tasks in a fieldset. */
function buildCategoryGroup({ category, amount }, tasks, done, onToggle) {
  const items = tasks.map((label, index) => {
    const id = taskId(category, index);
    return buildTask(id, label, done.has(id), onToggle);
  });
  return el(
    'fieldset',
    {},
    el('legend', {}, `${category} (${formatINR(amount)})`),
    el('div', { class: 'checks' }, ...items),
  );
}

function buildChecklistSection({ request, rows }) {
  const { vendorTasks } = PROFILES[request.type];
  const storageKey = checklistKey(request.id);
  const done = new Set(storage.readList(storageKey));
  const progress = createProgress(countTasks(vendorTasks, rows));

  const onToggle = (id, checked) => {
    if (checked) {
      done.add(id);
    } else {
      done.delete(id);
    }
    storage.write(storageKey, [...done]);
    progress.show(done.size);
  };
  const groups = rows
    .filter(({ category }) => vendorTasks[category])
    .map((row) => buildCategoryGroup(row, vendorTasks[row.category], done, onToggle));

  progress.show(done.size);
  return labelledSection(
    'checklist-heading',
    'Vendor checklist',
    progress.text,
    progress.meter,
    ...groups,
  );
}

export { buildChecklistSection };
